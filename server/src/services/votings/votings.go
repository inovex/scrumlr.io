package votings

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"

	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/services"

	"scrumlr.io/server/database"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/logger"
)

type VotingService struct {
	database DB
	realtime *realtime.Broker
}

type DB interface {
	CreateVoting(insert database.VotingInsert) (database.Voting, error)
	UpdateVoting(update database.VotingUpdate) (database.Voting, error)
	GetVoting(board, id uuid.UUID) (database.Voting, []database.Vote, error)
	GetVotings(board uuid.UUID) ([]database.Voting, []database.Vote, error)
	GetVotes(f filter.VoteFilter) ([]database.Vote, error)
	AddVote(board, user, note uuid.UUID) (database.Vote, error)
	RemoveVote(board, user, note uuid.UUID) error
	GetNotes(board uuid.UUID, columns ...uuid.UUID) ([]database.Note, error)
}

func NewVotingService(db DB, rt *realtime.Broker) services.Votings {
	b := new(VotingService)
	b.database = db
	b.realtime = rt
	return b
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
	s.CreatedVoting(body.Board, voting.ID)

	return new(dto.Voting).From(voting, nil), err
}

func (s *VotingService) Update(ctx context.Context, body dto.VotingUpdateRequest) (*dto.Voting, error) {
	log := logger.FromContext(ctx)
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
		log.Errorw("unable to update voting", "err", err)
		return nil, common.InternalServerError
	}

	if voting.Status == types.VotingStatusClosed {
		votes, err := s.getVotes(ctx, body.Board, body.ID)
		if err != nil {
			log.Errorw("unable to get votes", "err", err)
			return nil, err
		}
		s.UpdatedVoting(body.Board, voting.ID)
		return new(dto.Voting).From(voting, votes), err
	}
	s.UpdatedVoting(body.Board, voting.ID)
	return new(dto.Voting).From(voting, nil), err
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
		votes, err := s.getVotes(ctx, boardID, id)
		if err != nil {
			log.Errorw("unable to get votes", "voting", id, "error", err)
			return nil, err
		}
		return new(dto.Voting).From(voting, votes), err
	}
	return new(dto.Voting).From(voting, nil), err
}

func (s *VotingService) List(ctx context.Context, boardID uuid.UUID) ([]*dto.Voting, error) {
	log := logger.FromContext(ctx)
	votings, votes, err := s.database.GetVotings(boardID)
	if err != nil {
		log.Errorw("unable to get votings", "board", boardID, "error", err)
		return nil, err
	}
	return dto.Votings(votings, votes), err
}

func (s *VotingService) getVotes(ctx context.Context, boardID, id uuid.UUID) ([]database.Vote, error) {
	log := logger.FromContext(ctx)
	votes, err := s.database.GetVotes(filter.VoteFilter{Board: boardID, Voting: &id})
	if err != nil {
		log.Errorw("unable to get votes", "voting", id, "error", err)
		return nil, err
	}
	return votes, err
}

func (s *VotingService) CreatedVoting(board, voting uuid.UUID) {
	dbVoting, _, err := s.database.GetVoting(board, voting)
	if err != nil {
		logger.Get().Errorw("unable to get voting in created voting", "err", err)
		return
	}

	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventVotingCreated,
		Data: new(dto.Voting).From(dbVoting, nil),
	})
}

func (s *VotingService) UpdatedVoting(board, voting uuid.UUID) {
	var notes []database.Note
	dbVoting, dbVotes, err := s.database.GetVoting(board, voting)
	if err != nil {
		logger.Get().Errorw("unable to retrieve voting in updated voting", "err", err)
		return
	}
	if dbVoting.Status == types.VotingStatusClosed {
		notes, err = s.database.GetNotes(board)
		if err != nil {
			logger.Get().Errorw("unable to retrieve notes in updated voting", "err", err)
		}
	}

	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventVotingUpdated,
		Data: struct {
			Voting *dto.Voting `json:"voting"`
			Notes  []*dto.Note `json:"notes"`
		}{
			Voting: new(dto.Voting).From(dbVoting, dbVotes),
			Notes:  dto.Notes(notes),
		},
	})

}
