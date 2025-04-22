package api

import (
	"net/http"

	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/boardreactions"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
)

// createBoardReaction creates a new board reaction
func (s *Server) createBoardReaction(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

	var body boardreactions.BoardReactionCreateRequest
	if err := render.Decode(r, &body); err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		log.Errorw("unable to create board reaction", "err", err)
		return
	}

	// user is filled from context
	body.User = user

	s.boardReactions.Create(r.Context(), board, body)

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, nil)
}
