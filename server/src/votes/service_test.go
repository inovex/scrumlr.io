package votes

import (
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/uptrace/bun"
	"scrumlr.io/server/database"
	"scrumlr.io/server/database/types"
	"testing"
	"time"
)

func TestVotingWithResultsWithEmptyStructs(t *testing.T) {

	var votes []database.Vote
	var voting database.Voting

	res := getVotingWithResults(voting, votes)

	assert.Nil(t, res)
}

func TestVotingNotClosed(t *testing.T) {
	var votes []database.Vote
	voting := buildVoting(uuid.New(), types.VotingStatusOpen, false)

	res := getVotingWithResults(*voting, votes)

	assert.Nil(t, res)
}

func TestVotingAndVotesIdDiffer(t *testing.T) {

	voting := buildVoting(uuid.New(), types.VotingStatusClosed, false)
	votes := []database.Vote{*buildVote(uuid.New(), uuid.New(), uuid.New())}

	res := getVotingWithResults(*voting, votes)

	assert.Nil(t, res)
}

func TestVotingAndVotesIdEqualNoUserDefined(t *testing.T) {

	voteId := uuid.New()
	noteId := uuid.New()

	voting := buildVoting(voteId, types.VotingStatusClosed, false)
	votes := []database.Vote{*buildVote(voteId, noteId, uuid.New())}

	res := getVotingWithResults(*voting, votes)

	assert.Equal(t, 1, res.Total)
	assert.Equal(t, 1, res.Votes[noteId].Total)
	assert.Nil(t, res.Votes[noteId].Users)
}

func TestShowVotesOfOthers(t *testing.T) {

	voteId := uuid.New()
	noteId := uuid.New()
	userId := uuid.New()

	voting := buildVoting(voteId, types.VotingStatusClosed, true)
	votes := []database.Vote{*buildVote(voteId, noteId, userId)}

	res := getVotingWithResults(*voting, votes)

	users := *res.Votes[noteId].Users

	assert.Equal(t, 1, res.Total)
	assert.Equal(t, 1, res.Votes[noteId].Total)
	assert.Equal(t, 1, users[0].Total)
	assert.Equal(t, userId, users[0].ID)
}

func TestMultipleVotesForDifferentNotesFromOneUser(t *testing.T) {

	voteId := uuid.New()
	note1Id := uuid.New()
	note2Id := uuid.New()
	userId := uuid.New()

	voting := buildVoting(voteId, types.VotingStatusClosed, true)
	votes := []database.Vote{*buildVote(voteId, note1Id, userId), *buildVote(voteId, note2Id, userId)}

	res := getVotingWithResults(*voting, votes)

	usersNote1 := *res.Votes[note1Id].Users
	usersNote2 := *res.Votes[note2Id].Users

	assert.Equal(t, 2, res.Total)
	assert.Equal(t, 1, res.Votes[note1Id].Total)
	assert.Equal(t, 1, res.Votes[note2Id].Total)
	assert.Equal(t, 1, usersNote1[0].Total)
	assert.Equal(t, 1, usersNote2[0].Total)
	assert.Equal(t, userId, usersNote1[0].ID)
}

func TestMultipleVotesForOneNoteFromOneUser(t *testing.T) {

	voteId := uuid.New()
	noteId := uuid.New()
	userId := uuid.New()

	voting := buildVoting(voteId, types.VotingStatusClosed, true)
	votes := []database.Vote{*buildVote(voteId, noteId, userId), *buildVote(voteId, noteId, userId)}

	res := getVotingWithResults(*voting, votes)

	users := *res.Votes[noteId].Users

	assert.Equal(t, 2, res.Total)
	assert.Equal(t, 2, res.Votes[noteId].Total)
	assert.Equal(t, 2, users[0].Total)
	assert.Equal(t, userId, users[0].ID)
}

func buildVote(votingId uuid.UUID, noteId uuid.UUID, userId uuid.UUID) *database.Vote {
	return &database.Vote{
		Voting:    votingId,
		BaseModel: bun.BaseModel{},
		Board:     uuid.UUID{},
		User:      userId,
		Note:      noteId,
	}
}

func buildVoting(id uuid.UUID, status types.VotingStatus, showVotesOfOthers bool) *database.Voting {
	return &database.Voting{
		ID:                 id,
		BaseModel:          bun.BaseModel{},
		Board:              uuid.UUID{},
		CreatedAt:          time.Time{},
		VoteLimit:          0,
		AllowMultipleVotes: false,
		ShowVotesOfOthers:  showVotesOfOthers,
		Status:             status,
	}
}
