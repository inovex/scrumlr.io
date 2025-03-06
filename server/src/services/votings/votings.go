package votings

import (
	"context"
	"database/sql"
	"errors"
	notes2 "scrumlr.io/server/notes"
	"scrumlr.io/server/votes"

	"github.com/google/uuid"

	"scrumlr.io/server/common"
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
	GetOpenVoting(board uuid.UUID) (database.Voting, error)
}

func NewVotingService(db DB, rt *realtime.Broker) services.Votings {
	b := new(VotingService)
	b.database = db
	b.realtime = rt
	return b
}

func (s *VotingService) Create(ctx context.Context, body votes.VotingCreateRequest) (*votes.Voting, error) {
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

	return new(votes.Voting).From(voting, nil), err
}

func (s *VotingService) Update(ctx context.Context, body votes.VotingUpdateRequest) (*votes.Voting, error) {
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
		receivedVotes, err := s.getVotes(ctx, body.Board, body.ID)
		if err != nil {
			log.Errorw("unable to get votes", "err", err)
			return nil, err
		}
		s.UpdatedVoting(body.Board, voting.ID)
		return new(votes.Voting).From(voting, receivedVotes), err
	}
	s.UpdatedVoting(body.Board, voting.ID)
	return new(votes.Voting).From(voting, nil), err
}

func (s *VotingService) Get(ctx context.Context, boardID, id uuid.UUID) (*votes.Voting, error) {
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
		receivedVotes, err := s.getVotes(ctx, boardID, id)
		if err != nil {
			log.Errorw("unable to get votes", "voting", id, "error", err)
			return nil, err
		}
		return new(votes.Voting).From(voting, receivedVotes), err
	}
	return new(votes.Voting).From(voting, nil), err
}

func (s *VotingService) List(ctx context.Context, boardID uuid.UUID) ([]*votes.Voting, error) {
	log := logger.FromContext(ctx)
	votings, receivedVotes, err := s.database.GetVotings(boardID)
	if err != nil {
		log.Errorw("unable to get votings", "board", boardID, "error", err)
		return nil, err
	}
	return votes.Votings(votings, receivedVotes), err
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
		Data: new(votes.Voting).From(dbVoting, nil),
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
			Voting *votes.Voting  `json:"voting"`
			Notes  []*notes2.Note `json:"notes"`
		}{
			Voting: new(votes.Voting).From(dbVoting, dbVotes),
			Notes:  notes2.Notes(notes),
		},
	})

}
