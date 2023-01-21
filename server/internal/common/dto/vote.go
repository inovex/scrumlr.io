package dto

import (
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/internal/database"
)

// Vote is the response for all vote requests.
type Vote struct {
	Voting uuid.UUID `json:"voting"`
	Note   uuid.UUID `json:"note"`
}

func (v *Vote) From(vote database.Vote) *Vote {
	v.Voting = vote.Voting
	v.Note = vote.Note
	return v
}

func (*Vote) Render(_ http.ResponseWriter, _ *http.Request) error {
	return nil
}

func Votes(votes []database.Vote) []*Vote {
	if votes == nil {
		return nil
	}

	list := make([]*Vote, len(votes))
	for index, vote := range votes {
		list[index] = new(Vote).From(vote)
	}
	return list
}

// VoteRequest represents the request to add or delete a vote.
type VoteRequest struct {
	Note  uuid.UUID `json:"note"`
	Board uuid.UUID `json:"-"`
	User  uuid.UUID `json:"-"`
}
