package reactions

import (
	"context"

	"github.com/google/uuid"
)

type ReactionService interface {
	Get(ctx context.Context, id uuid.UUID) (*Reaction, error)
	List(ctx context.Context, boardId uuid.UUID) ([]*Reaction, error)
	Create(ctx context.Context, board uuid.UUID, body ReactionCreateRequest) (*Reaction, error)
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

// func (api *ReactionApi) getReaction(w http.ResponseWriter, r *http.Request) {
// 	id := r.Context().Value(identifiers.ReactionIdentifier).(uuid.UUID)
//
// 	reaction, err := api.service.Get(r.Context(), id)
// 	if err != nil {
// 		common.Throw(w, r, err)
// 		return
// 	}
//
// 	render.Status(r, http.StatusOK)
// 	render.Respond(w, r, reaction)
// }

// func (api *ReactionApi) getReactions(w http.ResponseWriter, r *http.Request) {
// 	boardId := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
//
// 	reactions, err := api.service.List(r.Context(), boardId)
// 	if err != nil {
// 		common.Throw(w, r, err)
// 		return
// 	}
//
// 	render.Status(r, http.StatusOK)
// 	render.Respond(w, r, reactions)
// }

// func (api *ReactionApi) createReaction(w http.ResponseWriter, r *http.Request) {
// 	log := logger.FromContext(r.Context())
// 	boardId := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
// 	userId := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)
//
// 	var body ReactionCreateRequest
// 	if err := render.Decode(r, &body); err != nil {
// 		log.Errorw("unable to decode body", "err", err)
// 		common.Throw(w, r, common.BadRequestError(err))
// 		return
// 	}
//
// 	// user is filled from context
// 	body.User = userId
//
// 	reaction, err := api.service.Create(r.Context(), boardId, body)
// 	if err != nil {
// 		common.Throw(w, r, err)
// 		return
// 	}
//
// 	render.Status(r, http.StatusCreated)
// 	render.Respond(w, r, reaction)
// }

// func (api *ReactionApi) removeReaction(w http.ResponseWriter, r *http.Request) {
// 	boardId := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
// 	userId := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)
// 	id := r.Context().Value(identifiers.ReactionIdentifier).(uuid.UUID)
//
// 	if err := api.service.Delete(r.Context(), boardId, userId, id); err != nil {
// 		common.Throw(w, r, err)
// 		return
// 	}
//
// 	render.Status(r, http.StatusNoContent)
// 	render.Respond(w, r, nil)
// }

// func (api *ReactionApi) updateReaction(w http.ResponseWriter, r *http.Request) {
// 	log := logger.FromRequest(r)
// 	boardId := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
// 	userId := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)
// 	id := r.Context().Value(identifiers.ReactionIdentifier).(uuid.UUID)
//
// 	var body ReactionUpdateTypeRequest
// 	if err := render.Decode(r, &body); err != nil {
// 		log.Errorw("unable to decode body", "err", err)
// 		common.Throw(w, r, common.BadRequestError(err))
// 		return
// 	}
//
// 	reaction, err := api.service.Update(r.Context(), boardId, userId, id, body)
// 	if err != nil {
// 		common.Throw(w, r, err)
// 		return
// 	}
//
// 	render.Status(r, http.StatusOK)
// 	render.Respond(w, r, reaction)
// }
