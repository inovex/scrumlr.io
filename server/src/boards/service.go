package boards

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/users"

	"github.com/google/uuid"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/hash"
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
	clock                    timeprovider.TimeProvider
	hash                     hash.Hash
	database                 BoardDatabase
	realtime                 *realtime.Broker
	boardLastModifiedUpdater BoardLastModifiedUpdater

	columnService         columns.ColumnService
	notesService          notes.NotesService
	sessionService        sessions.SessionService
	sessionRequestService sessionrequests.SessionRequestService
	reactionService       reactions.ReactionService
	votingService         votings.VotingService
	userService           users.UserService
}

type LastModifiedUpdater struct {
	database BoardDatabase
	clock    timeprovider.TimeProvider
}

type BoardDatabase interface {
	CreateBoard(ctx context.Context, board DatabaseBoardInsert) (DatabaseBoard, error)
	UpdateBoardTimer(ctx context.Context, update DatabaseBoardTimerUpdate) (DatabaseBoard, error)
	UpdateBoard(ctx context.Context, update DatabaseBoardUpdate) (DatabaseBoard, error)
	GetBoard(ctx context.Context, id uuid.UUID) (DatabaseBoard, error)
	DeleteBoard(ctx context.Context, id uuid.UUID) error
	GetBoards(ctx context.Context, userID uuid.UUID) ([]DatabaseBoard, error)
}

type BoardLastModifiedUpdater interface {
	UpdateLastModified(ctx context.Context, boardID uuid.UUID, time time.Time) error
}

func NewBoardService(
	db BoardDatabase,
	rt *realtime.Broker,
	sessionRequestService sessionrequests.SessionRequestService,
	sessionService sessions.SessionService,
	columnService columns.ColumnService,
	noteService notes.NotesService,
	reactionService reactions.ReactionService,
	votingService votings.VotingService,
	userService users.UserService,
	clock timeprovider.TimeProvider,
	hash hash.Hash,
) BoardService {
	b := new(Service)
	b.clock = clock
	b.hash = hash
	b.database = db
	b.realtime = rt
	b.sessionService = sessionService
	b.sessionRequestService = sessionRequestService
	b.columnService = columnService
	b.notesService = noteService
	b.reactionService = reactionService
	b.votingService = votingService
	b.userService = userService
	b.boardLastModifiedUpdater = NewLastModifiedUpdater(db, clock)

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

// GetBoards get all associated boards of a given user
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
		return nil, common.InternalServerError
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
		if body.Passphrase != nil {
			err := errors.New("passphrase should not be set for policies except 'BY_PASSPHRASE'")
			span.SetStatus(codes.Error, "passphrase should not be set for policies except 'BY_PASSPHRASE'")
			span.RecordError(err)
			return nil, common.BadRequestError(err)
		}

		board = DatabaseBoardInsert{Name: body.Name, Description: body.Description, AccessPolicy: body.AccessPolicy}

	case ByPassphrase:
		if body.Passphrase == nil || len(*body.Passphrase) == 0 {
			err := errors.New("passphrase must be set on access policy 'BY_PASSPHRASE'")
			span.SetStatus(codes.Error, "passphrase not set")
			span.RecordError(err)
			return nil, common.BadRequestError(err)
		}

		encodedPassphrase, salt, _ := service.hash.HashWithSalt(*body.Passphrase)
		board = DatabaseBoardInsert{
			Name:         body.Name,
			Description:  body.Description,
			AccessPolicy: body.AccessPolicy,
			Passphrase:   encodedPassphrase,
			Salt:         salt,
		}
	}

	// create the board
	b, err := service.database.CreateBoard(ctx, board)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create board")
		span.RecordError(err)
		log.Errorw("unable to create board", "owner", body.Owner, "policy", body.AccessPolicy, "error", err)
		return nil, common.InternalServerError
	}

	// create the columns
	for index, value := range body.Columns {
		column := columns.ColumnRequest{Board: b.ID, User: body.Owner, Name: value.Name, Description: value.Description, Color: value.Color, Visible: value.Visible, Index: &index}
		_, err = service.columnService.Create(ctx, column)
		if err != nil {
			span.SetStatus(codes.Error, "failed to create column")
			span.RecordError(err)
			return nil, err
		}
	}

	// create the owner session
	sessionRequest := sessions.BoardSessionCreateRequest{Board: b.ID, User: body.Owner, Role: common.OwnerRole}
	_, err = service.sessionService.Create(ctx, sessionRequest)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create session")
		span.RecordError(err)
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

	board, err := service.Get(ctx, boardID)
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
		Board:                board,
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
		board, err := service.Get(ctx, id)
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

		numColumns, err := service.columnService.GetCount(ctx, id)
		if err != nil {
			span.SetStatus(codes.Error, "failed to get columns")
			span.RecordError(err)
			log.Errorw("unable to get board overview", "board", id, "err", err)
			return nil, err
		}

		participantNum := len(boardSessions)
		for _, session := range boardSessions {
			if session.UserID == user {
				sessionCreated := session.CreatedAt
				overviewBoards = append(overviewBoards, &BoardOverview{
					Board:        board,
					Participants: participantNum,
					CreatedAt:    sessionCreated,
					Columns:      numColumns,
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

	if body.Name != nil {
		if len(*body.Name) == 0 {
			err := errors.New("name cannot be empty")
			span.SetStatus(codes.Error, "name cannot be empty")
			span.RecordError(err)
			return nil, common.BadRequestError(err)
		}
	}

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
		switch *body.AccessPolicy {
		case ByInvite, Public:
			if body.Passphrase != nil {
				err := errors.New("passphrase should not be set for policies except 'BY_PASSPHRASE'")
				span.SetStatus(codes.Error, "passphrase should not be set for policies except 'BY_PASSPHRASE'")
				span.RecordError(err)
				return nil, common.BadRequestError(err)
			}
		case ByPassphrase:
			if body.Passphrase == nil || len(*body.Passphrase) == 0 {
				err := errors.New("passphrase must be set if policy 'BY_PASSPHRASE' is selected")
				span.SetStatus(codes.Error, "no passphrase provided")
				span.RecordError(err)
				return nil, common.BadRequestError(err)
			}

			passphrase, salt, err := service.hash.HashWithSalt(*body.Passphrase)
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

	if err := service.boardLastModifiedUpdater.UpdateLastModified(ctx, board.ID, service.clock.Now()); err != nil {
		log.Warnw("unable to update last modified", "board", board, "err", err)
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
		timerEnd = board.TimerEnd.Add(time.Minute)
	} else {
		timerStart = currentTime
		timerEnd = currentTime.Add(time.Minute)
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

	err := service.SyncBoardSettingChange(ctx, board.ID)
	if err != nil {
		logger.Get().Errorw("unable to sync board setting change", "err", err)
	}
}

func (service *Service) SyncBoardSettingChange(ctx context.Context, boardID uuid.UUID) error {
	ctx, span := tracer.Start(ctx, "scrumlr.boards.service.board.sync")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.boards.service.board.sync.board", boardID.String()),
	)

	columnsOnBoard, err := service.columnService.GetAll(ctx, boardID)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get columns")
		span.RecordError(err)
		return fmt.Errorf("unable to retrieve columns, following a updated board call: %w", err)
	}

	var columnsID []uuid.UUID
	for _, column := range columnsOnBoard {
		columnsID = append(columnsID, column.ID)
	}

	notesOnBoard, err := service.notesService.GetAll(ctx, boardID, columnsID...)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get notes")
		span.RecordError(err)
		return fmt.Errorf("unable to retrieve notes, following a updated board call: %w", err)
	}

	err = service.realtime.BroadcastToBoard(ctx, boardID, realtime.BoardEvent{
		Type: realtime.BoardEventNotesSync,
		Data: notesOnBoard,
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to broadcast notes")
		span.RecordError(err)
		return fmt.Errorf("unable to broadcast notes, following a updated board call: %w", err)
	}

	return nil
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

func (service *Service) BoardEditableContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ctx, span := tracer.Start(r.Context(), "scrumlr.boards.service.board.editable")
		defer span.End()
		log := logger.FromContext(ctx)

		board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
		user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

		span.SetAttributes(
			attribute.String("scrumlr.sessions.service.context.editable.board", board.String()),
			attribute.String("scrumlr.sessions.service.context.editable.user", user.String()),
		)

		isMod, err := service.sessionService.ModeratorSessionExists(ctx, board, user)
		if err != nil {
			span.SetStatus(codes.Error, "failed to check session")
			span.RecordError(err)
			log.Errorw("unable to verify board session", "err", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		settings, err := service.Get(ctx, board)
		if err != nil {
			span.SetStatus(codes.Error, "failed to get board settings")
			span.RecordError(err)
			log.Errorw("unable to verify board settings", "err", err)
			common.Throw(w, r, common.BadRequestError(errors.New("unable to verify board settings")))
			return
		}

		if !isMod && settings.IsLocked {
			span.SetStatus(codes.Error, "not allowed to edit board")
			span.RecordError(err)
			log.Errorw("not allowed to edit board", "err", err)
			common.Throw(w, r, common.ForbiddenError(errors.New("not authorized to change board")))
			return
		}

		boardEditable := context.WithValue(ctx, identifiers.BoardEditableIdentifier, settings.IsLocked)
		next.ServeHTTP(w, r.WithContext(boardEditable))
	})
}

func NewLastModifiedUpdater(database BoardDatabase, clock timeprovider.TimeProvider) *LastModifiedUpdater {
	return &LastModifiedUpdater{database: database, clock: clock}
}

func (service *Service) Import(ctx context.Context, owner uuid.UUID, body ImportBoardRequest) (*Board, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.boards.service.board.import")
	defer span.End()

	b, err := service.createImportedBoard(ctx, owner, body)

	if err != nil {
		span.SetStatus(codes.Error, "failed to import board")
		span.RecordError(err)
		return nil, err
	}

	err = service.processImportedNotes(ctx, b.ID, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to import notes or columns")
		span.RecordError(err)
		return nil, err
	}

	return b, nil
}

func (service *Service) createImportedBoard(ctx context.Context, owner uuid.UUID, body ImportBoardRequest) (*Board, error) {
	body.Board.Owner = owner
	importColumns := make([]columns.ColumnRequest, 0, len(body.Columns))

	for _, column := range body.Columns {
		importColumns = append(importColumns, columns.ColumnRequest{
			Name:    column.Name,
			Color:   column.Color,
			Visible: &column.Visible,
			Index:   &column.Index,
		})
	}
	b, err := service.Create(ctx, CreateBoardRequest{
		Name:         body.Board.Name,
		Description:  body.Board.Description,
		AccessPolicy: body.Board.AccessPolicy,
		Passphrase:   body.Board.Passphrase,
		Columns:      importColumns,
		Owner:        owner,
	})
	return b, err
}

type parentChildNotes struct {
	Parent   notes.Note
	Children []notes.Note
}

func uniqueImportedNoteAuthors(importNotes []notes.Note) []uuid.UUID {
	participants := make([]uuid.UUID, 0, len(importNotes))
	seen := make(map[uuid.UUID]struct{}, len(importNotes))

	for _, note := range importNotes {
		if _, exists := seen[note.Author]; exists {
			continue
		}
		seen[note.Author] = struct{}{}
		participants = append(participants, note.Author)
	}

	return participants
}

func deletedImportedParticipants(participants, existingParticipants []uuid.UUID) []uuid.UUID {
	existingParticipantMap := make(map[uuid.UUID]struct{}, len(existingParticipants))
	for _, participant := range existingParticipants {
		existingParticipantMap[participant] = struct{}{}
	}

	deletedParticipants := make([]uuid.UUID, 0, len(participants))
	for _, participant := range participants {
		if _, found := existingParticipantMap[participant]; !found {
			deletedParticipants = append(deletedParticipants, participant)
		}
	}

	return deletedParticipants
}

func (service *Service) deleteNotesOfDeletedUsers(ctx context.Context, body ImportBoardRequest) (ImportBoardRequest, error) {
	if len(body.Notes) == 0 {
		return body, nil
	}

	participants := uniqueImportedNoteAuthors(body.Notes)

	existingParticipants, err := service.userService.GetExistingUserIDs(ctx, participants)
	if err != nil {
		return body, err
	}

	if len(existingParticipants) == len(participants) {
		return body, nil
	}

	deletedParticipants := deletedImportedParticipants(participants, existingParticipants)

	participantMapping := make(map[uuid.UUID]uuid.UUID, len(deletedParticipants))

	for _, deletedID := range deletedParticipants {

		// todo: check if there are notes that do no longer belong to anyone
		// if so: check if they have child nodes -> make child node parent
		// delete note
		// send message if note gets deleted
	}

	return body, nil
}

func (service *Service) processImportedNotes(ctx context.Context, boardID uuid.UUID, body ImportBoardRequest) (err error) {
	cols, err := service.columnService.GetAll(ctx, boardID)
	if err != nil {
		return err
	}

	body, err = service.deleteNotesOfDeletedUsers(ctx, body)
	if err != nil {
		return err
	}

	parentNotes, childNotes := organizeNotes(body.Notes)

	colMap := make(map[uuid.UUID]uuid.UUID)
	for i, col := range body.Columns {
		colMap[col.ID] = cols[i].ID
	}

	var organizedNotes []parentChildNotes
	for parentID, parentNote := range parentNotes {
		newColID, exists := colMap[parentNote.Position.Column]
		if !exists {
			continue
		}

		note, err := service.notesService.Import(ctx, notes.NoteImportRequest{
			Text: parentNote.Text,
			Position: notes.NotePosition{
				Column: newColID,
				Stack:  uuid.NullUUID{},
				Rank:   0,
			},
			Board: boardID,
			User:  parentNote.Author,
		})
		if err != nil {
			return err
		}

		organizedNotes = append(organizedNotes, parentChildNotes{
			Parent:   *note,
			Children: childNotes[parentID],
		})
	}

	err = service.importChildNotes(ctx, boardID, organizedNotes)
	if err != nil {
		return err
	}

	return nil
}

func organizeNotes(importNotes []notes.Note) (map[uuid.UUID]notes.Note, map[uuid.UUID][]notes.Note) {
	parentNotes := make(map[uuid.UUID]notes.Note)
	childNotes := make(map[uuid.UUID][]notes.Note)

	for _, note := range importNotes {
		if !note.Position.Stack.Valid {
			parentNotes[note.ID] = note
		} else {
			childNotes[note.Position.Stack.UUID] = append(childNotes[note.Position.Stack.UUID], note)
		}
	}
	return parentNotes, childNotes
}

func (service *Service) importChildNotes(ctx context.Context, boardID uuid.UUID, organizedNotes []parentChildNotes) error {
	for _, node := range organizedNotes {
		for _, note := range node.Children {
			_, err := service.notesService.Import(ctx, notes.NoteImportRequest{
				Text:  note.Text,
				Board: boardID,
				User:  note.Author,
				Position: notes.NotePosition{
					Column: node.Parent.Position.Column,
					Rank:   note.Position.Rank,
					Stack: uuid.NullUUID{
						UUID:  node.Parent.ID,
						Valid: true,
					},
				},
			})
			if err != nil {
				return err
			}
		}
	}
	return nil
}
