package boards

import (
	"context"
	"errors"
	"fmt"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/sessions"

	"github.com/google/uuid"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/timeprovider"
	"scrumlr.io/server/votings"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/boards")
var meter metric.Meter = otel.Meter("scrumlr.io/server/boards")

type Service struct {
	clock    timeprovider.TimeProvider
	database BoardDatabase
	realtime *realtime.Broker

	columnService         columns.ColumnService
	notesService          notes.NotesService
	sessionService        sessions.SessionService
	sessionRequestService sessionrequests.SessionRequestService
	reactionService       reactions.ReactionService
	votingService         votings.VotingService
}

type BoardDatabase interface {
	CreateBoard(ctx context.Context, creator uuid.UUID, board DatabaseBoardInsert, columns []columns.DatabaseColumnInsert) (DatabaseBoard, error)
	UpdateBoardTimer(ctx context.Context, update DatabaseBoardTimerUpdate) (DatabaseBoard, error)
	UpdateBoard(ctx context.Context, update DatabaseBoardUpdate) (DatabaseBoard, error)
	GetBoard(ctx context.Context, id uuid.UUID) (DatabaseBoard, error)
	DeleteBoard(ctx context.Context, id uuid.UUID) error
	GetBoards(ctx context.Context, userID uuid.UUID) ([]DatabaseBoard, error)
}

func NewBoardService(db BoardDatabase, rt *realtime.Broker, sessionRequestService sessionrequests.SessionRequestService, sessionService sessions.SessionService, columnService columns.ColumnService, noteService notes.NotesService, reactionService reactions.ReactionService, votingService votings.VotingService, clock timeprovider.TimeProvider) BoardService {
	b := new(Service)
	b.clock = clock
	b.database = db
	b.realtime = rt
	b.sessionService = sessionService
	b.sessionRequestService = sessionRequestService
	b.columnService = columnService
	b.notesService = noteService
	b.reactionService = reactionService
	b.votingService = votingService

	return b
}

func (service *Service) Get(ctx context.Context, id uuid.UUID) (*Board, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.boards.service.get")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.boards.service.get.board", id.String()),
	)

	board, err := service.database.GetBoard(ctx, id)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get board")
		span.RecordError(err)
		log.Errorw("unable to get board", "boardID", id, "err", err)
		return nil, err
	}

	return new(Board).From(board), err
}

// get all associated boards of a given user
func (service *Service) GetBoards(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.boards.service.get.all")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.boards.service.get.all.user", userID.String()),
	)

	boards, err := service.database.GetBoards(ctx, userID)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get board")
		span.RecordError(err)
		log.Errorw("unable to get boards of user", "userID", userID, "err", err)
		return nil, err
	}

	result := make([]uuid.UUID, 0, len(boards))
	for _, board := range boards {
		result = append(result, board.ID)
	}

	return result, nil
}

func (service *Service) Create(ctx context.Context, body CreateBoardRequest) (*Board, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.boards.service.create")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.boards.service.create.user", body.Owner.String()),
		attribute.String("scrumlr.boards.service.create.access_policy", string(body.AccessPolicy)),
		attribute.Int("scrumlr.boards.service.crete.columns.count", len(body.Columns)),
	)

	// map request on board object to insert into database
	var board DatabaseBoardInsert
	switch body.AccessPolicy {
	case Public, ByInvite:
		board = DatabaseBoardInsert{Name: body.Name, Description: body.Description, AccessPolicy: body.AccessPolicy}
	case ByPassphrase:
		if body.Passphrase == nil || len(*body.Passphrase) == 0 {
			err := errors.New("passphrase must be set on access policy 'BY_PASSPHRASE'")
			span.SetStatus(codes.Error, "passphrase not set")
			span.RecordError(err)
			return nil, err
		}

		encodedPassphrase, salt, _ := common.Sha512WithSalt(*body.Passphrase)
		board = DatabaseBoardInsert{
			Name:         body.Name,
			Description:  body.Description,
			AccessPolicy: body.AccessPolicy,
			Passphrase:   encodedPassphrase,
			Salt:         salt,
		}
	}

	// map request on column objects to insert into database
	newColumns := make([]columns.DatabaseColumnInsert, 0, len(body.Columns))
	for index, value := range body.Columns {
		newColumns = append(newColumns,
			columns.DatabaseColumnInsert{
				Name:        value.Name,
				Description: value.Description,
				Color:       value.Color,
				Visible:     value.Visible,
				Index:       index,
			},
		)
	}

	// create the board
	b, err := service.database.CreateBoard(ctx, body.Owner, board, newColumns)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create board")
		span.RecordError(err)
		log.Errorw("unable to create board", "owner", body.Owner, "policy", body.AccessPolicy, "error", err)
		return nil, err
	}

	boardCreatedCounter.Add(ctx, 1)
	return new(Board).From(b), nil
}

func (service *Service) FullBoard(ctx context.Context, boardID uuid.UUID) (*FullBoard, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.boards.service.board.get.full")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.boards.service.board.get.full.board", boardID.String()),
	)

	board, err := service.database.GetBoard(ctx, boardID)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get board")
		span.RecordError(err)
		log.Errorw("unable to get full board", "boardID", boardID, "err", err)
		return nil, err
	}

	boardRequests, err := service.sessionRequestService.GetAll(ctx, boardID, string(sessionrequests.RequestAccepted))
	if err != nil {
		span.SetStatus(codes.Error, "failed to get session requests")
		span.RecordError(err)
		log.Errorw("unable to get full board", "boardID", boardID, "err", err)
		return nil, err
	}

	boardSessions, err := service.sessionService.GetAll(ctx, boardID, sessions.BoardSessionFilter{})
	if err != nil {
		span.SetStatus(codes.Error, "failed to get sessions")
		span.RecordError(err)
		log.Errorw("unable to get full board", "boardID", boardID, "err", err)
		return nil, err
	}

	boardColumns, err := service.columnService.GetAll(ctx, boardID)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get columns")
		span.RecordError(err)
		log.Errorw("unable to get full board", "boardID", boardID, "err", err)
		return nil, err
	}

	boardNotes, err := service.notesService.GetAll(ctx, boardID)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get notes")
		span.RecordError(err)
		log.Errorw("unable to get full board", "boardID", boardID, "err", err)
		return nil, err
	}

	boardReactions, err := service.reactionService.GetAll(ctx, boardID)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get reactions")
		span.RecordError(err)
		log.Errorw("unable to get full board", "boardID", boardID, "err", err)
		return nil, err
	}

	boardVotings, err := service.votingService.GetAll(ctx, boardID)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get votings")
		span.RecordError(err)
		log.Errorw("unable to get full board", "boardID", boardID, "err", err)
		return nil, err
	}

	boardVotes, err := service.votingService.GetVotes(ctx, boardID, votings.VoteFilter{})
	if err != nil {
		span.SetStatus(codes.Error, "failed to get votes")
		span.RecordError(err)
		log.Errorw("unable to get full board", "boardID", boardID, "err", err)
		return nil, err
	}

	return &FullBoard{
		Board:                new(Board).From(board),
		BoardSessionRequests: boardRequests,
		BoardSessions:        boardSessions,
		Columns:              boardColumns,
		Notes:                boardNotes,
		Reactions:            boardReactions,
		Votings:              boardVotings,
		Votes:                boardVotes,
	}, err
}

func (service *Service) BoardOverview(ctx context.Context, boardIDs []uuid.UUID, user uuid.UUID) ([]*BoardOverview, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.boards.service.board.get.overview")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.boards.service.board.get.overview.user", user.String()),
	)

	overviewBoards := make([]*BoardOverview, 0, len(boardIDs))
	for _, id := range boardIDs {
		board, err := service.database.GetBoard(ctx, id)
		if err != nil {
			span.SetStatus(codes.Error, "failed to get board")
			span.RecordError(err)
			log.Errorw("unable to get board overview", "board", id, "err", err)
			return nil, err
		}

		boardSessions, err := service.sessionService.GetAll(ctx, id, sessions.BoardSessionFilter{})
		if err != nil {
			span.SetStatus(codes.Error, "failed to get sessions")
			span.RecordError(err)
			log.Errorw("unable to get board overview", "board", id, "err", err)
			return nil, err
		}

		boardColumns, err := service.columnService.GetAll(ctx, id)
		if err != nil {
			span.SetStatus(codes.Error, "failed to get columns")
			span.RecordError(err)
			log.Errorw("unable to get board overview", "board", id, "err", err)
			return nil, err
		}

		participantNum := len(boardSessions)
		columnNum := len(boardColumns)
		dtoBoard := new(Board).From(board)
		for _, session := range boardSessions {
			if session.User.ID == user {
				sessionCreated := session.CreatedAt
				overviewBoards = append(overviewBoards, &BoardOverview{
					Board:        dtoBoard,
					Participants: participantNum,
					CreatedAt:    sessionCreated,
					Columns:      columnNum,
				})
			}
		}
	}
	return overviewBoards, nil
}

func (service *Service) Delete(ctx context.Context, id uuid.UUID) error {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.boards.service.board.delete")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.boards.service.board.delete.board", id.String()),
	)

	err := service.database.DeleteBoard(ctx, id)
	if err != nil {
		span.SetStatus(codes.Error, "failed to delete board")
		span.RecordError(err)
		log.Errorw("unable to delete board", "err", err)
		return err
	}

	service.DeletedBoard(ctx, id)
	boardDeletedCounter.Add(ctx, 1)

	return nil
}

func (service *Service) Update(ctx context.Context, body BoardUpdateRequest) (*Board, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.boards.service.board.update")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.boards.service.board.update.board", body.ID.String()),
	)

	update := DatabaseBoardUpdate{
		ID:                    body.ID,
		Name:                  body.Name,
		Description:           body.Description,
		ShowAuthors:           body.ShowAuthors,
		ShowNotesOfOtherUsers: body.ShowNotesOfOtherUsers,
		ShowNoteReactions:     body.ShowNoteReactions,
		AllowStacking:         body.AllowStacking,
		IsLocked:              body.IsLocked,
		TimerStart:            body.TimerStart,
		TimerEnd:              body.TimerEnd,
		SharedNote:            body.SharedNote,
	}

	if body.AccessPolicy != nil {
		update.AccessPolicy = body.AccessPolicy
		if *body.AccessPolicy == ByPassphrase {
			if body.Passphrase == nil {
				err := errors.New("passphrase must be set if policy 'BY_PASSPHRASE' is selected")
				span.SetStatus(codes.Error, "no passphrase provided")
				span.RecordError(err)
				return nil, common.BadRequestError(err)
			}

			passphrase, salt, err := common.Sha512WithSalt(*body.Passphrase)
			if err != nil {
				span.SetStatus(codes.Error, "failed to encode passphrase")
				span.RecordError(err)
				log.Error("failed to encode passphrase")
				return nil, fmt.Errorf("failed to encode passphrase: %w", err)
			}

			update.Passphrase = passphrase
			update.Salt = salt
		}
	}

	board, err := service.database.UpdateBoard(ctx, update)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update board")
		span.RecordError(err)
		log.Errorw("unable to update board", "err", err)
		return nil, err
	}

	service.UpdatedBoard(ctx, board)

	return new(Board).From(board), err
}

func (service *Service) SetTimer(ctx context.Context, id uuid.UUID, minutes uint8) (*Board, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.boards.service.board.timer.set")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.boards.service.board.timer.set.board", id.String()),
		attribute.Int("scrumlr.boards.service.board.timer.set.minutes", int(minutes)),
	)

	timerStart := service.clock.Now().Local()
	timerEnd := timerStart.Add(time.Minute * time.Duration(minutes))
	update := DatabaseBoardTimerUpdate{
		ID:         id,
		TimerStart: &timerStart,
		TimerEnd:   &timerEnd,
	}

	board, err := service.database.UpdateBoardTimer(ctx, update)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update board timer")
		span.RecordError(err)
		log.Errorw("unable to update board timer", "err", err)
		return nil, err
	}

	service.UpdatedBoardTimer(ctx, board)

	boardTimerSetCounter.Add(ctx, 1)
	return new(Board).From(board), err
}

func (service *Service) DeleteTimer(ctx context.Context, id uuid.UUID) (*Board, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.boards.service.board.timer.delete")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.boards.service.board.timer.delete.board", id.String()),
	)

	update := DatabaseBoardTimerUpdate{
		ID:         id,
		TimerStart: nil,
		TimerEnd:   nil,
	}

	board, err := service.database.UpdateBoardTimer(ctx, update)
	if err != nil {
		span.SetStatus(codes.Error, "failed to delete board timer")
		span.RecordError(err)
		log.Errorw("unable to update board timer", "err", err)
		return nil, err
	}

	service.UpdatedBoardTimer(ctx, board)

	boardTimerDeletedCounter.Add(ctx, 1)
	return new(Board).From(board), err
}

func (service *Service) IncrementTimer(ctx context.Context, id uuid.UUID) (*Board, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.boards.service.board.timer.increment")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.boards.service.board.timer.increment.board", id.String()),
	)

	board, err := service.database.GetBoard(ctx, id)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get board")
		span.RecordError(err)
		log.Errorw("unable to get board", "boardID", id, "err", err)
		return nil, err
	}

	var timerStart time.Time
	var timerEnd time.Time

	currentTime := service.clock.Now().Local()

	if board.TimerEnd.After(currentTime) {
		timerStart = *board.TimerStart
		timerEnd = board.TimerEnd.Add(time.Minute * time.Duration(1))
	} else {
		timerStart = currentTime
		timerEnd = currentTime.Add(time.Minute * time.Duration(1))
	}

	update := DatabaseBoardTimerUpdate{
		ID:         board.ID,
		TimerStart: &timerStart,
		TimerEnd:   &timerEnd,
	}

	board, err = service.database.UpdateBoardTimer(ctx, update)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update board timer")
		span.RecordError(err)
		log.Errorw("unable to update board timer", "err", err)
		return nil, err
	}

	service.UpdatedBoardTimer(ctx, board)

	return new(Board).From(board), nil
}

func (service *Service) UpdatedBoardTimer(ctx context.Context, board DatabaseBoard) {
	_ = service.realtime.BroadcastToBoard(ctx, board.ID, realtime.BoardEvent{
		Type: realtime.BoardEventBoardTimerUpdated,
		Data: new(Board).From(board),
	})
}

func (service *Service) UpdatedBoard(ctx context.Context, board DatabaseBoard) {
	_ = service.realtime.BroadcastToBoard(ctx, board.ID, realtime.BoardEvent{
		Type: realtime.BoardEventBoardUpdated,
		Data: new(Board).From(board),
	})

	err_msg, err := service.SyncBoardSettingChange(ctx, board.ID)
	if err != nil {
		logger.Get().Errorw(err_msg, "err", err)
	}
}

func (service *Service) SyncBoardSettingChange(ctx context.Context, boardID uuid.UUID) (string, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.boards.service.board.sync")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.boards.service.board.sync.board", boardID.String()),
	)

	var err_msg string
	columnsOnBoard, err := service.columnService.GetAll(ctx, boardID)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get columns")
		span.RecordError(err)
		err_msg = "unable to retrieve columns, following a updated board call"
		return err_msg, err
	}

	var columnsID []uuid.UUID
	for _, column := range columnsOnBoard {
		columnsID = append(columnsID, column.ID)
	}

	notesOnBoard, err := service.notesService.GetAll(ctx, boardID, columnsID...)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get notes")
		span.RecordError(err)
		err_msg = "unable to retrieve notes, following a updated board call"
		return err_msg, err
	}

	err = service.realtime.BroadcastToBoard(ctx, boardID, realtime.BoardEvent{
		Type: realtime.BoardEventNotesSync,
		Data: notesOnBoard,
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to broadcast notes")
		span.RecordError(err)
		err_msg = "unable to broadcast notes, following a updated board call"
		return err_msg, err
	}

	return "", err
}

func (service *Service) DeletedBoard(ctx context.Context, board uuid.UUID) {
	ctx, span := tracer.Start(ctx, "scrumlr.boards.service.board.delete")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.boards.service.board.delete.board", board.String()),
	)

	_ = service.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
		Type: realtime.BoardEventBoardDeleted,
	})
}
