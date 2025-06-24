package database

import (
  "testing"

  "scrumlr.io/server/boards"

  "github.com/stretchr/testify/assert"
  "scrumlr.io/server/common/filter"
  "scrumlr.io/server/notes"
  "scrumlr.io/server/votings"
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
  activeVoting := fixture.MustRow("DatabaseVoting.votingTestBoardClosedVoting").(*votings.DatabaseVoting)
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
  activeVoting := fixture.MustRow("DatabaseVoting.votingTestBoardAbortedVoting").(*votings.DatabaseVoting)
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
  activeVoting := fixture.MustRow("DatabaseVoting.votingTestBoardOpenVoting").(*votings.DatabaseVoting)
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
  activeVoting := fixture.MustRow("DatabaseVoting.votingTestBoardClosedVoting").(*votings.DatabaseVoting)
  votes, err := votingDb.GetVotes(filter.VoteFilter{Board: activeVoting.Board, Voting: &activeVoting.ID})
  assert.Nil(t, err)
  assert.Equal(t, 2, len(votes))
}

func testGetVotesForOpenVoting(t *testing.T) {
  activeVoting := fixture.MustRow("DatabaseVoting.votingTestBoardOpenVoting").(*votings.DatabaseVoting)
  votes, err := votingDb.GetVotes(filter.VoteFilter{Board: activeVoting.Board, Voting: &activeVoting.ID})
  assert.Nil(t, err)
  assert.Equal(t, 2, len(votes))
}

func testGetVotesForAbortedVoting(t *testing.T) {
  activeVoting := fixture.MustRow("DatabaseVoting.votingTestBoardAbortedVoting").(*votings.DatabaseVoting)
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
  closedVoting := fixture.MustRow("DatabaseVoting.votingTestBoardClosedVoting").(*votings.DatabaseVoting)
  _, err := votingDb.Update(votings.DatabaseVotingUpdate{
    ID:     closedVoting.ID,
    Board:  closedVoting.Board,
    Status: votings.Open,
  })
  assert.NotNil(t, err)
}

func testReopenAbortedVotingShouldFail(t *testing.T) {
  activeVoting := fixture.MustRow("DatabaseVoting.votingTestBoardAbortedVoting").(*votings.DatabaseVoting)
  _, err := votingDb.Update(votings.DatabaseVotingUpdate{
    ID:     activeVoting.ID,
    Board:  activeVoting.Board,
    Status: votings.Open,
  })
  assert.NotNil(t, err)
}

func testCloseVoting(t *testing.T) {
  activeVoting := fixture.MustRow("DatabaseVoting.votingTestBoardOpenVoting").(*votings.DatabaseVoting)
  result, err := votingDb.Update(votings.DatabaseVotingUpdate{
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
  _, err := votingDb.Create(votings.DatabaseVotingInsert{
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
  _, err := votingDb.Create(votings.DatabaseVotingInsert{
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
  activeVoting, err := votingDb.Create(votings.DatabaseVotingInsert{
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
  _, err := votingDb.Create(votings.DatabaseVotingInsert{
    Board:              board.ID,
    VoteLimit:          10,
    AllowMultipleVotes: false,
    ShowVotesOfOthers:  false,
    Status:             votings.Open,
  })
  assert.NotNil(t, err)
}

func testCloseVotingUpdateRank(t *testing.T) {
  activeVoting := fixture.MustRow("DatabaseVoting.votingSortingTestBoardOpenVoting").(*votings.DatabaseVoting)

  // Close voting
  closedVoting, err := votingDb.Update(votings.DatabaseVotingUpdate{
    ID:     activeVoting.ID,
    Board:  activeVoting.Board,
    Status: votings.Closed,
  })
  assert.Nil(t, err)
  assert.Equal(t, votings.Closed, closedVoting.Status)

  note1, _ := notesDb.Get(fixture.MustRow("DatabaseNote.votingSortingNote1").(*notes.DatabaseNote).ID)
  note2, _ := notesDb.Get(fixture.MustRow("DatabaseNote.votingSortingNote2").(*notes.DatabaseNote).ID)
  note3, _ := notesDb.Get(fixture.MustRow("DatabaseNote.votingSortingNote3").(*notes.DatabaseNote).ID)
  note4, _ := notesDb.Get(fixture.MustRow("DatabaseNote.votingSortingNote4").(*notes.DatabaseNote).ID)
  note5, _ := notesDb.Get(fixture.MustRow("DatabaseNote.votingSortingNote5").(*notes.DatabaseNote).ID)
  note6, _ := notesDb.Get(fixture.MustRow("DatabaseNote.votingSortingNote6").(*notes.DatabaseNote).ID)

  // Note 2 should be the highest rank with the most amount of votes
  // Note 5 should be higher than Note 1 with equal amount of votes because the old rank has been higher
  assert.Equal(t, note1.Rank, 0)
  assert.Equal(t, note2.Rank, 2)
  assert.Equal(t, note3.Rank, 2)
  assert.Equal(t, note4.Rank, 2)
  assert.Equal(t, note5.Rank, 1)
  assert.Equal(t, note6.Rank, 1)
}
