package database

import (
	"github.com/emvi/null"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/database/types"
	"testing"
)

var boardForColumnsTest uuid.UUID
var columnInsertedFirst *Column
var columnInsertedSecond *Column
var columnInsertedThird *Column
var columnInsertedFourth *Column
var columnInsertedFifth *Column

func TestRunnerForColumns(t *testing.T) {
	t.Run("Create=0", testCreateColumnOnFirstIndex)
	t.Run("Create=1", testCreateColumnOnLastIndex)
	t.Run("Create=2", testCreateColumnOnNegativeIndex)
	t.Run("Create=3", testCreateColumnWithExceptionallyHighIndex)
	t.Run("Create=4", testCreateColumnOnSecondIndex)
	t.Run("Create=5", testCreateColumnWithEmptyName)
	t.Run("Create=6", testCreateColumnWithEmptyColor)

	t.Run("Getter=0", testGetColumn)
	t.Run("Getter=1", testGetColumns)

	t.Run("Update=0", testUpdateName)
	t.Run("Update=1", testUpdateColor)
	t.Run("Update=2", testUpdateVisibility)
	t.Run("Update=3", testMoveFirstColumnOnLastIndex)
	t.Run("Update=4", testMoveLastColumnOnFirstIndex)
	t.Run("Update=5", testMoveFirstColumnOnSecondIndex)
	t.Run("Update=6", testMoveSecondColumnOnFirstIndex)

	t.Run("Delete=1", testDeleteColumnOnSecondIndex)
	t.Run("Delete=2", testDeleteColumnOnFirstIndex)
	t.Run("Delete=3", testDeleteLastColumn)
	t.Run("Delete=4", testDeleteColumnContainingSharedNote)
	t.Run("Delete=5", testDeleteOthers)
}

func testCreateColumnOnFirstIndex(t *testing.T) {
	column, order, err := testDb.CreateColumn(
		boardForColumnsTest,
		"0 Column",
		types.ColorBacklogBlue,
		null.NewBool(true, true),
		null.NewInt32(0, true))

	assert.Nil(t, err)
	assert.Equal(t, 1, len(order))

	columnInsertedFirst = &column
}

func testCreateColumnOnLastIndex(t *testing.T) {
	column, order, err := testDb.CreateColumn(
		boardForColumnsTest,
		"1 Column",
		types.ColorBacklogBlue,
		null.NewBool(true, true),
		null.NewInt32(1, true))

	assert.Nil(t, err)
	assert.Equal(t, 2, len(order))
	assert.Equal(t, column.ID, order[1])

	columnInsertedSecond = &column
}

func testCreateColumnOnNegativeIndex(t *testing.T) {
	column, order, err := testDb.CreateColumn(
		boardForColumnsTest,
		"2 Column",
		types.ColorBacklogBlue,
		null.NewBool(true, true),
		null.NewInt32(-99, true))

	assert.Nil(t, err)
	assert.Equal(t, 3, len(order))
	assert.Equal(t, column.ID, order[0])

	columnInsertedThird = &column
}

func testCreateColumnWithExceptionallyHighIndex(t *testing.T) {
	column, order, err := testDb.CreateColumn(
		boardForColumnsTest,
		"3 Column",
		types.ColorBacklogBlue,
		null.NewBool(true, true),
		null.NewInt32(99, true))

	assert.Nil(t, err)
	assert.Equal(t, 4, len(order))
	assert.Equal(t, column.ID, order[3])

	columnInsertedFourth = &column
}

func testCreateColumnOnSecondIndex(t *testing.T) {
	column, order, err := testDb.CreateColumn(
		boardForColumnsTest,
		"4 Column",
		types.ColorBacklogBlue,
		null.NewBool(true, true),
		null.NewInt32(1, true))

	assert.Nil(t, err)
	assert.Equal(t, 5, len(order))
	assert.Equal(t, column.ID, order[1])

	columnInsertedFifth = &column
}

func testCreateColumnWithEmptyName(t *testing.T) {
	_, _, err := testDb.CreateColumn(
		boardForColumnsTest,
		"",
		types.ColorBacklogBlue,
		null.NewBool(true, false),
		null.NewInt32(0, false))

	assert.NotNil(t, err)
}

func testCreateColumnWithEmptyColor(t *testing.T) {
	_, _, err := testDb.CreateColumn(
		boardForColumnsTest,
		"Name",
		"",
		null.NewBool(true, false),
		null.NewInt32(0, false))

	assert.NotNil(t, err)
}

func testGetColumn(t *testing.T) {
	gotColumn, _, err := testDb.GetColumn(boardForColumnsTest, columnInsertedFirst.ID)

	assert.Nil(t, err)
	assert.Equal(t, columnInsertedFirst.ID, gotColumn.ID)
	assert.Equal(t, columnInsertedFirst.Name, gotColumn.Name)
	assert.Equal(t, columnInsertedFirst.Board, gotColumn.Board)
	assert.Equal(t, columnInsertedFirst.Visible, gotColumn.Visible)
}

func testGetColumns(t *testing.T) {
	verifyOrder(t)
}

func testUpdateName(t *testing.T) {
	column, _, err := testDb.UpdateColumn(boardForColumnsTest, columnInsertedFirst.ID, null.NewString("Updated name", true), types.ColorBacklogBlue, null.NewBool(false, false), null.NewInt32(0, false))
	assert.Nil(t, err)
	assert.Equal(t, "Updated name", column.Name)
}

func testUpdateColor(t *testing.T) {
	column, _, err := testDb.UpdateColumn(boardForColumnsTest, columnInsertedFirst.ID, null.NewString("", false), types.ColorPlanningPink, null.NewBool(false, false), null.NewInt32(0, false))
	assert.Nil(t, err)
	assert.Equal(t, types.ColorPlanningPink, column.Color)
}

func testUpdateVisibility(t *testing.T) {
	column, _, err := testDb.UpdateColumn(boardForColumnsTest, columnInsertedFirst.ID, null.NewString("", false), types.ColorPlanningPink, null.NewBool(true, true), null.NewInt32(0, false))
	assert.Nil(t, err)
	assert.Equal(t, true, column.Visible)
}

func testMoveFirstColumnOnLastIndex(t *testing.T) {
	_, _, err := testDb.UpdateColumn(boardForColumnsTest, columnInsertedFirst.ID, null.NewString("", false), types.ColorPlanningPink, null.NewBool(true, false), null.NewInt32(100, true))
	assert.Nil(t, err)
	verifyOrder(t)
}

func testMoveLastColumnOnFirstIndex(t *testing.T) {
	_, _, err := testDb.UpdateColumn(boardForColumnsTest, columnInsertedFifth.ID, null.NewString("", false), types.ColorPlanningPink, null.NewBool(true, false), null.NewInt32(0, true))
	assert.Nil(t, err)
	verifyOrder(t)
}

func testMoveFirstColumnOnSecondIndex(t *testing.T) {
	_, _, err := testDb.UpdateColumn(boardForColumnsTest, columnInsertedFirst.ID, null.NewString("", false), types.ColorPlanningPink, null.NewBool(true, false), null.NewInt32(1, true))
	assert.Nil(t, err)
	verifyOrder(t)
}

func testMoveSecondColumnOnFirstIndex(t *testing.T) {
	_, _, err := testDb.UpdateColumn(boardForColumnsTest, columnInsertedSecond.ID, null.NewString("", false), types.ColorPlanningPink, null.NewBool(true, false), null.NewInt32(0, true))
	assert.Nil(t, err)
	verifyOrder(t)
}

func testDeleteColumnOnSecondIndex(t *testing.T) {
	err := testDb.DeleteColumn(boardForColumnsTest, columnInsertedFifth.ID)
	assert.Nil(t, err)

	verifyOrder(t, columnInsertedThird.ID, columnInsertedFirst.ID, columnInsertedSecond.ID, columnInsertedFourth.ID)
}

func testDeleteColumnOnFirstIndex(t *testing.T) {
	err := testDb.DeleteColumn(boardForColumnsTest, columnInsertedThird.ID)
	assert.Nil(t, err)

	verifyOrder(t, columnInsertedFirst.ID, columnInsertedSecond.ID, columnInsertedFourth.ID)
}

func testDeleteLastColumn(t *testing.T) {
	err := testDb.DeleteColumn(boardForColumnsTest, columnInsertedFourth.ID)
	assert.Nil(t, err)

	verifyOrder(t, columnInsertedFirst.ID, columnInsertedSecond.ID)
}

func testDeleteColumnContainingSharedNote(t *testing.T) {
	note, createNoteError := testDb.CreateNote(NoteInsert{
		Board:  boardForColumnsTest,
		Column: columnInsertedSecond.ID,
		Text:   "Lorem Ipsum",
		Author: fixture.MustRow("User.john").(*User).ID,
	})
	assert.Nil(t, createNoteError)

	_, updateBoardError := testDb.UpdateBoard(BoardUpdate{
		ID:         boardForColumnsTest,
		SharedNote: uuid.NullUUID{UUID: note.ID, Valid: true},
		ShowVoting: uuid.NullUUID{Valid: false},
	})
	assert.Nil(t, updateBoardError)

	board, getBoardError := testDb.GetBoard(boardForColumnsTest)
	assert.Nil(t, getBoardError)
	assert.Equal(t, board.SharedNote, uuid.NullUUID{UUID: note.ID, Valid: true})

	deleteColumnError := testDb.DeleteColumn(boardForColumnsTest, columnInsertedSecond.ID)
	assert.Nil(t, deleteColumnError)

	updatedBoard, getUpdatedBoardError := testDb.GetBoard(boardForColumnsTest)
	assert.Nil(t, getUpdatedBoardError)
	assert.Equal(t, updatedBoard.SharedNote, uuid.NullUUID{Valid: false})
}

func testDeleteOthers(t *testing.T) {
	_ = testDb.DeleteColumn(boardForColumnsTest, columnInsertedFirst.ID)

	verifyOrder(t)
}

func verifyOrder(t *testing.T, ids ...uuid.UUID) {
	expectedOrder := ids

	_, order, err := testDb.GetColumns(boardForColumnsTest)
	assert.Nil(t, err)
	assert.Equal(t, len(ids), len(order))

	for index, value := range order {
		assert.Equal(t, expectedOrder[index], value.ID)
	}
}
