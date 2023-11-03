package api

import (
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
)

// createBoardReaction creates a new board reaction
func (s *Server) createBoardReaction(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value("Board").(uuid.UUID)
	user := r.Context().Value("User").(uuid.UUID)

	var body dto.BoardReactionCreateRequest
	if err := render.Decode(r, &body); err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	// user is filled from context
	body.User = user

	s.boardReactions.Create(r.Context(), board, body)

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, nil)
}
