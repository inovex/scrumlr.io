package votings

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/filter"

	"scrumlr.io/server/logger"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
)

type VotingDatabase interface {
	Create(insert VotingInsert) (VotingDB, error)
	Update(update VotingUpdate) (VotingDB, error)
	Get(board, id uuid.UUID) (VotingDB, []VoteDB, error)
	GetAll(board uuid.UUID) ([]VotingDB, []VoteDB, error)
	GetVotes(f filter.VoteFilter) ([]VoteDB, error)
	AddVote(board, user, note uuid.UUID) (VoteDB, error)
	RemoveVote(board, user, note uuid.UUID) error
	GetOpenVoting(board uuid.UUID) (VotingDB, error)
}

type Service struct {
	database VotingDatabase
	realtime *realtime.Broker
}

func (s *Service) AddVote(ctx context.Context, body VoteRequest) (*Vote, error) {
	log := logger.FromContext(ctx)
	v, err := s.database.AddVote(body.Board, body.User, body.Note)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.ForbiddenError(errors.New("voting limit reached or no active voting session found"))
		}
		log.Warnw("unable to add vote", "board", body.Board, "user", body.User, "note", body.Note, "err", err)
		return nil, err
	}
	return new(Vote).From(v), err
}

func (s *Service) RemoveVote(ctx context.Context, body VoteRequest) error {
	log := logger.FromContext(ctx)
	err := s.database.RemoveVote(body.Board, body.User, body.Note)
	if err != nil {
		log.Errorw("unable to remove vote", "board", body.Board, "user", body.User)
	}
	return err
}

func (s *Service) GetVotes(ctx context.Context, f filter.VoteFilter) ([]*Vote, error) {
	log := logger.FromContext(ctx)
	votes, err := s.database.GetVotes(f)
	if err != nil {
		log.Errorw("unable to get votes", "err", err)
	}
	return Votes(votes), err
}

func (s *Service) Create(ctx context.Context, body VotingCreateRequest) (*Voting, error) {
	log := logger.FromContext(ctx)
	voting, err := s.database.Create(VotingInsert{
		Board:              body.Board,
		VoteLimit:          body.VoteLimit,
		AllowMultipleVotes: body.AllowMultipleVotes,
		ShowVotesOfOthers:  body.ShowVotesOfOthers,
		Status:             Open,
	})

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.BadRequestError(errors.New("only one open voting session is allowed"))
		}
		log.Errorw("unable to create voting", "board", body.Board, "error", err)
		return nil, common.InternalServerError
	}
	s.CreatedVoting(body.Board, voting.ID)

	return new(Voting).From(voting, nil), err
}

func (s *Service) Update(ctx context.Context, body VotingUpdateRequest, affectedNotes []*notes.Note) (*Voting, error) {
	log := logger.FromContext(ctx)
	if body.Status == Open {
		return nil, common.BadRequestError(errors.New("not allowed ot change to open state"))
	}

	voting, err := s.database.Update(VotingUpdate{
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

	if voting.Status == Closed {
		receivedVotes, err := s.getVotes(ctx, body.Board, body.ID)
		if err != nil {
			log.Errorw("unable to get votes", "err", err)
			return nil, err
		}
		s.UpdatedVoting(body.Board, voting, affectedNotes)
		return new(Voting).From(voting, receivedVotes), err
	}
	s.UpdatedVoting(body.Board, voting, affectedNotes)
	return new(Voting).From(voting, nil), err
}

func (s *Service) Get(ctx context.Context, boardID, id uuid.UUID) (*Voting, error) {
	log := logger.FromContext(ctx)
	voting, _, err := s.database.Get(boardID, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.NotFoundError
		}
		log.Errorw("unable to get voting session", "voting", id, "error", err)
		return nil, common.InternalServerError
	}

	if voting.Status == Closed {
		receivedVotes, err := s.getVotes(ctx, boardID, id)
		if err != nil {
			log.Errorw("unable to get votes", "voting", id, "error", err)
			return nil, err
		}
		return new(Voting).From(voting, receivedVotes), err
	}
	return new(Voting).From(voting, nil), err
}

func (s *Service) GetAll(ctx context.Context, boardID uuid.UUID) ([]*Voting, error) {
	log := logger.FromContext(ctx)
	votings, receivedVotes, err := s.database.GetAll(boardID)
	if err != nil {
		log.Errorw("unable to get votings", "board", boardID, "error", err)
		return nil, err
	}
	return Votings(votings, receivedVotes), err
}

func (s *Service) GetOpen(ctx context.Context, boardID uuid.UUID) (*Voting, error) {
	log := logger.FromContext(ctx)
	voting, err := s.database.GetOpenVoting(boardID)
	if err != nil {
		log.Errorw("nable to get open votings", "board", boardID, "error", err)
		return nil, err
	}

	return new(Voting).From(voting, nil), err
}

func (s *Service) getVotes(ctx context.Context, boardID, id uuid.UUID) ([]VoteDB, error) {
	log := logger.FromContext(ctx)
	votes, err := s.database.GetVotes(filter.VoteFilter{Board: boardID, Voting: &id})
	if err != nil {
		log.Errorw("unable to get votes", "voting", id, "error", err)
		return nil, err
	}
	return votes, err
}

func (s *Service) CreatedVoting(board, voting uuid.UUID) {
	dbVoting, _, err := s.database.Get(board, voting)
	if err != nil {
		logger.Get().Errorw("unable to get voting in created voting", "err", err)
		return
	}

	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventVotingCreated,
		Data: new(Voting).From(dbVoting, nil),
	})
}

func (s *Service) UpdatedVoting(board uuid.UUID, voting VotingDB, affectedNotes []*notes.Note) {
	dbVoting, dbVotes, err := s.database.Get(board, voting.ID)
	if err != nil {
		logger.Get().Errorw("unable to retrieve voting in updated voting", "err", err)
		return
	}
	if voting.Status == Closed {
		if err != nil {
			logger.Get().Errorw("unable to retrieve notes in updated voting", "err", err)
		}
	}

	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventVotingUpdated,
		Data: struct {
			Voting *Voting       `json:"voting"`
			Notes  []*notes.Note `json:"notes"`
		}{
			Voting: new(Voting).From(dbVoting, dbVotes),
			Notes:  affectedNotes,
		},
	})

}

func NewVotingService(db VotingDatabase, rt *realtime.Broker) VotingService {
	service := new(Service)
	service.database = db
	service.realtime = rt
	return service
}
