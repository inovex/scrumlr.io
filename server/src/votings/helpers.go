package votings

import (
	"github.com/google/uuid"
	"scrumlr.io/server/technical_helper"
)

func Votings(votings []VotingDB, votes []VoteDB) []*Voting {
	if votings == nil {
		return nil
	}

	list := make([]*Voting, len(votings))
	for index, voting := range votings {
		list[index] = new(Voting).From(voting, votes)
	}
	return list
}

func (v *Voting) UpdateVoting(notes []uuid.UUID) *VotingUpdated {
	if v.hasNoResults() {
		return &VotingUpdated{
			Notes:  notes,
			Voting: v,
		}
	}

	v.VotingResults = v.calculateTotalVoteCount(notes)

	return &VotingUpdated{
		Notes:  notes,
		Voting: v,
	}
}

func UnmarshallVoteData(data interface{}) (*VotingUpdated, error) {
	vote, err := technical_helper.Unmarshal[VotingUpdated](data)

	if err != nil {
		return nil, err
	}

	return vote, nil
}

func getVotingWithResults(voting VotingDB, votes []VoteDB) *VotingResults {
	if voting.Status != Closed {
		return nil
	}

	relevantVoting := technical_helper.Filter[VoteDB](votes, func(vote VoteDB) bool {
		return vote.Voting == voting.ID
	})

	if len(relevantVoting) <= 0 {
		return nil
	}

	votingResult := VotingResults{Total: len(relevantVoting), Votes: map[uuid.UUID]VotingResultsPerNote{}}
	totalVotePerNote := map[uuid.UUID]int{}
	votesPerUser := map[uuid.UUID][]uuid.UUID{}
	for _, vote := range relevantVoting {
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
		if !voting.IsAnonymous {
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

func (v *Voting) calculateTotalVoteCount(notes []uuid.UUID) *VotingResults {
	totalVotingCount := 0
	votingResultsPerNode := &VotingResults{
		Votes: make(map[uuid.UUID]VotingResultsPerNote),
	}

	for _, note := range notes {
		if voteResults, ok := v.VotingResults.Votes[note]; ok { // Check if note was voted on
			votingResultsPerNode.Votes[note] = VotingResultsPerNote{
				Total: voteResults.Total,
				Users: voteResults.Users,
			}
			totalVotingCount += v.VotingResults.Votes[note].Total
		}
	}

	votingResultsPerNode.Total = totalVotingCount

	return votingResultsPerNode
}

func (v *Voting) hasNoResults() bool {
	return v.VotingResults == nil
}
