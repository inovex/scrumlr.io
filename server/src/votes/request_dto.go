package votes

import (
	"github.com/google/uuid"
	"scrumlr.io/server/database/types"
)

// VotingCreateRequest represents the request to create a new voting session.
type VotingCreateRequest struct {
	Board              uuid.UUID `json:"-"`
	VoteLimit          int       `json:"voteLimit"`
	AllowMultipleVotes bool      `json:"allowMultipleVotes"`
	ShowVotesOfOthers  bool      `json:"showVotesOfOthers"`
}

// VotingUpdateRequest represents the request to u pdate a voting session.
type VotingUpdateRequest struct {
	ID     uuid.UUID          `json:"-"`
	Board  uuid.UUID          `json:"-"`
	Status types.VotingStatus `json:"status"`
}
