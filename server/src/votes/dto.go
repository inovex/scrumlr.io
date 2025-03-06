package votes

import (
	"github.com/google/uuid"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/notes"
)

// VotingCreateRequest represents the request to create a new voting session.
type VotingCreateRequest struct {
	Board              uuid.UUID `json:"-"`
	VoteLimit          int       `json:"voteLimit"`
	AllowMultipleVotes bool      `json:"allowMultipleVotes"`
	ShowVotesOfOthers  bool      `json:"showVotesOfOthers"`
}

// VotingUpdateRequest represents the request to update a voting session.
type VotingUpdateRequest struct {
	ID     uuid.UUID          `json:"-"`
	Board  uuid.UUID          `json:"-"`
	Status types.VotingStatus `json:"status"`
}

// Voting is the response for all voting requests.
type Voting struct {
	ID                 uuid.UUID          `json:"id"`
	VoteLimit          int                `json:"voteLimit"`
	AllowMultipleVotes bool               `json:"allowMultipleVotes"`
	ShowVotesOfOthers  bool               `json:"showVotesOfOthers"`
	Status             types.VotingStatus `json:"status"`
	VotingResults      *VotingResults     `json:"votes,omitempty"`
}

type VotingResults struct {
	Total int                                `json:"total"`
	Votes map[uuid.UUID]VotingResultsPerNote `json:"votesPerNote"`
}

type VotingResultsPerUser struct {
	ID    uuid.UUID `json:"id"`
	Total int       `json:"total"`
}

type VotingResultsPerNote struct {
	Total int                     `json:"total"`
	Users *[]VotingResultsPerUser `json:"userVotes,omitempty"`
}

type VotingUpdated struct {
	Notes  notes.NoteSlice `json:"notes"`
	Voting *Voting         `json:"voting"`
}
