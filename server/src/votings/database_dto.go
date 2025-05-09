package votings

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"time"
)

type VotingDB struct {
	bun.BaseModel      `bun:"table:votings"`
	ID                 uuid.UUID
	Board              uuid.UUID
	CreatedAt          time.Time
	VoteLimit          int
	AllowMultipleVotes bool
	ShowVotesOfOthers  bool
	Status             VotingStatus
}

type VotingInsert struct {
	bun.BaseModel      `bun:"table:votings"`
	Board              uuid.UUID
	VoteLimit          int
	AllowMultipleVotes bool
	ShowVotesOfOthers  bool
	Status             VotingStatus
}

type VotingUpdate struct {
	bun.BaseModel `bun:"table:votings"`
	ID            uuid.UUID
	Board         uuid.UUID
	Status        VotingStatus
}

type VoteDB struct {
	bun.BaseModel `bun:"table:votes"`
	Board         uuid.UUID
	Voting        uuid.UUID
	User          uuid.UUID
	Note          uuid.UUID
}
