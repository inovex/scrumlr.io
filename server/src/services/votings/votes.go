package votings

import (
	"context"
	"database/sql"
	"errors"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/logger"
)

func (s *VotingService) AddVote(ctx context.Context, body dto.VoteRequest) (*dto.Vote, error) {
	log := logger.FromContext(ctx)
	v, err := s.database.AddVote(body.Board, body.User, body.Note)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.ForbiddenError(errors.New("voting limit reached or no active voting session found"))
		}
		log.Warnw("unable to add vote", "board", body.Board, "user", body.User, "note", body.Note, "err", err)
		return nil, err
	}
	return new(dto.Vote).From(v), err
}

func (s *VotingService) RemoveVote(ctx context.Context, body dto.VoteRequest) error {
	log := logger.FromContext(ctx)
	err := s.database.RemoveVote(body.Board, body.User, body.Note)
	if err != nil {
		log.Errorw("unable to remove vote", "board", body.Board, "user", body.User)
	}
	return err
}

func (s *VotingService) GetVotes(ctx context.Context, f filter.VoteFilter) ([]*dto.Vote, error) {
	log := logger.FromContext(ctx)
	votes, err := s.database.GetVotes(f)
	if err != nil {
		log.Errorw("unable to get votes", "err", err)
	}
	return dto.Votes(votes), err
}
