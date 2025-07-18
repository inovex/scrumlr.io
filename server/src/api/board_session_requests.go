package api

import (
	"errors"
	"net/http"

	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/sessionrequests"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
)

func (s *Server) getBoardSessionRequest(w http.ResponseWriter, r *http.Request) {
	log := logger.FromContext(r.Context())
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	userParam := chi.URLParam(r, "user")
	user, err := uuid.Parse(userParam)
	if err != nil {
		log.Error(err, "unable to parse body", "err", err)
		common.Throw(w, r, err)
		return
	}
	// user should only be allowed to get own session request
	if user != r.Context().Value(identifiers.UserIdentifier).(uuid.UUID) {
		common.Throw(w, r, common.ForbiddenError(errors.New("not allowed")))
		return
	}

	if len(r.Header["Upgrade"]) > 0 && r.Header["Upgrade"][0] == "websocket" {
		s.sessionRequests.OpenSocket(w, r)
		return
	}

	request, err := s.sessionRequests.Get(r.Context(), board, user)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, request)
}

func (s *Server) getBoardSessionRequests(w http.ResponseWriter, r *http.Request) {
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	statusQuery := r.URL.Query().Get("status")

	requests, err := s.sessionRequests.GetAll(r.Context(), board, statusQuery)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, requests)
}

func (s *Server) updateBoardSessionRequest(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)

	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

	userParam := chi.URLParam(r, "user")
	user, err := uuid.Parse(userParam)
	if err != nil {
		common.Throw(w, r, common.BadRequestError(errors.New("invalid user id")))
		return
	}

	var body sessionrequests.BoardSessionRequestUpdate
	if err := render.Decode(r, &body); err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Board = board
	body.User = user

	request, err := s.sessionRequests.Update(r.Context(), body)
	if err != nil {
		log.Errorw("failed to update board session request", "request", body, "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, request)
}
