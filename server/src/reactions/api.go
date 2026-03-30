package reactions

import (
	"context"

	"github.com/google/uuid"
)

type ReactionService interface {
	Get(ctx context.Context, id uuid.UUID) (*Reaction, error)
	GetAll(ctx context.Context, boardId uuid.UUID) ([]*Reaction, error)
	Create(ctx context.Context, body ReactionCreateRequest) (*Reaction, error)
	Delete(ctx context.Context, board, user, id uuid.UUID) error
	Update(ctx context.Context, board, user, id uuid.UUID, body ReactionUpdateTypeRequest) (*Reaction, error)
}

type ReactionApi struct {
	service ReactionService
}

func NewReactionApi(service ReactionService) *ReactionApi {
	api := new(ReactionApi)
	api.service = service

	return api
}
