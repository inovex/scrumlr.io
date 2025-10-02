package draglocks

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type DatabaseDragLock struct {
	bun.BaseModel `bun:"table:drag_locks,alias:drag_lock"`
	NoteID        uuid.UUID `bun:"note_id,pk"`
	UserID        uuid.UUID `bun:"user_id,notnull"`
	BoardID       uuid.UUID `bun:"board_id,notnull"`
	CreatedAt     time.Time `bun:"created_at,default:now()"`
}

type DatabaseDragLockInsert struct {
	bun.BaseModel `bun:"table:drag_locks,alias:drag_lock"`
	NoteID        uuid.UUID `bun:"note_id"`
	UserID        uuid.UUID `bun:"user_id"`
	BoardID       uuid.UUID `bun:"board_id"`
}