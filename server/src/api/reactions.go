package api

import (
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
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

func (s *Server) createReaction(w http.ResponseWriter, r *http.Request) {
	note := r.Context().Value("Note").(uuid.UUID)
	user := r.Context().Value("User").(uuid.UUID)

	var body dto.ReactionCreateRequest
	if err := render.Decode(r, &body); err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	// only reaction type is required in body, rest is filled in from context
	body.Note = note
	body.User = user

	reaction, err := s.reactions.Create(r.Context(), body)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, reaction)
}

func (s *Server) removeReaction(w http.ResponseWriter, r *http.Request) {
	id := r.Context().Value("Reaction").(uuid.UUID)

	if err := s.reactions.Delete(r.Context(), id); err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}
