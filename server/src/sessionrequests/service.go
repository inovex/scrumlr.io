package sessionrequests

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessions"
)

type SessionRequestDatabase interface {
	Create(request DatabaseBoardSessionRequestInsert) (DatabaseBoardSessionRequest, error)
	Update(update DatabaseBoardSessionRequestUpdate) (DatabaseBoardSessionRequest, error)
	Get(board, user uuid.UUID) (DatabaseBoardSessionRequest, error)
	GetAll(board uuid.UUID, status ...RequestStatus) ([]DatabaseBoardSessionRequest, error)
	Exists(board, user uuid.UUID) (bool, error)
}

type Websocket interface {
	OpenSocket(w http.ResponseWriter, r *http.Request)
	listenOnBoardSessionRequest(boardID, userID uuid.UUID, conn *websocket.Conn)
	closeSocket(conn *websocket.Conn)
}

type BoardSessionRequestService struct {
	database       SessionRequestDatabase
	realtime       *realtime.Broker
	websocket      Websocket
	sessionService sessions.SessionService
}

func NewSessionRequestService(db SessionRequestDatabase, rt *realtime.Broker, websocket Websocket, sessionService sessions.SessionService) SessionRequestService {
	service := new(BoardSessionRequestService)
	service.database = db
	service.realtime = rt
	service.websocket = websocket
	service.sessionService = sessionService

	return service
}

func (service *BoardSessionRequestService) Create(ctx context.Context, boardID, userID uuid.UUID) (*BoardSessionRequest, error) {
	log := logger.FromContext(ctx)
	request, err := service.database.Create(DatabaseBoardSessionRequestInsert{
		Board: boardID,
		User:  userID,
	})
	if err != nil {
		log.Errorw("unable to create BoardSessionRequest", "board", boardID, "user", userID, "error", err)
		return nil, err
	}

	service.createdSessionRequest(boardID, request)

	return new(BoardSessionRequest).From(request), err
}

func (service *BoardSessionRequestService) Update(ctx context.Context, body BoardSessionRequestUpdate) (*BoardSessionRequest, error) {
	log := logger.FromContext(ctx)
	request, err := service.database.Update(DatabaseBoardSessionRequestUpdate{Board: body.Board, User: body.User, Status: body.Status})
	if err != nil {
		log.Errorw("unable to update BoardSessionRequest", "board", body.Board, "user", body.User, "error", err)
		return nil, err
	}

	if request.Status == RequestAccepted {
		_, err := service.sessionService.Create(ctx, request.User, request.Board)
		if err != nil {
			return nil, err
		}
	}

	service.updatedSessionRequest(body.Board, request)

	return new(BoardSessionRequest).From(request), err
}

func (service *BoardSessionRequestService) Get(ctx context.Context, boardID, userID uuid.UUID) (*BoardSessionRequest, error) {
	log := logger.FromContext(ctx)
	request, err := service.database.Get(boardID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.NotFoundError
		}
		log.Errorw("failed to load board session request", "board", boardID, "user", userID, "err", err)
		return nil, fmt.Errorf("failed to load board session request: %w", err)
	}

	return new(BoardSessionRequest).From(request), err
}

func (service *BoardSessionRequestService) GetAll(ctx context.Context, boardID uuid.UUID, statusQuery string) ([]*BoardSessionRequest, error) {
	log := logger.FromContext(ctx)
	var filters []RequestStatus
	if statusQuery != "" {
		if statusQuery == (string)(RequestPending) || statusQuery == (string)(RequestAccepted) || statusQuery == (string)(RequestRejected) {
			f := (RequestStatus)(statusQuery)
			filters = append(filters, f)
		} else {
			return nil, common.BadRequestError(errors.New("invalid status filter"))
		}
	}

	requests, err := service.database.GetAll(boardID, filters...)
	if err != nil {
		log.Errorw("failed to load board session requests", "board", boardID, "err", err)
		return nil, fmt.Errorf("failed to load board session requests: %w", err)
	}

	return BoardSessionRequests(requests), nil
}

func (service *BoardSessionRequestService) Exists(_ context.Context, boardID, userID uuid.UUID) (bool, error) {
	return service.database.Exists(boardID, userID)
}

func (service *BoardSessionRequestService) OpenSocket(w http.ResponseWriter, r *http.Request) {
	service.websocket.OpenSocket(w, r)
}

func (service *BoardSessionRequestService) createdSessionRequest(board uuid.UUID, request DatabaseBoardSessionRequest) {
	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventSessionRequestCreated,
		Data: new(BoardSessionRequest).From(request),
	})
}

func (service *BoardSessionRequestService) updatedSessionRequest(board uuid.UUID, request DatabaseBoardSessionRequest) {
	var status realtime.BoardSessionRequestEventType
	if request.Status == RequestAccepted {
		status = realtime.RequestAccepted
	} else if request.Status == RequestRejected {
		status = realtime.RequestRejected
	}

	if status != "" {
		_ = service.realtime.BroadcastUpdateOnBoardSessionRequest(board, request.User, status)
	}

	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventSessionRequestUpdated,
		Data: new(BoardSessionRequest).From(request),
	})

}
