package database

import (
	"scrumlr.io/server/board"
	"testing"

	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/voting"
)

func TestRunnerForVoting(t *testing.T) {
	t.Run("Get=0", testGetVotingForClosed)
	t.Run("Get=1", testGetVotingForAborted)
	t.Run("Get=2", testGetVotingForOpen)
	t.Run("Get=3", testGetVotesForClosedVoting)
	t.Run("Get=4", testGetVotesForOpenVoting)
	t.Run("Get=5", testGetVotesForAbortedVoting)
	t.Run("Get=6", testGetVotings)

	t.Run("Update=0", testReopenClosedVotingShouldFail)
	t.Run("Update=1", testReopenAbortedVotingShouldFail)
	t.Run("Update=2", testCloseVoting)
	t.Run("Update=3", testCloseVotingUpdateRank)

	t.Run("Create=0", testCreateVotingWithNegativeVoteLimitShouldFail)
	t.Run("Create=1", testCreateVotingWithVoteLimitGreater99ShouldFail)
	t.Run("Create=2", testCreateVoting)
	t.Run("Create=3", testCreateVotingWhenOpenShouldFail)
}

func testGetVotingForClosed(t *testing.T) {
	activeVoting := fixture.MustRow("VotingDB.votingTestBoardClosedVoting").(*votings.VotingDB)
	got, _, err := votingDb.Get(activeVoting.Board, activeVoting.ID)
	assert.Nil(t, err)
	assert.Equal(t, activeVoting.ID, got.ID)
	assert.Equal(t, activeVoting.Board, got.Board)
	assert.Equal(t, activeVoting.Status, got.Status)
	assert.Equal(t, activeVoting.VoteLimit, got.VoteLimit)
	assert.Equal(t, activeVoting.ShowVotesOfOthers, got.ShowVotesOfOthers)
	assert.Equal(t, activeVoting.AllowMultipleVotes, got.AllowMultipleVotes)
}
func testGetVotingForAborted(t *testing.T) {
	activeVoting := fixture.MustRow("VotingDB.votingTestBoardAbortedVoting").(*votings.VotingDB)
	got, _, err := votingDb.Get(activeVoting.Board, activeVoting.ID)
	assert.Nil(t, err)
	assert.Equal(t, activeVoting.ID, got.ID)
	assert.Equal(t, activeVoting.Board, got.Board)
	assert.Equal(t, activeVoting.Status, got.Status)
	assert.Equal(t, activeVoting.VoteLimit, got.VoteLimit)
	assert.Equal(t, activeVoting.ShowVotesOfOthers, got.ShowVotesOfOthers)
	assert.Equal(t, activeVoting.AllowMultipleVotes, got.AllowMultipleVotes)
}
func testGetVotingForOpen(t *testing.T) {
	activeVoting := fixture.MustRow("VotingDB.votingTestBoardOpenVoting").(*votings.VotingDB)
	got, _, err := votingDb.Get(activeVoting.Board, activeVoting.ID)
	assert.Nil(t, err)
	assert.Equal(t, activeVoting.ID, got.ID)
	assert.Equal(t, activeVoting.Board, got.Board)
	assert.Equal(t, activeVoting.Status, got.Status)
	assert.Equal(t, activeVoting.VoteLimit, got.VoteLimit)
	assert.Equal(t, activeVoting.ShowVotesOfOthers, got.ShowVotesOfOthers)
	assert.Equal(t, activeVoting.AllowMultipleVotes, got.AllowMultipleVotes)
}
func testGetVotesForClosedVoting(t *testing.T) {
	activeVoting := fixture.MustRow("VotingDB.votingTestBoardClosedVoting").(*votings.VotingDB)
	votes, err := votingDb.GetVotes(filter.VoteFilter{Board: activeVoting.Board, Voting: &activeVoting.ID})
	assert.Nil(t, err)
	assert.Equal(t, 2, len(votes))
}
func testGetVotesForOpenVoting(t *testing.T) {
	activeVoting := fixture.MustRow("VotingDB.votingTestBoardOpenVoting").(*votings.VotingDB)
	votes, err := votingDb.GetVotes(filter.VoteFilter{Board: activeVoting.Board, Voting: &activeVoting.ID})
	assert.Nil(t, err)
	assert.Equal(t, 2, len(votes))
}
func testGetVotesForAbortedVoting(t *testing.T) {
	activeVoting := fixture.MustRow("VotingDB.votingTestBoardAbortedVoting").(*votings.VotingDB)
	votes, err := votingDb.GetVotes(filter.VoteFilter{Board: activeVoting.Board, Voting: &activeVoting.ID})
	assert.Nil(t, err)
	assert.Equal(t, 0, len(votes))
}
func testGetVotings(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.votingTestBoard").(*boards.DatabaseBoard)
	activeVoting, _, err := votingDb.GetAll(board.ID)
	assert.Nil(t, err)
	assert.Greater(t, len(activeVoting), 0)
	assert.Equal(t, votings.Open, activeVoting[0].Status)
}

func testReopenClosedVotingShouldFail(t *testing.T) {
	closedVoting := fixture.MustRow("VotingDB.votingTestBoardClosedVoting").(*votings.VotingDB)
	_, err := votingDb.Update(votings.VotingUpdate{
		ID:     closedVoting.ID,
		Board:  closedVoting.Board,
		Status: votings.Open,
	})
	assert.NotNil(t, err)
}
func testReopenAbortedVotingShouldFail(t *testing.T) {
	activeVoting := fixture.MustRow("VotingDB.votingTestBoardAbortedVoting").(*votings.VotingDB)
	_, err := votingDb.Update(votings.VotingUpdate{
		ID:     activeVoting.ID,
		Board:  activeVoting.Board,
		Status: votings.Open,
	})
	assert.NotNil(t, err)
}

func testCloseVoting(t *testing.T) {
	activeVoting := fixture.MustRow("VotingDB.votingTestBoardOpenVoting").(*votings.VotingDB)
	result, err := votingDb.Update(votings.VotingUpdate{
		ID:     activeVoting.ID,
		Board:  activeVoting.Board,
		Status: votings.Closed,
	})
	assert.Nil(t, err)
	assert.Equal(t, activeVoting.ID, result.ID)
	assert.Equal(t, activeVoting.Board, result.Board)
	assert.Equal(t, votings.Closed, result.Status)
	assert.Equal(t, activeVoting.VoteLimit, result.VoteLimit)
	assert.Equal(t, activeVoting.ShowVotesOfOthers, result.ShowVotesOfOthers)
	assert.Equal(t, activeVoting.AllowMultipleVotes, result.AllowMultipleVotes)
}

func testCreateVotingWithNegativeVoteLimitShouldFail(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.votingTestBoard").(*boards.DatabaseBoard)
	_, err := votingDb.Create(votings.VotingInsert{
		Board:              board.ID,
		VoteLimit:          -100,
		AllowMultipleVotes: false,
		ShowVotesOfOthers:  false,
		Status:             votings.Open,
	})
	assert.NotNil(t, err)
}
func testCreateVotingWithVoteLimitGreater99ShouldFail(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.votingTestBoard").(*boards.DatabaseBoard)
	_, err := votingDb.Create(votings.VotingInsert{
		Board:              board.ID,
		VoteLimit:          100,
		AllowMultipleVotes: false,
		ShowVotesOfOthers:  false,
		Status:             votings.Open,
	})
	assert.NotNil(t, err)
}
func testCreateVoting(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.votingTestBoard").(*boards.DatabaseBoard)
	activeVoting, err := votingDb.Create(votings.VotingInsert{
		Board:              board.ID,
		VoteLimit:          10,
		AllowMultipleVotes: false,
		ShowVotesOfOthers:  false,
		Status:             votings.Open,
	})
	assert.Nil(t, err)
	assert.Equal(t, board.ID, activeVoting.Board)
	assert.Equal(t, votings.Open, activeVoting.Status)
	assert.Equal(t, 10, activeVoting.VoteLimit)
	assert.Equal(t, false, activeVoting.AllowMultipleVotes)
	assert.Equal(t, false, activeVoting.ShowVotesOfOthers)
}
func testCreateVotingWhenOpenShouldFail(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.votingTestBoard").(*boards.DatabaseBoard)
	_, err := votingDb.Create(votings.VotingInsert{
		Board:              board.ID,
		VoteLimit:          10,
		AllowMultipleVotes: false,
		ShowVotesOfOthers:  false,
		Status:             votings.Open,
	})
	assert.NotNil(t, err)
}

func testCloseVotingUpdateRank(t *testing.T) {
	activeVoting := fixture.MustRow("VotingDB.votingSortingTestBoardOpenVoting").(*votings.VotingDB)

	// Close voting
	closedVoting, err := votingDb.Update(votings.VotingUpdate{
		ID:     activeVoting.ID,
		Board:  activeVoting.Board,
		Status: votings.Closed,
	})
	assert.Nil(t, err)
	assert.Equal(t, votings.Closed, closedVoting.Status)

	note1, _ := notesDb.Get(fixture.MustRow("NoteDB.votingSortingNote1").(*notes.NoteDB).ID)
	note2, _ := notesDb.Get(fixture.MustRow("NoteDB.votingSortingNote2").(*notes.NoteDB).ID)
	note3, _ := notesDb.Get(fixture.MustRow("NoteDB.votingSortingNote3").(*notes.NoteDB).ID)
	note4, _ := notesDb.Get(fixture.MustRow("NoteDB.votingSortingNote4").(*notes.NoteDB).ID)
	note5, _ := notesDb.Get(fixture.MustRow("NoteDB.votingSortingNote5").(*notes.NoteDB).ID)
	note6, _ := notesDb.Get(fixture.MustRow("NoteDB.votingSortingNote6").(*notes.NoteDB).ID)

	// Note 2 should be the highest rank with the most amount of votes
	// Note 5 should be higher than Note 1 with equal amount of votes because the old rank has been higher
	assert.Equal(t, note1.Rank, 0)
	assert.Equal(t, note2.Rank, 2)
	assert.Equal(t, note3.Rank, 2)
	assert.Equal(t, note4.Rank, 2)
	assert.Equal(t, note5.Rank, 1)
	assert.Equal(t, note6.Rank, 1)
}
