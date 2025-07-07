package reactions

import (
	"context"
	"net/http"

	"github.com/google/uuid"
)

type API struct {
	service  ReactionService
	basePath string
}

type ReactionService interface {
	Get(ctx context.Context, id uuid.UUID) (*Reaction, error)
	GetAll(ctx context.Context, boardId uuid.UUID) ([]*Reaction, error)
	Create(ctx context.Context, board uuid.UUID, body ReactionCreateRequest) (*Reaction, error)
	Delete(ctx context.Context, board, user, id uuid.UUID) error
	Update(ctx context.Context, board, user, id uuid.UUID, body ReactionUpdateTypeRequest) (*Reaction, error)
}

func (A API) createReaction(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) getReaction(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) removeReaction(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (A API) updateReaction(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func NewReactionAPI(service ReactionService, basePath string) ReactionAPI {
	api := &API{service: service, basePath: basePath}
	return api
}
