package notes

import (
	"context"
	"github.com/google/uuid"
	"scrumlr.io/server/voting"
)

type NotesService interface {
	Create(ctx context.Context, body NoteCreateRequest) (*Note, error)
	Import(ctx context.Context, body NoteImportRequest) (*Note, error)
	Get(ctx context.Context, id uuid.UUID) (*Note, error)
	Update(ctx context.Context, body NoteUpdateRequest) (*Note, error)
	GetAll(ctx context.Context, id uuid.UUID, columns ...uuid.UUID) ([]*Note, error)
	Delete(ctx context.Context, body NoteDeleteRequest, id uuid.UUID, deletedVotes []*voting.Vote) error
	GetStack(ctx context.Context, note uuid.UUID) ([]*Note, error)
}
