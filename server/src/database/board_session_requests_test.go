package database

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/users"
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
	_, err := sessionRequestDb.Create(sessionrequests.DatabaseBoardSessionRequestInsert{
		Board: board.ID,
		User:  fixture.MustRow("DatabaseUser.jane").(*users.DatabaseUser).ID,
	})
	assert.Nil(t, err)

	_, err = sessionRequestDb.Create(sessionrequests.DatabaseBoardSessionRequestInsert{
		Board: board.ID,
		User:  fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser).ID,
	})
	assert.Nil(t, err)

	_, err = sessionRequestDb.Create(sessionrequests.DatabaseBoardSessionRequestInsert{
		Board: board.ID,
		User:  fixture.MustRow("DatabaseUser.jennifer").(*users.DatabaseUser).ID,
	})
	assert.Nil(t, err)
}

func testCreateBoardSessionRequestOnConflictDoesNothing(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	user := fixture.MustRow("DatabaseUser.jane").(*users.DatabaseUser)

	_, err := sessionRequestDb.Create(sessionrequests.DatabaseBoardSessionRequestInsert{
		Board: board.ID,
		User:  user.ID,
	})
	assert.Nil(t, err)
}

func testUpdateOfBoardSessionRequestToAccepted(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	user := fixture.MustRow("DatabaseUser.jane").(*users.DatabaseUser)

	request, err := sessionRequestDb.Update(sessionrequests.DatabaseBoardSessionRequestUpdate{
		Board:  board.ID,
		User:   user.ID,
		Status: sessionrequests.RequestAccepted,
	})
	assert.Nil(t, err)
	assert.Equal(t, board.ID, request.Board)
	assert.Equal(t, user.ID, request.User)
	assert.Equal(t, sessionrequests.RequestAccepted, request.Status)
}

func testUpdateOfBoardSessionToRejected(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	_, err := sessionRequestDb.Update(sessionrequests.DatabaseBoardSessionRequestUpdate{
		Board:  board.ID,
		User:   user.ID,
		Status: sessionrequests.RequestRejected,
	})
	assert.Nil(t, err)
}

func testUpdateOfRejectedSessionToPendingFails(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	_, err := sessionRequestDb.Update(sessionrequests.DatabaseBoardSessionRequestUpdate{
		Board:  board.ID,
		User:   user.ID,
		Status: sessionrequests.RequestPending,
	})
	assert.NotNil(t, err)
}

func testUpdateOfAcceptedSessionToPendingFails(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	user := fixture.MustRow("DatabaseUser.jane").(*users.DatabaseUser)

	_, err := sessionRequestDb.Update(sessionrequests.DatabaseBoardSessionRequestUpdate{
		Board:  board.ID,
		User:   user.ID,
		Status: sessionrequests.RequestPending,
	})
	assert.NotNil(t, err)
}

func testUpdateOfAcceptedSessionToRejectedFails(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	user := fixture.MustRow("DatabaseUser.jane").(*users.DatabaseUser)

	_, err := sessionRequestDb.Update(sessionrequests.DatabaseBoardSessionRequestUpdate{
		Board:  board.ID,
		User:   user.ID,
		Status: sessionrequests.RequestRejected,
	})
	assert.NotNil(t, err)
}

func testGetBoardSessionRequest(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	user := fixture.MustRow("DatabaseUser.jane").(*users.DatabaseUser)

	request, err := sessionRequestDb.Get(board.ID, user.ID)
	assert.Nil(t, err)

	assert.Equal(t, board.ID, request.Board)
	assert.Equal(t, user.ID, request.User)
	assert.Equal(t, sessionrequests.RequestAccepted, request.Status)
}

func testGetBoardSessionRequests(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	requests, err := sessionRequestDb.GetAll(board.ID)
	assert.Nil(t, err)
	assert.Equal(t, 3, len(requests))
}

func testGetBoardSessionRequestsWithAcceptedFilter(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	requests, err := sessionRequestDb.GetAll(board.ID, sessionrequests.RequestAccepted)
	assert.Nil(t, err)
	assert.Equal(t, 1, len(requests))
	assert.Equal(t, sessionrequests.RequestAccepted, requests[0].Status)
}

func testGetBoardSessionRequestsWithRejectedFilter(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	requests, err := sessionRequestDb.GetAll(board.ID, sessionrequests.RequestRejected)
	assert.Nil(t, err)
	assert.Equal(t, 1, len(requests))
	assert.Equal(t, sessionrequests.RequestRejected, requests[0].Status)
}

func testGetBoardSessionRequestsWithPendingFilter(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	requests, err := sessionRequestDb.GetAll(board.ID, sessionrequests.RequestPending)
	assert.Nil(t, err)
	assert.Equal(t, 1, len(requests))
	assert.Equal(t, sessionrequests.RequestPending, requests[0].Status)
}

func testGetBoardSessionRequestWithMultipleFilters(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsTestBoard").(*Board)
	requests, err := sessionRequestDb.GetAll(board.ID, sessionrequests.RequestAccepted, sessionrequests.RequestRejected)
	assert.Nil(t, err)
	assert.Equal(t, 2, len(requests))
}
