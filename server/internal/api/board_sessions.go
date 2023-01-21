package api

import (
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/internal/common"
	"scrumlr.io/server/internal/common/dto"
	"scrumlr.io/server/internal/database"
	"scrumlr.io/server/internal/logger"
)

// getBoardSessions get participants
func (s *Server) getBoardSessions(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)

	board := r.Context().Value("Board").(uuid.UUID)

	filter := database.BoardSessionFilterTypeFromQueryString(r.URL.Query())
	sessions, err := s.sessions.List(r.Context(), board, filter)
	if err != nil {
		log.Errorw("unable to get board sessions", "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, sessions)
}

// getBoardSession get a participant
func (s *Server) getBoardSession(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value("Board").(uuid.UUID)
	userParam := chi.URLParam(r, "session")
	user, err := uuid.Parse(userParam)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	session, err := s.sessions.Get(r.Context(), board, user)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, session)
}

// updateBoardSession updates a participant
func (s *Server) updateBoardSession(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value("Board").(uuid.UUID)
	caller := r.Context().Value("User").(uuid.UUID)
	userParam := chi.URLParam(r, "session")
	user, err := uuid.Parse(userParam)
	if err != nil {
		http.Error(w, "invalid user session id", http.StatusBadRequest)
		return
	}

	var body dto.BoardSessionUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.Board = board
	body.Caller = caller
	body.User = user

	session, err := s.sessions.Update(r.Context(), body)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, session)
}

// updateBoardSessions updates all participants
func (s *Server) updateBoardSessions(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value("Board").(uuid.UUID)

	var body dto.BoardSessionsUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.Board = board
	sessions, err := s.sessions.UpdateAll(r.Context(), body)
	if err != nil {
		http.Error(w, "unable to update board sessions", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, sessions)
}
