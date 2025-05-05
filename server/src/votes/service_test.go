package votes

import (
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/uptrace/bun"
	"scrumlr.io/server/database"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/notes"
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

func TestCalculateVoteCountsWithEmptySlice(t *testing.T) {

	var noteSlice notes.NoteSlice
	var voting Voting

	votingCountResult := voting.calculateTotalVoteCount(noteSlice)

	assert.Equal(t, 0, votingCountResult.Total)
	assert.Empty(t, votingCountResult.Votes)
}

func TestCalculateVoteCountForSpecificNote(t *testing.T) {

	voteId := uuid.New()
	noteId := uuid.New()
	userId := uuid.New()

	noteSlice := notes.NoteSlice{buildNote(noteId)}
	voting := Votings([]database.Voting{*buildVoting(voteId, types.VotingStatusClosed, true)}, []database.Vote{*buildVote(voteId, noteId, userId), *buildVote(voteId, noteId, userId)})[0]

	votingCountResult := voting.calculateTotalVoteCount(noteSlice)

	assert.Equal(t, voting.VotingResults.Total, votingCountResult.Total)
	assert.Equal(t, voting.VotingResults.Votes[noteId].Total, votingCountResult.Votes[noteId].Total)
	assert.Equal(t, (*voting.VotingResults.Votes[noteId].Users)[0].Total, (*votingCountResult.Votes[noteId].Users)[0].Total)
}

func TestShouldReturnNoVotingResultsBecauseVotingIsStillOpen(t *testing.T) {

	voteId := uuid.New()
	noteId := uuid.New()

	voting := Votings([]database.Voting{*buildVoting(voteId, types.VotingStatusOpen, true)}, []database.Vote{})[0]
	noteSlice := notes.NoteSlice{buildNote(noteId)}

	updatedVoting := voting.UpdateVoting(noteSlice)

	assert.Nil(t, updatedVoting.Voting.VotingResults)

	assert.Equal(t, noteSlice, updatedVoting.Notes)
	assert.Equal(t, voting, updatedVoting.Voting)
}

func TestShouldReturnVotingResults(t *testing.T) {

	voteId := uuid.New()
	noteId := uuid.New()
	userId := uuid.New()

	voting := Votings([]database.Voting{*buildVoting(voteId, types.VotingStatusClosed, true)}, []database.Vote{*buildVote(voteId, noteId, userId), *buildVote(voteId, noteId, userId)})[0]
	noteSlice := notes.NoteSlice{buildNote(noteId)}

	updatedVoting := voting.UpdateVoting(noteSlice)

	assert.NotNil(t, updatedVoting.Voting.VotingResults)

	assert.Equal(t, noteSlice, updatedVoting.Notes)
	assert.Equal(t, voting, updatedVoting.Voting)
}

func TestShouldUnmarshallVoteData(t *testing.T) {

	voteId := uuid.New()
	noteId := uuid.New()
	userId := uuid.New()

	voting := Votings([]database.Voting{*buildVoting(voteId, types.VotingStatusClosed, true)}, []database.Vote{*buildVote(voteId, noteId, userId), *buildVote(voteId, noteId, userId)})[0]
	noteSlice := notes.NoteSlice{buildNote(noteId)}

	updatedVoting := voting.UpdateVoting(noteSlice)
	_, err := UnmarshallVoteData(updatedVoting)

	assert.NoError(t, err)
}

func TestShouldFailUnmarshallingVoteData(t *testing.T) {

	_, err := UnmarshallVoteData("lorem ipsum")

	assert.Error(t, err)
}

func buildNote(noteId uuid.UUID) *notes.Note {
	return &notes.Note{
		ID:       noteId,
		Author:   uuid.UUID{},
		Text:     "",
		Edited:   false,
		Position: notes.NotePosition{},
	}
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
