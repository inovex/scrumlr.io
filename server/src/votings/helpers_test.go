package votings

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/uptrace/bun"
)

func TestVotingWithResultsWithEmptyStructs(t *testing.T) {

	var votes []DatabaseVote
	var voting DatabaseVoting

	res := getVotingWithResults(voting, votes)

	assert.Nil(t, res)
}

func TestVotingNotClosed(t *testing.T) {
	var votes []DatabaseVote
	voting := buildVoting(uuid.New(), Open, false, false)

	res := getVotingWithResults(*voting, votes)

	assert.Nil(t, res)
}

func TestVotingAndVotesIdDiffer(t *testing.T) {

	voting := buildVoting(uuid.New(), Closed, false, false)
	votes := []DatabaseVote{*buildVote(uuid.New(), uuid.New(), uuid.New())}

	res := getVotingWithResults(*voting, votes)

	assert.Nil(t, res)
}

func TestVotingAndVotesIdEqualNoUserDefined(t *testing.T) {

	voteId := uuid.New()
	noteId := uuid.New()

	voting := buildVoting(voteId, Closed, false, true)
	votes := []DatabaseVote{*buildVote(voteId, noteId, uuid.New())}

	res := getVotingWithResults(*voting, votes)

	assert.Equal(t, 1, res.Total)
	assert.Equal(t, 1, res.Votes[noteId].Total)
	assert.Nil(t, res.Votes[noteId].Users)
}

func TestShowVotesOfOthers(t *testing.T) {

	voteId := uuid.New()
	noteId := uuid.New()
	userId := uuid.New()

	voting := buildVoting(voteId, Closed, true, false)
	votes := []DatabaseVote{*buildVote(voteId, noteId, userId)}

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

	voting := buildVoting(voteId, Closed, true, false)
	votes := []DatabaseVote{*buildVote(voteId, note1Id, userId), *buildVote(voteId, note2Id, userId)}

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

	voting := buildVoting(voteId, Closed, true, false)
	votes := []DatabaseVote{*buildVote(voteId, noteId, userId), *buildVote(voteId, noteId, userId)}

	res := getVotingWithResults(*voting, votes)

	users := *res.Votes[noteId].Users

	assert.Equal(t, 2, res.Total)
	assert.Equal(t, 2, res.Votes[noteId].Total)
	assert.Equal(t, 2, users[0].Total)
	assert.Equal(t, userId, users[0].ID)
}

func TestCalculateVoteCountsWithEmptySlice(t *testing.T) {

	var noteSlice []Note
	var voting Voting

	votingCountResult := voting.calculateTotalVoteCount(noteSlice)

	assert.Equal(t, 0, votingCountResult.Total)
	assert.Empty(t, votingCountResult.Votes)
}

func TestCalculateVoteCountForSpecificNote(t *testing.T) {

	voteId := uuid.New()
	noteId := uuid.New()
	userId := uuid.New()

	noteSlice := []Note{{ID: noteId}}
	voting := Votings(
		[]DatabaseVoting{*buildVoting(voteId, Closed, true, false)},
		[]DatabaseVote{*buildVote(voteId, noteId, userId), *buildVote(voteId, noteId, userId)},
	)[0]

	votingCountResult := voting.calculateTotalVoteCount(noteSlice)

	assert.Equal(t, voting.VotingResults.Total, votingCountResult.Total)
	assert.Equal(t, voting.VotingResults.Votes[noteId].Total, votingCountResult.Votes[noteId].Total)
	assert.Equal(t, (*voting.VotingResults.Votes[noteId].Users)[0].Total, (*votingCountResult.Votes[noteId].Users)[0].Total)
}

func TestShouldReturnNoVotingResultsBecauseVotingIsStillOpen(t *testing.T) {

	voteId := uuid.New()
	noteId := uuid.New()

	voting := Votings([]DatabaseVoting{*buildVoting(voteId, Open, true, false)}, []DatabaseVote{})[0]
	noteSlice := []Note{{ID: noteId}}

	updatedVoting := voting.UpdateVoting(noteSlice)

	assert.Nil(t, updatedVoting.Voting.VotingResults)

	assert.Equal(t, noteSlice, updatedVoting.Notes)
	assert.Equal(t, voting, updatedVoting.Voting)
}

func TestShouldReturnVotingResults(t *testing.T) {

	voteId := uuid.New()
	noteId := uuid.New()
	userId := uuid.New()

	voting := Votings(
		[]DatabaseVoting{*buildVoting(voteId, Closed, true, false)},
		[]DatabaseVote{*buildVote(voteId, noteId, userId), *buildVote(voteId, noteId, userId)},
	)[0]
	noteSlice := []Note{{ID: noteId}}

	updatedVoting := voting.UpdateVoting(noteSlice)

	assert.NotNil(t, updatedVoting.Voting.VotingResults)

	assert.Equal(t, noteSlice, updatedVoting.Notes)
	assert.Equal(t, voting, updatedVoting.Voting)
}

func TestShouldUnmarshallVoteData(t *testing.T) {

	voteId := uuid.New()
	noteId := uuid.New()
	userId := uuid.New()

	voting := Votings(
		[]DatabaseVoting{*buildVoting(voteId, Closed, true, false)},
		[]DatabaseVote{*buildVote(voteId, noteId, userId), *buildVote(voteId, noteId, userId)},
	)[0]
	noteSlice := []Note{{ID: noteId}}

	updatedVoting := voting.UpdateVoting(noteSlice)
	_, err := UnmarshallVoteData(updatedVoting)

	assert.NoError(t, err)
}

func TestShouldFailUnmarshallingVoteData(t *testing.T) {

	_, err := UnmarshallVoteData("lorem ipsum")

	assert.Error(t, err)
}

//func buildNote(noteId uuid.UUID) *notes.Note {
//	return &notes.Note{
//		ID:       noteId,
//		Author:   uuid.UUID{},
//		Text:     "",
//		Edited:   false,
//		Position: notes.NotePosition{},
//	}
//}

func TestSortNotesByVotesOrdersDescending(t *testing.T) {
	note1 := Note{ID: uuid.New()}
	note2 := Note{ID: uuid.New()}
	note3 := Note{ID: uuid.New()}

	results := &VotingResults{
		Votes: map[uuid.UUID]VotingResultsPerNote{
			note1.ID: {Total: 1},
			note2.ID: {Total: 5},
			note3.ID: {Total: 3},
		},
	}

	notes := []Note{note1, note2, note3}
	sortNotesByVotes(notes, results)

	assert.Equal(t, note2.ID, notes[0].ID)
	assert.Equal(t, note3.ID, notes[1].ID)
	assert.Equal(t, note1.ID, notes[2].ID)
}

func TestSortNotesByVotesZeroVoteNotesIncludedAtEnd(t *testing.T) {
	noteWithVotes := Note{ID: uuid.New()}
	noteWithoutVotes := Note{ID: uuid.New()}

	results := &VotingResults{
		Votes: map[uuid.UUID]VotingResultsPerNote{
			noteWithVotes.ID: {Total: 3},
		},
	}

	notes := []Note{noteWithoutVotes, noteWithVotes}
	sortNotesByVotes(notes, results)

	assert.Equal(t, noteWithVotes.ID, notes[0].ID)
	assert.Equal(t, noteWithoutVotes.ID, notes[1].ID)
}

func TestSortNotesByVotesNilResults(t *testing.T) {
	note1 := Note{ID: uuid.New()}
	note2 := Note{ID: uuid.New()}

	notes := []Note{note1, note2}
	sortNotesByVotes(notes, nil)

	assert.Len(t, notes, 2)
}

func TestSortNotesByVotesEmptyInput(t *testing.T) {
	notes := []Note{}
	sortNotesByVotes(notes, &VotingResults{Votes: map[uuid.UUID]VotingResultsPerNote{}})

	assert.Empty(t, notes)
}

func buildVote(votingId uuid.UUID, noteId uuid.UUID, userId uuid.UUID) *DatabaseVote {
	return &DatabaseVote{
		Voting:    votingId,
		BaseModel: bun.BaseModel{},
		Board:     uuid.UUID{},
		User:      userId,
		Note:      noteId,
	}
}

func buildVoting(id uuid.UUID, status VotingStatus, showVotesOfOthers bool, isAnonymous bool) *DatabaseVoting {
	return &DatabaseVoting{
		ID:                 id,
		BaseModel:          bun.BaseModel{},
		Board:              uuid.UUID{},
		CreatedAt:          time.Time{},
		VoteLimit:          0,
		AllowMultipleVotes: false,
		ShowVotesOfOthers:  showVotesOfOthers,
		IsAnonymous:        isAnonymous,
		Status:             status,
	}
}
