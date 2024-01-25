package database

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/database/types"
)

func TestRunnerForBoardSessions(t *testing.T) {
	t.Run("Create=0", testCreateBoardSessionAsParticipant)
	t.Run("Create=1", testCreateBoardSessionAsModerator)
	t.Run("Create=2", testCreateDuplicateBoardSessionShouldFail)
	t.Run("Create=3", testCreateBoardSessionAsOwnerShouldFail)

	t.Run("Update=0", testUpdateOfConnectedState)
	t.Run("Update=1", testUpdateOfReadyState)
	t.Run("Update=2", testUpdateOfRaisedHandState)
	t.Run("Update=3", testUpdateOfParticipantToModerator)
	t.Run("Update=4", testUpdateOfParticipantToOwnerShouldFail)
	t.Run("Update=5", testUpdateOfModeratorToOwnerShouldFail)
	t.Run("Update=6", testUpdateBoardSessions)
	t.Run("Update=7", testUpdateOfBannedState)

	t.Run("Exists=0", testBoardSessionExistsForParticipant)
	t.Run("Exists=1", testBoardSessionExistsForModerator)
	t.Run("Exists=2", testBoardSessionExistsForOwner)
	t.Run("Exists=3", testBoardSessionDoesNotExist)
	t.Run("Exists=4", testModeratorBoardSessionExistsForParticipantShouldFail)
	t.Run("Exists=5", testModeratorBoardSessionExistsForModerator)
	t.Run("Exists=6", testModeratorBoardSessionExistsForOwner)
	t.Run("Exists=7", testModeratorBoardSessionDoesNotExist)

	t.Run("Get=0", testGetBoardSession)
	t.Run("Get=1", testGetBoardSessions)
	t.Run("Get=2", testGetBoardSessionsWithReadyFilter)
	t.Run("Get=3", testGetBoardSessionsWithRaisedHandFilter)
	t.Run("Get=4", testGetBoardSessionsWithConnectedFilter)
	t.Run("Get=5", testGetBoardSessionsWithRoleFilter)
	t.Run("Get=6", testGetBoardSessionsWithMultipleFilters)
}

func testCreateBoardSessionAsParticipant(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.john").(*User)

	session, err := testDb.CreateBoardSession(BoardSessionInsert{Board: board.ID, User: user.ID, Role: types.SessionRoleParticipant})
	assert.Nil(t, err)
	assert.NotEmpty(t, session)
}

func testCreateBoardSessionAsModerator(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.jennifer").(*User)

	session, err := testDb.CreateBoardSession(BoardSessionInsert{Board: board.ID, User: user.ID, Role: types.SessionRoleModerator})
	assert.Nil(t, err)
	assert.NotEmpty(t, session)
}

func testCreateDuplicateBoardSessionShouldFail(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.jennifer").(*User)

	_, err := testDb.CreateBoardSession(BoardSessionInsert{Board: board.ID, User: user.ID, Role: types.SessionRoleModerator})
	assert.NotNil(t, err)
}

func testCreateBoardSessionAsOwnerShouldFail(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.jack").(*User)

	_, err := testDb.CreateBoardSession(BoardSessionInsert{Board: board.ID, User: user.ID, Role: types.SessionRoleOwner})
	assert.NotNil(t, err)
}

func testUpdateOfConnectedState(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.jennifer").(*User)

	connected := true

	session, err := testDb.UpdateBoardSession(BoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  &connected,
		Ready:      nil,
		RaisedHand: nil,
		Role:       nil,
	})
	assert.Nil(t, err)
	assert.Equal(t, connected, session.Connected)

	connected = false
	session, err = testDb.UpdateBoardSession(BoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  &connected,
		Ready:      nil,
		RaisedHand: nil,
		Role:       nil,
	})
	assert.Nil(t, err)
	assert.Equal(t, connected, session.Connected)
}

func testUpdateOfReadyState(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.jennifer").(*User)

	ready := true

	session, err := testDb.UpdateBoardSession(BoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      &ready,
		RaisedHand: nil,
		Role:       nil,
	})
	assert.Nil(t, err)
	assert.Equal(t, ready, session.Ready)

	ready = false
	session, err = testDb.UpdateBoardSession(BoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      &ready,
		RaisedHand: nil,
		Role:       nil,
	})
	assert.Nil(t, err)
	assert.Equal(t, ready, session.Ready)
}

func testUpdateOfRaisedHandState(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.jennifer").(*User)

	raisedHand := true

	session, err := testDb.UpdateBoardSession(BoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: &raisedHand,
		Role:       nil,
	})
	assert.Nil(t, err)
	assert.Equal(t, raisedHand, session.RaisedHand)

	raisedHand = false
	session, err = testDb.UpdateBoardSession(BoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: &raisedHand,
		Role:       nil,
	})
	assert.Nil(t, err)
	assert.Equal(t, raisedHand, session.RaisedHand)
}

func testUpdateOfBannedState(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.jennifer").(*User)

	banned := true

	session, err := testDb.UpdateBoardSession(BoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: nil,
		Role:       nil,
		Banned:     &banned,
	})
	assert.Nil(t, err)
	assert.Equal(t, banned, session.Banned)

	banned = false
	session, err = testDb.UpdateBoardSession(BoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: nil,
		Role:       nil,
		Banned:     &banned,
	})
	assert.Nil(t, err)
	assert.Equal(t, banned, session.Banned)
}

func testUpdateOfParticipantToModerator(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.jennifer").(*User)

	role := types.SessionRoleParticipant

	session, err := testDb.UpdateBoardSession(BoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: nil,
		Role:       &role,
	})
	assert.Nil(t, err)
	assert.Equal(t, role, session.Role)

	role = types.SessionRoleModerator
	session, err = testDb.UpdateBoardSession(BoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: nil,
		Role:       &role,
	})
	assert.Nil(t, err)
	assert.Equal(t, role, session.Role)
}

func testUpdateOfParticipantToOwnerShouldFail(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.jennifer").(*User)

	role := types.SessionRoleParticipant

	session, err := testDb.UpdateBoardSession(BoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: nil,
		Role:       &role,
	})
	assert.Nil(t, err)
	assert.Equal(t, role, session.Role)

	role = types.SessionRoleOwner
	session, err = testDb.UpdateBoardSession(BoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: nil,
		Role:       &role,
	})
	assert.NotNil(t, err)
}

func testUpdateOfModeratorToOwnerShouldFail(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.jennifer").(*User)

	role := types.SessionRoleModerator

	session, err := testDb.UpdateBoardSession(BoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: nil,
		Role:       &role,
	})
	assert.Nil(t, err)
	assert.Equal(t, role, session.Role)

	role = types.SessionRoleOwner
	session, err = testDb.UpdateBoardSession(BoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: nil,
		Role:       &role,
	})
	assert.NotNil(t, err)
}

func testBoardSessionExistsForParticipant(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.jennifer").(*User)

	role := types.SessionRoleParticipant

	_, err := testDb.UpdateBoardSession(BoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: nil,
		Role:       &role,
	})
	assert.Nil(t, err)

	exists, err := testDb.BoardSessionExists(board.ID, user.ID)
	assert.Nil(t, err)
	assert.Equal(t, true, exists)
}

func testBoardSessionExistsForModerator(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.jennifer").(*User)

	role := types.SessionRoleModerator

	_, err := testDb.UpdateBoardSession(BoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: nil,
		Role:       &role,
	})
	assert.Nil(t, err)

	exists, err := testDb.BoardSessionExists(board.ID, user.ID)
	assert.Nil(t, err)
	assert.Equal(t, true, exists)
}

func testBoardSessionExistsForOwner(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.jane").(*User)

	exists, err := testDb.BoardSessionExists(board.ID, user.ID)
	assert.Nil(t, err)
	assert.Equal(t, true, exists)
}

func testBoardSessionDoesNotExist(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.jack").(*User)

	exists, err := testDb.BoardSessionExists(board.ID, user.ID)
	assert.Nil(t, err)
	assert.Equal(t, false, exists)
}

func testModeratorBoardSessionExistsForParticipantShouldFail(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.jennifer").(*User)

	role := types.SessionRoleParticipant

	_, err := testDb.UpdateBoardSession(BoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: nil,
		Role:       &role,
	})
	assert.Nil(t, err)

	exists, err := testDb.BoardModeratorSessionExists(board.ID, user.ID)
	assert.Nil(t, err)
	assert.Equal(t, false, exists)
}

func testModeratorBoardSessionExistsForModerator(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.jennifer").(*User)

	role := types.SessionRoleModerator

	_, err := testDb.UpdateBoardSession(BoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: nil,
		Role:       &role,
	})
	assert.Nil(t, err)

	exists, err := testDb.BoardModeratorSessionExists(board.ID, user.ID)
	assert.Nil(t, err)
	assert.Equal(t, true, exists)
}

func testModeratorBoardSessionExistsForOwner(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.jane").(*User)

	exists, err := testDb.BoardModeratorSessionExists(board.ID, user.ID)
	assert.Nil(t, err)
	assert.Equal(t, true, exists)
}

func testModeratorBoardSessionDoesNotExist(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.john").(*User)

	exists, err := testDb.BoardModeratorSessionExists(board.ID, user.ID)
	assert.Nil(t, err)
	assert.Equal(t, false, exists)
}

func testGetBoardSession(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	user := fixture.MustRow("User.jane").(*User)

	session, err := testDb.GetBoardSession(board.ID, user.ID)
	assert.Nil(t, err)

	assert.Equal(t, board.ID, session.Board)
	assert.Equal(t, user.ID, session.User)
	assert.Equal(t, user.Name, session.Name)
}

func testGetBoardSessions(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	sessions, err := testDb.GetBoardSessions(board.ID)
	assert.Nil(t, err)
	assert.Equal(t, 3, len(sessions))
}

func testGetBoardSessionsWithReadyFilter(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	readyFilter := true
	sessions, err := testDb.GetBoardSessions(board.ID, filter.BoardSessionFilter{Ready: &readyFilter})
	assert.Nil(t, err)
	assert.Equal(t, 0, len(sessions))
}

func testGetBoardSessionsWithRaisedHandFilter(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	raisedHandFilter := true
	sessions, err := testDb.GetBoardSessions(board.ID, filter.BoardSessionFilter{RaisedHand: &raisedHandFilter})
	assert.Nil(t, err)
	assert.Equal(t, 0, len(sessions))
}

func testGetBoardSessionsWithConnectedFilter(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	connectedFilter := true
	sessions, err := testDb.GetBoardSessions(board.ID, filter.BoardSessionFilter{Connected: &connectedFilter})
	assert.Nil(t, err)
	assert.Equal(t, 0, len(sessions))
}

func testGetBoardSessionsWithRoleFilter(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	roleFilter := types.SessionRoleOwner
	sessions, err := testDb.GetBoardSessions(board.ID, filter.BoardSessionFilter{Role: &roleFilter})
	assert.Nil(t, err)
	assert.Equal(t, 1, len(sessions))
}

func testGetBoardSessionsWithMultipleFilters(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)
	roleFilter := types.SessionRoleOwner
	connectedFilter := true
	sessions, err := testDb.GetBoardSessions(board.ID, filter.BoardSessionFilter{Role: &roleFilter, Connected: &connectedFilter})
	assert.Nil(t, err)
	assert.Equal(t, 0, len(sessions))
}

func testUpdateBoardSessions(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsTestBoard").(*Board)

	ready := true
	raisedHand := true
	sessions, err := testDb.UpdateBoardSessions(BoardSessionUpdate{
		Board:      board.ID,
		Ready:      &ready,
		RaisedHand: &raisedHand,
	})
	assert.Nil(t, err)
	assert.NotNil(t, sessions)
	for _, session := range sessions {
		assert.True(t, session.Ready)
		assert.True(t, session.RaisedHand)
	}

	ready = false
	raisedHand = false
	sessions, err = testDb.UpdateBoardSessions(BoardSessionUpdate{
		Board:      board.ID,
		Ready:      &ready,
		RaisedHand: &raisedHand,
	})
	assert.Nil(t, err)
	assert.NotNil(t, sessions)
	for _, session := range sessions {
		assert.False(t, session.Ready)
		assert.False(t, session.RaisedHand)
	}
}
