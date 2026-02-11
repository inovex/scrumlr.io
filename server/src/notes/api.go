package notes

import (
	"context"

	"github.com/google/uuid"
)

type NotesService interface {
	Create(ctx context.Context, body NoteCreateRequest) (*Note, error)
	Import(ctx context.Context, body NoteImportRequest) (*Note, error)
	Get(ctx context.Context, id uuid.UUID) (*Note, error)
	GetAll(ctx context.Context, id uuid.UUID, columns ...uuid.UUID) ([]*Note, error)
	GetByUserAndBoard(ctx context.Context, boardID uuid.UUID, userID uuid.UUID) ([]*Note, error)
	GetStack(ctx context.Context, note uuid.UUID) ([]*Note, error)
	Update(ctx context.Context, userID uuid.UUID, body NoteUpdateRequest) (*Note, error)
	Delete(ctx context.Context, userID uuid.UUID, body NoteDeleteRequest) error
	DeleteUserNotesFromBoard(ctx context.Context, userID uuid.UUID, boardID uuid.UUID) error
}
