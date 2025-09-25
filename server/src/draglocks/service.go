package draglocks

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/realtime"
)

const (
	// DefaultCleanupInterval is how often expired locks are cleaned up
	DefaultCleanupInterval = 10 * time.Second
)

// DragLock represents a note being dragged
type DragLock struct {
	NoteID    uuid.UUID
	UserID    uuid.UUID
	BoardID   uuid.UUID
	Timestamp time.Time
}

// DragLockService interface for dependency injection
type DragLockService interface {
	AcquireLock(noteID, userID, boardID uuid.UUID) bool
	ReleaseLock(noteID, userID uuid.UUID) bool
	IsLocked(noteID uuid.UUID) (*DragLock, bool)
	GetLocksForBoard(boardID uuid.UUID) []*DragLock
	Close()
}

// InitializeDatabaseLockService creates a database-backed drag lock service
func InitializeDatabaseLockService(db *bun.DB, rt *realtime.Broker) DragLockService {
	return NewDatabaseDragLockService(db, rt)
}