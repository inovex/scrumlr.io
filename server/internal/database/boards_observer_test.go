package database

import (
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"testing"
)

type BoardsObserverForTests struct {
	t            *testing.T
	boardName    *string
	deleted      bool
	deletedBoard *uuid.UUID
}

func (o *BoardsObserverForTests) UpdatedBoard(board Board) {
	o.boardName = board.Name
}

func (o *BoardsObserverForTests) UpdatedBoardTimer(board Board) {
}

func (o *BoardsObserverForTests) DeletedBoard(board uuid.UUID) {
	o.deleted = true
	o.deletedBoard = &board
}

var boardsObserver BoardsObserverForTests

func TestBoardsObserver(t *testing.T) {
	boardsObserver = BoardsObserverForTests{t: t, deleted: false}
	testDb.AttachObserver(&boardsObserver)

	t.Run("Test=1", testBoardsObserverOnUpdate)
	t.Run("Test=2", testBoardsObserverOnDelete)

	_, _ = testDb.DetachObserver(boardsObserver)
}

func testBoardsObserverOnUpdate(t *testing.T) {
	board := fixture.MustRow("Board.boardsObserverTestBoard").(*Board)

	updatedName := "My updated board name"
	updatedBoard, err := testDb.UpdateBoard(BoardUpdate{
		ID:   board.ID,
		Name: &updatedName,
	})
	assert.Nil(t, err)
	assert.NotNil(t, boardsObserver.boardName)
	assert.Equal(t, *updatedBoard.Name, *boardsObserver.boardName)
}

func testBoardsObserverOnDelete(t *testing.T) {
	board := fixture.MustRow("Board.boardsObserverTestBoard").(*Board)
	err := testDb.DeleteBoard(board.ID)
	assert.Nil(t, err)
	assert.True(t, boardsObserver.deleted)
	assert.NotNil(t, boardsObserver.deletedBoard)
	assert.Equal(t, board.ID, *boardsObserver.deletedBoard)
}
