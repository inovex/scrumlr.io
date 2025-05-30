package notes

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type NoteDB struct {
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

type NoteInsertDB struct {
	bun.BaseModel `bun:"table:notes,alias:note"`
	Author        uuid.UUID
	Board         uuid.UUID
	Column        uuid.UUID
	Text          string
}

type NoteImportDB struct {
	bun.BaseModel `bun:"table:notes,alias:note"`
	Author        uuid.UUID
	Board         uuid.UUID
	Text          string
	Position      *NoteUpdatePosition `bun:",embed"`
}

type NoteUpdateDB struct {
	bun.BaseModel `bun:"table:notes,alias:note"`
	ID            uuid.UUID
	Board         uuid.UUID
	Text          *string
	Position      *NoteUpdatePosition `bun:"embed"`
	Edited        bool
}
