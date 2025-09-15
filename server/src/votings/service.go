package votings

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/filter"

	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

type VotingDatabase interface {
	Create(insert DatabaseVotingInsert) (DatabaseVoting, error)
	Update(update DatabaseVotingUpdate) (DatabaseVoting, error)
	Get(board, id uuid.UUID) (DatabaseVoting, error)
	GetAll(board uuid.UUID) ([]DatabaseVoting, error)
	GetVotes(f filter.VoteFilter) ([]DatabaseVote, error)
	AddVote(board, user, note uuid.UUID) (DatabaseVote, error)
	RemoveVote(board, user, note uuid.UUID) error
	GetOpenVoting(board uuid.UUID) (DatabaseVoting, error)
}

type Service struct {
	database VotingDatabase
	realtime *realtime.Broker
}

func NewVotingService(db VotingDatabase, rt *realtime.Broker) VotingService {
	service := new(Service)
	service.database = db
	service.realtime = rt

	return service
}

func (s *Service) AddVote(ctx context.Context, body VoteRequest) (*Vote, error) {
	log := logger.FromContext(ctx)
	vote, err := s.database.AddVote(body.Board, body.User, body.Note)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.ForbiddenError(errors.New("voting limit reached or no active voting session found"))
		}

		log.Warnw("unable to add vote", "board", body.Board, "user", body.User, "note", body.Note, "err", err)
		return nil, err
	}

	return new(Vote).From(vote), err
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
		return nil, err
	}

	return Votes(votes), err
}

func (s *Service) Create(ctx context.Context, body VotingCreateRequest) (*Voting, error) {
	log := logger.FromContext(ctx)
	voting, err := s.database.Create(DatabaseVotingInsert{
		Board:              body.Board,
		VoteLimit:          body.VoteLimit,
		AllowMultipleVotes: body.AllowMultipleVotes,
		ShowVotesOfOthers:  body.ShowVotesOfOthers,
		IsAnonymous:        body.IsAnonymous,
		Status:             Open,
	})

	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.BadRequestError(errors.New("only one open voting session is allowed"))
		}
		log.Errorw("unable to create voting", "board", body.Board, "error", err)
		return nil, common.InternalServerError
	}
	s.createdVoting(body.Board, voting)

	return new(Voting).From(voting, nil), err
}

func (s *Service) Update(ctx context.Context, body VotingUpdateRequest, affectedNotes []Note) (*Voting, error) {
	log := logger.FromContext(ctx)
	if body.Status == Open {
		return nil, common.BadRequestError(errors.New("not allowed ot change to open state"))
	}

	voting, err := s.database.Update(DatabaseVotingUpdate{
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

	receivedVotes, err := s.database.GetVotes(filter.VoteFilter{Board: body.Board, Voting: &body.ID})
	if err != nil {
		log.Errorw("unable to get votes", "voting", body.ID, "error", err)
		return nil, err
	}

	s.updatedVoting(body.Board, voting, receivedVotes, affectedNotes)
	return new(Voting).From(voting, receivedVotes), err
}

func (s *Service) Get(ctx context.Context, boardID, id uuid.UUID) (*Voting, error) {
	log := logger.FromContext(ctx)
	voting, err := s.database.Get(boardID, id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.NotFoundError
		}
		log.Errorw("unable to get voting session", "voting", id, "error", err)
		return nil, common.InternalServerError
	}

	if voting.Status == Open {
		return new(Voting).From(voting, []DatabaseVote{}), err
	}

	receivedVotes, err := s.database.GetVotes(filter.VoteFilter{Board: boardID, Voting: &id})
	if err != nil {
		log.Errorw("unable to get votes", "voting", id, "error", err)
		return nil, err
	}
	return new(Voting).From(voting, receivedVotes), err
}

func (s *Service) GetAll(ctx context.Context, boardID uuid.UUID) ([]*Voting, error) {
	log := logger.FromContext(ctx)
	votings, err := s.database.GetAll(boardID)
	if err != nil {
		log.Errorw("unable to get votings", "board", boardID, "error", err)
		return nil, err
	}

	votes, err := s.database.GetVotes(filter.VoteFilter{Board: boardID})
	if err != nil {
		log.Errorw("unable to get votes", "board", boardID, "error", err)
		return nil, err
	}

	return Votings(votings, votes), err
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

func (s *Service) createdVoting(board uuid.UUID, voting DatabaseVoting) {
	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventVotingCreated,
		Data: new(Voting).From(voting, nil),
	})
}

func (s *Service) updatedVoting(board uuid.UUID, voting DatabaseVoting, votes []DatabaseVote, affectedNotes []Note) {
	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventVotingUpdated,
		Data: struct {
			Voting *Voting `json:"voting"`
			Notes  []Note  `json:"notes"`
		}{
			Voting: new(Voting).From(voting, votes),
			Notes:  affectedNotes,
		},
	})
}
