package boards

import (
	"context"
	"errors"
	"fmt"
	"gopkg.in/guregu/null.v4"
	"time"

	"github.com/google/uuid"

	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/services"

	"scrumlr.io/server/common"
	"scrumlr.io/server/database"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/logger"
)

type BoardService struct {
	database *database.Database
	realtime *realtime.Broker
}

func NewBoardService(db *database.Database, rt *realtime.Broker) services.Boards {
	b := new(BoardService)
	b.database = db
	b.realtime = rt
	b.database.AttachObserver((database.BoardObserver)(b))
	return b
}

func (s *BoardService) Get(_ context.Context, id uuid.UUID) (*dto.Board, error) {
	board, err := s.database.GetBoard(id)
	if err != nil {
		return nil, err
	}
	return new(dto.Board).From(board), err
}

func (s *BoardService) Create(ctx context.Context, body dto.CreateBoardRequest) (*dto.Board, error) {
	log := logger.FromContext(ctx)
	// map request on board object to insert into database
	var board database.BoardInsert
	switch body.AccessPolicy {
	case types.AccessPolicyPublic, types.AccessPolicyByInvite:
		board = database.BoardInsert{Name: body.Name, AccessPolicy: body.AccessPolicy}
	case types.AccessPolicyByPassphrase:
		if body.Passphrase == nil || len(*body.Passphrase) == 0 {
			return nil, errors.New("passphrase must be set on access policy 'BY_PASSPHRASE'")
		}

		encodedPassphrase, salt, _ := common.Sha512WithSalt(*body.Passphrase)
		board = database.BoardInsert{
			Name:         body.Name,
			AccessPolicy: body.AccessPolicy,
			Passphrase:   encodedPassphrase,
			Salt:         salt,
		}
	}

	// map request on column objects to insert into database
	columns := make([]database.ColumnInsert, 0, len(body.Columns))
	for index, value := range body.Columns {
		var currentIndex = index
		columns = append(columns, database.ColumnInsert{Name: value.Name, Color: value.Color, Visible: value.Visible.NullBool, Index: null.NewInt(int64(currentIndex), true).NullInt64})
	}

	// create the board
	b, err := s.database.CreateBoard(body.Owner, board, columns)
	if err != nil {
		log.Errorw("unable to create board", "owner", body.Owner, "policy", body.AccessPolicy, "error", err)
		return nil, err
	}
	return new(dto.Board).From(b), nil
}

func (s *BoardService) FullBoard(ctx context.Context, boardID uuid.UUID) (*dto.Board, []*dto.BoardSessionRequest, []*dto.BoardSession, []*dto.Column, []*dto.Note, []*dto.Voting, []*dto.Vote, []*dto.Assignment, error) {
	board, requests, sessions, columns, notes, votings, votes, assignments, err := s.database.Get(boardID)
	if err != nil {
		return nil, nil, nil, nil, nil, nil, nil, nil, err
	}

	personalVotes := []*dto.Vote{}
	for _, vote := range votes {
		if vote.User == ctx.Value("User").(uuid.UUID) {
			personalVotes = append(personalVotes, new(dto.Vote).From(vote))
		}
	}

	return new(dto.Board).From(board), dto.BoardSessionRequests(requests), dto.BoardSessions(sessions), dto.Columns(columns), dto.Notes(notes), dto.Votings(votings, votes), personalVotes, dto.Assignments(assignments), err
}

func (s *BoardService) Delete(_ context.Context, id uuid.UUID) error {
	return s.database.DeleteBoard(id)
}

func (s *BoardService) Update(ctx context.Context, body dto.BoardUpdateRequest) (*dto.Board, error) {
	log := logger.FromContext(ctx)
	update := database.BoardUpdate{
		ID:                    body.ID,
		Name:                  body.Name,
		ShowAuthors:           body.ShowAuthors,
		ShowNotesOfOtherUsers: body.ShowNotesOfOtherUsers,
		AllowStacking:         body.AllowStacking,
		TimerStart:            body.TimerStart,
		TimerEnd:              body.TimerEnd,
		SharedNote:            body.SharedNote,
	}

	if body.AccessPolicy != nil {
		update.AccessPolicy = body.AccessPolicy
		if *body.AccessPolicy == types.AccessPolicyByPassphrase {
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

	board, err := s.database.UpdateBoard(update)
	if err != nil {
		return nil, err
	}
	return new(dto.Board).From(board), err
}

func (s *BoardService) SetTimer(_ context.Context, id uuid.UUID, minutes uint8) (*dto.Board, error) {
	timerStart := time.Now().Local()
	timerEnd := timerStart.Add(time.Minute * time.Duration(minutes))
	update := database.BoardTimerUpdate{
		ID:         id,
		TimerStart: &timerStart,
		TimerEnd:   &timerEnd,
	}
	board, err := s.database.UpdateBoardTimer(update)
	if err != nil {
		return nil, err
	}
	return new(dto.Board).From(board), err
}

func (s *BoardService) DeleteTimer(_ context.Context, id uuid.UUID) (*dto.Board, error) {
	update := database.BoardTimerUpdate{
		ID:         id,
		TimerStart: nil,
		TimerEnd:   nil,
	}
	board, err := s.database.UpdateBoardTimer(update)
	if err != nil {
		return nil, err
	}
	return new(dto.Board).From(board), err
}

func (s *BoardService) UpdatedBoardTimer(board database.Board) {
	err := s.realtime.BroadcastToBoard(board.ID, realtime.BoardEvent{
		Type: realtime.BoardEventBoardTimerUpdated,
		Data: new(dto.Board).From(board),
	})
	if err != nil {
		logger.Get().Errorw("unable to broadcast updated timer", "err", err)
	}
}

func (s *BoardService) UpdatedBoard(board database.Board) {
	err := s.realtime.BroadcastToBoard(board.ID, realtime.BoardEvent{
		Type: realtime.BoardEventBoardUpdated,
		Data: new(dto.Board).From(board),
	})
	if err != nil {
		logger.Get().Errorw("unable to broadcast updated board", "err", err)
	}
}

func (s *BoardService) DeletedBoard(board uuid.UUID) {
	err := s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventBoardDeleted,
	})
	if err != nil {
		logger.Get().Errorw("unable to broadcast deleted board", "err", err)
	}
}
