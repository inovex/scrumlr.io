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

type VotingDatabase interface {
	CreateVoting(insert VotingInsert) (VotingDB, error)
	UpdateVoting(update VotingUpdate) (VotingDB, error)
	GetVoting(board, id uuid.UUID) (VotingDB, []VoteDB, error)
	GetVotings(board uuid.UUID) ([]VotingDB, []VoteDB, error)
	GetVotes(f filter.VoteFilter) ([]VoteDB, error)
	AddVote(board, user, note uuid.UUID) (VoteDB, error)
	RemoveVote(board, user, note uuid.UUID) error
	GetOpenVoting(board uuid.UUID) (VotingDB, error)
}
