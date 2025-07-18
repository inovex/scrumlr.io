package api

import (
	"net/http"

	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/reactions"
)

func (s *Server) getReaction(w http.ResponseWriter, r *http.Request) {
	id := r.Context().Value(identifiers.ReactionIdentifier).(uuid.UUID)

	reaction, err := s.reactions.Get(r.Context(), id)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, reaction)
}

func (s *Server) getReactions(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

	reactions, err := s.reactions.GetAll(r.Context(), board)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, reactions)
}

func (s *Server) createReaction(w http.ResponseWriter, r *http.Request) {
	log := logger.FromContext(r.Context())
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

	var body reactions.ReactionCreateRequest
	if err := render.Decode(r, &body); err != nil {
		log.Errorw("unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	// user is filled from context
	body.User = user

	reaction, err := s.reactions.Create(r.Context(), board, body)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, reaction)
}

func (s *Server) removeReaction(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)
	id := r.Context().Value(identifiers.ReactionIdentifier).(uuid.UUID)

	if err := s.reactions.Delete(r.Context(), board, user, id); err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}

func (s *Server) updateReaction(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)
	id := r.Context().Value(identifiers.ReactionIdentifier).(uuid.UUID)
	var body reactions.ReactionUpdateTypeRequest
	if err := render.Decode(r, &body); err != nil {
		log.Errorw("unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	reaction, err := s.reactions.Update(r.Context(), board, user, id, body)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, reaction)
}
