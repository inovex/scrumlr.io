package notes

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
)

type DatabaseNote struct {
	bun.BaseModel `bun:"table:notes,alias:note"`
	ID            uuid.UUID
	CreatedAt     time.Time
	Author        uuid.UUID
	Board         uuid.UUID
	Column        uuid.UUID
	Text          string
	Stack         uuid.NullUUID
	Rank          int
	Edited        bool
}

type DatabaseNoteInsert struct {
	bun.BaseModel `bun:"table:notes,alias:note"`
	Author        uuid.UUID
	Board         uuid.UUID
	Column        uuid.UUID
	Text          string
}

type DatabaseNoteImport struct {
	bun.BaseModel `bun:"table:notes,alias:note"`
	Author        uuid.UUID
	Board         uuid.UUID
	Text          string
	Position      *NoteUpdatePosition `bun:",embed"`
}

type DatabaseNoteUpdate struct {
	bun.BaseModel `bun:"table:notes,alias:note"`
	ID            uuid.UUID
	Board         uuid.UUID
	Text          *string
	Position      *NoteUpdatePosition `bun:"embed"`
	Edited        bool
}

type Precondition struct {
	StackingAllowed bool
	CallerRole      common.SessionRole
	Author          uuid.UUID
}
