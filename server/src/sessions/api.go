package sessions

import (
	"context"
	"net/http"
	"net/url"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/otel"
)

const failureParsingUserIdMessage = "failed to parse user id"
const checkBoardSessionFailureMessage = "unable to check board session"

type SessionService interface {
	Create(ctx context.Context, body BoardSessionCreateRequest) (*BoardSession, error)
	Get(ctx context.Context, boardID, userID uuid.UUID) (*BoardSession, error)
	GetAll(ctx context.Context, boardID uuid.UUID, filter BoardSessionFilter) ([]*BoardSession, error)
	GetUserBoardSessions(ctx context.Context, user uuid.UUID, connectedOnly bool) ([]*BoardSession, error)
	Exists(ctx context.Context, boardID, userID uuid.UUID) (bool, error)
	ModeratorSessionExists(ctx context.Context, boardID, userID uuid.UUID) (bool, error)
	OwnerSessionExists(ctx context.Context, boardID, userID uuid.UUID) (bool, error)
	IsParticipantBanned(ctx context.Context, boardID, userID uuid.UUID) (bool, error)
	BoardSessionFilterTypeFromQueryString(query url.Values) BoardSessionFilter
	Update(ctx context.Context, body BoardSessionUpdateRequest) (*BoardSession, error)
	UpdateAll(ctx context.Context, body BoardSessionsUpdateRequest) ([]*BoardSession, error)
	Connect(ctx context.Context, boardID, userID uuid.UUID) error
	Disconnect(ctx context.Context, boardID, userID uuid.UUID) error
	Delete(ctx context.Context, callerID, boardID, userID uuid.UUID) error
}

type API struct {
	service SessionService
}

func NewSessionApi(service SessionService) SessionApi {
	api := new(API)
	api.service = service
	return api
}

// Get all sessions for a board
//
//	@Summary		Get all sessions for a board
//	@Description	Get all sessions for a board
//	@Tags			sessions
//	@Accept			json
//	@Param			Cookie		header	string	true	"jwt token to authenticate"
//	@Param			boardId		path	string	true	"id of the board"
//	@Param			connected	query	string	false	"only select connected sessions"				Enums(true, false)
//	@Param			ready		query	string	false	"only select sessions that are ready"			Enums(true, false)
//	@Param			raisedHand	query	string	false	"only select sessions that raised their hand"	Enums(true, false)
//	@Param			role		query	string	false	"only select sessions with the requested role"	Enums(OWNER, MODERATOR, PARTICIPANT)
//	@Produce		json
//	@Success		200	{object}	[]BoardSession	"sessions for the board"
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/participants [get]
func (api *API) GetBoardSessions(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.sessions.api.get.all")
	defer span.End()

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	filter := api.service.BoardSessionFilterTypeFromQueryString(r.URL.Query())
	sessions, err := api.service.GetAll(ctx, board, filter)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get sessions"))
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, sessions)
}

// Get a sessions for a board
//
//	@Summary		Get a sessions for a board
//	@Description	Get a sessions for a board
//	@Tags			sessions
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardId	path	string	true	"id of the board"
//	@Param			id		path	string	true	"id of the session"
//	@Produce		json
//	@Success		200	{object}	sessions.BoardSession	"session for the board"
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/participants/{id} [get]
func (api *API) GetBoardSession(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.sessions.api.get")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	userParam := chi.URLParam(r, "session")

	userId, err := uuid.Parse(userParam)
	if err != nil {
		otel.RecordErrorSpan(span, err, new(failureParsingUserIdMessage))
		log.Errorw("Invalid user id", "err", err)
		common.Throw(w, r, err)
		return
	}

	session, err := api.service.Get(ctx, board, userId)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get session"))
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, session)
}

// Update a sessions for a board
//
//	@Summary		Update a sessions for a board
//	@Description	Update a sessions for a board
//	@Tags			sessions
//	@Accept			json
//	@Param			Cookie	header	string						true	"jwt token to authenticate"
//	@Param			boardId	path	string						true	"id of the board"
//	@Param			id		path	string						true	"id of the session"
//	@Param			session	body	BoardSessionUpdateRequest	true	"values to update the session"
//	@Produce		json
//	@Success		200	{object}	sessions.BoardSession	"session for the board"
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/participants/{id} [put]
func (api *API) UpdateBoardSession(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.sessions.api.update")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	caller := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)
	userParam := chi.URLParam(r, "session")

	userId, err := uuid.Parse(userParam)
	if err != nil {
		otel.RecordErrorSpan(span, err, new(failureParsingUserIdMessage))
		log.Errorw("Invalid user session id", "err", err)
		http.Error(w, "invalid user session id", http.StatusBadRequest)
		return
	}

	var body BoardSessionUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		otel.RecordErrorSpan(span, err, new("unable to decode body"))
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.Board = board
	body.Caller = caller
	body.User = userId

	session, err := api.service.Update(ctx, body)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to update session"))
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, session)
}

// Update all sessions for a board
//
//	@Summary		Update all sessions for a board
//	@Description	Update all sessions for a board
//	@Tags			sessions
//	@Accept			json
//	@Param			Cookie	header	string						true	"jwt token to authenticate"
//	@Param			boardId	path	string						true	"id of the board"
//	@Param			session	body	BoardSessionUpdateRequest	true	"values to update the session"
//	@Produce		json
//	@Success		200	{object}	sessions.BoardSession	"updated session for the board"
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/participants [put]
func (api *API) UpdateBoardSessions(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.sessions.api.update.all")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	var body BoardSessionsUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		otel.RecordErrorSpan(span, err, new("unable to decode body"))
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.Board = board
	updatedSessions, err := api.service.UpdateAll(ctx, body)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to update all sessions"))
		http.Error(w, "unable to update board sessions", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, updatedSessions)
}

// Delete a participant from a board
//
//	@Summary		Delete a participant from a board
//	@Description	Delete a participant from a board
//	@Tags			sessions
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardId	path	string	true	"id of the board"
//	@Param			id		path	string	true	"id of the session"
//	@Produce		json
//	@Success		204
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/participants/{id} [delete]
func (api *API) DeleteBoardSession(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.sessions.api.delete")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	caller := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	userParam := chi.URLParam(r, "session")
	userId, err := uuid.Parse(userParam)
	if err != nil {
		otel.RecordErrorSpan(span, err, new(failureParsingUserIdMessage))
		log.Errorw("Invalid user session id", "err", err)
		http.Error(w, "invalid user session id", http.StatusBadRequest)
		return
	}

	err = api.service.Delete(ctx, caller, board, userId)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to delete session"))
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}
