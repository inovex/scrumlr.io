package draglocks

import (
	"context"
	"database/sql"
	"time"

	"github.com/google/uuid"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

// DatabaseService manages drag locks using PostgreSQL and NATS
type DatabaseService struct {
	db       *sql.DB
	realtime *realtime.Broker
	cleanup  chan struct{}
}

// NewDatabaseDragLockService creates a new database-backed drag lock service
func NewDatabaseDragLockService(db *sql.DB, rt *realtime.Broker) DragLockService {
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

	// Try to insert lock atomically
	query := `
		INSERT INTO drag_locks (note_id, user_id, board_id, created_at)
		VALUES ($1, $2, $3, NOW())
		ON CONFLICT (note_id) DO NOTHING`

	result, err := s.db.ExecContext(ctx, query, noteID, userID, boardID)
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
			refreshQuery := `
				UPDATE drag_locks
				SET created_at = NOW()
				WHERE note_id = $1 AND user_id = $2`

			_, err := s.db.ExecContext(ctx, refreshQuery, noteID, userID)
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

	// Get board ID before deleting (for NATS event)
	var boardID uuid.UUID
	boardQuery := `SELECT board_id FROM drag_locks WHERE note_id = $1 AND user_id = $2`
	err := s.db.QueryRowContext(ctx, boardQuery, noteID, userID).Scan(&boardID)
	if err != nil {
		if err == sql.ErrNoRows {
			logger.Get().Debugw("drag lock not found for release", "noteId", noteID, "userId", userID)
			return false
		}
		logger.Get().Errorw("failed to get board for drag lock", "noteId", noteID, "userId", userID, "error", err)
		return false
	}

	// Delete lock
	query := `DELETE FROM drag_locks WHERE note_id = $1 AND user_id = $2`
	result, err := s.db.ExecContext(ctx, query, noteID, userID)
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
		s.broadcastLockEvent(boardID, realtime.BoardEventNoteDragEnd, noteID, userID)
	}

	return success
}

// IsLocked checks if a note is currently locked
func (s *DatabaseService) IsLocked(noteID uuid.UUID) (*DragLock, bool) {
	ctx, cancel := context.WithTimeout(context.Background(), 2*time.Second)
	defer cancel()

	// Cleanup expired lock first
	s.cleanupExpiredLock(ctx, noteID)

	query := `
		SELECT note_id, user_id, board_id, created_at
		FROM drag_locks
		WHERE note_id = $1 AND created_at > NOW() - INTERVAL '30 seconds'`

	var lock DragLock
	err := s.db.QueryRowContext(ctx, query, noteID).Scan(
		&lock.NoteID,
		&lock.UserID,
		&lock.BoardID,
		&lock.Timestamp,
	)

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, false
		}
		logger.Get().Errorw("failed to check if note is locked", "noteId", noteID, "error", err)
		return nil, false
	}

	return &lock, true
}

// GetLocksForBoard returns all active locks for a board
func (s *DatabaseService) GetLocksForBoard(boardID uuid.UUID) []*DragLock {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()

	// First cleanup expired locks for this board
	s.cleanupExpiredLocksForBoard(ctx, boardID)

	query := `
		SELECT note_id, user_id, board_id, created_at
		FROM drag_locks
		WHERE board_id = $1 AND created_at > NOW() - INTERVAL '30 seconds'`

	rows, err := s.db.QueryContext(ctx, query, boardID)
	if err != nil {
		logger.Get().Errorw("failed to get locks for board", "boardId", boardID, "error", err)
		return nil
	}
	defer rows.Close()

	var locks []*DragLock
	for rows.Next() {
		var lock DragLock
		err := rows.Scan(
			&lock.NoteID,
			&lock.UserID,
			&lock.BoardID,
			&lock.Timestamp,
		)
		if err != nil {
			logger.Get().Errorw("failed to scan drag lock", "error", err)
			continue
		}
		locks = append(locks, &lock)
	}

	return locks
}

// Close shuts down the service
func (s *DatabaseService) Close() {
	close(s.cleanup)
}

// isLockOwnedByUser checks if a lock is owned by a specific user
func (s *DatabaseService) isLockOwnedByUser(ctx context.Context, noteID, userID uuid.UUID) bool {
	query := `SELECT 1 FROM drag_locks WHERE note_id = $1 AND user_id = $2`
	var exists int
	err := s.db.QueryRowContext(ctx, query, noteID, userID).Scan(&exists)
	return err == nil
}

// cleanupExpiredLock removes an expired lock for a specific note
func (s *DatabaseService) cleanupExpiredLock(ctx context.Context, noteID uuid.UUID) {
	query := `DELETE FROM drag_locks WHERE note_id = $1 AND created_at <= NOW() - INTERVAL '30 seconds'`
	_, err := s.db.ExecContext(ctx, query, noteID)
	if err != nil {
		logger.Get().Debugw("failed to cleanup expired lock", "noteId", noteID, "error", err)
	}
}

// cleanupExpiredLocksForBoard removes expired locks for a board
func (s *DatabaseService) cleanupExpiredLocksForBoard(ctx context.Context, boardID uuid.UUID) {
	query := `DELETE FROM drag_locks WHERE board_id = $1 AND created_at <= NOW() - INTERVAL '30 seconds'`
	_, err := s.db.ExecContext(ctx, query, boardID)
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

	query := `DELETE FROM drag_locks WHERE created_at <= NOW() - INTERVAL '30 seconds'`
	result, err := s.db.ExecContext(ctx, query)
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

	err := s.realtime.BroadcastToBoard(boardID, event)
	if err != nil {
		logger.Get().Errorw("failed to broadcast lock event", "eventType", eventType, "noteId", noteID, "error", err)
	}
}