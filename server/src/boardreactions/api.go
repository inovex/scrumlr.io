package boardreactions

import (
  "context"
  "github.com/go-chi/render"
  "github.com/google/uuid"
  "net/http"
  "scrumlr.io/server/common"
  "scrumlr.io/server/identifiers"
  "scrumlr.io/server/logger"
)

type BoardReactionService interface {
  Create(ctx context.Context, board uuid.UUID, body BoardReactionCreateRequest)
}

type API struct {
  service  BoardReactionService
  basePath string
}

func (a API) createBoardReaction(w http.ResponseWriter, r *http.Request) {
  log := logger.FromRequest(r)
  board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
  user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

  var body BoardReactionCreateRequest
  if err := render.Decode(r, &body); err != nil {
    common.Throw(w, r, common.BadRequestError(err))
    log.Errorw("unable to create board reaction", "err", err)
    return
  }

  // user is filled from context
  body.User = user

  a.service.Create(r.Context(), board, body)

  render.Status(r, http.StatusCreated)
  render.Respond(w, r, nil)
}

func NewBoardReactionAPI(service BoardReactionService, basePath string) BoardReactionAPI {
  api := &API{service: service, basePath: basePath}
  return api
}
