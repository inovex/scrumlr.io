package votings

import (
  "net/http"

  "github.com/google/uuid"
)

type Vote struct {
  Voting uuid.UUID `json:"voting"`
  Note   uuid.UUID `json:"note"`
  User   uuid.UUID `json:"user"`
}

func (v *Vote) From(vote DatabaseVote) *Vote {
  v.Voting = vote.Voting
  v.Note = vote.Note
  v.User = vote.User
  return v
}

func Votes(votes []DatabaseVote) []*Vote {
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

// VotingCreateRequest represents the request to create a new voting session.
type VotingCreateRequest struct {
  Board              uuid.UUID `json:"-"`
  VoteLimit          int       `json:"voteLimit"`
  AllowMultipleVotes bool      `json:"allowMultipleVotes"`
  ShowVotesOfOthers  bool      `json:"showVotesOfOthers"`
  IsAnonymous        bool      `json:"isAnonymous"`
}

// VotingUpdateRequest represents the request to update a voting session.
type VotingUpdateRequest struct {
  ID     uuid.UUID    `json:"-"`
  Board  uuid.UUID    `json:"-"`
  Status VotingStatus `json:"status"`
}

// Voting is the response for all voting requests.
type Voting struct {
  ID                 uuid.UUID      `json:"id"`
  VoteLimit          int            `json:"voteLimit"`
  AllowMultipleVotes bool           `json:"allowMultipleVotes"`
  ShowVotesOfOthers  bool           `json:"showVotesOfOthers"`
  Status             VotingStatus   `json:"status"`
  VotingResults      *VotingResults `json:"votes,omitempty"`
  IsAnonymous        bool           `json:"isAnonymous"`
}

func (v *Voting) From(voting DatabaseVoting, votes []DatabaseVote) *Voting {
  v.ID = voting.ID
  v.VoteLimit = voting.VoteLimit
  v.AllowMultipleVotes = voting.AllowMultipleVotes
  v.ShowVotesOfOthers = voting.ShowVotesOfOthers
  v.Status = voting.Status
  v.VotingResults = getVotingWithResults(voting, votes)
  v.IsAnonymous = voting.IsAnonymous
  return v
}

func (*Voting) Render(_ http.ResponseWriter, _ *http.Request) error {
  return nil
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
  Notes  []Note  `json:"notes"`
  Voting *Voting `json:"voting"`
}

type VoteFilter struct {
	Voting *uuid.UUID
	User   *uuid.UUID
	Note   *uuid.UUID
}

type Note struct {
  // The id of the note
  ID uuid.UUID `json:"id"`

  // The author of the note.
  Author uuid.UUID `json:"author"`

  // The text of the note.
  Text string `json:"text"`

  Edited bool `json:"edited"`

  // The position of the note.
  Position NotePosition `json:"position"`
}

type NotePosition struct {

  // The column of the note.
  Column uuid.UUID `json:"column"`

  // The parent note for this note in a stack.
  Stack uuid.NullUUID `json:"stack"`

  // The note rank.
  Rank int `json:"rank"`
}
