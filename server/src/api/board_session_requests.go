package api

import (
	"errors"
	"net/http"

	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/sessionrequests"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
)

//var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

// Get a board session request for a user
//
//	@Summary		Get a board session request for a user
//	@Description	Get a board session request for a user
//	@Tags			board session requests
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardId	path	string	true	"boarId for the session request"
//	@Param			userId	path	string	true	"userId for the session request"
//	@Produce		json
//	@Success		200	{object}	sessionrequests.BoardSessionRequest
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Router			/boards/{boardId}/requests/{userId} [get]
func (s *Server) getBoardSessionRequest(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.session_requests.api.get")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	userParam := chi.URLParam(r, "user")
	user, err := uuid.Parse(userParam)
	if err != nil {
		span.SetStatus(codes.Error, "unable to decode body")
		span.RecordError(err)
		log.Error(err, "unable to parse body", "err", err)
		common.Throw(w, r, err)
		return
	}
	// user should only be allowed to get own session request
	if user != ctx.Value(identifiers.UserIdentifier).(uuid.UUID) {
		err := common.ForbiddenError(errors.New("not allowed"))
		span.SetStatus(codes.Error, "not allowed to get session from other users")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}

	if len(r.Header["Upgrade"]) > 0 && r.Header["Upgrade"][0] == "websocket" {
		s.sessionRequests.OpenSocket(ctx, w, r)
		return
	}

	request, err := s.sessionRequests.Get(ctx, board, user)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get session request")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, request)
}

// Get all board session request for a board
//
//	@Summary		Get all board session request for a board
//	@Description	Get all board session request for a board
//	@Tags			board session requests
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardId	path	string	true	"boarId for the session requests"
//	@Param			status	query	string	false	"status to filter the requests"
//	@Produce		json
//	@Success		200	{object}	[]sessionrequests.BoardSessionRequest
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Router			/boards/{boardId}/requests [get]
func (s *Server) getBoardSessionRequests(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.session_requests.api.get.all")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	statusQuery := r.URL.Query().Get("status")

	requests, err := s.sessionRequests.GetAll(ctx, board, statusQuery)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get all session requests")
		span.RecordError(err)
		log.Error(err, "failed to get all session requetsts", "board", board)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, requests)
}

// Update a board session request for a user
//
//	@Summary		Update a board session request for a user
//	@Description	Update a board session request for a user
//	@Tags			board session requests
//	@Accept			json
//	@Param			Cookie					header	string										true	"jwt token to authenticate"
//	@Param			boardId					path	string										true	"boarId for the session request"
//	@Param			userId					path	string										true	"userId for the session request"
//	@Param			sessionRequestUpdate	body	sessionrequests.BoardSessionRequestUpdate	true	"values to update the board session request"
//	@Produce		json
//	@Success		200	{object}	sessionrequests.BoardSessionRequest
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Router			/boards/{boardId}/requests/{userId} [put]
func (s *Server) updateBoardSessionRequest(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.session_requests.api.update")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	userParam := chi.URLParam(r, "user")
	user, err := uuid.Parse(userParam)
	if err != nil {
		span.SetStatus(codes.Error, "failed to parse user id")
		span.RecordError(err)
		common.Throw(w, r, common.BadRequestError(errors.New("invalid user id")))
		return
	}

	var body sessionrequests.BoardSessionRequestUpdate
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "unable to decode body")
		span.RecordError(err)
		log.Error(err, "unable to parse body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Board = board
	body.User = user

	request, err := s.sessionRequests.Update(r.Context(), body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update session request")
		span.RecordError(err)
		log.Errorw("failed to update board session request", "request", body, "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, request)
}
