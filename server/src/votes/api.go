package votes

import (
  "context"
  "github.com/google/uuid"
  "scrumlr.io/server/common/filter"
)

type VotingService interface {
  Create(ctx context.Context, body VotingCreateRequest) (*Voting, error)
  Update(ctx context.Context, body VotingUpdateRequest) (*Voting, error)
  Get(ctx context.Context, board, id uuid.UUID) (*Voting, error)
  List(ctx context.Context, board uuid.UUID) ([]*Voting, error)

  AddVote(ctx context.Context, req VoteRequest) (*Vote, error)
  RemoveVote(ctx context.Context, req VoteRequest) error
  GetVotes(ctx context.Context, f filter.VoteFilter) ([]*Vote, error)
}

type ReactionApi struct {
  service VotingService
}

func NewReactionApi(service VotingService) *ReactionApi {
  api := new(ReactionApi)
  api.service = service

  return api
}
