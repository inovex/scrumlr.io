package votings

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"

	"scrumlr.io/server/internal/common"
	"scrumlr.io/server/internal/common/dto"
	"scrumlr.io/server/internal/common/filter"
	"scrumlr.io/server/internal/realtime"
	"scrumlr.io/server/internal/services"

	"scrumlr.io/server/internal/database"
	"scrumlr.io/server/internal/database/types"
	"scrumlr.io/server/internal/logger"
)

type VotingService struct {
	database *database.Database
	realtime *realtime.Broker
}

func NewVotingService(db *database.Database, rt *realtime.Broker) services.Votings {
	b := new(VotingService)
	b.database = db
	b.realtime = rt
	b.database.AttachObserver((database.VotingObserver)(b))
	return b
}

func (s *VotingService) Get(ctx context.Context, boardID, id uuid.UUID) (*dto.Voting, error) {
	log := logger.FromContext(ctx)
	voting, _, err := s.database.GetVoting(boardID, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.NotFoundError
		}
		log.Errorw("unable to get voting session", "voting", id, "error", err)
		return nil, common.InternalServerError
	}

	if voting.Status == types.VotingStatusClosed {
		votes, _ := s.getVotes(ctx, boardID, id)
		return new(dto.Voting).From(voting, votes), err
	}
	return new(dto.Voting).From(voting, nil), err
}

func (s *VotingService) Create(ctx context.Context, body dto.VotingCreateRequest) (*dto.Voting, error) {
	log := logger.FromContext(ctx)
	voting, err := s.database.CreateVoting(database.VotingInsert{
		Board:              body.Board,
		VoteLimit:          body.VoteLimit,
		AllowMultipleVotes: body.AllowMultipleVotes,
		ShowVotesOfOthers:  body.ShowVotesOfOthers,
		Status:             types.VotingStatusOpen,
	})

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.BadRequestError(errors.New("only one open voting session is allowed"))
		}
		log.Errorw("unable to create voting", "board", body.Board, "error", err)
		return nil, common.InternalServerError
	}

	return new(dto.Voting).From(voting, nil), err
}

func (s *VotingService) Update(ctx context.Context, body dto.VotingUpdateRequest) (*dto.Voting, error) {
	if body.Status == types.VotingStatusOpen {
		return nil, common.BadRequestError(errors.New("not allowed ot change to open state"))
	}

	voting, err := s.database.UpdateVoting(database.VotingUpdate{
		ID:     body.ID,
		Board:  body.Board,
		Status: body.Status,
	})
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.NotFoundError
		}
		return nil, common.InternalServerError
	}

	if voting.Status == types.VotingStatusClosed {
		votes, _ := s.getVotes(ctx, body.Board, body.ID)
		return new(dto.Voting).From(voting, votes), err
	}
	return new(dto.Voting).From(voting, nil), err
}

func (s *VotingService) List(_ context.Context, boardID uuid.UUID) ([]*dto.Voting, error) {
	votings, votes, err := s.database.GetVotings(boardID)
	return dto.Votings(votings, votes), err
}

func (s *VotingService) getVotes(_ context.Context, boardID, id uuid.UUID) ([]database.Vote, error) {
	return s.database.GetVotes(filter.VoteFilter{Board: boardID, Voting: &id})
}

func (s *VotingService) CreatedVoting(board uuid.UUID, voting database.Voting) {
	err := s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventVotingCreated,
		Data: new(dto.Voting).From(voting, nil),
	})
	if err != nil {
		logger.Get().Errorw("unable to broadcast created voting", "err", err)
	}
}

func (s *VotingService) UpdatedVoting(board uuid.UUID, voting database.Voting) {
	var notes []database.Note
	var votes []database.Vote
	if voting.Status == types.VotingStatusClosed {
		notes, _ = s.database.GetNotes(board)
		votes, _ = s.getVotes(context.Background(), board, voting.ID)
	}

	err := s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventVotingUpdated,
		Data: struct {
			Voting *dto.Voting `json:"voting"`
			Notes  []*dto.Note `json:"notes"`
		}{
			Voting: new(dto.Voting).From(voting, votes),
			Notes:  dto.Notes(notes),
		},
	})
	if err != nil {
		logger.Get().Errorw("unable to broadcast updated voting", "err", err)
	}
}
