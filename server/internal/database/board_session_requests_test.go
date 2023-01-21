package database

import (
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/internal/database/types"
	"testing"
)

func TestRunnerForBoardSessionRequests(t *testing.T) {
	t.Run("Create=0", testCreateBoardSessionRequest)
	t.Run("Create=1", testCreateBoardSessionRequestOnConflictDoesNothing)

	t.Run("Update=0", testUpdateOfBoardSessionRequestToAccepted)
	t.Run("Update=1", testUpdateOfBoardSessionToRejected)
	t.Run("Update=2", testUpdateOfRejectedSessionToPendingFails)
	t.Run("Update=3", testUpdateOfAcceptedSessionToPendingFails)
	t.Run("Update=4", testUpdateOfAcceptedSessionToRejectedFails)

	t.Run("Get=0", testGetBoardSessionRequest)
	t.Run("Get=1", testGetBoardSessionRequests)
	t.Run("Get=2", testGetBoardSessionRequestsWithAcceptedFilter)
	t.Run("Get=3", testGetBoardSessionRequestsWithRejectedFilter)
	t.Run("Get=4", testGetBoardSessionRequestsWithPendingFilter)
	t.Run("Get=5", testGetBoardSessionRequestWithMultipleFilters)
}

func testCreateBoardSessionRequest(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	_, err := testDb.CreateBoardSessionRequest(BoardSessionRequestInsert{
		Board: board.ID,
		User:  fixture.MustRow("User.jane").(*User).ID,
	})
	assert.Nil(t, err)

	_, err = testDb.CreateBoardSessionRequest(BoardSessionRequestInsert{
		Board: board.ID,
		User:  fixture.MustRow("User.jack").(*User).ID,
	})
	assert.Nil(t, err)

	_, err = testDb.CreateBoardSessionRequest(BoardSessionRequestInsert{
		Board: board.ID,
		User:  fixture.MustRow("User.jennifer").(*User).ID,
	})
	assert.Nil(t, err)
}

func testCreateBoardSessionRequestOnConflictDoesNothing(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	user := fixture.MustRow("User.jane").(*User)

	_, err := testDb.CreateBoardSessionRequest(BoardSessionRequestInsert{
		Board: board.ID,
		User:  user.ID,
	})
	assert.Nil(t, err)
}

func testUpdateOfBoardSessionRequestToAccepted(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	user := fixture.MustRow("User.jane").(*User)

	_, err := testDb.UpdateBoardSessionRequest(BoardSessionRequestUpdate{
		Board:  board.ID,
		User:   user.ID,
		Status: types.BoardSessionRequestStatusAccepted,
	})
	assert.Nil(t, err)

	// a board session should exist after accepting a board session request
	exists, err := testDb.BoardSessionExists(board.ID, user.ID)
	assert.Nil(t, err)
	assert.True(t, exists)
}

func testUpdateOfBoardSessionToRejected(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	user := fixture.MustRow("User.jack").(*User)

	_, err := testDb.UpdateBoardSessionRequest(BoardSessionRequestUpdate{
		Board:  board.ID,
		User:   user.ID,
		Status: types.BoardSessionRequestStatusRejected,
	})
	assert.Nil(t, err)
}

func testUpdateOfRejectedSessionToPendingFails(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	user := fixture.MustRow("User.jack").(*User)

	_, err := testDb.UpdateBoardSessionRequest(BoardSessionRequestUpdate{
		Board:  board.ID,
		User:   user.ID,
		Status: types.BoardSessionRequestStatusPending,
	})
	assert.NotNil(t, err)
}

func testUpdateOfAcceptedSessionToPendingFails(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	user := fixture.MustRow("User.jane").(*User)

	_, err := testDb.UpdateBoardSessionRequest(BoardSessionRequestUpdate{
		Board:  board.ID,
		User:   user.ID,
		Status: types.BoardSessionRequestStatusPending,
	})
	assert.NotNil(t, err)
}

func testUpdateOfAcceptedSessionToRejectedFails(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	user := fixture.MustRow("User.jane").(*User)

	_, err := testDb.UpdateBoardSessionRequest(BoardSessionRequestUpdate{
		Board:  board.ID,
		User:   user.ID,
		Status: types.BoardSessionRequestStatusRejected,
	})
	assert.NotNil(t, err)
}

func testGetBoardSessionRequest(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	user := fixture.MustRow("User.jane").(*User)

	request, err := testDb.GetBoardSessionRequest(board.ID, user.ID)
	assert.Nil(t, err)

	assert.Equal(t, board.ID, request.Board)
	assert.Equal(t, user.ID, request.User)
	assert.Equal(t, types.BoardSessionRequestStatusAccepted, request.Status)
}

func testGetBoardSessionRequests(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	requests, err := testDb.GetBoardSessionRequests(board.ID)
	assert.Nil(t, err)
	assert.Equal(t, 3, len(requests))
}

func testGetBoardSessionRequestsWithAcceptedFilter(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	requests, err := testDb.GetBoardSessionRequests(board.ID, types.BoardSessionRequestStatusAccepted)
	assert.Nil(t, err)
	assert.Equal(t, 1, len(requests))
	assert.Equal(t, types.BoardSessionRequestStatusAccepted, requests[0].Status)
}

func testGetBoardSessionRequestsWithRejectedFilter(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	requests, err := testDb.GetBoardSessionRequests(board.ID, types.BoardSessionRequestStatusRejected)
	assert.Nil(t, err)
	assert.Equal(t, 1, len(requests))
	assert.Equal(t, types.BoardSessionRequestStatusRejected, requests[0].Status)
}

func testGetBoardSessionRequestsWithPendingFilter(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	requests, err := testDb.GetBoardSessionRequests(board.ID, types.BoardSessionRequestStatusPending)
	assert.Nil(t, err)
	assert.Equal(t, 1, len(requests))
	assert.Equal(t, types.BoardSessionRequestStatusPending, requests[0].Status)
}

func testGetBoardSessionRequestWithMultipleFilters(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	requests, err := testDb.GetBoardSessionRequests(board.ID, types.BoardSessionRequestStatusAccepted, types.BoardSessionRequestStatusRejected)
	assert.Nil(t, err)
	assert.Equal(t, 2, len(requests))
}
