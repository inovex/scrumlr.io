package notes

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"time"
)

type NoteDB struct {
	bun.BaseModel `bun:"table:notes"`
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
	bun.BaseModel `bun:"table:notes"`
	Author        uuid.UUID
	Board         uuid.UUID
	Column        uuid.UUID
	Text          string
}

type NoteImportDB struct {
	bun.BaseModel `bun:"table:notes"`
	Author        uuid.UUID
	Board         uuid.UUID
	Text          string
	Position      *NoteUpdatePosition `bun:",embed"`
}

type NoteUpdateDB struct {
	bun.BaseModel `bun:"table:notes"`
	ID            uuid.UUID
	Board         uuid.UUID
	Text          *string
	Position      *NoteUpdatePosition `bun:"embed"`
	Edited        bool
}
