package database

import (
	"scrumlr.io/server/boards"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/votings"
	"testing"

	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/notes"
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
	voting := fixture.MustRow("DatabaseVoting.votingForOpenMultipleVotesTestBoard").(*votings.DatabaseVoting)
	board := fixture.MustRow("DatabaseBoard.openMultipleVotesTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)
	note := fixture.MustRow("DatabaseNote.openMultipleVotesTestBoardNote").(*notes.DatabaseNote)

	vote, err := votingDb.AddVote(board.ID, user.ID, note.ID)
	assert.Nil(t, err)
	assert.Equal(t, voting.ID, vote.Voting)
	assert.Equal(t, user.ID, vote.User)
	assert.Equal(t, note.ID, vote.Note)
}

func testAddVoteOnClosedSessionShouldFailed(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.closedVotesTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)
	note := fixture.MustRow("DatabaseNote.closedVotesTestBoardNote").(*notes.DatabaseNote)

	_, err := votingDb.AddVote(board.ID, user.ID, note.ID)
	assert.NotNil(t, err)
}

func testAddVoteOnAbortedSessionShouldFailed(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.abortedVotesTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)
	note := fixture.MustRow("DatabaseNote.abortedVotesTestBoardNote").(*notes.DatabaseNote)

	_, err := votingDb.AddVote(board.ID, user.ID, note.ID)
	assert.NotNil(t, err)
}

func testAddVoteAboveLimit(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.openMultipleVotesTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)
	note := fixture.MustRow("DatabaseNote.openMultipleVotesTestBoardNote").(*notes.DatabaseNote)

	_, err := votingDb.AddVote(board.ID, user.ID, note.ID)
	assert.Nil(t, err)

	_, err = votingDb.AddVote(board.ID, user.ID, note.ID)
	assert.NotNil(t, err)
}

func testAddMultipleVotesWhenNotAllowedShouldFail(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.openSingleVotesTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)
	note := fixture.MustRow("DatabaseNote.openSingleVotesTestBoardNote").(*notes.DatabaseNote)

	_, err := votingDb.AddVote(board.ID, user.ID, note.ID)
	assert.Nil(t, err)

	_, err = votingDb.AddVote(board.ID, user.ID, note.ID)
	assert.NotNil(t, err)
}

func testRemoveVote(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.openMultipleVotesTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)
	note := fixture.MustRow("DatabaseNote.openMultipleVotesTestBoardNote").(*notes.DatabaseNote)

	err := votingDb.RemoveVote(board.ID, user.ID, note.ID)
	assert.Nil(t, err)
}

func testRemoveVoteOnClosedSessionShouldFail(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.closedVotesTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)
	note := fixture.MustRow("DatabaseNote.closedVotesTestBoardNote").(*notes.DatabaseNote)

	err := votingDb.RemoveVote(board.ID, user.ID, note.ID)
	assert.Nil(t, err)
}

func testRemoveVoteOnAbortedSessionShouldFail(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.abortedVotesTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)
	note := fixture.MustRow("DatabaseNote.abortedVotesTestBoardNote").(*notes.DatabaseNote)

	err := votingDb.RemoveVote(board.ID, user.ID, note.ID)
	assert.Nil(t, err)
}
