package votings

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
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

func (s *VotingService) UpdatedVotes(board uuid.UUID) {
  err := s.realtime.BroadcastToModeration(board, realtime.ModerationEvent{
    Type: realtime.ModerationEventVotesUpdated,
  })
  if err != nil {
    logger.Get().Errorw("unable to broadcast updated votes", "err", err)
  }
}
