package sessions

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"net/url"
	"slices"
	"strconv"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/notes"

	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/sessions")
var meter metric.Meter = otel.Meter("scrumlr.io/server/sessions")

type SessionDatabase interface {
	Create(ctx context.Context, boardSession DatabaseBoardSessionInsert) (DatabaseBoardSession, error)
	Update(ctx context.Context, update DatabaseBoardSessionUpdate) (DatabaseBoardSession, error)
	UpdateAll(ctx context.Context, update DatabaseBoardSessionUpdate) ([]DatabaseBoardSession, error)
	Exists(ctx context.Context, board, user uuid.UUID) (bool, error)
	ModeratorExists(ctx context.Context, board, user uuid.UUID) (bool, error)
	IsParticipantBanned(ctx context.Context, board, user uuid.UUID) (bool, error)
	Get(ctx context.Context, board, user uuid.UUID) (DatabaseBoardSession, error)
	GetAll(ctx context.Context, board uuid.UUID, filter ...BoardSessionFilter) ([]DatabaseBoardSession, error)
	GetUserConnectedBoards(ctx context.Context, user uuid.UUID) ([]DatabaseBoardSession, error)
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
	ctx, span := tracer.Start(ctx, "session-create")
	defer span.End()

	span.SetAttributes(attribute.String("board", boardID.String()), attribute.String("user", userID.String()))
	session, err := service.database.Create(ctx, DatabaseBoardSessionInsert{
		Board: boardID,
		User:  userID,
		Role:  common.ParticipantRole,
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to create board session")
		span.RecordError(err)
		log.Errorw("unable to create board session", "board", boardID, "user", userID, "error", err)
		return nil, err
	}

	service.createdSession(ctx, boardID, session)

	return new(BoardSession).From(session), err
}

func (service *BoardSessionService) Update(ctx context.Context, body BoardSessionUpdateRequest) (*BoardSession, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "session-update")
	defer span.End()

	span.SetAttributes(
		attribute.String("board", body.Board.String()),
		attribute.String("user", body.User.String()),
		attribute.String("caller", body.Caller.String()),
	)
	sessionOfCaller, err := service.database.Get(ctx, body.Board, body.Caller)
	if err != nil {
		span.SetStatus(codes.Error, "failed to getboard session")
		span.RecordError(err)
		log.Errorw("unable to get board session", "board", body.Board, "calling user", body.Caller, "error", err)
		return nil, fmt.Errorf("unable to get session for board: %w", err)
	}

	if sessionOfCaller.Role == common.ParticipantRole && body.User != body.Caller {
		span.SetStatus(codes.Error, "not allowed to change user session")
		span.RecordError(err)
		return nil, common.ForbiddenError(errors.New("not allowed to change other users session"))
	}

	sessionOfUserToModify, err := service.database.Get(ctx, body.Board, body.User)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get session")
		span.RecordError(err)
		log.Errorw("unable to get board session", "board", body.Board, "target user", body.User, "error", err)
		return nil, fmt.Errorf("unable to get session for board: %w", err)
	}

	if body.Role != nil {
		if sessionOfCaller.Role == common.ParticipantRole && *body.Role != common.ParticipantRole {
			err := common.ForbiddenError(errors.New("cannot promote role"))
			span.SetStatus(codes.Error, "cannot promote role")
			span.RecordError(err)
			return nil, err
		} else if sessionOfUserToModify.Role == common.OwnerRole && *body.Role != common.OwnerRole {
			err := common.ForbiddenError(errors.New("not allowed to change owner role"))
			span.SetStatus(codes.Error, "not allowed to change owner role")
			span.RecordError(err)
			return nil, err
		} else if sessionOfUserToModify.Role != common.OwnerRole && *body.Role == common.OwnerRole {
			err := common.ForbiddenError(errors.New("not allowed to promote to owner role"))
			span.SetStatus(codes.Error, "not allowed to promote to owner role")
			span.RecordError(err)
			return nil, err
		}
	}

	session, err := service.database.Update(ctx, DatabaseBoardSessionUpdate{
		Board:             body.Board,
		User:              body.User,
		Ready:             body.Ready,
		RaisedHand:        body.RaisedHand,
		ShowHiddenColumns: body.ShowHiddenColumns,
		Role:              body.Role,
		Banned:            body.Banned,
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to update board session")
		span.RecordError(err)
		log.Errorw("unable to update board session", "board", body.Board, "error", err)
		return nil, err
	}

	service.updatedSession(ctx, body.Board, session)

	return new(BoardSession).From(session), err
}

func (service *BoardSessionService) UpdateAll(ctx context.Context, body BoardSessionsUpdateRequest) ([]*BoardSession, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "session-update-all")
	defer span.End()

	span.SetAttributes(
		attribute.String("board", body.Board.String()),
	)
	sessions, err := service.database.UpdateAll(ctx, DatabaseBoardSessionUpdate{
		Board:      body.Board,
		Ready:      body.Ready,
		RaisedHand: body.RaisedHand,
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to update all sessions")
		span.RecordError(err)
		log.Errorw("unable to update all sessions for a board", "board", body.Board, "error", err)
		return nil, err
	}

	service.updatedSessions(ctx, body.Board, sessions)

	return BoardSessions(sessions), err
}

func (service *BoardSessionService) UpdateUserBoards(ctx context.Context, body BoardSessionUpdateRequest) ([]*BoardSession, error) {
	ctx, span := tracer.Start(ctx, "session-update-user-boards")
	defer span.End()

	span.SetAttributes(
		attribute.String("board", body.Board.String()),
		attribute.String("user", body.User.String()),
		attribute.String("caller", body.Caller.String()),
	)
	connectedBoards, err := service.database.GetUserConnectedBoards(ctx, body.User)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update all sessions")
		span.RecordError(err)
		return nil, err
	}

	for _, session := range connectedBoards {
		service.updatedSession(ctx, session.Board, session)
	}

	return BoardSessions(connectedBoards), err
}

func (service *BoardSessionService) Get(ctx context.Context, boardID, userID uuid.UUID) (*BoardSession, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "session-get")
	defer span.End()

	span.SetAttributes(attribute.String("board", boardID.String()), attribute.String("user", userID.String()))
	session, err := service.database.Get(ctx, boardID, userID)
	if err != nil {
		if err == sql.ErrNoRows {
			span.SetStatus(codes.Error, "session not found")
			span.RecordError(err)
			return nil, common.NotFoundError
		}

		span.SetStatus(codes.Error, "failed to get session")
		span.RecordError(err)
		log.Errorw("unable to get session for board", "board", boardID, "session", userID, "error", err)
		return nil, fmt.Errorf("unable to get session for board: %w", err)
	}

	return new(BoardSession).From(session), err
}

func (service *BoardSessionService) GetAll(ctx context.Context, boardID uuid.UUID, filter BoardSessionFilter) ([]*BoardSession, error) {
	ctx, span := tracer.Start(ctx, "session-get-all")
	defer span.End()

	span.SetAttributes(attribute.String("board", boardID.String()))
	sessions, err := service.database.GetAll(ctx, boardID, filter)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get all session")
		span.RecordError(err)
		return nil, err
	}

	return BoardSessions(sessions), err
}

func (service *BoardSessionService) GetUserConnectedBoards(ctx context.Context, user uuid.UUID) ([]*BoardSession, error) {
	ctx, span := tracer.Start(ctx, "session-get-user-connected-boards")
	defer span.End()

	span.SetAttributes(attribute.String("user", user.String()))
	sessions, err := service.database.GetUserConnectedBoards(ctx, user)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get user connected boards")
		span.RecordError(err)
		return nil, err
	}

	return BoardSessions(sessions), err
}

func (service *BoardSessionService) Connect(ctx context.Context, boardID, userID uuid.UUID) error {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "session-connect")
	defer span.End()

	span.SetAttributes(attribute.String("board", boardID.String()), attribute.String("user", userID.String()))
	var connected = true
	updatedSession, err := service.database.Update(ctx, DatabaseBoardSessionUpdate{
		Board:     boardID,
		User:      userID,
		Connected: &connected,
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to connect to board session")
		span.RecordError(err)
		log.Errorw("unable to connect to board session", "board", boardID, "user", userID, "error", err)
		return err
	}

	service.updatedSession(ctx, boardID, updatedSession)

	return err
}

func (service *BoardSessionService) Disconnect(ctx context.Context, boardID, userID uuid.UUID) error {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "session-disconnect")
	defer span.End()

	span.SetAttributes(attribute.String("board", boardID.String()), attribute.String("user", userID.String()))
	var connected = false
	updatedSession, err := service.database.Update(ctx, DatabaseBoardSessionUpdate{
		Board:     boardID,
		User:      userID,
		Connected: &connected,
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to disconnect from board session")
		span.RecordError(err)
		log.Errorw("unable to disconnect from board session", "board", boardID, "user", userID, "error", err)
		return err
	}

	service.updatedSession(ctx, boardID, updatedSession)

	return err
}

func (service *BoardSessionService) Exists(ctx context.Context, boardID, userID uuid.UUID) (bool, error) {
	ctx, span := tracer.Start(ctx, "session-exists")
	defer span.End()

	span.SetAttributes(attribute.String("baord", boardID.String()), attribute.String("user", userID.String()))
	return service.database.Exists(ctx, boardID, userID)
}

func (service *BoardSessionService) ModeratorSessionExists(ctx context.Context, boardID, userID uuid.UUID) (bool, error) {
	return service.database.ModeratorExists(ctx, boardID, userID)
}

func (service *BoardSessionService) IsParticipantBanned(ctx context.Context, boardID, userID uuid.UUID) (bool, error) {
	ctx, span := tracer.Start(ctx, "session-is-banned")
	defer span.End()

	span.SetAttributes(attribute.String("baord", boardID.String()), attribute.String("user", userID.String()))
	return service.database.IsParticipantBanned(ctx, boardID, userID)
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

func (service *BoardSessionService) createdSession(ctx context.Context, board uuid.UUID, session DatabaseBoardSession) {
	_ = service.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
		Type: realtime.BoardEventParticipantCreated,
		Data: new(BoardSession).From(session),
	})
}

func (service *BoardSessionService) updatedSession(ctx context.Context, board uuid.UUID, session DatabaseBoardSession) {
	connectedBoards, err := service.database.GetUserConnectedBoards(ctx, session.User)
	if err != nil {
		logger.Get().Errorw("unable to get user connections", "session", session, "error", err)
		return
	}

	for _, session := range connectedBoards {
		userSession, err := service.database.Get(ctx, session.Board, session.User)
		if err != nil {
			logger.Get().Errorw("unable to get board session of user", "board", session.Board, "user", session.User, "err", err)
			return
		}
		_ = service.realtime.BroadcastToBoard(ctx, session.Board, realtime.BoardEvent{
			Type: realtime.BoardEventParticipantUpdated,
			Data: new(BoardSession).From(userSession),
		})
	}

	// Sync columns
	columns, err := service.columnService.GetAll(ctx, board)
	if err != nil {
		logger.Get().Errorw("unable to get columns", "boardID", board, "err", err)
	}
	_ = service.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
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
	_ = service.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
		Type: realtime.BoardEventNotesSync,
		Data: notes,
	})
}

func (service *BoardSessionService) updatedSessions(ctx context.Context, board uuid.UUID, sessions []DatabaseBoardSession) {
	eventSessions := make([]BoardSession, 0, len(sessions))
	for _, session := range sessions {
		eventSessions = append(eventSessions, *new(BoardSession).From(session))
	}

	_ = service.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
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
