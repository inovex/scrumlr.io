package dto

import (
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/internal/database"
	"scrumlr.io/server/internal/database/types"
)

// Voting is the response for all voting requests.
type Voting struct {
	ID                 uuid.UUID          `json:"id"`
	VoteLimit          int                `json:"voteLimit"`
	AllowMultipleVotes bool               `json:"allowMultipleVotes"`
	ShowVotesOfOthers  bool               `json:"showVotesOfOthers"`
	Status             types.VotingStatus `json:"status"`
	VotingResults      *VotingResults     `json:"votes,omitempty"`
}

type VotingResultsPerUser struct {
	ID    uuid.UUID `json:"id"`
	Total int       `json:"total"`
}

type VotingResultsPerNote struct {
	Total int                     `json:"total"`
	Users *[]VotingResultsPerUser `json:"userVotes,omitempty"`
}

type VotingResults struct {
	Total int                                `json:"total"`
	Votes map[uuid.UUID]VotingResultsPerNote `json:"votesPerNote"`
}

func (v *Voting) From(voting database.Voting, votes []database.Vote) *Voting {
	v.ID = voting.ID
	v.VoteLimit = voting.VoteLimit
	v.AllowMultipleVotes = voting.AllowMultipleVotes
	v.ShowVotesOfOthers = voting.ShowVotesOfOthers
	v.Status = voting.Status
	v.VotingResults = getVotingWithResults(voting, votes)
	return v
}

func (*Voting) Render(_ http.ResponseWriter, _ *http.Request) error {
	return nil
}

func Votings(votings []database.Voting, votes []database.Vote) []*Voting {
	if votings == nil {
		return nil
	}

	list := make([]*Voting, len(votings))
	for index, voting := range votings {
		list[index] = new(Voting).From(voting, votes)
	}
	return list
}

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

func getVotingWithResults(voting database.Voting, votes []database.Vote) *VotingResults {
	if voting.Status != types.VotingStatusClosed {
		return nil
	}

	votesForVoting := []database.Vote{}
	for _, vote := range votes {
		if vote.Voting == voting.ID {
			votesForVoting = append(votesForVoting, vote)
		}
	}

	if len(votesForVoting) > 0 {
		votingResult := VotingResults{Total: len(votesForVoting), Votes: map[uuid.UUID]VotingResultsPerNote{}}
		totalVotePerNote := map[uuid.UUID]int{}
		votesPerUser := map[uuid.UUID][]uuid.UUID{}
		for _, vote := range votesForVoting {
			if _, ok := totalVotePerNote[vote.Note]; ok {
				totalVotePerNote[vote.Note] = totalVotePerNote[vote.Note] + 1
				votesPerUser[vote.Note] = append(votesPerUser[vote.Note], vote.User)
			} else {
				totalVotePerNote[vote.Note] = 1
				votesPerUser[vote.Note] = []uuid.UUID{vote.User}
			}
		}

		for note, total := range totalVotePerNote {
			result := VotingResultsPerNote{
				Total: total,
			}
			if voting.ShowVotesOfOthers {
				userVotes := map[uuid.UUID]int{}
				for _, user := range votesPerUser[note] {
					if _, ok := userVotes[user]; ok {
						userVotes[user] = userVotes[user] + 1
					} else {
						userVotes[user] = 1
					}
				}

				var votingResultsPerUser []VotingResultsPerUser
				for user, total := range userVotes {
					votingResultsPerUser = append(votingResultsPerUser, VotingResultsPerUser{
						ID:    user,
						Total: total,
					})
				}

				result.Users = &votingResultsPerUser
			}

			votingResult.Votes[note] = result
		}
		return &votingResult
	}
	return nil
}
