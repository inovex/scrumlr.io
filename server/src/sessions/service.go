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
	GetUserBoardSessions(ctx context.Context, user uuid.UUID) ([]DatabaseBoardSession, error)
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

func (service *BoardSessionService) Create(ctx context.Context, body BoardSessionCreateRequest) (*BoardSession, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.sessions.service.create")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.sessions.service.create.board", body.Board.String()),
		attribute.String("scrumlr.sessions.service.create.user", body.User.String()),
		attribute.String("scrumlr.sessions.service.create.role", string(body.Role)),
	)

	session, err := service.database.Create(ctx, DatabaseBoardSessionInsert{
		Board: body.Board,
		User:  body.User,
		Role:  body.Role,
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to create board session")
		span.RecordError(err)
		log.Errorw("unable to create board session", "board", body.Board, "user", body.User, "error", err)
		return nil, err
	}

	service.createdSession(ctx, body.Board, session)

	sessionCreatedCounter.Add(ctx, 1)
	return new(BoardSession).From(session), err
}

func (service *BoardSessionService) Update(ctx context.Context, body BoardSessionUpdateRequest) (*BoardSession, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.sessions.service.update")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.sessions.service.update.board", body.Board.String()),
		attribute.String("scrumlr.sessions.service.update.user", body.User.String()),
		attribute.String("scrumlr.sessions.service.update.caller", body.Caller.String()),
	)

	sessionOfCaller, err := service.database.Get(ctx, body.Board, body.Caller)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get board session")
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

	service.updatedSession(ctx, body.Board, body.User)

	if body.Banned != nil {
		if *body.Banned {
			bannedSessionsCounter.Add(ctx, 1)
		}
	}
	return new(BoardSession).From(session), err
}

func (service *BoardSessionService) UpdateAll(ctx context.Context, body BoardSessionsUpdateRequest) ([]*BoardSession, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.sessions.service.update.all")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.sessions.service.update.all.board", body.Board.String()),
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

func (service *BoardSessionService) Get(ctx context.Context, boardID, userID uuid.UUID) (*BoardSession, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.sessions.service.get")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.sessions.service.get.board", boardID.String()),
		attribute.String("scrumlr.sessions.service.get.user", userID.String()),
	)

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
	ctx, span := tracer.Start(ctx, "scrumlr.sessions.service.get.all")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.sessions.service.get.all.board", boardID.String()),
	)

	sessions, err := service.database.GetAll(ctx, boardID, filter)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get all session")
		span.RecordError(err)
		return nil, err
	}

	return BoardSessions(sessions), err
}

func (service *BoardSessionService) GetUserConnectedBoards(ctx context.Context, user uuid.UUID) ([]*BoardSession, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.sessions.service.get.user_connected_boards")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.sessions.service.get.user_connected_boards.user", user.String()),
	)

	sessions, err := service.database.GetUserConnectedBoards(ctx, user)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get user connected boards")
		span.RecordError(err)
		return nil, err
	}

	return BoardSessions(sessions), err
}

func (service *BoardSessionService) GetUserBoardSessions(ctx context.Context, user uuid.UUID) ([]*BoardSession, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.sessions.service.get.user_boards")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.sessions.service.get.user_boards.user", user.String()),
	)

	sessions, err := service.database.GetUserBoardSessions(ctx, user)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get user boards")
		span.RecordError(err)
		return nil, err
	}

	return BoardSessions(sessions), err
}

func (service *BoardSessionService) Connect(ctx context.Context, boardID, userID uuid.UUID) error {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.sessions.service.connect")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.sessions.service.connect.board", boardID.String()),
		attribute.String("scrumlr.sessions.service.connect.user", userID.String()),
	)

	var connected = true
	_, err := service.database.Update(ctx, DatabaseBoardSessionUpdate{
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

	service.updatedSession(ctx, boardID, userID)

	connectedSessions.Add(ctx, 1)
	return err
}

func (service *BoardSessionService) Disconnect(ctx context.Context, boardID, userID uuid.UUID) error {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.sessions.service.disconnect")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.sessions.service.disconnect.board", boardID.String()),
		attribute.String("scrumlr.sessions.service.disconnect.user", userID.String()),
	)

	var connected = false
	_, err := service.database.Update(ctx, DatabaseBoardSessionUpdate{
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

	service.updatedSession(ctx, boardID, userID)

	connectedSessions.Add(ctx, -1)
	return err
}

func (service *BoardSessionService) Exists(ctx context.Context, boardID, userID uuid.UUID) (bool, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.sessions.service.exists")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.sessions.service.exists.baord", boardID.String()),
		attribute.String("scrumlr.sessions.service.exists.user", userID.String()),
	)

	return service.database.Exists(ctx, boardID, userID)
}

func (service *BoardSessionService) ModeratorSessionExists(ctx context.Context, boardID, userID uuid.UUID) (bool, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.sessions.service.exists.moderator")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.sessions.service.exists.moderator.baord", boardID.String()),
		attribute.String("scrumlr.sessions.service.exists.moderator.user", userID.String()),
	)

	return service.database.ModeratorExists(ctx, boardID, userID)
}

func (service *BoardSessionService) IsParticipantBanned(ctx context.Context, boardID, userID uuid.UUID) (bool, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.sessions.service.is_banned")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.sessions.service.is_banned.baord", boardID.String()),
		attribute.String("scrumlr.sessions.service.is_banned.user", userID.String()),
	)

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
	ctx, span := tracer.Start(ctx, "scrumlr.sessions.service.create")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.sessions.service.create.board", board.String()),
		attribute.String("scrumlr.sessions.service.create.user", session.User.String()),
	)

	err := service.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
		Type: realtime.BoardEventParticipantCreated,
		Data: new(BoardSession).From(session),
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to send participant update")
		span.RecordError(err)
		log.Errorw("unable to send participant update", "session", session, "error", err)
	}
}

func (service *BoardSessionService) updatedSession(ctx context.Context, board uuid.UUID, userId uuid.UUID) {
	ctx, span := tracer.Start(ctx, "scrumlr.sessions.service.update")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.sessions.service.update.board", board.String()),
		attribute.String("scrumlr.sessions.service.update.user", userId.String()),
	)

	connectedBoards, err := service.database.GetUserConnectedBoards(ctx, userId)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get user connections")
		span.RecordError(err)
		log.Errorw("unable to get user connections", "userId", userId, "error", err)
		return
	}

	for _, s := range connectedBoards {
		userSession, err := service.database.Get(ctx, s.Board, s.User)
		if err != nil {
			span.SetStatus(codes.Error, "failed to get board sessions of user")
			span.RecordError(err)
			log.Errorw("unable to get board session of user", "board", s.Board, "user", s.User, "err", err)
			continue
		}

		err = service.realtime.BroadcastToBoard(ctx, s.Board, realtime.BoardEvent{
			Type: realtime.BoardEventParticipantUpdated,
			Data: new(BoardSession).From(userSession),
		})

		if err != nil {
			span.SetStatus(codes.Error, "failed to send participant update")
			span.RecordError(err)
			log.Errorw("unable to send participant update", "board", board, "user", userId, "err", err)
		}
	}

	// Sync columns
	columns, err := service.columnService.GetAll(ctx, board)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get columns")
		span.RecordError(err)
		log.Errorw("unable to get columns", "boardID", board, "err", err)
	}

	err = service.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: columns,
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to send columns update")
		span.RecordError(err)
		log.Errorw("unable to send columns update", "board", board, "user", userId, "err", err)
	}

	columnIds := make([]uuid.UUID, 0, len(columns))
	for _, column := range columns {
		columnIds = append(columnIds, column.ID)
	}
	// Sync notes
	notes, err := service.noteService.GetAll(ctx, board, columnIds...)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get notes")
		span.RecordError(err)
		log.Errorw("unable to get notes on a updatedsession call", "err", err)
	}

	err = service.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
		Type: realtime.BoardEventNotesSync,
		Data: notes,
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to send note sync")
		span.RecordError(err)
		log.Errorw("unable to send note sync", "board", board, "user", userId, "err", err)
	}
}

func (service *BoardSessionService) updatedSessions(ctx context.Context, board uuid.UUID, sessions []DatabaseBoardSession) {
	ctx, span := tracer.Start(ctx, "scrumlr.sessions.service.update")
	defer span.End()
	log := logger.FromContext(ctx)

	eventSessions := make([]BoardSession, 0, len(sessions))
	for _, session := range sessions {
		eventSessions = append(eventSessions, *new(BoardSession).From(session))
	}

	err := service.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
		Type: realtime.BoardEventParticipantsUpdated,
		Data: eventSessions,
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to send participant update")
		span.RecordError(err)
		log.Errorw("unable to send participant update", "board", board, "err", err)
	}
}

func CheckSessionRole(clientID uuid.UUID, sessions []*BoardSession, sessionsRoles []common.SessionRole) bool {
	for _, session := range sessions {
		if clientID == session.UserID {
			if slices.Contains(sessionsRoles, session.Role) {
				return true
			}
		}
	}
	return false
}
