package database

import (
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/database/types"
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
	t.Run("Update=2", testChangeAbortedToClosedVotingShouldFail)
	t.Run("Update=3", testChangeClosedToAbortedVotingShouldFail)
	t.Run("Update=4", testCloseVoting)

	t.Run("Create=0", testCreateVotingWithNegativeVoteLimitShouldFail)
	t.Run("Create=1", testCreateVotingWithVoteLimitGreater99ShouldFail)
	t.Run("Create=2", testCreateVoting)
	t.Run("Create=3", testCreateVotingWhenOpenShouldFail)
}

func testGetVotingForClosed(t *testing.T) {
	voting := fixture.MustRow("Voting.votingTestBoardClosedVoting").(*Voting)
	got, _, err := testDb.GetVoting(voting.Board, voting.ID)
	assert.Nil(t, err)
	assert.Equal(t, voting.ID, got.ID)
	assert.Equal(t, voting.Board, got.Board)
	assert.Equal(t, voting.Status, got.Status)
	assert.Equal(t, voting.VoteLimit, got.VoteLimit)
	assert.Equal(t, voting.ShowVotesOfOthers, got.ShowVotesOfOthers)
	assert.Equal(t, voting.AllowMultipleVotes, got.AllowMultipleVotes)
}
func testGetVotingForAborted(t *testing.T) {
	voting := fixture.MustRow("Voting.votingTestBoardAbortedVoting").(*Voting)
	got, _, err := testDb.GetVoting(voting.Board, voting.ID)
	assert.Nil(t, err)
	assert.Equal(t, voting.ID, got.ID)
	assert.Equal(t, voting.Board, got.Board)
	assert.Equal(t, voting.Status, got.Status)
	assert.Equal(t, voting.VoteLimit, got.VoteLimit)
	assert.Equal(t, voting.ShowVotesOfOthers, got.ShowVotesOfOthers)
	assert.Equal(t, voting.AllowMultipleVotes, got.AllowMultipleVotes)
}
func testGetVotingForOpen(t *testing.T) {
	voting := fixture.MustRow("Voting.votingTestBoardOpenVoting").(*Voting)
	got, _, err := testDb.GetVoting(voting.Board, voting.ID)
	assert.Nil(t, err)
	assert.Equal(t, voting.ID, got.ID)
	assert.Equal(t, voting.Board, got.Board)
	assert.Equal(t, voting.Status, got.Status)
	assert.Equal(t, voting.VoteLimit, got.VoteLimit)
	assert.Equal(t, voting.ShowVotesOfOthers, got.ShowVotesOfOthers)
	assert.Equal(t, voting.AllowMultipleVotes, got.AllowMultipleVotes)
}
func testGetVotesForClosedVoting(t *testing.T) {
	voting := fixture.MustRow("Voting.votingTestBoardClosedVoting").(*Voting)
	votes, err := testDb.GetVotes(filter.VoteFilter{Board: voting.Board, Voting: &voting.ID})
	assert.Nil(t, err)
	assert.Equal(t, 2, len(votes))
}
func testGetVotesForOpenVoting(t *testing.T) {
	voting := fixture.MustRow("Voting.votingTestBoardOpenVoting").(*Voting)
	votes, err := testDb.GetVotes(filter.VoteFilter{Board: voting.Board, Voting: &voting.ID})
	assert.Nil(t, err)
	assert.Equal(t, 2, len(votes))
}
func testGetVotesForAbortedVoting(t *testing.T) {
	voting := fixture.MustRow("Voting.votingTestBoardAbortedVoting").(*Voting)
	votes, err := testDb.GetVotes(filter.VoteFilter{Board: voting.Board, Voting: &voting.ID})
	assert.Nil(t, err)
	assert.Equal(t, 0, len(votes))
}
func testGetVotings(t *testing.T) {
	board := fixture.MustRow("Board.votingTestBoard").(*Board)
	votings, _, err := testDb.GetVotings(board.ID)
	assert.Nil(t, err)
	assert.Greater(t, len(votings), 0)
	assert.Equal(t, types.VotingStatusOpen, votings[0].Status)
	assert.Equal(t, types.VotingStatusAborted, votings[len(votings)-1].Status)
}

func testReopenClosedVotingShouldFail(t *testing.T) {
	voting := fixture.MustRow("Voting.votingTestBoardClosedVoting").(*Voting)
	_, err := testDb.UpdateVoting(VotingUpdate{
		ID:     voting.ID,
		Board:  voting.Board,
		Status: types.VotingStatusOpen,
	})
	assert.NotNil(t, err)
}
func testReopenAbortedVotingShouldFail(t *testing.T) {
	voting := fixture.MustRow("Voting.votingTestBoardAbortedVoting").(*Voting)
	_, err := testDb.UpdateVoting(VotingUpdate{
		ID:     voting.ID,
		Board:  voting.Board,
		Status: types.VotingStatusOpen,
	})
	assert.NotNil(t, err)
}
func testChangeAbortedToClosedVotingShouldFail(t *testing.T) {
	voting := fixture.MustRow("Voting.votingTestBoardAbortedVoting").(*Voting)
	_, err := testDb.UpdateVoting(VotingUpdate{
		ID:     voting.ID,
		Board:  voting.Board,
		Status: types.VotingStatusClosed,
	})
	assert.NotNil(t, err)
}
func testChangeClosedToAbortedVotingShouldFail(t *testing.T) {
	voting := fixture.MustRow("Voting.votingTestBoardClosedVoting").(*Voting)
	_, err := testDb.UpdateVoting(VotingUpdate{
		ID:     voting.ID,
		Board:  voting.Board,
		Status: types.VotingStatusAborted,
	})
	assert.NotNil(t, err)
}
func testCloseVoting(t *testing.T) {
	voting := fixture.MustRow("Voting.votingTestBoardOpenVoting").(*Voting)
	result, err := testDb.UpdateVoting(VotingUpdate{
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
	_, err := testDb.CreateVoting(VotingInsert{
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
	_, err := testDb.CreateVoting(VotingInsert{
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
	voting, err := testDb.CreateVoting(VotingInsert{
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
	_, err := testDb.CreateVoting(VotingInsert{
		Board:              board.ID,
		VoteLimit:          10,
		AllowMultipleVotes: false,
		ShowVotesOfOthers:  false,
		Status:             types.VotingStatusOpen,
	})
	assert.NotNil(t, err)
}
