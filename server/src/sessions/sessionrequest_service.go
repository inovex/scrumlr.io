package sessions

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
)

type SessionRequestDatabase interface {
	CreateBoardSessionRequest(request DatabaseBoardSessionRequestInsert) (DatabaseBoardSessionRequest, error)
	UpdateBoardSessionRequest(update DatabaseBoardSessionRequestUpdate) (DatabaseBoardSessionRequest, error)
	GetBoardSessionRequest(board, user uuid.UUID) (DatabaseBoardSessionRequest, error)
	GetBoardSessionRequests(board uuid.UUID, status ...BoardSessionRequestStatus) ([]DatabaseBoardSessionRequest, error)
	BoardSessionRequestExists(board, user uuid.UUID) (bool, error)
}

type Websocket interface {
	OpenBoardSessionRequestSocket(w http.ResponseWriter, r *http.Request)
	listenOnBoardSessionRequest(boardID, userID uuid.UUID, conn *websocket.Conn)
	closeBoardSessionRequestSocket(conn *websocket.Conn)
}

type BoardSessionRequestService struct {
	database       SessionRequestDatabase
	realtime       *realtime.Broker
	websocket      Websocket
	sessionService SessionService
}

func NewSessionRequestService(db SessionRequestDatabase, rt *realtime.Broker, websocket Websocket, sessionService SessionService) SessionRequestService {
	service := new(BoardSessionRequestService)
	service.database = db
	service.realtime = rt
	service.websocket = websocket
	service.sessionService = sessionService

	return service
}

func (service *BoardSessionRequestService) CreateSessionRequest(ctx context.Context, boardID, userID uuid.UUID) (*BoardSessionRequest, error) {
	log := logger.FromContext(ctx)
	request, err := service.database.CreateBoardSessionRequest(DatabaseBoardSessionRequestInsert{
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

func (service *BoardSessionRequestService) UpdateSessionRequest(ctx context.Context, body BoardSessionRequestUpdate) (*BoardSessionRequest, error) {
	log := logger.FromContext(ctx)
	request, err := service.database.UpdateBoardSessionRequest(DatabaseBoardSessionRequestUpdate{Board: body.Board, User: body.User, Status: body.Status})
	if err != nil {
		log.Errorw("unable to update BoardSessionRequest", "board", body.Board, "user", body.User, "error", err)
		return nil, err
	}

	if request.Status == RequestStatusAccepted {
		_, err := service.sessionService.Create(ctx, request.User, request.Board)
		if err != nil {
			return nil, err
		}
	}

	service.updatedSessionRequest(body.Board, request)

	return new(BoardSessionRequest).From(request), err
}

func (service *BoardSessionRequestService) GetSessionRequest(ctx context.Context, boardID, userID uuid.UUID) (*BoardSessionRequest, error) {
	log := logger.FromContext(ctx)
	request, err := service.database.GetBoardSessionRequest(boardID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.NotFoundError
		}
		log.Errorw("failed to load board session request", "board", boardID, "user", userID, "err", err)
		return nil, fmt.Errorf("failed to load board session request: %w", err)
	}

	return new(BoardSessionRequest).From(request), err
}

func (service *BoardSessionRequestService) ListSessionRequest(ctx context.Context, boardID uuid.UUID, statusQuery string) ([]*BoardSessionRequest, error) {
	log := logger.FromContext(ctx)
	var filters []BoardSessionRequestStatus
	if statusQuery != "" {
		if statusQuery == (string)(RequestStatusPending) || statusQuery == (string)(RequestStatusAccepted) || statusQuery == (string)(RequestStatusRejected) {
			f := (BoardSessionRequestStatus)(statusQuery)
			filters = append(filters, f)
		} else {
			return nil, common.BadRequestError(errors.New("invalid status filter"))
		}
	}

	requests, err := service.database.GetBoardSessionRequests(boardID, filters...)
	if err != nil {
		log.Errorw("failed to load board session requests", "board", boardID, "err", err)
		return nil, fmt.Errorf("failed to load board session requests: %w", err)
	}

	return BoardSessionRequests(requests), nil
}

func (service *BoardSessionRequestService) SessionRequestExists(_ context.Context, boardID, userID uuid.UUID) (bool, error) {
	return service.database.BoardSessionRequestExists(boardID, userID)
}

func (service *BoardSessionRequestService) OpenBoardSessionRequestSocket(w http.ResponseWriter, r *http.Request) {
	service.websocket.OpenBoardSessionRequestSocket(w, r)
}

func (service *BoardSessionRequestService) createdSessionRequest(board uuid.UUID, request DatabaseBoardSessionRequest) {
	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventSessionRequestCreated,
		Data: new(BoardSessionRequest).From(request),
	})
}

func (service *BoardSessionRequestService) updatedSessionRequest(board uuid.UUID, request DatabaseBoardSessionRequest) {
	var status realtime.BoardSessionRequestEventType
	if request.Status == RequestStatusAccepted {
		status = realtime.RequestAccepted
	} else if request.Status == RequestStatusRejected {
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
