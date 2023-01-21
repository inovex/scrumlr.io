package database

import (
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/internal/database/types"
	"testing"
)

type BoardSessionRequestsObserverForTests struct {
	t       *testing.T
	board   *uuid.UUID
	request *BoardSessionRequest
}

func (o *BoardSessionRequestsObserverForTests) CreatedSessionRequest(board uuid.UUID, request BoardSessionRequest) {
	o.board = &board
	o.request = &request
}

func (o *BoardSessionRequestsObserverForTests) UpdatedSessionRequest(board uuid.UUID, request BoardSessionRequest) {
	o.board = &board
	o.request = &request
}

func (o *BoardSessionRequestsObserverForTests) Reset() {
	o.board = nil
	o.request = nil
}

var boardSessionRequestsObserver BoardSessionRequestsObserverForTests

func TestBoardSessionRequestsObserver(t *testing.T) {
	boardSessionRequestsObserver = BoardSessionRequestsObserverForTests{t: t}
	testDb.AttachObserver(&boardSessionRequestsObserver)

	t.Run("Test=1", testBoardSessionRequestsObserverOnCreate)
	boardSessionsObserver.Reset()
	t.Run("Test=2", testBoardSessionRequestsObserverOnUpdate)

	_, _ = testDb.DetachObserver(boardSessionRequestsObserver)
}

func testBoardSessionRequestsObserverOnCreate(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsObserverTestBoard").(*Board)
	user := fixture.MustRow("User.jane").(*User)

	_, err := testDb.CreateBoardSessionRequest(BoardSessionRequestInsert{Board: board.ID, User: user.ID})
	assert.Nil(t, err)

	assert.NotNil(t, boardSessionRequestsObserver.board)
	assert.NotNil(t, boardSessionRequestsObserver.request)

	assert.Equal(t, board.ID, *boardSessionRequestsObserver.board)
	assert.Equal(t, board.ID, boardSessionRequestsObserver.request.Board)
	assert.Equal(t, user.ID, boardSessionRequestsObserver.request.User)
	assert.Equal(t, types.BoardSessionRequestStatusPending, boardSessionRequestsObserver.request.Status)
}

func testBoardSessionRequestsObserverOnUpdate(t *testing.T) {
	board := fixture.MustRow("Board.boardSessionRequestsObserverTestBoard").(*Board)
	user := fixture.MustRow("User.jane").(*User)

	_, err := testDb.UpdateBoardSessionRequest(BoardSessionRequestUpdate{
		Board:  board.ID,
		User:   user.ID,
		Status: types.BoardSessionRequestStatusRejected,
	})
	assert.Nil(t, err)

	assert.NotNil(t, boardSessionRequestsObserver.board)
	assert.NotNil(t, boardSessionRequestsObserver.request)

	assert.Equal(t, board.ID, *boardSessionRequestsObserver.board)
	assert.Equal(t, board.ID, boardSessionRequestsObserver.request.Board)
	assert.Equal(t, user.ID, boardSessionRequestsObserver.request.User)
	assert.Equal(t, types.BoardSessionRequestStatusRejected, boardSessionRequestsObserver.request.Status)
}
