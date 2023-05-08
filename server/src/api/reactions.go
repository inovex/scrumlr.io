package api

import (
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/common"
)

func (s *Server) getReaction(w http.ResponseWriter, r *http.Request) {
	id := r.Context().Value("Reaction").(uuid.UUID)

	reaction, err := s.reactions.Get(r.Context(), id)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, reaction)
}

func (s *Server) getReactions(w http.ResponseWriter, r *http.Request) {
	note := r.Context().Value("Note").(uuid.UUID)

	reactions, err := s.reactions.List(r.Context(), note)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, reactions)
}
