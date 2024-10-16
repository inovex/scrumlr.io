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

func (s *BoardSessionService) Connect(ctx context.Context, boardID, userID uuid.UUID) error {
	log := logger.FromContext(ctx)
	var connected = true
	updatedSession, err := s.database.UpdateBoardSession(database.BoardSessionUpdate{
		Board:     boardID,
		User:      userID,
		Connected: &connected,
	})

	if err != nil {
		log.Errorw("unable to connect to board session", "board", boardID, "user", userID, "error", err)
		return err
	}
	s.UpdatedSession(boardID, updatedSession)

	return err
}

func (s *BoardSessionService) Disconnect(ctx context.Context, boardID, userID uuid.UUID) error {
	log := logger.FromContext(ctx)
	var connected = false
	updatedSession, err := s.database.UpdateBoardSession(database.BoardSessionUpdate{
		Board:     boardID,
		User:      userID,
		Connected: &connected,
	})
	if err != nil {
		log.Errorw("unable to disconnect from board session", "board", boardID, "user", userID, "error", err)
		return err
	}
	s.UpdatedSession(boardID, updatedSession)

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

func (s *BoardSessionService) Update(ctx context.Context, body dto.BoardSessionUpdateRequest) (*dto.BoardSession, error) {
	log := logger.FromContext(ctx)
	sessionOfCaller, err := s.database.GetBoardSession(body.Board, body.Caller)
	if err != nil {
		log.Errorw("unable to get board session", "board", body.Board, "calling user", body.Caller, "error", err)
		return nil, fmt.Errorf("unable to get session for board: %w", err)
	}
	if sessionOfCaller.Role == types.SessionRoleParticipant && body.User != body.Caller {

		return nil, common.ForbiddenError(errors.New("not allowed to change other users session"))
	}

	sessionOfUserToModify, err := s.database.GetBoardSession(body.Board, body.User)
	if err != nil {
		log.Errorw("unable to get board session", "board", body.Board, "target user", body.User, "error", err)
		return nil, fmt.Errorf("unable to get session for board: %w", err)
	}
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
		log.Errorw("unable to update board session", "board", body.Board, "error", err)
		return nil, err
	}
	s.UpdatedSession(body.Board, session)

	return new(dto.BoardSession).From(session), err
}

func (s *BoardSessionService) UpdateAll(ctx context.Context, body dto.BoardSessionsUpdateRequest) ([]*dto.BoardSession, error) {
	log := logger.FromContext(ctx)
	sessions, err := s.database.UpdateBoardSessions(database.BoardSessionUpdate{
		Board:      body.Board,
		Ready:      body.Ready,
		RaisedHand: body.RaisedHand,
	})
	if err != nil {
		log.Errorw("unable to update all sessions for a board", "board", body.Board, "error", err)
		return nil, err
	}
	s.UpdatedSessions(body.Board, sessions)

	return dto.BoardSessions(sessions), err
}

func (s *BoardSessionService) Create(ctx context.Context, boardID, userID uuid.UUID) (*dto.BoardSession, error) {
	log := logger.FromContext(ctx)
	session, err := s.database.CreateBoardSession(database.BoardSessionInsert{
		Board: boardID,
		User:  userID,
		Role:  types.SessionRoleParticipant,
	})
	if err != nil {
		log.Errorw("unable to create board session", "board", boardID, "user", userID, "error", err)
		return nil, err
	}
	s.CreatedSession(boardID, session)

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

func (s *BoardSessionService) CreateSessionRequest(ctx context.Context, boardID, userID uuid.UUID) (*dto.BoardSessionRequest, error) {
	log := logger.FromContext(ctx)
	request, err := s.database.CreateBoardSessionRequest(database.BoardSessionRequestInsert{
		Board: boardID,
		User:  userID,
	})
	if err != nil {
		log.Errorw("unable to create BoardSessionRequest", "board", boardID, "user", userID, "error", err)
		return nil, err
	}
	s.CreatedSessionRequest(boardID, request)

	return new(dto.BoardSessionRequest).From(request), err
}

func (s *BoardSessionService) UpdateSessionRequest(ctx context.Context, body dto.BoardSessionRequestUpdate) (*dto.BoardSessionRequest, error) {
	log := logger.FromContext(ctx)
	request, err := s.database.UpdateBoardSessionRequest(database.BoardSessionRequestUpdate{Board: body.Board, User: body.User, Status: body.Status})
	if err != nil {
		log.Errorw("unable to update BoardSessionRequest", "board", body.Board, "user", body.User, "error", err)
		return nil, err
	}
	s.UpdatedSessionRequest(body.Board, request)

	return new(dto.BoardSessionRequest).From(request), err
}

func (s *BoardSessionService) CreatedSessionRequest(board uuid.UUID, request database.BoardSessionRequest) {
	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventSessionRequestCreated,
		Data: new(dto.BoardSessionRequest).From(request),
	})
}

func (s *BoardSessionService) UpdatedSessionRequest(board uuid.UUID, request database.BoardSessionRequest) {
	var status realtime.BoardSessionRequestEventType
	if request.Status == types.BoardSessionRequestStatusAccepted {
		status = realtime.RequestAccepted
	} else if request.Status == types.BoardSessionRequestStatusRejected {
		status = realtime.RequestRejected
	}

	if status != "" {
		_ = s.realtime.BroadcastUpdateOnBoardSessionRequest(board, request.User, status)
	}

	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventSessionRequestUpdated,
		Data: new(dto.BoardSessionRequest).From(request),
	})

}

func (s *BoardSessionService) CreatedSession(board uuid.UUID, session database.BoardSession) {
	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventParticipantCreated,
		Data: new(dto.BoardSession).From(session),
	})

}

func (s *BoardSessionService) UpdatedSession(board uuid.UUID, session database.BoardSession) {
	connectedBoards, err := s.database.GetSingleUserConnectedBoards(session.User)
	if err != nil {
		logger.Get().Errorw("unable to get user connections", "session", session, "error", err)
		return
	}
	for _, session := range connectedBoards {
		userSession, err := s.database.GetBoardSession(session.Board, session.User)
		if err != nil {
			logger.Get().Errorw("unable to get board session of user", "board", session.Board, "user", session.User, "err", err)
			return
		}
		_ = s.realtime.BroadcastToBoard(session.Board, realtime.BoardEvent{
			Type: realtime.BoardEventParticipantUpdated,
			Data: new(dto.BoardSession).From(userSession),
		})
	}

	// Sync columns
	columns, err := s.database.GetColumns(board)
	if err != nil {
		logger.Get().Errorw("unable to get columns", "boardID", board, "err", err)
	}
	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: dto.Columns(columns),
	})

	// Sync notes
	notes, err := s.database.GetNotes(board)
	if err != nil {
		logger.Get().Errorw("unable to get notes on a updatedsession call", "err", err)
	}
	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventNotesSync,
		Data: dto.Notes(notes),
	})
}

func (s *BoardSessionService) UpdatedSessions(board uuid.UUID, sessions []database.BoardSession) {
	eventSessions := make([]dto.BoardSession, len(sessions))
	for index, session := range sessions {
		eventSessions[index] = *new(dto.BoardSession).From(session)
	}
	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventParticipantsUpdated,
		Data: eventSessions,
	})
}
