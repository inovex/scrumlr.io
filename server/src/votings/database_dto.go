package votings

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type DatabaseVoting struct {
	bun.BaseModel      `bun:"table:votings,alias:voting"`
	ID                 uuid.UUID
	Board              uuid.UUID
	CreatedAt          time.Time
	VoteLimit          int
	AllowMultipleVotes bool
	ShowVotesOfOthers  bool
	IsAnonymous        bool
	Status             VotingStatus
}

type DatabaseVotingInsert struct {
	bun.BaseModel      `bun:"table:votings"`
	Board              uuid.UUID
	VoteLimit          int
	AllowMultipleVotes bool
	ShowVotesOfOthers  bool
	IsAnonymous        bool
	Status             VotingStatus
}

type DatabaseVotingUpdate struct {
	bun.BaseModel `bun:"table:votings"`
	ID            uuid.UUID
	Board         uuid.UUID
	Status        VotingStatus
}

type DatabaseVote struct {
	bun.BaseModel `bun:"table:votes"`
	Board         uuid.UUID
	Voting        uuid.UUID
	User          uuid.UUID
	Note          uuid.UUID
}
