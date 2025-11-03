package sessions

import (
	"context"
	"errors"
	"net/http"
	"net/url"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
)

type SessionService interface {
	Create(ctx context.Context, body BoardSessionCreateRequest) (*BoardSession, error)
	Update(ctx context.Context, body BoardSessionUpdateRequest) (*BoardSession, error)
	UpdateAll(ctx context.Context, body BoardSessionsUpdateRequest) ([]*BoardSession, error)
	UpdateUserBoards(ctx context.Context, body BoardSessionUpdateRequest) ([]*BoardSession, error)
	Get(ctx context.Context, boardID, userID uuid.UUID) (*BoardSession, error)
	GetAll(ctx context.Context, boardID uuid.UUID, filter BoardSessionFilter) ([]*BoardSession, error)
	GetUserConnectedBoards(ctx context.Context, user uuid.UUID) ([]*BoardSession, error)

	Connect(ctx context.Context, boardID, userID uuid.UUID) error
	Disconnect(ctx context.Context, boardID, userID uuid.UUID) error

	Exists(ctx context.Context, boardID, userID uuid.UUID) (bool, error)
	ModeratorSessionExists(ctx context.Context, boardID, userID uuid.UUID) (bool, error)
	IsParticipantBanned(ctx context.Context, boardID, userID uuid.UUID) (bool, error)

	BoardSessionFilterTypeFromQueryString(query url.Values) BoardSessionFilter
}

type API struct {
	service SessionService
}

func (api *API) GetBoardSessions(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.sessions.api.get.all")
	defer span.End()

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	filter := api.service.BoardSessionFilterTypeFromQueryString(r.URL.Query())
	sessions, err := api.service.GetAll(ctx, board, filter)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get sessions")
		span.RecordError(err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, sessions)
}

func (api *API) GetBoardSession(w http.ResponseWriter, r *http.Request) {
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

	session, err := api.service.Get(ctx, board, userId)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get session")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, session)
}

func (api *API) UpdateBoardSession(w http.ResponseWriter, r *http.Request) {
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

	var body BoardSessionUpdateRequest
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

	session, err := api.service.Update(ctx, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update session")
		span.RecordError(err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, session)
}

func (api *API) UpdateBoardSessions(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.sessions.api.update.all")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	var body BoardSessionsUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "unable to decode body")
		span.RecordError(err)
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.Board = board
	updatedSessions, err := api.service.UpdateAll(ctx, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update all sessions")
		span.RecordError(err)
		http.Error(w, "unable to update board sessions", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, updatedSessions)
}

func (api *API) BoardParticipantContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := logger.FromRequest(r)
		boardParam := chi.URLParam(r, "id")
		board, err := uuid.Parse(boardParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board id")))
			return
		}

		user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)
		exists, err := api.service.Exists(r.Context(), board, user)
		if err != nil {
			log.Errorw("unable to check board session", "err", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if !exists {
			common.Throw(w, r, common.ForbiddenError(errors.New("user board session not found")))
			return
		}

		banned, err := api.service.IsParticipantBanned(r.Context(), board, user)
		if err != nil {
			log.Errorw("unable to check if participant is banned", "err", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if banned {
			common.Throw(w, r, common.ForbiddenError(errors.New("participant is currently banned from this session")))
			return
		}

		boardContext := context.WithValue(r.Context(), identifiers.BoardIdentifier, board)
		next.ServeHTTP(w, r.WithContext(boardContext))
	})
}

func (api *API) BoardModeratorContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := logger.FromRequest(r)

		boardParam := chi.URLParam(r, "id")
		board, err := uuid.Parse(boardParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board id")))
			return
		}
		user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

		exists, err := api.service.ModeratorSessionExists(r.Context(), board, user)
		if err != nil {
			log.Errorw("unable to verify board session", "err", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if !exists {
			common.Throw(w, r, common.NotFoundError)
			return
		}

		boardContext := context.WithValue(r.Context(), identifiers.BoardIdentifier, board)
		next.ServeHTTP(w, r.WithContext(boardContext))
	})
}

func NewSessionApi(service SessionService) SessionApi {
	api := &API{service: service}
	return api
}
