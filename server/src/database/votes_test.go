package database

import (
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/voting"
	"testing"
)

func TestRunnerForVotes(t *testing.T) {
	t.Run("Add=0", testAddVote)
	t.Run("Add=1", testAddVoteOnClosedSessionShouldFailed)
	t.Run("Add=2", testAddVoteOnAbortedSessionShouldFailed)
	t.Run("Add=3", testAddVoteAboveLimit)
	t.Run("Add=4", testAddMultipleVotesWhenNotAllowedShouldFail)

	t.Run("Remove=0", testRemoveVote)
	t.Run("Remove=1", testRemoveVoteOnClosedSessionShouldFail)
	t.Run("Remove=2", testRemoveVoteOnAbortedSessionShouldFail)
}

func testAddVote(t *testing.T) {
	voting := fixture.MustRow("VotingDB.votingForOpenMultipleVotesTestBoard").(*voting.VotingDB)
	board := fixture.MustRow("Board.openMultipleVotesTestBoard").(*Board)
	user := fixture.MustRow("User.jack").(*User)
	note := fixture.MustRow("NoteDB.openMultipleVotesTestBoardNote").(*notes.NoteDB)

	vote, err := votingDB.AddVote(board.ID, user.ID, note.ID)
	assert.Nil(t, err)
	assert.Equal(t, voting.ID, vote.Voting)
	assert.Equal(t, user.ID, vote.User)
	assert.Equal(t, note.ID, vote.Note)
}

func testAddVoteOnClosedSessionShouldFailed(t *testing.T) {
	board := fixture.MustRow("Board.closedVotesTestBoard").(*Board)
	user := fixture.MustRow("User.jack").(*User)
	note := fixture.MustRow("NoteDB.closedVotesTestBoardNote").(*notes.NoteDB)

	_, err := votingDB.AddVote(board.ID, user.ID, note.ID)
	assert.NotNil(t, err)
}

func testAddVoteOnAbortedSessionShouldFailed(t *testing.T) {
	board := fixture.MustRow("Board.abortedVotesTestBoard").(*Board)
	user := fixture.MustRow("User.jack").(*User)
	note := fixture.MustRow("NoteDB.abortedVotesTestBoardNote").(*notes.NoteDB)

	_, err := votingDB.AddVote(board.ID, user.ID, note.ID)
	assert.NotNil(t, err)
}

func testAddVoteAboveLimit(t *testing.T) {
	board := fixture.MustRow("Board.openMultipleVotesTestBoard").(*Board)
	user := fixture.MustRow("User.jack").(*User)
	note := fixture.MustRow("NoteDB.openMultipleVotesTestBoardNote").(*notes.NoteDB)

	_, err := votingDB.AddVote(board.ID, user.ID, note.ID)
	assert.Nil(t, err)

	_, err = votingDB.AddVote(board.ID, user.ID, note.ID)
	assert.NotNil(t, err)
}

func testAddMultipleVotesWhenNotAllowedShouldFail(t *testing.T) {
	board := fixture.MustRow("Board.openSingleVotesTestBoard").(*Board)
	user := fixture.MustRow("User.jack").(*User)
	note := fixture.MustRow("NoteDB.openSingleVotesTestBoardNote").(*notes.NoteDB)

	_, err := votingDB.AddVote(board.ID, user.ID, note.ID)
	assert.Nil(t, err)

	_, err = votingDB.AddVote(board.ID, user.ID, note.ID)
	assert.NotNil(t, err)
}

func testRemoveVote(t *testing.T) {
	board := fixture.MustRow("Board.openMultipleVotesTestBoard").(*Board)
	user := fixture.MustRow("User.jack").(*User)
	note := fixture.MustRow("NoteDB.openMultipleVotesTestBoardNote").(*notes.NoteDB)

	err := votingDB.RemoveVote(board.ID, user.ID, note.ID)
	assert.Nil(t, err)
}

func testRemoveVoteOnClosedSessionShouldFail(t *testing.T) {
	board := fixture.MustRow("Board.closedVotesTestBoard").(*Board)
	user := fixture.MustRow("User.jack").(*User)
	note := fixture.MustRow("NoteDB.closedVotesTestBoardNote").(*notes.NoteDB)

	err := votingDB.RemoveVote(board.ID, user.ID, note.ID)
	assert.Nil(t, err)
}

func testRemoveVoteOnAbortedSessionShouldFail(t *testing.T) {
	board := fixture.MustRow("Board.abortedVotesTestBoard").(*Board)
	user := fixture.MustRow("User.jack").(*User)
	note := fixture.MustRow("NoteDB.abortedVotesTestBoardNote").(*notes.NoteDB)

	err := votingDB.RemoveVote(board.ID, user.ID, note.ID)
	assert.Nil(t, err)
}
