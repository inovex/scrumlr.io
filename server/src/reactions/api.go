package reactions

import (
	"context"

	"github.com/google/uuid"
)

type ReactionService interface {
	Create(ctx context.Context, body ReactionCreateRequest) (*Reaction, error)
	Get(ctx context.Context, id uuid.UUID) (*Reaction, error)
	GetAll(ctx context.Context, boardId uuid.UUID) ([]*Reaction, error)
	Update(ctx context.Context, board, user, id uuid.UUID, body ReactionUpdateTypeRequest) (*Reaction, error)
	Delete(ctx context.Context, board, user, id uuid.UUID) error
}

type ReactionApi struct {
	service ReactionService
}

func NewReactionApi(service ReactionService) *ReactionApi {
	api := new(ReactionApi)
	api.service = service

	return api
}
