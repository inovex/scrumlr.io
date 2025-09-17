package draglocks

import (
	"sync"
	"time"

	"github.com/google/uuid"
	"scrumlr.io/server/logger"
)

const (
	// DefaultLockTimeout is the default time after which a lock expires
	DefaultLockTimeout = 30 * time.Second
	// DefaultCleanupInterval is how often expired locks are cleaned up
	DefaultCleanupInterval = 10 * time.Second
	// DefaultCleanupChannelSize is the size of the cleanup channel buffer
	DefaultCleanupChannelSize = 1000
)

// DragLock represents a note being dragged
type DragLock struct {
	NoteID    uuid.UUID
	UserID    uuid.UUID
	BoardID   uuid.UUID
	Timestamp time.Time
}

// Service manages drag state for notes with automatic cleanup
type Service struct {
	mu              sync.RWMutex
	locks           map[uuid.UUID]*DragLock // noteID -> DragLock
	cleanup         chan uuid.UUID
	stopCleanup     chan struct{}
	lockTimeout     time.Duration
	cleanupInterval time.Duration
}

// DragLockService interface for dependency injection
type DragLockService interface {
	AcquireLock(noteID, userID, boardID uuid.UUID) bool
	ReleaseLock(noteID, userID uuid.UUID) bool
	IsLocked(noteID uuid.UUID) (*DragLock, bool)
	GetLocksForBoard(boardID uuid.UUID) []*DragLock
	Close()
}

func InitializeLockService() DragLockService {
	return InitializeLockServiceWithConfig(DefaultLockTimeout, DefaultCleanupInterval)
}

// InitializeLockServiceWithConfig creates a new drag lock service with custom configuration
func InitializeLockServiceWithConfig(lockTimeout, cleanupInterval time.Duration) DragLockService {
	service := &Service{
		locks:           make(map[uuid.UUID]*DragLock),
		cleanup:         make(chan uuid.UUID, DefaultCleanupChannelSize),
		stopCleanup:     make(chan struct{}),
		lockTimeout:     lockTimeout,
		cleanupInterval: cleanupInterval,
	}

	// Start cleanup goroutine
	go service.cleanupExpiredLocks()

	return service
}

// AcquireLock attempts to acquire a drag lock for the specified note
// Returns true if successful, false if already locked by another user
func (s *Service) AcquireLock(noteID, userID, boardID uuid.UUID) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	// Check if already locked
	if existingLock, exists := s.locks[noteID]; exists {
		// If locked by the same user, refresh timestamp
		if existingLock.UserID == userID {
			existingLock.Timestamp = time.Now()
			return true
		}
		// Check if lock has expired
		if time.Since(existingLock.Timestamp) > s.lockTimeout {
			logger.Get().Debugw("removing expired drag lock", "noteId", noteID, "userId", existingLock.UserID)
			delete(s.locks, noteID)
		} else {
			// Lock exists and hasn't expired
			return false
		}
	}

	// Acquire the lock
	s.locks[noteID] = &DragLock{
		NoteID:    noteID,
		UserID:    userID,
		BoardID:   boardID,
		Timestamp: time.Now(),
	}

	logger.Get().Debugw("acquired drag lock", "noteId", noteID, "userId", userID)
	return true
}

// ReleaseLock releases a drag lock if owned by the specified user
func (s *Service) ReleaseLock(noteID, userID uuid.UUID) bool {
	s.mu.Lock()
	defer s.mu.Unlock()

	if lock, exists := s.locks[noteID]; exists {
		if lock.UserID == userID {
			delete(s.locks, noteID)
			logger.Get().Debugw("released drag lock", "noteId", noteID, "userId", userID)
			return true
		}
	}
	return false
}

// IsLocked checks if a note is currently locked
func (s *Service) IsLocked(noteID uuid.UUID) (*DragLock, bool) {
	s.mu.RLock()
	defer s.mu.RUnlock()

	lock, exists := s.locks[noteID]
	if exists && time.Since(lock.Timestamp) > s.lockTimeout {
		// Lock has expired, remove it asynchronously
		select {
		case s.cleanup <- noteID:
		default:
			// Cleanup channel is full, will be handled later
		}
		return nil, false
	}
	return lock, exists
}

// GetLocksForBoard returns all active locks for a specific board
func (s *Service) GetLocksForBoard(boardID uuid.UUID) []*DragLock {
	s.mu.RLock()
	defer s.mu.RUnlock()

	var boardLocks []*DragLock
	for _, lock := range s.locks {
		if lock.BoardID == boardID && time.Since(lock.Timestamp) <= s.lockTimeout {
			boardLocks = append(boardLocks, lock)
		}
	}
	return boardLocks
}

// cleanupExpiredLocks runs a background cleanup process
func (s *Service) cleanupExpiredLocks() {
	ticker := time.NewTicker(s.cleanupInterval)
	defer ticker.Stop()

	for {
		select {
		case <-s.stopCleanup:
			return
		case noteID := <-s.cleanup:
			s.cleanupLock(noteID)
		case <-ticker.C:
			s.cleanupAllExpiredLocks()
		}
	}
}

// cleanupLock removes a specific expired lock
func (s *Service) cleanupLock(noteID uuid.UUID) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if lock, exists := s.locks[noteID]; exists {
		if time.Since(lock.Timestamp) > s.lockTimeout {
			logger.Get().Debugw("cleaning up expired drag lock", "noteId", noteID, "userId", lock.UserID)
			delete(s.locks, noteID)
		}
	}
}

// cleanupAllExpiredLocks removes all expired locks
func (s *Service) cleanupAllExpiredLocks() {
	s.mu.Lock()
	defer s.mu.Unlock()

	now := time.Now()
	for noteID, lock := range s.locks {
		if now.Sub(lock.Timestamp) > s.lockTimeout {
			logger.Get().Debugw("cleaning up expired drag lock", "noteId", noteID, "userId", lock.UserID)
			delete(s.locks, noteID)
		}
	}
}

// Close shuts down the service and cleanup goroutine
func (s *Service) Close() {
	close(s.stopCleanup)
}
