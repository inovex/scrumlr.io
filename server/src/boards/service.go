package boards

import (
	"context"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/votings"
	"time"
)

type Service struct {
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
	CreateBoard(creator uuid.UUID, board DatabaseBoardInsert, columns []columns.DatabaseColumnInsert) (DatabaseBoard, error)
	UpdateBoardTimer(update DatabaseBoardTimerUpdate) (DatabaseBoard, error)
	UpdateBoard(update DatabaseBoardUpdate) (DatabaseBoard, error)
	GetBoard(id uuid.UUID) (DatabaseBoard, error)
	DeleteBoard(id uuid.UUID) error
	GetBoards(userID uuid.UUID) ([]DatabaseBoard, error)
}

func NewBoardService(db BoardDatabase, rt *realtime.Broker, sessionRequestService sessionrequests.SessionRequestService, sessionService sessions.SessionService, noteService notes.NotesService, reactionService reactions.ReactionService, votingService votings.VotingService) BoardService {
	b := new(Service)
	b.database = db
	b.realtime = rt
	b.sessionService = sessionService
	b.sessionRequestService = sessionRequestService
	b.notesService = noteService
	b.reactionService = reactionService
	b.votingService = votingService

	return b
}

func (service *Service) Get(ctx context.Context, id uuid.UUID) (*Board, error) {
	log := logger.FromContext(ctx)
	board, err := service.database.GetBoard(id)
	if err != nil {
		log.Errorw("unable to get board", "boardID", id, "err", err)
		return nil, err
	}
	return new(Board).From(board), err
}

// get all associated boards of a given user
func (service *Service) GetBoards(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error) {
	log := logger.FromContext(ctx)
	boards, err := service.database.GetBoards(userID)
	if err != nil {
		log.Errorw("unable to get boards of user", "userID", userID, "err", err)
		return nil, err
	}

	result := make([]uuid.UUID, len(boards))
	for i, board := range boards {
		result[i] = board.ID
	}
	return result, nil
}

func (service *Service) Create(ctx context.Context, body CreateBoardRequest) (*Board, error) {
	log := logger.FromContext(ctx)
	// map request on board object to insert into database
	var board DatabaseBoardInsert
	switch body.AccessPolicy {
	case Public, ByInvite:
		board = DatabaseBoardInsert{Name: body.Name, Description: body.Description, AccessPolicy: body.AccessPolicy}
	case ByPassphrase:
		if body.Passphrase == nil || len(*body.Passphrase) == 0 {
			return nil, errors.New("passphrase must be set on access policy 'BY_PASSPHRASE'")
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
		var currentIndex = index
		newColumns = append(newColumns, columns.DatabaseColumnInsert{Name: value.Name, Color: value.Color, Visible: value.Visible, Index: &currentIndex})
	}

	// create the board
	b, err := service.database.CreateBoard(body.Owner, board, newColumns)
	if err != nil {
		log.Errorw("unable to create board", "owner", body.Owner, "policy", body.AccessPolicy, "error", err)
		return nil, err
	}

	return new(Board).From(b), nil
}

func (service *Service) FullBoard(ctx context.Context, boardID uuid.UUID) (*FullBoard, error) {
	log := logger.FromContext(ctx)

	board, err := service.database.GetBoard(boardID)
	boardRequests, err := service.sessionRequestService.GetAll(ctx, boardID, string(sessionrequests.RequestAccepted))
	boardSessions, err := service.sessionService.GetAll(ctx, boardID, sessions.BoardSessionFilter{})
	boardColumns, err := service.columnService.GetAll(ctx, boardID)
	boardNotes, err := service.notesService.GetAll(ctx, boardID)
	boardReactions, err := service.reactionService.GetAll(ctx, boardID)
	boardVotings, err := service.votingService.GetAll(ctx, boardID)
	boardVotes, err := service.votingService.GetVotes(ctx, filter.VoteFilter{Board: boardID})

	if err != nil {
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
	OverviewBoards := make([]*BoardOverview, len(boardIDs))
	for i, id := range boardIDs {
		board, err := service.database.GetBoard(id)
		boardSessions, err := service.sessionService.GetAll(ctx, id, sessions.BoardSessionFilter{})
		boardColumns, err := service.columnService.GetAll(ctx, id)
		if err != nil {
			log.Errorw("unable to get board overview", "board", id, "err", err)
			return nil, err
		}
		participantNum := len(boardSessions)
		columnNum := len(boardColumns)
		dtoBoard := new(Board).From(board)
		for _, session := range boardSessions {
			if session.User.ID == user {
				sessionCreated := session.CreatedAt
				OverviewBoards[i] = &BoardOverview{
					Board:        dtoBoard,
					Participants: participantNum,
					CreatedAt:    sessionCreated,
					Columns:      columnNum,
				}
			}
		}
	}
	return OverviewBoards, nil
}

func (service *Service) Delete(ctx context.Context, id uuid.UUID) error {
	log := logger.FromContext(ctx)
	err := service.database.DeleteBoard(id)
	if err != nil {
		log.Errorw("unable to delete board", "err", err)
	}
	return err
}

func (service *Service) Update(ctx context.Context, body BoardUpdateRequest) (*Board, error) {
	log := logger.FromContext(ctx)
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
				return nil, common.BadRequestError(errors.New("passphrase must be set if policy 'BY_PASSPHRASE' is selected"))
			}

			passphrase, salt, err := common.Sha512WithSalt(*body.Passphrase)
			if err != nil {
				log.Error("failed to encode passphrase")
				return nil, fmt.Errorf("failed to encode passphrase: %w", err)
			}

			update.Passphrase = passphrase
			update.Salt = salt
		}
	}

	board, err := service.database.UpdateBoard(update)
	if err != nil {
		log.Errorw("unable to update board", "err", err)
		return nil, err
	}
	service.UpdatedBoard(board)

	return new(Board).From(board), err
}

func (service *Service) SetTimer(ctx context.Context, id uuid.UUID, minutes uint8) (*Board, error) {
	log := logger.FromContext(ctx)
	timerStart := time.Now().Local()
	timerEnd := timerStart.Add(time.Minute * time.Duration(minutes))
	update := DatabaseBoardTimerUpdate{
		ID:         id,
		TimerStart: &timerStart,
		TimerEnd:   &timerEnd,
	}
	board, err := service.database.UpdateBoardTimer(update)
	if err != nil {
		log.Errorw("unable to update board timer", "err", err)
		return nil, err
	}
	service.UpdatedBoardTimer(board)

	return new(Board).From(board), err
}

func (service *Service) DeleteTimer(ctx context.Context, id uuid.UUID) (*Board, error) {
	log := logger.FromContext(ctx)
	update := DatabaseBoardTimerUpdate{
		ID:         id,
		TimerStart: nil,
		TimerEnd:   nil,
	}
	board, err := service.database.UpdateBoardTimer(update)
	if err != nil {
		log.Errorw("unable to update board timer", "err", err)
		return nil, err
	}
	service.UpdatedBoardTimer(board)

	return new(Board).From(board), err
}

func (service *Service) IncrementTimer(ctx context.Context, id uuid.UUID) (*Board, error) {
	log := logger.FromContext(ctx)
	board, err := service.database.GetBoard(id)
	if err != nil {
		log.Errorw("unable to get board", "boardID", id, "err", err)
		return nil, err
	}

	var timerStart time.Time
	var timerEnd time.Time

	currentTime := time.Now().Local()

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

	board, err = service.database.UpdateBoardTimer(update)
	if err != nil {
		log.Errorw("unable to update board timer", "err", err)
		return nil, err
	}
	service.UpdatedBoardTimer(board)

	return new(Board).From(board), nil
}

func (service *Service) UpdatedBoardTimer(board DatabaseBoard) {
	_ = service.realtime.BroadcastToBoard(board.ID, realtime.BoardEvent{
		Type: realtime.BoardEventBoardTimerUpdated,
		Data: new(Board).From(board),
	})
}

func (service *Service) UpdatedBoard(board DatabaseBoard) {
	_ = service.realtime.BroadcastToBoard(board.ID, realtime.BoardEvent{
		Type: realtime.BoardEventBoardUpdated,
		Data: new(Board).From(board),
	})

	err_msg, err := service.SyncBoardSettingChange(board.ID)
	if err != nil {
		logger.Get().Errorw(err_msg, "err", err)
	}
}

func (service *Service) SyncBoardSettingChange(boardID uuid.UUID) (string, error) {
	var err_msg string
	columnsOnBoard, err := service.columnService.GetAll(context.Background(), boardID)
	if err != nil {
		err_msg = "unable to retrieve columns, following a updated board call"
		return err_msg, err
	}

	var columnsID []uuid.UUID
	for _, column := range columnsOnBoard {
		columnsID = append(columnsID, column.ID)
	}
	notesOnBoard, err := service.notesService.GetAll(context.Background(), boardID, columnsID...)
	if err != nil {
		err_msg = "unable to retrieve notes, following a updated board call"
		return err_msg, err
	}

	err = service.realtime.BroadcastToBoard(boardID, realtime.BoardEvent{
		Type: realtime.BoardEventNotesSync,
		Data: notesOnBoard,
	})
	if err != nil {
		err_msg = "unable to broadcast notes, following a updated board call"
		return err_msg, err
	}
	return "", err
}

func (service *Service) DeletedBoard(board uuid.UUID) {
	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventBoardDeleted,
	})
}
