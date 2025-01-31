package votes

import "github.com/google/uuid"

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
