package votes

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/notes"
	"time"
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
type VoteRequest struct {
	Note  uuid.UUID `json:"note"`
	Board uuid.UUID `json:"-"`
	User  uuid.UUID `json:"-"`
}

type Vote struct {
	Voting uuid.UUID `json:"voting"`
	Note   uuid.UUID `json:"note"`
	User   uuid.UUID `json:"user"`
}

func (v *Voting) From(voting VotingDB, votes []VoteDB) *Voting {
	v.ID = voting.ID
	v.VoteLimit = voting.VoteLimit
	v.AllowMultipleVotes = voting.AllowMultipleVotes
	v.ShowVotesOfOthers = voting.ShowVotesOfOthers
	v.Status = voting.Status
	v.VotingResults = getVotingWithResults(voting, votes)
	return v
}

type VotingDB struct {
	bun.BaseModel      `bun:"table:votings"`
	ID                 uuid.UUID
	Board              uuid.UUID
	CreatedAt          time.Time
	VoteLimit          int
	AllowMultipleVotes bool
	ShowVotesOfOthers  bool
	Status             types.VotingStatus
}

type VotingInsert struct {
	bun.BaseModel      `bun:"table:votings"`
	Board              uuid.UUID
	VoteLimit          int
	AllowMultipleVotes bool
	ShowVotesOfOthers  bool
	Status             types.VotingStatus
}

type VotingUpdate struct {
	bun.BaseModel `bun:"table:votings"`
	ID            uuid.UUID
	Board         uuid.UUID
	Status        types.VotingStatus
}

type VoteDB struct {
	bun.BaseModel `bun:"table:votes"`
	Board         uuid.UUID
	Voting        uuid.UUID
	User          uuid.UUID
	Note          uuid.UUID
}

func (v *Vote) From(vote VoteDB) *Vote {
	v.Voting = vote.Voting
	v.Note = vote.Note
	v.User = vote.User
	return v
}

func Votes(votes []VoteDB) []*Vote {
	if votes == nil {
		return nil
	}

	list := make([]*Vote, len(votes))
	for index, vote := range votes {
		list[index] = new(Vote).From(vote)
	}
	return list
}
