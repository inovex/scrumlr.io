package sessionrequests

import (
	"context"
	"database/sql"
	"errors"
	"net/http"
	"time"

	"scrumlr.io/server/otel"
	"scrumlr.io/server/role"
	"scrumlr.io/server/websocket"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel/attribute"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessions"
)

type SessionRequestDatabase interface {
	Create(ctx context.Context, request DatabaseBoardSessionRequestInsert) (DatabaseBoardSessionRequest, error)
	Update(ctx context.Context, update DatabaseBoardSessionRequestUpdate) (DatabaseBoardSessionRequest, error)
	Get(ctx context.Context, board, user uuid.UUID) (DatabaseBoardSessionRequest, error)
	GetAll(ctx context.Context, board uuid.UUID, status ...RequestStatus) ([]DatabaseBoardSessionRequest, error)
	Exists(ctx context.Context, board, user uuid.UUID) (bool, error)
}

type SessionRequestWebsocket interface {
	OpenSocket(w http.ResponseWriter, r *http.Request)
	listenOnBoardSessionRequest(boardID, userID uuid.UUID, conn websocket.Connection, retryDelay time.Duration)
	closeSocket(conn websocket.Connection)
}

type BoardSessionRequestService struct {
	database       SessionRequestDatabase
	broker         *realtime.Broker
	websocket      SessionRequestWebsocket
	sessionService sessions.SessionService
}

func NewSessionRequestService(db SessionRequestDatabase, rt *realtime.Broker, websocket SessionRequestWebsocket, sessionService sessions.SessionService) SessionRequestService {
	service := new(BoardSessionRequestService)
	service.database = db
	service.broker = rt
	service.websocket = websocket
	service.sessionService = sessionService

	return service
}

func (service *BoardSessionRequestService) Create(ctx context.Context, boardID, userID uuid.UUID) (*BoardSessionRequest, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.session_requests.service.create")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.session_requests.service.create.board", boardID.String()),
		attribute.String("scrumlr.session_requests.service.create.user", userID.String()),
	)

	request, err := service.database.Create(ctx, DatabaseBoardSessionRequestInsert{
		Board: boardID,
		User:  userID,
	})

	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to create board session request"))
		log.Errorw("unable to create BoardSessionRequest", "board", boardID, "user", userID, "error", err)
		return nil, CreateSessionRequestError(Internal, "unable to create board session request", err)
	}

	service.createdSessionRequest(ctx, boardID, request)

	sessionRequestsCreatedCounter.Add(ctx, 1)
	return new(BoardSessionRequest).From(request), err
}

func (service *BoardSessionRequestService) Get(ctx context.Context, boardID, userID uuid.UUID) (*BoardSessionRequest, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.session_requests.service.get")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.session_requests.service.get.board", boardID.String()),
		attribute.String("scrumlr.session_requests.service.get.user", userID.String()),
	)

	request, err := service.database.Get(ctx, boardID, userID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			otel.RecordErrorSpan(span, err, new("board session request not found"))
			return nil, CreateSessionRequestError(NotFound, "board session request not found", err)
		}

		otel.RecordErrorSpan(span, err, new("failed to get board session request"))
		log.Errorw("failed to load board session request", "board", boardID, "user", userID, "err", err)
		return nil, CreateSessionRequestError(Internal, "failed to load board session request", err)
	}

	return new(BoardSessionRequest).From(request), err
}

func (service *BoardSessionRequestService) GetAll(ctx context.Context, boardID uuid.UUID, statusQuery string) ([]*BoardSessionRequest, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.session_requests.service.get.all")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.session_requests.service.get.all.board", boardID.String()),
		attribute.String("scrumlr.session_requests.service.get.all.status.query", statusQuery),
	)

	var filters []RequestStatus
	if statusQuery != "" {
		if statusQuery == (string)(RequestPending) || statusQuery == (string)(RequestAccepted) || statusQuery == (string)(RequestRejected) {
			f := (RequestStatus)(statusQuery)
			filters = append(filters, f)
		} else {
			err := errors.New("invalid status filter")
			otel.RecordErrorSpan(span, err, nil)
			return nil, CreateSessionRequestError(BadRequest, "invalid status filter", err)
		}
	}

	requests, err := service.database.GetAll(ctx, boardID, filters...)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get board session requests"))
		log.Errorw("failed to load board session requests", "board", boardID, "err", err)
		return nil, CreateSessionRequestError(Internal, "failed to load board session requests", err)
	}

	return BoardSessionRequests(requests), nil
}

func (service *BoardSessionRequestService) Exists(ctx context.Context, boardID, userID uuid.UUID) (bool, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.session_requests.service.exists")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.session_requests.service.exists.board", boardID.String()),
		attribute.String("scrumlr.session_requests.service.exists.user", userID.String()),
	)

	exists, err := service.database.Exists(ctx, boardID, userID)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to check board session request existence"))
		return false, CreateSessionRequestError(Internal, "failed to check board session request existence", err)
	}

	return exists, nil
}

func (service *BoardSessionRequestService) Update(ctx context.Context, body BoardSessionRequestUpdate) (*BoardSessionRequest, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.session_requests.service.update")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.session_requests.service.update.board", body.Board.String()),
		attribute.String("scrumlr.session_requests.service.update.user", body.User.String()),
		attribute.String("scrumlr.session_requests.service.update.status", string(body.Status)),
	)

	request, err := service.database.Update(ctx, DatabaseBoardSessionRequestUpdate{
		Board:  body.Board,
		User:   body.User,
		Status: body.Status,
	})

	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to update board session request"))
		log.Errorw("unable to update BoardSessionRequest", "board", body.Board, "user", body.User, "error", err)
		return nil, CreateSessionRequestError(Internal, "unable to update board session request", err)
	}

	if request.Status == RequestAccepted {
		_, err := service.sessionService.Create(ctx, sessions.BoardSessionCreateRequest{Board: request.Board, User: request.User, Role: role.ParticipantRole})
		if err != nil {
			otel.RecordErrorSpan(span, err, new("failed to create board session"))
			return nil, err
		}
	}

	service.updatedSessionRequest(ctx, body.Board, request)

	return new(BoardSessionRequest).From(request), err
}

func (service *BoardSessionRequestService) OpenSocket(ctx context.Context, w http.ResponseWriter, r *http.Request) {
	_, span := tracer.Start(ctx, "scrumlr.session_requests.service.open_socket")
	defer span.End()

	service.websocket.OpenSocket(w, r)
}

// this needs to be moved to the middleware later
func (service *BoardSessionRequestService) BoardCandidateContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx, span := tracer.Start(r.Context(), "scrumlr.sessionrequest.service.context.boardCandidate")
		defer span.End()

		log := logger.FromContext(ctx)
		boardParam := chi.URLParam(r, "id")
		board, err := uuid.Parse(boardParam)
		if err != nil {
			otel.RecordErrorSpan(span, err, new("unable to parse uuid"))
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board id")))
			return
		}

		user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)
		span.SetAttributes(
			attribute.String("scrumlr.sessionrequest.service.context.boardCandidate.board", board.String()),
			attribute.String("scrumlr.sessionrequest.service.context.boardCandidate.user", user.String()),
		)

		exists, err := service.Exists(ctx, board, user)
		if err != nil {
			otel.RecordErrorSpan(span, err, new("unable to check board session"))
			log.Errorw("unable to check board session", "err", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if !exists {
			err := errors.New("board session request not found")
			otel.RecordErrorSpan(span, err, nil)
			common.Throw(w, r, common.NotFoundError)
			return
		}

		boardContext := context.WithValue(ctx, identifiers.BoardIdentifier, board)
		next.ServeHTTP(w, r.WithContext(boardContext))
	})
}

func (service *BoardSessionRequestService) createdSessionRequest(ctx context.Context, board uuid.UUID, request DatabaseBoardSessionRequest) {
	_ = service.broker.BroadcastToBoard(ctx, board, realtime.BoardEvent{
		Type: realtime.BoardEventSessionRequestCreated,
		Data: new(BoardSessionRequest).From(request),
	})
}

func (service *BoardSessionRequestService) updatedSessionRequest(ctx context.Context, board uuid.UUID, request DatabaseBoardSessionRequest) {
	var status realtime.BoardSessionRequestEventType
	switch request.Status {
	case RequestAccepted:
		status = realtime.RequestAccepted
	case RequestRejected:
		status = realtime.RequestRejected
	}

	if status != "" {
		_ = service.broker.BroadcastUpdateOnBoardSessionRequest(ctx, board, request.User, status)
	}

	_ = service.broker.BroadcastToBoard(ctx, board, realtime.BoardEvent{
		Type: realtime.BoardEventSessionRequestUpdated,
		Data: new(BoardSessionRequest).From(request),
	})

}
