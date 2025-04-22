package database

import (
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/voting"
	"testing"
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
	voting := fixture.MustRow("Voting.votingTestBoardClosedVoting").(*voting.VotingDB)
	got, _, err := votingDB.GetVoting(voting.Board, voting.ID)
	assert.Nil(t, err)
	assert.Equal(t, voting.ID, got.ID)
	assert.Equal(t, voting.Board, got.Board)
	assert.Equal(t, voting.Status, got.Status)
	assert.Equal(t, voting.VoteLimit, got.VoteLimit)
	assert.Equal(t, voting.ShowVotesOfOthers, got.ShowVotesOfOthers)
	assert.Equal(t, voting.AllowMultipleVotes, got.AllowMultipleVotes)
}
func testGetVotingForAborted(t *testing.T) {
	voting := fixture.MustRow("Voting.votingTestBoardAbortedVoting").(*voting.VotingDB)
	got, _, err := votingDB.GetVoting(voting.Board, voting.ID)
	assert.Nil(t, err)
	assert.Equal(t, voting.ID, got.ID)
	assert.Equal(t, voting.Board, got.Board)
	assert.Equal(t, voting.Status, got.Status)
	assert.Equal(t, voting.VoteLimit, got.VoteLimit)
	assert.Equal(t, voting.ShowVotesOfOthers, got.ShowVotesOfOthers)
	assert.Equal(t, voting.AllowMultipleVotes, got.AllowMultipleVotes)
}
func testGetVotingForOpen(t *testing.T) {
	voting := fixture.MustRow("Voting.votingTestBoardOpenVoting").(*voting.VotingDB)
	got, _, err := votingDB.GetVoting(voting.Board, voting.ID)
	assert.Nil(t, err)
	assert.Equal(t, voting.ID, got.ID)
	assert.Equal(t, voting.Board, got.Board)
	assert.Equal(t, voting.Status, got.Status)
	assert.Equal(t, voting.VoteLimit, got.VoteLimit)
	assert.Equal(t, voting.ShowVotesOfOthers, got.ShowVotesOfOthers)
	assert.Equal(t, voting.AllowMultipleVotes, got.AllowMultipleVotes)
}
func testGetVotesForClosedVoting(t *testing.T) {
	voting := fixture.MustRow("Voting.votingTestBoardClosedVoting").(*voting.VotingDB)
	votes, err := votingDB.GetVotes(filter.VoteFilter{Board: voting.Board, Voting: &voting.ID})
	assert.Nil(t, err)
	assert.Equal(t, 2, len(votes))
}
func testGetVotesForOpenVoting(t *testing.T) {
	voting := fixture.MustRow("Voting.votingTestBoardOpenVoting").(*voting.VotingDB)
	votes, err := votingDB.GetVotes(filter.VoteFilter{Board: voting.Board, Voting: &voting.ID})
	assert.Nil(t, err)
	assert.Equal(t, 2, len(votes))
}
func testGetVotesForAbortedVoting(t *testing.T) {
	voting := fixture.MustRow("Voting.votingTestBoardAbortedVoting").(*voting.VotingDB)
	votes, err := votingDB.GetVotes(filter.VoteFilter{Board: voting.Board, Voting: &voting.ID})
	assert.Nil(t, err)
	assert.Equal(t, 0, len(votes))
}
func testGetVotings(t *testing.T) {
	board := fixture.MustRow("Board.votingTestBoard").(*Board)
	votings, _, err := votingDB.GetVotings(board.ID)
	assert.Nil(t, err)
	assert.Greater(t, len(votings), 0)
	assert.Equal(t, types.VotingStatusOpen, votings[0].Status)
}

func testReopenClosedVotingShouldFail(t *testing.T) {
	voting := fixture.MustRow("Voting.votingTestBoardClosedVoting").(*voting.VotingDB)
	_, err := votingDB.UpdateVoting(VotingUpdate{
		ID:     voting.ID,
		Board:  voting.Board,
		Status: types.VotingStatusOpen,
	})
	assert.NotNil(t, err)
}
func testReopenAbortedVotingShouldFail(t *testing.T) {
	voting := fixture.MustRow("Voting.votingTestBoardAbortedVoting").(*Voting)
	_, err := votingDB.UpdateVoting(VotingUpdate{
		ID:     voting.ID,
		Board:  voting.Board,
		Status: types.VotingStatusOpen,
	})
	assert.NotNil(t, err)
}

func testCloseVoting(t *testing.T) {
	voting := fixture.MustRow("Voting.votingTestBoardOpenVoting").(*Voting)
	result, err := votingDB.UpdateVoting(VotingUpdate{
		ID:     voting.ID,
		Board:  voting.Board,
		Status: types.VotingStatusClosed,
	})
	assert.Nil(t, err)
	assert.Equal(t, voting.ID, result.ID)
	assert.Equal(t, voting.Board, result.Board)
	assert.Equal(t, types.VotingStatusClosed, result.Status)
	assert.Equal(t, voting.VoteLimit, result.VoteLimit)
	assert.Equal(t, voting.ShowVotesOfOthers, result.ShowVotesOfOthers)
	assert.Equal(t, voting.AllowMultipleVotes, result.AllowMultipleVotes)
}

func testCreateVotingWithNegativeVoteLimitShouldFail(t *testing.T) {
	board := fixture.MustRow("Board.votingTestBoard").(*Board)
	_, err := votingDB.CreateVoting(VotingInsert{
		Board:              board.ID,
		VoteLimit:          -100,
		AllowMultipleVotes: false,
		ShowVotesOfOthers:  false,
		Status:             types.VotingStatusOpen,
	})
	assert.NotNil(t, err)
}
func testCreateVotingWithVoteLimitGreater99ShouldFail(t *testing.T) {
	board := fixture.MustRow("Board.votingTestBoard").(*Board)
	_, err := votingDB.CreateVoting(VotingInsert{
		Board:              board.ID,
		VoteLimit:          100,
		AllowMultipleVotes: false,
		ShowVotesOfOthers:  false,
		Status:             types.VotingStatusOpen,
	})
	assert.NotNil(t, err)
}
func testCreateVoting(t *testing.T) {
	board := fixture.MustRow("Board.votingTestBoard").(*Board)
	voting, err := votingDB.CreateVoting(VotingInsert{
		Board:              board.ID,
		VoteLimit:          10,
		AllowMultipleVotes: false,
		ShowVotesOfOthers:  false,
		Status:             types.VotingStatusOpen,
	})
	assert.Nil(t, err)
	assert.Equal(t, board.ID, voting.Board)
	assert.Equal(t, types.VotingStatusOpen, voting.Status)
	assert.Equal(t, 10, voting.VoteLimit)
	assert.Equal(t, false, voting.AllowMultipleVotes)
	assert.Equal(t, false, voting.ShowVotesOfOthers)
}
func testCreateVotingWhenOpenShouldFail(t *testing.T) {
	board := fixture.MustRow("Board.votingTestBoard").(*Board)
	_, err := votingDB.CreateVoting(VotingInsert{
		Board:              board.ID,
		VoteLimit:          10,
		AllowMultipleVotes: false,
		ShowVotesOfOthers:  false,
		Status:             types.VotingStatusOpen,
	})
	assert.NotNil(t, err)
}

func testCloseVotingUpdateRank(t *testing.T) {
	voting := fixture.MustRow("Voting.votingSortingTestBoardOpenVoting").(*Voting)

	// Close voting
	closedVoting, err := votingDB.UpdateVoting(VotingUpdate{
		ID:     voting.ID,
		Board:  voting.Board,
		Status: types.VotingStatusClosed,
	})
	assert.Nil(t, err)
	assert.Equal(t, types.VotingStatusClosed, closedVoting.Status)

	note1, _ := testDb.notesDB.GetNote(fixture.MustRow("NoteDB.votingSortingNote1").(*notes.NoteDB).ID)
	note2, _ := testDb.notesDB.GetNote(fixture.MustRow("NoteDB.votingSortingNote2").(*notes.NoteDB).ID)
	note3, _ := testDb.notesDB.GetNote(fixture.MustRow("NoteDB.votingSortingNote3").(*notes.NoteDB).ID)
	note4, _ := testDb.notesDB.GetNote(fixture.MustRow("NoteDB.votingSortingNote4").(*notes.NoteDB).ID)
	note5, _ := testDb.notesDB.GetNote(fixture.MustRow("NoteDB.votingSortingNote5").(*notes.NoteDB).ID)
	note6, _ := testDb.notesDB.GetNote(fixture.MustRow("NoteDB.votingSortingNote6").(*notes.NoteDB).ID)

	// Note 2 should be the highest rank with the most amount of votes
	// Note 5 should be higher than Note 1 with equal amount of votes because the old rank has been higher
	assert.Equal(t, note1.Rank, 0)
	assert.Equal(t, note2.Rank, 2)
	assert.Equal(t, note3.Rank, 2)
	assert.Equal(t, note4.Rank, 2)
	assert.Equal(t, note5.Rank, 1)
	assert.Equal(t, note6.Rank, 1)
}
