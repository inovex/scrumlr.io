package draglocks

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

// DatabaseService manages drag locks using PostgreSQL and NATS
type DatabaseService struct {
	db       *bun.DB
	realtime *realtime.Broker
	cleanup  chan struct{}
}

// NewDatabaseDragLockService creates a new database-backed drag lock service
func NewDatabaseDragLockService(db *bun.DB, rt *realtime.Broker) DragLockService {
	service := &DatabaseService{
		db:       db,
		realtime: rt,
		cleanup:  make(chan struct{}),
	}

	// Start background cleanup
	go service.startCleanupWorker()

	return service
}

// AcquireLock attempts to acquire a drag lock using database
func (s *DatabaseService) AcquireLock(noteID, userID, boardID uuid.UUID) bool {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// First cleanup expired locks for this note
	s.cleanupExpiredLock(ctx, noteID)

	// Try to insert lock atomically using Bun
	insert := DatabaseDragLockInsert{
		NoteID:  noteID,
		UserID:  userID,
		BoardID: boardID,
	}

	result, err := s.db.NewInsert().
		Model(&insert).
		On("CONFLICT (note_id) DO NOTHING").
		Exec(ctx)

	if err != nil {
		logger.Get().Errorw("failed to acquire drag lock", "noteId", noteID, "userId", userID, "error", err)
		return false
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		logger.Get().Errorw("failed to check rows affected", "error", err)
		return false
	}

	success := rowsAffected > 0
	if success {
		logger.Get().Debugw("acquired drag lock", "noteId", noteID, "userId", userID)

		// Broadcast lock acquisition via NATS
		s.broadcastLockEvent(boardID, realtime.BoardEventNoteDragStart, noteID, userID)
	} else {
		// Check if lock is owned by same user (refresh case)
		if s.isLockOwnedByUser(ctx, noteID, userID) {
			// Update timestamp to refresh lock
			_, err := s.db.NewUpdate().
				Model((*DatabaseDragLock)(nil)).
				Set("created_at = NOW()").
				Where("note_id = ? AND user_id = ?", noteID, userID).
				Exec(ctx)

			if err != nil {
				logger.Get().Errorw("failed to refresh drag lock", "noteId", noteID, "userId", userID, "error", err)
				return false
			}

			logger.Get().Debugw("refreshed drag lock", "noteId", noteID, "userId", userID)
			return true
		}

		logger.Get().Debugw("drag lock already exists", "noteId", noteID, "userId", userID)
	}

	return success
}

// ReleaseLock releases a drag lock
func (s *DatabaseService) ReleaseLock(noteID, userID uuid.UUID) bool {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// Get the lock before deleting it (for NATS event)
	var dbLock DatabaseDragLock
	err := s.db.NewSelect().
		Model(&dbLock).
		Where("note_id = ? AND user_id = ?", noteID, userID).
		Scan(ctx)

	if err != nil {
		logger.Get().Debugw("drag lock not found for release", "noteId", noteID, "userId", userID, "error", err)
		return false
	}

	// Delete the lock
	result, err := s.db.NewDelete().
		Model((*DatabaseDragLock)(nil)).
		Where("note_id = ? AND user_id = ?", noteID, userID).
		Exec(ctx)

	if err != nil {
		logger.Get().Errorw("failed to release drag lock", "noteId", noteID, "userId", userID, "error", err)
		return false
	}

	rowsAffected, err := result.RowsAffected()
	if err != nil {
		logger.Get().Errorw("failed to check rows affected", "error", err)
		return false
	}

	success := rowsAffected > 0
	if success {
		logger.Get().Debugw("released drag lock", "noteId", noteID, "userId", userID)

		// Broadcast lock release via NATS
		s.broadcastLockEvent(dbLock.BoardID, realtime.BoardEventNoteDragEnd, noteID, userID)
	}

	return success
}

// IsLocked checks if a note is currently locked
func (s *DatabaseService) IsLocked(noteID uuid.UUID) (*DragLock, bool) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	// Cleanup expired lock first
	s.cleanupExpiredLock(ctx, noteID)

	var dbLock DatabaseDragLock
	err := s.db.NewSelect().
		Model(&dbLock).
		Where("note_id = ? AND created_at > NOW() - INTERVAL '30 seconds'", noteID).
		Scan(ctx)

	if err != nil {
		// No lock found or other error
		return nil, false
	}

	// Convert database model to service model
	lock := &DragLock{
		NoteID:    dbLock.NoteID,
		UserID:    dbLock.UserID,
		BoardID:   dbLock.BoardID,
		Timestamp: dbLock.CreatedAt,
	}

	return lock, true
}

// GetLocksForBoard returns all active locks for a board
func (s *DatabaseService) GetLocksForBoard(boardID uuid.UUID) []*DragLock {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// First cleanup expired locks for this board
	s.cleanupExpiredLocksForBoard(ctx, boardID)

	var dbLocks []DatabaseDragLock
	err := s.db.NewSelect().
		Model(&dbLocks).
		Where("board_id = ? AND created_at > NOW() - INTERVAL '30 seconds'", boardID).
		Scan(ctx)

	if err != nil {
		logger.Get().Errorw("failed to get locks for board", "boardId", boardID, "error", err)
		return nil
	}

	// Convert database models to service models
	locks := make([]*DragLock, len(dbLocks))
	for i, dbLock := range dbLocks {
		locks[i] = &DragLock{
			NoteID:    dbLock.NoteID,
			UserID:    dbLock.UserID,
			BoardID:   dbLock.BoardID,
			Timestamp: dbLock.CreatedAt,
		}
	}

	return locks
}

// Close shuts down the service
func (s *DatabaseService) Close() {
	close(s.cleanup)
}

// isLockOwnedByUser checks if a lock is owned by a specific user
func (s *DatabaseService) isLockOwnedByUser(ctx context.Context, noteID, userID uuid.UUID) bool {
	exists, err := s.db.NewSelect().
		Model((*DatabaseDragLock)(nil)).
		Where("note_id = ? AND user_id = ?", noteID, userID).
		Exists(ctx)
	return err == nil && exists
}

// cleanupExpiredLock removes an expired lock for a specific note
func (s *DatabaseService) cleanupExpiredLock(ctx context.Context, noteID uuid.UUID) {
	_, err := s.db.NewDelete().
		Model((*DatabaseDragLock)(nil)).
		Where("note_id = ? AND created_at <= NOW() - INTERVAL '30 seconds'", noteID).
		Exec(ctx)
	if err != nil {
		logger.Get().Debugw("failed to cleanup expired lock", "noteId", noteID, "error", err)
	}
}

// cleanupExpiredLocksForBoard removes expired locks for a board
func (s *DatabaseService) cleanupExpiredLocksForBoard(ctx context.Context, boardID uuid.UUID) {
	_, err := s.db.NewDelete().
		Model((*DatabaseDragLock)(nil)).
		Where("board_id = ? AND created_at <= NOW() - INTERVAL '30 seconds'", boardID).
		Exec(ctx)
	if err != nil {
		logger.Get().Debugw("failed to cleanup expired locks for board", "boardId", boardID, "error", err)
	}
}

// startCleanupWorker runs periodic cleanup of expired locks
func (s *DatabaseService) startCleanupWorker() {
	ticker := time.NewTicker(DefaultCleanupInterval)
	defer ticker.Stop()

	for {
		select {
		case <-s.cleanup:
			return
		case <-ticker.C:
			s.cleanupAllExpiredLocks()
		}
	}
}

// cleanupAllExpiredLocks removes all expired locks
func (s *DatabaseService) cleanupAllExpiredLocks() {
	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	result, err := s.db.NewDelete().
		Model((*DatabaseDragLock)(nil)).
		Where("created_at <= NOW() - INTERVAL '30 seconds'").
		Exec(ctx)

	if err != nil {
		logger.Get().Errorw("failed to cleanup all expired locks", "error", err)
		return
	}

	rowsAffected, err := result.RowsAffected()
	if err == nil && rowsAffected > 0 {
		logger.Get().Debugw("cleaned up expired drag locks", "count", rowsAffected)
	}
}

// broadcastLockEvent sends lock events via NATS
func (s *DatabaseService) broadcastLockEvent(boardID uuid.UUID, eventType realtime.BoardEventType, noteID, userID uuid.UUID) {
	event := realtime.BoardEvent{
		Type: eventType,
		Data: map[string]string{
			"noteId": noteID.String(),
			"userId": userID.String(),
		},
	}

	err := s.realtime.BroadcastToBoard(context.Background(), boardID, event)
	if err != nil {
		logger.Get().Errorw("failed to broadcast lock event", "eventType", eventType, "noteId", noteID, "error", err)
	}
}