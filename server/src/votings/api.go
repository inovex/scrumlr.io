package votings

import (
	"context"
	"github.com/google/uuid"
	"scrumlr.io/server/common/filter"
)

type VotingService interface {
	Create(ctx context.Context, body VotingCreateRequest) (*Voting, error)
	Update(ctx context.Context, body VotingUpdateRequest, affectedNotes []Note) (*Voting, error)
	Get(ctx context.Context, board, id uuid.UUID) (*Voting, error)
	GetAll(ctx context.Context, board uuid.UUID) ([]*Voting, error)
	GetOpen(ctx context.Context, board uuid.UUID) (*Voting, error)

	AddVote(ctx context.Context, req VoteRequest) (*Vote, error)
	RemoveVote(ctx context.Context, req VoteRequest) error
	GetVotes(ctx context.Context, f filter.VoteFilter) ([]*Vote, error)
}

type VotingApi struct {
	service VotingService
}

func NewVotingApi(service VotingService) *VotingApi {
	api := new(VotingApi)
	api.service = service

	return api
}
