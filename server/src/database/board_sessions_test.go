package database

import (
	"testing"

	"scrumlr.io/server/boards"
	"scrumlr.io/server/common"

	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/users"
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
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.john").(*users.DatabaseUser)

	session, err := sessionDb.Create(sessions.DatabaseBoardSessionInsert{Board: board.ID, User: user.ID, Role: common.ParticipantRole})
	assert.Nil(t, err)
	assert.NotEmpty(t, session)
}

func testCreateBoardSessionAsModerator(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jennifer").(*users.DatabaseUser)

	session, err := sessionDb.Create(sessions.DatabaseBoardSessionInsert{Board: board.ID, User: user.ID, Role: common.ModeratorRole})
	assert.Nil(t, err)
	assert.NotEmpty(t, session)
}

func testCreateDuplicateBoardSessionShouldFail(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jennifer").(*users.DatabaseUser)

	_, err := sessionDb.Create(sessions.DatabaseBoardSessionInsert{Board: board.ID, User: user.ID, Role: common.ModeratorRole})
	assert.NotNil(t, err)
}

func testCreateBoardSessionAsOwnerShouldFail(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	_, err := sessionDb.Create(sessions.DatabaseBoardSessionInsert{Board: board.ID, User: user.ID, Role: common.ModeratorRole})
	assert.NotNil(t, err)
}

func testUpdateOfConnectedState(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jennifer").(*users.DatabaseUser)

	connected := true

	session, err := sessionDb.Update(sessions.DatabaseBoardSessionUpdate{
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
	session, err = sessionDb.Update(sessions.DatabaseBoardSessionUpdate{
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
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jennifer").(*users.DatabaseUser)

	ready := true

	session, err := sessionDb.Update(sessions.DatabaseBoardSessionUpdate{
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
	session, err = sessionDb.Update(sessions.DatabaseBoardSessionUpdate{
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
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jennifer").(*users.DatabaseUser)

	raisedHand := true

	session, err := sessionDb.Update(sessions.DatabaseBoardSessionUpdate{
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
	session, err = sessionDb.Update(sessions.DatabaseBoardSessionUpdate{
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
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jennifer").(*users.DatabaseUser)

	banned := true

	session, err := sessionDb.Update(sessions.DatabaseBoardSessionUpdate{
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
	session, err = sessionDb.Update(sessions.DatabaseBoardSessionUpdate{
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
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jennifer").(*users.DatabaseUser)

	role := common.ParticipantRole

	session, err := sessionDb.Update(sessions.DatabaseBoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: nil,
		Role:       &role,
	})
	assert.Nil(t, err)
	assert.Equal(t, role, session.Role)

	role = common.ModeratorRole
	session, err = sessionDb.Update(sessions.DatabaseBoardSessionUpdate{
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
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jennifer").(*users.DatabaseUser)

	role := common.ParticipantRole

	session, err := sessionDb.Update(sessions.DatabaseBoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: nil,
		Role:       &role,
	})
	assert.Nil(t, err)
	assert.Equal(t, role, session.Role)

	role = common.OwnerRole
	session, err = sessionDb.Update(sessions.DatabaseBoardSessionUpdate{
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
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jennifer").(*users.DatabaseUser)

	role := common.ModeratorRole

	session, err := sessionDb.Update(sessions.DatabaseBoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: nil,
		Role:       &role,
	})
	assert.Nil(t, err)
	assert.Equal(t, role, session.Role)

	role = common.OwnerRole
	session, err = sessionDb.Update(sessions.DatabaseBoardSessionUpdate{
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
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jennifer").(*users.DatabaseUser)

	role := common.ParticipantRole

	_, err := sessionDb.Update(sessions.DatabaseBoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: nil,
		Role:       &role,
	})
	assert.Nil(t, err)

	exists, err := sessionDb.Exists(board.ID, user.ID)
	assert.Nil(t, err)
	assert.Equal(t, true, exists)
}

func testBoardSessionExistsForModerator(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jennifer").(*users.DatabaseUser)

	role := common.ModeratorRole

	_, err := sessionDb.Update(sessions.DatabaseBoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: nil,
		Role:       &role,
	})
	assert.Nil(t, err)

	exists, err := sessionDb.Exists(board.ID, user.ID)
	assert.Nil(t, err)
	assert.Equal(t, true, exists)
}

func testBoardSessionExistsForOwner(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jane").(*users.DatabaseUser)

	exists, err := sessionDb.Exists(board.ID, user.ID)
	assert.Nil(t, err)
	assert.Equal(t, true, exists)
}

func testBoardSessionDoesNotExist(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	exists, err := sessionDb.Exists(board.ID, user.ID)
	assert.Nil(t, err)
	assert.Equal(t, false, exists)
}

func testModeratorBoardSessionExistsForParticipantShouldFail(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jennifer").(*users.DatabaseUser)

	role := common.ParticipantRole

	_, err := sessionDb.Update(sessions.DatabaseBoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: nil,
		Role:       &role,
	})
	assert.Nil(t, err)

	exists, err := sessionDb.ModeratorExists(board.ID, user.ID)
	assert.Nil(t, err)
	assert.Equal(t, false, exists)
}

func testModeratorBoardSessionExistsForModerator(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jennifer").(*users.DatabaseUser)

	role := common.ModeratorRole

	_, err := sessionDb.Update(sessions.DatabaseBoardSessionUpdate{
		Board:      board.ID,
		User:       user.ID,
		Connected:  nil,
		Ready:      nil,
		RaisedHand: nil,
		Role:       &role,
	})
	assert.Nil(t, err)

	exists, err := sessionDb.ModeratorExists(board.ID, user.ID)
	assert.Nil(t, err)
	assert.Equal(t, true, exists)
}

func testModeratorBoardSessionExistsForOwner(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jane").(*users.DatabaseUser)

	exists, err := sessionDb.ModeratorExists(board.ID, user.ID)
	assert.Nil(t, err)
	assert.Equal(t, true, exists)
}

func testModeratorBoardSessionDoesNotExist(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.john").(*users.DatabaseUser)

	exists, err := sessionDb.ModeratorExists(board.ID, user.ID)
	assert.Nil(t, err)
	assert.Equal(t, false, exists)
}

func testGetBoardSession(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	user := fixture.MustRow("DatabaseUser.jane").(*users.DatabaseUser)

	session, err := sessionDb.Get(board.ID, user.ID)
	assert.Nil(t, err)

	assert.Equal(t, board.ID, session.Board)
	assert.Equal(t, user.ID, session.User)
	assert.Equal(t, user.Name, session.Name)
}

func testGetBoardSessions(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	sessions, err := sessionDb.GetAll(board.ID)
	assert.Nil(t, err)
	assert.Equal(t, 3, len(sessions))
}

func testGetBoardSessionsWithReadyFilter(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	readyFilter := true
	sessions, err := sessionDb.GetAll(board.ID, sessions.BoardSessionFilter{Ready: &readyFilter})
	assert.Nil(t, err)
	assert.Equal(t, 0, len(sessions))
}

func testGetBoardSessionsWithRaisedHandFilter(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	raisedHandFilter := true
	sessions, err := sessionDb.GetAll(board.ID, sessions.BoardSessionFilter{RaisedHand: &raisedHandFilter})
	assert.Nil(t, err)
	assert.Equal(t, 0, len(sessions))
}

func testGetBoardSessionsWithConnectedFilter(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	connectedFilter := true
	sessions, err := sessionDb.GetAll(board.ID, sessions.BoardSessionFilter{Connected: &connectedFilter})
	assert.Nil(t, err)
	assert.Equal(t, 0, len(sessions))
}

func testGetBoardSessionsWithRoleFilter(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	roleFilter := common.OwnerRole
	sessions, err := sessionDb.GetAll(board.ID, sessions.BoardSessionFilter{Role: &roleFilter})
	assert.Nil(t, err)
	assert.Equal(t, 1, len(sessions))
}

func testGetBoardSessionsWithMultipleFilters(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)
	roleFilter := common.OwnerRole
	connectedFilter := true
	sessions, err := sessionDb.GetAll(board.ID, sessions.BoardSessionFilter{Role: &roleFilter, Connected: &connectedFilter})
	assert.Nil(t, err)
	assert.Equal(t, 0, len(sessions))
}

func testUpdateBoardSessions(t *testing.T) {
	board := fixture.MustRow("DatabaseBoard.boardSessionsTestBoard").(*boards.DatabaseBoard)

	ready := true
	raisedHand := true
	boardSessions, err := sessionDb.UpdateAll(sessions.DatabaseBoardSessionUpdate{
		Board:      board.ID,
		Ready:      &ready,
		RaisedHand: &raisedHand,
	})
	assert.Nil(t, err)
	assert.NotNil(t, boardSessions)
	for _, session := range boardSessions {
		assert.True(t, session.Ready)
		assert.True(t, session.RaisedHand)
	}

	ready = false
	raisedHand = false
	boardSessions, err = sessionDb.UpdateAll(sessions.DatabaseBoardSessionUpdate{
		Board:      board.ID,
		Ready:      &ready,
		RaisedHand: &raisedHand,
	})
	assert.Nil(t, err)
	assert.NotNil(t, boardSessions)
	for _, session := range boardSessions {
		assert.False(t, session.Ready)
		assert.False(t, session.RaisedHand)
	}
}
