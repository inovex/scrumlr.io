package api

import (
	"net/http"

	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/sessions"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
)

//var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

// getBoardSessions get participants
func (s *Server) getBoardSessions(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.sessions.api.get.all")
	defer span.End()

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	filter := s.sessions.BoardSessionFilterTypeFromQueryString(r.URL.Query())
	sessions, err := s.sessions.GetAll(ctx, board, filter)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get sessions")
		span.RecordError(err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, sessions)
}

// getBoardSession get a participant
func (s *Server) getBoardSession(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.sessions.api.get")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	userParam := chi.URLParam(r, "session")
	userId, err := uuid.Parse(userParam)
	if err != nil {
		span.SetStatus(codes.Error, "failed to parse user id")
		span.RecordError(err)
		log.Errorw("Invalid user id", "err", err)
		common.Throw(w, r, err)
		return
	}

	session, err := s.sessions.Get(ctx, board, userId)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get session")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, session)
}

// updateBoardSession updates a participant
func (s *Server) updateBoardSession(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.sessions.api.update")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	caller := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)
	userParam := chi.URLParam(r, "session")
	userId, err := uuid.Parse(userParam)
	if err != nil {
		span.SetStatus(codes.Error, "failed to parse user id")
		span.RecordError(err)
		log.Errorw("Invalid user session id", "err", err)
		http.Error(w, "invalid user session id", http.StatusBadRequest)
		return
	}

	var body sessions.BoardSessionUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "unable to decode body")
		span.RecordError(err)
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.Board = board
	body.Caller = caller
	body.User = userId

	session, err := s.sessions.Update(ctx, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update session")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, session)
}

// updateBoardSessions updates all participants
func (s *Server) updateBoardSessions(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.sessions.api.update.all")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	var body sessions.BoardSessionsUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "unable to decode body")
		span.RecordError(err)
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.Board = board
	updatedSessions, err := s.sessions.UpdateAll(ctx, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update all sessions")
		span.RecordError(err)
		http.Error(w, "unable to update board sessions", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, updatedSessions)
}
