package notes

import (
	"context"
	"github.com/google/uuid"
	"scrumlr.io/server/common/dto"
)

type NotesService interface {
	Create(ctx context.Context, body NoteCreateRequest) (*Note, error)
	Import(ctx context.Context, body NoteImportRequest) (*Note, error)
	Get(ctx context.Context, id uuid.UUID) (*Note, error)
	Update(ctx context.Context, body NoteUpdateRequest) (*Note, error)
	GetAll(ctx context.Context, id uuid.UUID, columns ...uuid.UUID) ([]*Note, error)
	Delete(ctx context.Context, body NoteDeleteRequest, id uuid.UUID, deletedVotes []*dto.Vote) error
	GetStack(ctx context.Context, note uuid.UUID) ([]*Note, error)
}
