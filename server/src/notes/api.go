package notes

import (
	"context"

	"github.com/google/uuid"
)

type NotesService interface {
	Create(ctx context.Context, body NoteCreateRequest) (*Note, error)
	Import(ctx context.Context, body NoteImportRequest) (*Note, error)
	Get(ctx context.Context, id uuid.UUID) (*Note, error)
	Update(ctx context.Context, user uuid.UUID, body NoteUpdateRequest) (*Note, error)
	GetAll(ctx context.Context, id uuid.UUID, columns ...uuid.UUID) ([]*Note, error)
	Delete(ctx context.Context, user uuid.UUID, body NoteDeleteRequest) error
	GetStack(ctx context.Context, note uuid.UUID) ([]*Note, error)
}
