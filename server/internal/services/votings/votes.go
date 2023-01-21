package votings

import (
	"context"
	"database/sql"
	"errors"
	"scrumlr.io/server/internal/common"
	"scrumlr.io/server/internal/common/dto"
	"scrumlr.io/server/internal/common/filter"
	"scrumlr.io/server/internal/logger"
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

func (s *VotingService) RemoveVote(_ context.Context, body dto.VoteRequest) error {
	return s.database.RemoveVote(body.Board, body.User, body.Note)
}

func (s *VotingService) GetVotes(_ context.Context, f filter.VoteFilter) ([]*dto.Vote, error) {
	votes, err := s.database.GetVotes(f)
	return dto.Votes(votes), err

}
