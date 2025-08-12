package sessions

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/url"
	"slices"
	"strconv"

	"scrumlr.io/server/columns"
	"scrumlr.io/server/notes"

	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

type SessionDatabase interface {
	Create(boardSession DatabaseBoardSessionInsert) (DatabaseBoardSession, error)
	Update(update DatabaseBoardSessionUpdate) (DatabaseBoardSession, error)
	UpdateAll(update DatabaseBoardSessionUpdate) ([]DatabaseBoardSession, error)
	Exists(board, user uuid.UUID) (bool, error)
	ModeratorExists(board, user uuid.UUID) (bool, error)
	IsParticipantBanned(board, user uuid.UUID) (bool, error)
	Get(board, user uuid.UUID) (DatabaseBoardSession, error)
	GetAll(board uuid.UUID, filter ...BoardSessionFilter) ([]DatabaseBoardSession, error)
	GetUserConnectedBoards(user uuid.UUID) ([]DatabaseBoardSession, error)
}

type BoardSessionService struct {
	database      SessionDatabase
	realtime      *realtime.Broker
	columnService columns.ColumnService
	noteService   notes.NotesService
}

func NewSessionService(db SessionDatabase, rt *realtime.Broker, columnService columns.ColumnService, noteService notes.NotesService) SessionService {
	service := new(BoardSessionService)
	service.database = db
	service.realtime = rt
	service.columnService = columnService
	service.noteService = noteService

	return service
}

func (service *BoardSessionService) Create(ctx context.Context, boardID, userID uuid.UUID) (*BoardSession, error) {
	log := logger.FromContext(ctx)
	session, err := service.database.Create(DatabaseBoardSessionInsert{
		Board: boardID,
		User:  userID,
		Role:  common.ParticipantRole,
	})

	if err != nil {
		log.Errorw("unable to create board session", "board", boardID, "user", userID, "error", err)
		return nil, err
	}

	service.createdSession(boardID, session)

	return new(BoardSession).From(session), err
}

func (service *BoardSessionService) Update(ctx context.Context, body BoardSessionUpdateRequest) (*BoardSession, error) {
	log := logger.FromContext(ctx)
	sessionOfCaller, err := service.database.Get(body.Board, body.Caller)
	if err != nil {
		log.Errorw("unable to get board session", "board", body.Board, "calling user", body.Caller, "error", err)
		return nil, fmt.Errorf("unable to get session for board: %w", err)
	}

	if sessionOfCaller.Role == common.ParticipantRole && body.User != body.Caller {
		return nil, common.ForbiddenError(errors.New("not allowed to change other users session"))
	}

	sessionOfUserToModify, err := service.database.Get(body.Board, body.User)
	if err != nil {
		log.Errorw("unable to get board session", "board", body.Board, "target user", body.User, "error", err)
		return nil, fmt.Errorf("unable to get session for board: %w", err)
	}

	if body.Role != nil {
		if sessionOfCaller.Role == common.ParticipantRole && *body.Role != common.ParticipantRole {
			return nil, common.ForbiddenError(errors.New("cannot promote role"))
		} else if sessionOfUserToModify.Role == common.OwnerRole && *body.Role != common.OwnerRole {
			return nil, common.ForbiddenError(errors.New("not allowed to change owner role"))
		} else if sessionOfUserToModify.Role != common.OwnerRole && *body.Role == common.OwnerRole {
			return nil, common.ForbiddenError(errors.New("not allowed to promote to owner role"))
		}
	}

	session, err := service.database.Update(DatabaseBoardSessionUpdate{
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

	service.updatedSession(ctx, body.Board, session)

	return new(BoardSession).From(session), err
}

func (service *BoardSessionService) UpdateAll(ctx context.Context, body BoardSessionsUpdateRequest) ([]*BoardSession, error) {
	log := logger.FromContext(ctx)
	sessions, err := service.database.UpdateAll(DatabaseBoardSessionUpdate{
		Board:      body.Board,
		Ready:      body.Ready,
		RaisedHand: body.RaisedHand,
	})

	if err != nil {
		log.Errorw("unable to update all sessions for a board", "board", body.Board, "error", err)
		return nil, err
	}

	service.updatedSessions(body.Board, sessions)

	return BoardSessions(sessions), err
}

func (service *BoardSessionService) UpdateUserBoards(ctx context.Context, body BoardSessionUpdateRequest) ([]*BoardSession, error) {
	connectedBoards, err := service.database.GetUserConnectedBoards(body.User)
	if err != nil {
		return nil, err
	}

	for _, session := range connectedBoards {
		service.updatedSession(ctx, session.Board, session)
	}

	return BoardSessions(connectedBoards), err
}

func (service *BoardSessionService) Get(ctx context.Context, boardID, userID uuid.UUID) (*BoardSession, error) {
	log := logger.FromContext(ctx)
	session, err := service.database.Get(boardID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.NotFoundError
		}
		log.Errorw("unable to get session for board", "board", boardID, "session", userID, "error", err)
		return nil, fmt.Errorf("unable to get session for board: %w", err)
	}

	return new(BoardSession).From(session), err
}

func (service *BoardSessionService) GetAll(_ context.Context, boardID uuid.UUID, filter BoardSessionFilter) ([]*BoardSession, error) {
	sessions, err := service.database.GetAll(boardID, filter)
	if err != nil {
		return nil, err
	}

	return BoardSessions(sessions), err
}

func (service *BoardSessionService) GetUserConnectedBoards(ctx context.Context, user uuid.UUID) ([]*BoardSession, error) {
	sessions, err := service.database.GetUserConnectedBoards(user)
	if err != nil {
		return nil, err
	}

	return BoardSessions(sessions), err
}

func (service *BoardSessionService) Connect(ctx context.Context, boardID, userID uuid.UUID) error {
	log := logger.FromContext(ctx)
	var connected = true
	updatedSession, err := service.database.Update(DatabaseBoardSessionUpdate{
		Board:     boardID,
		User:      userID,
		Connected: &connected,
	})

	if err != nil {
		log.Errorw("unable to connect to board session", "board", boardID, "user", userID, "error", err)
		return err
	}

	service.updatedSession(ctx, boardID, updatedSession)

	return err
}

func (service *BoardSessionService) Disconnect(ctx context.Context, boardID, userID uuid.UUID) error {
	log := logger.FromContext(ctx)
	var connected = false
	updatedSession, err := service.database.Update(DatabaseBoardSessionUpdate{
		Board:     boardID,
		User:      userID,
		Connected: &connected,
	})

	if err != nil {
		log.Errorw("unable to disconnect from board session", "board", boardID, "user", userID, "error", err)
		return err
	}

	service.updatedSession(ctx, boardID, updatedSession)

	return err
}

func (service *BoardSessionService) Exists(_ context.Context, boardID, userID uuid.UUID) (bool, error) {
	return service.database.Exists(boardID, userID)
}

func (service *BoardSessionService) ModeratorSessionExists(_ context.Context, boardID, userID uuid.UUID) (bool, error) {
	return service.database.ModeratorExists(boardID, userID)
}

func (service *BoardSessionService) IsParticipantBanned(_ context.Context, boardID, userID uuid.UUID) (bool, error) {
	return service.database.IsParticipantBanned(boardID, userID)
}

func (service *BoardSessionService) BoardSessionFilterTypeFromQueryString(query url.Values) BoardSessionFilter {
	filter := BoardSessionFilter{}
	connectedFilter := query.Get("connected")
	if connectedFilter != "" {
		value, _ := strconv.ParseBool(connectedFilter)
		filter.Connected = &value
	}

	readyFilter := query.Get("ready")
	if readyFilter != "" {
		value, _ := strconv.ParseBool(readyFilter)
		filter.Ready = &value
	}

	raisedHandFilter := query.Get("raisedHand")
	if raisedHandFilter != "" {
		value, _ := strconv.ParseBool(raisedHandFilter)
		filter.RaisedHand = &value
	}

	roleFilter := query.Get("role")
	if roleFilter != "" {
		filter.Role = (*common.SessionRole)(&roleFilter)
	}

	return filter
}

func (service *BoardSessionService) createdSession(board uuid.UUID, session DatabaseBoardSession) {
	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventParticipantCreated,
		Data: new(BoardSession).From(session),
	})
}

func (service *BoardSessionService) updatedSession(ctx context.Context, board uuid.UUID, session DatabaseBoardSession) {
	connectedBoards, err := service.database.GetUserConnectedBoards(session.User)
	if err != nil {
		logger.Get().Errorw("unable to get user connections", "session", session, "error", err)
		return
	}

	for _, s := range connectedBoards {
		userSession, err := service.database.Get(s.Board, s.User)
		if err != nil {
			logger.Get().Errorw("unable to get board session of user", "board", s.Board, "user", s.User, "err", err)
			return
		}

		_ = service.realtime.BroadcastToBoard(s.Board, realtime.BoardEvent{
			Type: realtime.BoardEventParticipantUpdated,
			Data: new(BoardSession).From(userSession),
		})
	}

	// Sync columns
	columns, err := service.columnService.GetAll(ctx, board)
	if err != nil {
		logger.Get().Errorw("unable to get columns", "boardID", board, "err", err)
	}
	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: columns,
	})

	columnIds := make([]uuid.UUID, 0, len(columns))
	for _, column := range columns {
		columnIds = append(columnIds, column.ID)
	}
	// Sync notes
	notes, err := service.noteService.GetAll(ctx, board, columnIds...)
	if err != nil {
		logger.Get().Errorw("unable to get notes on a updatedsession call", "err", err)
	}
	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventNotesSync,
		Data: notes,
	})
}

func (service *BoardSessionService) updatedSessions(board uuid.UUID, sessions []DatabaseBoardSession) {
	eventSessions := make([]BoardSession, 0, len(sessions))
	for _, session := range sessions {
		eventSessions = append(eventSessions, *new(BoardSession).From(session))
	}

	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventParticipantsUpdated,
		Data: eventSessions,
	})
}

func CheckSessionRole(clientID uuid.UUID, sessions []*BoardSession, sessionsRoles []common.SessionRole) bool {
	for _, session := range sessions {
		if clientID == session.User.ID {
			if slices.Contains(sessionsRoles, session.Role) {
				return true
			}
		}
	}
	return false
}
