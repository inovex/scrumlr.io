package database

import (
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/internal/database/types"
	"testing"
)

var boardForColumnsTest uuid.UUID
var firstColumn *Column
var secondColumn *Column
var thirdColumn *Column
var columnInsertedFirst *Column
var columnInsertedSecond *Column
var columnInsertedThird *Column
var columnInsertedFourth *Column
var columnInsertedFifth *Column
var columnTestUser *User

func TestRunnerForColumns(t *testing.T) {
	firstColumn = fixture.MustRow("Column.firstColumn").(*Column)
	secondColumn = fixture.MustRow("Column.secondColumn").(*Column)
	thirdColumn = fixture.MustRow("Column.thirdColumn").(*Column)
	columnTestUser = fixture.MustRow("User.john").(*User)
	boardForColumnsTest = firstColumn.Board

	t.Run("Getter=0", testGetColumn)
	t.Run("Getter=1", testGetColumns)

	t.Run("Create=0", testCreateColumnOnFirstIndex)
	t.Run("Create=1", testCreateColumnOnLastIndex)
	t.Run("Create=2", testCreateColumnOnNegativeIndex)
	t.Run("Create=3", testCreateColumnWithExceptionallyHighIndex)
	t.Run("Create=4", testCreateColumnWithEmptyName)
	t.Run("Create=5", testCreateColumnWithEmptyColor)

	t.Run("Delete=0", testCreateColumnOnSecondIndex)
	t.Run("Delete=1", testDeleteColumnOnSecondIndex)
	t.Run("Delete=2", testDeleteColumnOnFirstIndex)
	t.Run("Delete=3", testDeleteLastColumn)
	t.Run("Delete=4", testDeleteColumnContainingSharedNote)
	t.Run("Delete=5", testDeleteOthers)

	t.Run("Update=0", testUpdateName)
	t.Run("Update=1", testUpdateColor)
	t.Run("Update=2", testUpdateVisibility)
	t.Run("Update=3", testMoveFirstColumnOnLastIndex)
	t.Run("Update=4", testMoveLastColumnOnFirstIndex)
	t.Run("Update=5", testMoveFirstColumnOnSecondIndex)
	t.Run("Update=6", testMoveSecondColumnOnFirstIndex)
}

func testGetColumn(t *testing.T) {
	column := fixture.MustRow("Column.firstColumn").(*Column)
	gotColumn, err := testDb.GetColumn(boardForColumnsTest, column.ID)
	assert.Nil(t, err)
	assert.Equal(t, column.ID, gotColumn.ID)
	assert.Equal(t, column.Name, gotColumn.Name)
	assert.Equal(t, column.Board, gotColumn.Board)
	assert.Equal(t, column.Visible, gotColumn.Visible)
	assert.Equal(t, column.Index, gotColumn.Index)
}

func testGetColumns(t *testing.T) {
	verifyOrder(t, firstColumn.ID, secondColumn.ID, thirdColumn.ID)
}

func testCreateColumnOnFirstIndex(t *testing.T) {
	visible := true
	index := 0

	column, err := testDb.CreateColumn(ColumnInsert{
		Board:   boardForColumnsTest,
		Name:    "0 Column",
		Color:   types.ColorBacklogBlue,
		Visible: &visible,
		Index:   &index,
	})
	assert.Nil(t, err)
	assert.Equal(t, 0, column.Index)

	verifyOrder(t, column.ID, firstColumn.ID, secondColumn.ID, thirdColumn.ID)

	columnInsertedFirst = &column
}

func testCreateColumnOnLastIndex(t *testing.T) {
	visible := true
	index := 4

	column, err := testDb.CreateColumn(ColumnInsert{
		Board:   boardForColumnsTest,
		Name:    "4 Column",
		Color:   types.ColorBacklogBlue,
		Visible: &visible,
		Index:   &index,
	})
	assert.Nil(t, err)
	assert.Equal(t, 4, column.Index)

	verifyOrder(t, columnInsertedFirst.ID, firstColumn.ID, secondColumn.ID, thirdColumn.ID, column.ID)

	columnInsertedSecond = &column
}

func testCreateColumnOnNegativeIndex(t *testing.T) {
	visible := true
	index := -99

	column, err := testDb.CreateColumn(ColumnInsert{
		Board:   boardForColumnsTest,
		Name:    "-99 Column",
		Color:   types.ColorBacklogBlue,
		Visible: &visible,
		Index:   &index,
	})
	assert.Nil(t, err)
	assert.Equal(t, 0, column.Index)

	verifyOrder(t, column.ID, columnInsertedFirst.ID, firstColumn.ID, secondColumn.ID, thirdColumn.ID, columnInsertedSecond.ID)

	columnInsertedThird = &column
}

func testCreateColumnWithExceptionallyHighIndex(t *testing.T) {
	visible := true
	index := 99

	column, err := testDb.CreateColumn(ColumnInsert{
		Board:   boardForColumnsTest,
		Name:    "99 Column",
		Color:   types.ColorBacklogBlue,
		Visible: &visible,
		Index:   &index,
	})
	assert.Nil(t, err)
	assert.Equal(t, 6, column.Index)

	verifyOrder(t, columnInsertedThird.ID, columnInsertedFirst.ID, firstColumn.ID, secondColumn.ID, thirdColumn.ID, columnInsertedSecond.ID, column.ID)

	columnInsertedFourth = &column
}

func testCreateColumnOnSecondIndex(t *testing.T) {
	visible := true
	index := 1

	column, err := testDb.CreateColumn(ColumnInsert{
		Board:   boardForColumnsTest,
		Name:    "1 Column",
		Color:   types.ColorBacklogBlue,
		Visible: &visible,
		Index:   &index,
	})
	assert.Nil(t, err)
	assert.Equal(t, 1, column.Index)

	verifyOrder(t, columnInsertedThird.ID, column.ID, columnInsertedFirst.ID, firstColumn.ID, secondColumn.ID, thirdColumn.ID, columnInsertedSecond.ID, columnInsertedFourth.ID)

	columnInsertedFifth = &column
}

func testCreateColumnWithEmptyName(t *testing.T) {
	_, err := testDb.CreateColumn(ColumnInsert{
		Board: boardForColumnsTest,
		Name:  "",
		Color: types.ColorBacklogBlue,
	})
	assert.NotNil(t, err)
}

func testCreateColumnWithEmptyColor(t *testing.T) {
	_, err := testDb.CreateColumn(ColumnInsert{
		Board: boardForColumnsTest,
		Name:  "Column",
		Color: "",
	})
	assert.NotNil(t, err)
}

func testDeleteColumnOnSecondIndex(t *testing.T) {
	err := testDb.DeleteColumn(boardForColumnsTest, columnInsertedFifth.ID, columnTestUser.ID)
	assert.Nil(t, err)

	verifyOrder(t, columnInsertedThird.ID, columnInsertedFirst.ID, firstColumn.ID, secondColumn.ID, thirdColumn.ID, columnInsertedSecond.ID, columnInsertedFourth.ID)
}

func testDeleteColumnOnFirstIndex(t *testing.T) {
	err := testDb.DeleteColumn(boardForColumnsTest, columnInsertedThird.ID, columnTestUser.ID)
	assert.Nil(t, err)

	verifyOrder(t, columnInsertedFirst.ID, firstColumn.ID, secondColumn.ID, thirdColumn.ID, columnInsertedSecond.ID, columnInsertedFourth.ID)
}

func testDeleteLastColumn(t *testing.T) {
	err := testDb.DeleteColumn(boardForColumnsTest, columnInsertedFourth.ID, columnTestUser.ID)
	assert.Nil(t, err)

	verifyOrder(t, columnInsertedFirst.ID, firstColumn.ID, secondColumn.ID, thirdColumn.ID, columnInsertedSecond.ID)
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

	deleteColumnError := testDb.DeleteColumn(boardForColumnsTest, columnInsertedSecond.ID, columnTestUser.ID)
	assert.Nil(t, deleteColumnError)

	updatedBoard, getUpdatedBoardError := testDb.GetBoard(boardForColumnsTest)
	assert.Nil(t, getUpdatedBoardError)
	assert.Equal(t, updatedBoard.SharedNote, uuid.NullUUID{Valid: false})
}

func testDeleteOthers(t *testing.T) {
	_ = testDb.DeleteColumn(boardForColumnsTest, columnInsertedFirst.ID, columnTestUser.ID)

	verifyOrder(t, firstColumn.ID, secondColumn.ID, thirdColumn.ID)
}

func testUpdateName(t *testing.T) {
	column, err := testDb.UpdateColumn(ColumnUpdate{
		ID:      firstColumn.ID,
		Board:   boardForColumnsTest,
		Name:    "Updated name",
		Color:   types.ColorBacklogBlue,
		Visible: false,
		Index:   0,
	})
	assert.Nil(t, err)
	assert.Equal(t, "Updated name", column.Name)
}

func testUpdateColor(t *testing.T) {
	column, err := testDb.UpdateColumn(ColumnUpdate{
		ID:      firstColumn.ID,
		Board:   boardForColumnsTest,
		Name:    "Updated name",
		Color:   types.ColorPlanningPink,
		Visible: false,
		Index:   0,
	})
	assert.Nil(t, err)
	assert.Equal(t, types.ColorPlanningPink, column.Color)
}

func testUpdateVisibility(t *testing.T) {
	column, err := testDb.UpdateColumn(ColumnUpdate{
		ID:      firstColumn.ID,
		Board:   boardForColumnsTest,
		Name:    "First column",
		Color:   types.ColorBacklogBlue,
		Visible: true,
		Index:   0,
	})
	assert.Nil(t, err)
	assert.Equal(t, true, column.Visible)
}

func testMoveFirstColumnOnLastIndex(t *testing.T) {
	_, err := testDb.UpdateColumn(ColumnUpdate{
		ID:      firstColumn.ID,
		Board:   boardForColumnsTest,
		Name:    "First column",
		Color:   types.ColorBacklogBlue,
		Visible: true,
		Index:   100,
	})
	assert.Nil(t, err)
	verifyOrder(t, secondColumn.ID, thirdColumn.ID, firstColumn.ID)
}

func testMoveLastColumnOnFirstIndex(t *testing.T) {
	_, err := testDb.UpdateColumn(ColumnUpdate{
		ID:      firstColumn.ID,
		Board:   boardForColumnsTest,
		Name:    "First column",
		Color:   types.ColorBacklogBlue,
		Visible: true,
		Index:   0,
	})
	assert.Nil(t, err)
	verifyOrder(t, firstColumn.ID, secondColumn.ID, thirdColumn.ID)
}

func testMoveFirstColumnOnSecondIndex(t *testing.T) {
	_, err := testDb.UpdateColumn(ColumnUpdate{
		ID:      firstColumn.ID,
		Board:   boardForColumnsTest,
		Name:    "First column",
		Color:   types.ColorBacklogBlue,
		Visible: true,
		Index:   1,
	})
	assert.Nil(t, err)
	verifyOrder(t, secondColumn.ID, firstColumn.ID, thirdColumn.ID)
}

func testMoveSecondColumnOnFirstIndex(t *testing.T) {
	_, err := testDb.UpdateColumn(ColumnUpdate{
		ID:      firstColumn.ID,
		Board:   boardForColumnsTest,
		Name:    "First column",
		Color:   types.ColorBacklogBlue,
		Visible: true,
		Index:   0,
	})
	assert.Nil(t, err)
	verifyOrder(t, firstColumn.ID, secondColumn.ID, thirdColumn.ID)
}

func verifyOrder(t *testing.T, ids ...uuid.UUID) {
	expectedOrder := ids

	columns, err := testDb.GetColumns(boardForColumnsTest)
	assert.Nil(t, err)
	assert.Equal(t, len(ids), len(columns))

	for index, value := range columns {
		assert.Equal(t, expectedOrder[index], value.ID)
		assert.Equal(t, index, value.Index)
	}
}
