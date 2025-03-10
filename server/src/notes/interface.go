package notes

import (
	"context"
	"github.com/google/uuid"
)

type NotesService interface {
	Create(ctx context.Context, body NoteCreateRequest) (*Note, error)
	Import(ctx context.Context, body NoteImportRequest) (*Note, error)
	Get(ctx context.Context, id uuid.UUID) (*Note, error)
	Update(ctx context.Context, body NoteUpdateRequest) (*Note, error)
	List(ctx context.Context, id uuid.UUID, columns ...uuid.UUID) ([]*Note, error)
	Delete(ctx context.Context, body NoteDeleteRequest, id uuid.UUID) error
}

type NotesDatabase interface {
	CreateNote(insert NoteInsertDB) (NoteDB, error)
	ImportNote(insert NoteImportDB) (NoteDB, error)
	GetNote(id uuid.UUID) (NoteDB, error)
	GetNotes(board uuid.UUID, columns ...uuid.UUID) ([]NoteDB, error)
	GetChildNotes(parentNote uuid.UUID) ([]NoteDB, error)
	UpdateNote(caller uuid.UUID, update NoteUpdateDB) (NoteDB, error)
	DeleteNote(caller uuid.UUID, board uuid.UUID, id uuid.UUID, deleteStack bool) error
}
