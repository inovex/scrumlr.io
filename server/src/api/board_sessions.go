package api

import (
	"net/http"
	"time"

	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/users"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
)

// getBoardSessions get participants
func (s *Server) getBoardSessions(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

	filter := s.sessions.BoardSessionFilterTypeFromQueryString(r.URL.Query())
	sessions, err := s.sessions.GetAll(r.Context(), board, filter)
	if err != nil {
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, sessions)
}

// getBoardSession get a participant
func (s *Server) getBoardSession(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	userParam := chi.URLParam(r, "session")
	userId, err := uuid.Parse(userParam)
	if err != nil {
		log.Errorw("Invalid user id", "err", err)
		common.Throw(w, r, err)
		return
	}

	user, err := s.users.Get(r.Context(), userId)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	session, err := s.sessions.Get(r.Context(), board, userId)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	fullSession := struct {
		User              users.User         `json:"user"`
		Connected         bool               `json:"connected"`
		ShowHiddenColumns bool               `json:"showHiddenColumns"`
		Ready             bool               `json:"ready"`
		RaisedHand        bool               `json:"raisedHand"`
		Role              common.SessionRole `json:"role"`
		CreatedAt         time.Time          `json:"createdAt"`
		Banned            bool               `json:"banned"`
	}{
		User:              *user,
		Connected:         session.Connected,
		ShowHiddenColumns: session.ShowHiddenColumns,
		Ready:             session.Ready,
		RaisedHand:        session.RaisedHand,
		Role:              session.Role,
		CreatedAt:         session.CreatedAt,
		Banned:            session.Banned,
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, fullSession)
}

// updateBoardSession updates a participant
func (s *Server) updateBoardSession(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	caller := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)
	userParam := chi.URLParam(r, "session")
	userId, err := uuid.Parse(userParam)
	if err != nil {
		log.Errorw("Invalid user session id", "err", err)
		http.Error(w, "invalid user session id", http.StatusBadRequest)
		return
	}

	var body sessions.BoardSessionUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.Board = board
	body.Caller = caller
	body.User = userId

	session, err := s.sessions.Update(r.Context(), body)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	user, err := s.users.Get(r.Context(), userId)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	fullSession := struct {
		User              users.User         `json:"user"`
		Connected         bool               `json:"connected"`
		ShowHiddenColumns bool               `json:"showHiddenColumns"`
		Ready             bool               `json:"ready"`
		RaisedHand        bool               `json:"raisedHand"`
		Role              common.SessionRole `json:"role"`
		CreatedAt         time.Time          `json:"createdAt"`
		Banned            bool               `json:"banned"`
	}{
		User:              *user,
		Connected:         session.Connected,
		ShowHiddenColumns: session.ShowHiddenColumns,
		Ready:             session.Ready,
		RaisedHand:        session.RaisedHand,
		Role:              session.Role,
		CreatedAt:         session.CreatedAt,
		Banned:            session.Banned,
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, fullSession)
}

// updateBoardSessions updates all participants
func (s *Server) updateBoardSessions(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

	var body sessions.BoardSessionsUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.Board = board
	updatedSessions, err := s.sessions.UpdateAll(r.Context(), body)
	if err != nil {
		http.Error(w, "unable to update board sessions", http.StatusInternalServerError)
		return
	}

	type FullSession struct {
		User              users.User         `json:"user"`
		Connected         bool               `json:"connected"`
		ShowHiddenColumns bool               `json:"showHiddenColumns"`
		Ready             bool               `json:"ready"`
		RaisedHand        bool               `json:"raisedHand"`
		Role              common.SessionRole `json:"role"`
		CreatedAt         time.Time          `json:"createdAt"`
		Banned            bool               `json:"banned"`
	}

	fullSessions := make([]FullSession, len(updatedSessions))
	for i, session := range updatedSessions {
		user, err := s.users.Get(r.Context(), session.User)
		if err != nil {
			common.Throw(w, r, err)
			return
		}

		fullSessions[i] = FullSession{
			User:              *user,
			Connected:         session.Connected,
			ShowHiddenColumns: session.ShowHiddenColumns,
			Ready:             session.Ready,
			RaisedHand:        session.RaisedHand,
			Role:              session.Role,
			CreatedAt:         session.CreatedAt,
			Banned:            session.Banned,
		}
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, fullSessions)
}
