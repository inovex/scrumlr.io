package boards

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"

	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/database"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/services"
)

type BoardSessionService struct {
	database *database.Database
	realtime *realtime.Broker
}

func NewBoardSessionService(db *database.Database, rt *realtime.Broker) services.BoardSessions {
	b := new(BoardSessionService)
	b.database = db
	b.realtime = rt
	b.database.AttachObserver((database.BoardSessionsObserver)(b))
	return b
}

func (s *BoardSessionService) SessionExists(_ context.Context, boardID, userID uuid.UUID) (bool, error) {
	return s.database.BoardSessionExists(boardID, userID)
}

func (s *BoardSessionService) ModeratorSessionExists(_ context.Context, boardID, userID uuid.UUID) (bool, error) {
	return s.database.BoardModeratorSessionExists(boardID, userID)
}

func (s *BoardSessionService) ParticipantBanned(_ context.Context, boardID, userID uuid.UUID) (bool, error) {
	return s.database.ParticipantBanned(boardID, userID)
}

func (s *BoardSessionService) SessionRequestExists(_ context.Context, boardID, userID uuid.UUID) (bool, error) {
	return s.database.BoardSessionRequestExists(boardID, userID)
}

func (s *BoardSessionService) List(_ context.Context, boardID uuid.UUID, filter filter.BoardSessionFilter) ([]*dto.BoardSession, error) {
	sessions, err := s.database.GetBoardSessions(boardID, filter)
	if err != nil {
		return nil, err
	}
	return dto.BoardSessions(sessions), err
}

func (s *BoardSessionService) Connect(_ context.Context, boardID, userID uuid.UUID) error {
	var connected = true
	_, err := s.database.UpdateBoardSession(database.BoardSessionUpdate{
		Board:     boardID,
		User:      userID,
		Connected: &connected,
	})
	return err
}

func (s *BoardSessionService) Disconnect(_ context.Context, boardID, userID uuid.UUID) error {
	var connected = false
	_, err := s.database.UpdateBoardSession(database.BoardSessionUpdate{
		Board:     boardID,
		User:      userID,
		Connected: &connected,
	})
	return err
}

func (s *BoardSessionService) Get(ctx context.Context, boardID, userID uuid.UUID) (*dto.BoardSession, error) {
	log := logger.FromContext(ctx)
	session, err := s.database.GetBoardSession(boardID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.NotFoundError
		}
		log.Errorw("unable to get session for board", "board", boardID, "session", userID, "error", err)
		return nil, fmt.Errorf("unable to get session for board: %w", err)
	}
	return new(dto.BoardSession).From(session), err
}

func (s *BoardSessionService) Update(_ context.Context, body dto.BoardSessionUpdateRequest) (*dto.BoardSession, error) {
	sessionOfCaller, _ := s.database.GetBoardSession(body.Board, body.Caller)
	if sessionOfCaller.Role == types.SessionRoleParticipant && body.User != body.Caller {
		return nil, common.ForbiddenError(errors.New("not allowed to change other users session"))
	}

	sessionOfUserToModify, _ := s.database.GetBoardSession(body.Board, body.User)
	if body.Role != nil {
		if sessionOfCaller.Role == types.SessionRoleParticipant && *body.Role != types.SessionRoleParticipant {
			return nil, common.ForbiddenError(errors.New("cannot promote role"))
		} else if sessionOfUserToModify.Role == types.SessionRoleOwner && *body.Role != types.SessionRoleOwner {
			return nil, common.ForbiddenError(errors.New("not allowed to change owner role"))
		} else if sessionOfUserToModify.Role != types.SessionRoleOwner && *body.Role == types.SessionRoleOwner {
			return nil, common.ForbiddenError(errors.New("not allowed to promote to owner role"))
		}
	}

	session, err := s.database.UpdateBoardSession(database.BoardSessionUpdate{
		Board:             body.Board,
		User:              body.User,
		Ready:             body.Ready,
		RaisedHand:        body.RaisedHand,
		ShowHiddenColumns: body.ShowHiddenColumns,
		Role:              body.Role,
		Banned:            body.Banned,
	})
	if err != nil {
		return nil, err

	}
	return new(dto.BoardSession).From(session), err
}

func (s *BoardSessionService) UpdateAll(_ context.Context, body dto.BoardSessionsUpdateRequest) ([]*dto.BoardSession, error) {
	sessions, err := s.database.UpdateBoardSessions(database.BoardSessionUpdate{
		Board:      body.Board,
		Ready:      body.Ready,
		RaisedHand: body.RaisedHand,
	})
	if err != nil {
		return nil, err
	}
	return dto.BoardSessions(sessions), err
}

func (s *BoardSessionService) Create(_ context.Context, boardID, userID uuid.UUID) (*dto.BoardSession, error) {
	session, err := s.database.CreateBoardSession(database.BoardSessionInsert{
		Board: boardID,
		User:  userID,
		Role:  types.SessionRoleParticipant,
	})
	if err != nil {
		return nil, err
	}
	return new(dto.BoardSession).From(session), err
}

func (s *BoardSessionService) GetSessionRequest(ctx context.Context, boardID, userID uuid.UUID) (*dto.BoardSessionRequest, error) {
	log := logger.FromContext(ctx)
	request, err := s.database.GetBoardSessionRequest(boardID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.NotFoundError
		}
		log.Errorw("failed to load board session request", "board", boardID, "user", userID, "err", err)
		return nil, fmt.Errorf("failed to load board session request: %w", err)
	}

	return new(dto.BoardSessionRequest).From(request), err
}

func (s *BoardSessionService) ListSessionRequest(ctx context.Context, boardID uuid.UUID, statusQuery string) ([]*dto.BoardSessionRequest, error) {
	log := logger.FromContext(ctx)
	var filters []types.BoardSessionRequestStatus
	if statusQuery != "" {
		if statusQuery == (string)(types.BoardSessionRequestStatusPending) || statusQuery == (string)(types.BoardSessionRequestStatusAccepted) || statusQuery == (string)(types.BoardSessionRequestStatusRejected) {
			f := (types.BoardSessionRequestStatus)(statusQuery)
			filters = append(filters, f)
		} else {
			return nil, common.BadRequestError(errors.New("invalid status filter"))
		}
	}

	requests, err := s.database.GetBoardSessionRequests(boardID, filters...)
	if err != nil {
		log.Errorw("failed to load board session requests", "board", boardID, "err", err)
		return nil, fmt.Errorf("failed to load board session requests: %w", err)
	}
	return dto.BoardSessionRequests(requests), nil
}

func (s *BoardSessionService) CreateSessionRequest(_ context.Context, boardID, userID uuid.UUID) (*dto.BoardSessionRequest, error) {
	request, err := s.database.CreateBoardSessionRequest(database.BoardSessionRequestInsert{
		Board: boardID,
		User:  userID,
	})
	if err != nil {
		return nil, err
	}
	return new(dto.BoardSessionRequest).From(request), err
}

func (s *BoardSessionService) UpdateSessionRequest(_ context.Context, body dto.BoardSessionRequestUpdate) (*dto.BoardSessionRequest, error) {
	request, err := s.database.UpdateBoardSessionRequest(database.BoardSessionRequestUpdate{Board: body.Board, User: body.User, Status: body.Status})
	if err != nil {
		return nil, err
	}
	return new(dto.BoardSessionRequest).From(request), err
}

func (s *BoardSessionService) CreatedSessionRequest(board uuid.UUID, request database.BoardSessionRequest) {
	err := s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventSessionRequestCreated,
		Data: new(dto.BoardSessionRequest).From(request),
	})
	if err != nil {
		logger.Get().Errorw("unable to broadcast created board session request", "err", err)
	}
}

func (s *BoardSessionService) UpdatedSessionRequest(board uuid.UUID, request database.BoardSessionRequest) {
	var status realtime.BoardSessionRequestEventType
	if request.Status == types.BoardSessionRequestStatusAccepted {
		status = realtime.RequestAccepted
	} else if request.Status == types.BoardSessionRequestStatusRejected {
		status = realtime.RequestRejected
	}

	if status != "" {
		err := s.realtime.BroadcastUpdateOnBoardSessionRequest(board, request.User, status)
		if err != nil {
			logger.Get().Errorw("unable to broadcast board session request with status", "status", status, "err", err)
		}
	}

	err := s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventSessionRequestUpdated,
		Data: new(dto.BoardSessionRequest).From(request),
	})

	if err != nil {
		logger.Get().Errorw("unable to broadcast updated board session request", "err", err)
	}
}

func (s *BoardSessionService) CreatedSession(board uuid.UUID, session database.BoardSession) {
	err := s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventParticipantCreated,
		Data: new(dto.BoardSession).From(session),
	})
	if err != nil {
		logger.Get().Errorw("unable to broadcast created board session", "err", err)
	}
}

func (s *BoardSessionService) UpdatedSession(board uuid.UUID, session database.BoardSession) {
	err := s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventParticipantUpdated,
		Data: new(dto.BoardSession).From(session),
	})
	if err != nil {
		logger.Get().Errorw("unable to broadcast updated board session", "err", err)
	}
}

func (s *BoardSessionService) UpdatedSessions(board uuid.UUID, sessions []database.BoardSession) {
	eventSessions := make([]dto.BoardSession, len(sessions))
	for index, session := range sessions {
		eventSessions[index] = *new(dto.BoardSession).From(session)
	}
	err := s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventParticipantsUpdated,
		Data: eventSessions,
	})
	if err != nil {
		logger.Get().Errorw("unable to broadcast updated board sessions", "err", err)
	}
}
