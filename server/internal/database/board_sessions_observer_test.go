package database

import (
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/internal/database/types"
	"testing"
)

type BoardSessionsObserverForTests struct {
	t           *testing.T
	board       *uuid.UUID
	session     *BoardSession
	sessions    *[]BoardSession
	updateCalls int
}

func (o *BoardSessionsObserverForTests) CreatedSession(board uuid.UUID, session BoardSession) {
	o.board = &board
	o.session = &session
}

func (o *BoardSessionsObserverForTests) UpdatedSession(board uuid.UUID, session BoardSession) {
	o.board = &board
	o.session = &session
}

func (o *BoardSessionsObserverForTests) UpdatedSessions(board uuid.UUID, sessions []BoardSession) {
	o.board = &board
	o.sessions = &sessions
	o.updateCalls++
}

func (o *BoardSessionsObserverForTests) Reset() {
	o.board = nil
	o.session = nil
	o.sessions = nil
	o.updateCalls = 0
}

var boardSessionsObserver BoardSessionsObserverForTests

func TestBoardSessionsObserver(t *testing.T) {
	boardSessionsObserver = BoardSessionsObserverForTests{t: t}
	testDb.AttachObserver(&boardSessionsObserver)

	t.Run("Test=1", testBoardSessionsObserverOnCreate)
	boardSessionsObserver.Reset()
	t.Run("Test=2", testBoardSessionsObserverOnUpdate)
	boardSessionsObserver.Reset()
	t.Run("Test=3", testBoardSessionsObserverOnUpdates)
	boardSessionsObserver.Reset()
	t.Run("Test=4", testUpdateUserNameShouldUpdateBoardSession)

	_, _ = testDb.DetachObserver(boardSessionsObserver)
}

func testBoardSessionsObserverOnCreate(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsObserverTestBoard").(*Board)
	user := fixture.MustRow("User.jane").(*User)

	_, err := testDb.CreateBoardSession(BoardSessionInsert{Board: board.ID, User: user.ID, Role: types.SessionRoleParticipant})
	assert.Nil(t, err)

	assert.NotNil(t, boardSessionsObserver.board)
	assert.NotNil(t, boardSessionsObserver.session)

	assert.Equal(t, board.ID, *boardSessionsObserver.board)
	assert.Equal(t, board.ID, boardSessionsObserver.session.Board)
	assert.Equal(t, user.ID, boardSessionsObserver.session.User)
}

func testBoardSessionsObserverOnUpdate(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsObserverTestBoard").(*Board)
	user := fixture.MustRow("User.jane").(*User)

	newRole := types.SessionRoleModerator
	newReady := true
	_, err := testDb.UpdateBoardSession(BoardSessionUpdate{Board: board.ID, User: user.ID, Role: &newRole, Ready: &newReady})
	assert.Nil(t, err)

	assert.NotNil(t, boardSessionsObserver.board)
	assert.NotNil(t, boardSessionsObserver.session)

	assert.Equal(t, board.ID, *boardSessionsObserver.board)
	assert.Equal(t, board.ID, boardSessionsObserver.session.Board)
	assert.Equal(t, user.ID, boardSessionsObserver.session.User)
	assert.Equal(t, types.SessionRoleModerator, boardSessionsObserver.session.Role)
}

func testBoardSessionsObserverOnUpdates(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsObserverTestBoard").(*Board)
	user := fixture.MustRow("User.jane").(*User)

	newReady := false
	_, err := testDb.UpdateBoardSessions(BoardSessionUpdate{Board: board.ID, Ready: &newReady})
	assert.Nil(t, err)

	assert.NotNil(t, boardSessionsObserver.board)
	assert.NotNil(t, boardSessionsObserver.sessions)

	assert.Equal(t, board.ID, *boardSessionsObserver.board)
	assert.Equal(t, board.ID, (*boardSessionsObserver.sessions)[1].Board)
	assert.Equal(t, user.ID, (*boardSessionsObserver.sessions)[1].User)
	assert.Equal(t, newReady, (*boardSessionsObserver.sessions)[1].Ready)

	assert.Equal(t, 1, boardSessionsObserver.updateCalls)
}

func testUpdateUserNameShouldUpdateBoardSession(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionsObserverTestBoard").(*Board)
	user := fixture.MustRow("User.jay").(*User)

	connected := true
	_, err := testDb.UpdateBoardSession(BoardSessionUpdate{Board: board.ID, User: user.ID, Connected: &connected})
	assert.Nil(t, err)
	boardSessionsObserver.Reset()

	newName := "Jay the Great"
	_, err = testDb.UpdateUser(UserUpdate{ID: user.ID, Name: newName})
	assert.Nil(t, err)

	assert.NotNil(t, boardSessionsObserver.board)
	assert.NotNil(t, boardSessionsObserver.session)

	assert.Equal(t, board.ID, *boardSessionsObserver.board)
	assert.Equal(t, board.ID, boardSessionsObserver.session.Board)
	assert.Equal(t, user.ID, boardSessionsObserver.session.User)
	assert.Equal(t, newName, boardSessionsObserver.session.Name)
}
