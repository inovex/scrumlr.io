package database

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/database/types"
)

var boardForColumnTemplatesTest uuid.UUID
var firstColumnTemplate *ColumnTemplate
var secondColumnTemplate *ColumnTemplate
var thirdColumnTemplate *ColumnTemplate
var columnTemplateInsertedFirst *ColumnTemplate
var columnTemplateInsertedSecond *ColumnTemplate
var columnTemplateInsertedThird *ColumnTemplate
var columnTemplateInsertedFourth *ColumnTemplate
var columnTemplateInsertedFifth *ColumnTemplate
var columnTemplateTestUser *User

func TestRunnerForColumnTemplates(t *testing.T) {
	firstColumnTemplate = fixture.MustRow("ColumnTemplate.firstColumnTemplate").(*ColumnTemplate)
	secondColumnTemplate = fixture.MustRow("ColumnTemplate.secondColumnTemplate").(*ColumnTemplate)
	thirdColumnTemplate = fixture.MustRow("ColumnTemplate.thirdColumnTemplate").(*ColumnTemplate)
	columnTemplateTestUser = fixture.MustRow("User.justin").(*User)
	boardForColumnTemplatesTest = firstColumnTemplate.BoardTemplate

	t.Run("Getter=0", testGetColumnTemplate)
	t.Run("Getter=1", testGetColumnTemplates)

	t.Run("Create=0", testCreateColumnTemplateOnFirstIndex)
	t.Run("Create=1", testCreateColumnTemplateOnLastIndex)
	t.Run("Create=2", testCreateColumnTemplateOnNegativeIndex)
	t.Run("Create=3", testCreateColumnTemplateWithExceptionallyHighIndex)
	t.Run("Create=4", testCreateColumnTemplateOnSecondIndex)
	t.Run("Create=5", testCreateColumnTemplateWithEmptyName)
	t.Run("Create=6", testCreateColumnTemplateWithEmptyColor)
	t.Run("Create=7", testCreateColumnTemplateWithDescription)

	t.Run("Delete=0", testDeleteColumnTemplateOnSecondIndex)
	t.Run("Delete=1", testDeleteColumnTemplateOnFirstIndex)
	t.Run("Delete=2", testDeleteLastColumnTemplate)
	t.Run("Delete=3", testDeleteOtherColumnTemplates)

	t.Run("Update=0", testUpdateColumnTemplateName)
	t.Run("Update=1", testUpdateColumnTemplateColor)
	t.Run("Update=2", testUpdateColumnTemplateVisibility)
	t.Run("Update=3", testMoveFirstColumnTemplateOnLastIndex)
	t.Run("Update=4", testMoveLastColumnTemplateOnFirstIndex)
	t.Run("Update=5", testMoveFirstColumnTemplateOnSecondIndex)
	t.Run("Update=6", testMoveSecondColumnTemplateOnFirstIndex)
	t.Run("Update=7", testUpdateColumnTemplateDescription)
}

func testGetColumnTemplate(t *testing.T) {
	column := fixture.MustRow("ColumnTemplate.firstColumnTemplate").(*ColumnTemplate)
	gotColumn, err := testDb.GetColumnTemplate(boardForColumnTemplatesTest, column.ID)
	assert.Nil(t, err)
	assert.Equal(t, column.ID, gotColumn.ID)
	assert.Equal(t, column.BoardTemplate, gotColumn.BoardTemplate)
	assert.Equal(t, column.Name, gotColumn.Name)
	assert.Equal(t, column.Description, gotColumn.Description)
	assert.Equal(t, column.Visible, gotColumn.Visible)
	assert.Equal(t, column.Index, gotColumn.Index)
}

func testGetColumnTemplates(t *testing.T) {
	verifyColumnTemplateOrder(t, firstColumnTemplate.ID, secondColumnTemplate.ID, thirdColumnTemplate.ID)
}

func testCreateColumnTemplateOnFirstIndex(t *testing.T) {
	visible := true
	index := 0

	column, err := testDb.CreateColumnTemplate(ColumnTemplateInsert{
		BoardTemplate: boardForColumnTemplatesTest,
		Name:          "0 Column",
		Color:         types.ColorBacklogBlue,
		Visible:       &visible,
		Index:         &index,
	})
	assert.Nil(t, err)
	assert.Equal(t, index, column.Index)

	verifyColumnTemplateOrder(t, column.ID, firstColumnTemplate.ID, secondColumnTemplate.ID, thirdColumnTemplate.ID)
	columnTemplateInsertedFirst = &column
}

func testCreateColumnTemplateOnLastIndex(t *testing.T) {
	visible := true
	index := 4

	column, err := testDb.CreateColumnTemplate(ColumnTemplateInsert{
		BoardTemplate: boardForColumnTemplatesTest,
		Name:          "4 Column",
		Description:   "Test description",
		Color:         types.ColorBacklogBlue,
		Visible:       &visible,
		Index:         &index,
	})

	assert.Nil(t, err)
	assert.Equal(t, index, column.Index)

	verifyColumnTemplateOrder(t, columnTemplateInsertedFirst.ID, firstColumnTemplate.ID, secondColumnTemplate.ID, thirdColumnTemplate.ID, column.ID)
	columnTemplateInsertedSecond = &column
}

func testCreateColumnTemplateOnNegativeIndex(t *testing.T) {
	visible := true
	index := -99
	expectedIndex := 0

	column, err := testDb.CreateColumnTemplate(ColumnTemplateInsert{
		BoardTemplate: boardForColumnTemplatesTest,
		Name:          "-99 Column",
		Color:         types.ColorBacklogBlue,
		Visible:       &visible,
		Index:         &index,
	})
	assert.Nil(t, err)
	assert.Equal(t, expectedIndex, column.Index)

	verifyColumnTemplateOrder(t, column.ID, columnTemplateInsertedFirst.ID, firstColumnTemplate.ID, secondColumnTemplate.ID, thirdColumnTemplate.ID, columnTemplateInsertedSecond.ID)
	columnTemplateInsertedThird = &column
}

func testCreateColumnTemplateWithExceptionallyHighIndex(t *testing.T) {
	visible := true
	index := 99
	expectedIndex := 6

	column, err := testDb.CreateColumnTemplate(ColumnTemplateInsert{
		BoardTemplate: boardForColumnTemplatesTest,
		Name:          "99 Column",
		Color:         types.ColorBacklogBlue,
		Visible:       &visible,
		Index:         &index,
	})
	assert.Nil(t, err)
	assert.Equal(t, expectedIndex, column.Index)

	verifyColumnTemplateOrder(t, columnTemplateInsertedThird.ID, columnTemplateInsertedFirst.ID, firstColumnTemplate.ID, secondColumnTemplate.ID, thirdColumnTemplate.ID, columnTemplateInsertedSecond.ID, column.ID)
	columnTemplateInsertedFourth = &column
}

func testCreateColumnTemplateOnSecondIndex(t *testing.T) {
	visible := true
	index := 1

	column, err := testDb.CreateColumnTemplate(ColumnTemplateInsert{
		BoardTemplate: boardForColumnTemplatesTest,
		Name:          "1 Column",
		Color:         types.ColorBacklogBlue,
		Visible:       &visible,
		Index:         &index,
	})
	assert.Nil(t, err)
	assert.Equal(t, index, column.Index)

	verifyColumnTemplateOrder(t, columnTemplateInsertedThird.ID, column.ID, columnTemplateInsertedFirst.ID, firstColumnTemplate.ID, secondColumnTemplate.ID, thirdColumnTemplate.ID, columnTemplateInsertedSecond.ID, columnTemplateInsertedFourth.ID)
	columnTemplateInsertedFifth = &column
}

func testCreateColumnTemplateWithEmptyName(t *testing.T) {
	index := 99
	_, err := testDb.CreateColumnTemplate(ColumnTemplateInsert{
		BoardTemplate: boardForColumnTemplatesTest,
		Name:          "",
		Color:         types.ColorBacklogBlue,
		Index:         &index,
	})
	assert.NotNil(t, err)
}

func testCreateColumnTemplateWithEmptyColor(t *testing.T) {
	_, err := testDb.CreateColumnTemplate(ColumnTemplateInsert{
		BoardTemplate: boardForColumnTemplatesTest,
		Name:          "Column",
		Color:         "",
	})
	assert.NotNil(t, err)
}

func testCreateColumnTemplateWithDescription(t *testing.T) {
	aDescription := "A column template description"
	column, err := testDb.CreateColumnTemplate(ColumnTemplateInsert{
		BoardTemplate: boardForColumnTemplatesTest,
		Name:          "Column",
		Color:         types.ColorBacklogBlue,
		Description:   aDescription,
	})
	assert.Nil(t, err)
	assert.NotNil(t, column)
	assert.Equal(t, aDescription, column.Description)

	// clean up to not crash other tests
	_ = testDb.DeleteColumnTemplate(boardForColumnTemplatesTest, column.ID, uuid.New())
}

func testDeleteColumnTemplateOnSecondIndex(t *testing.T) {
	err := testDb.DeleteColumnTemplate(boardForColumnTemplatesTest, columnTemplateInsertedFifth.ID, columnTemplateTestUser.ID)
	assert.Nil(t, err)

	verifyColumnTemplateOrder(t, columnTemplateInsertedThird.ID, columnTemplateInsertedFirst.ID, firstColumnTemplate.ID, secondColumnTemplate.ID, thirdColumnTemplate.ID, columnTemplateInsertedSecond.ID, columnTemplateInsertedFourth.ID)
}

func testDeleteColumnTemplateOnFirstIndex(t *testing.T) {
	err := testDb.DeleteColumnTemplate(boardForColumnTemplatesTest, columnTemplateInsertedThird.ID, columnTemplateTestUser.ID)
	assert.Nil(t, err)

	verifyColumnTemplateOrder(t, columnTemplateInsertedFirst.ID, firstColumnTemplate.ID, secondColumnTemplate.ID, thirdColumnTemplate.ID, columnTemplateInsertedSecond.ID, columnTemplateInsertedFourth.ID)
}

func testDeleteLastColumnTemplate(t *testing.T) {
	err := testDb.DeleteColumnTemplate(boardForColumnTemplatesTest, columnTemplateInsertedFourth.ID, columnTemplateTestUser.ID)
	assert.Nil(t, err)

	verifyColumnTemplateOrder(t, columnTemplateInsertedFirst.ID, firstColumnTemplate.ID, secondColumnTemplate.ID, thirdColumnTemplate.ID, columnTemplateInsertedSecond.ID)
}

func testDeleteOtherColumnTemplates(t *testing.T) {
	_ = testDb.DeleteColumnTemplate(boardForColumnTemplatesTest, columnTemplateInsertedFirst.ID, columnTemplateTestUser.ID)
	_ = testDb.DeleteColumnTemplate(boardForColumnTemplatesTest, columnTemplateInsertedSecond.ID, columnTemplateTestUser.ID)

	verifyColumnTemplateOrder(t, firstColumnTemplate.ID, secondColumnTemplate.ID, thirdColumnTemplate.ID)
}

func testUpdateColumnTemplateName(t *testing.T) {
	column, err := testDb.UpdateColumnTemplate(ColumnTemplateUpdate{
		ID:            firstColumnTemplate.ID,
		BoardTemplate: boardForColumnTemplatesTest,
		Name:          "Updated name",
		Color:         types.ColorBacklogBlue,
		Visible:       false,
		Index:         0,
	})
	assert.Nil(t, err)
	assert.Equal(t, "Updated name", column.Name)
}

func testUpdateColumnTemplateColor(t *testing.T) {
	column, err := testDb.UpdateColumnTemplate(ColumnTemplateUpdate{
		ID:            firstColumnTemplate.ID,
		BoardTemplate: boardForColumnTemplatesTest,
		Name:          "Updated name",
		Color:         types.ColorPlanningPink,
		Visible:       false,
		Index:         0,
	})
	assert.Nil(t, err)
	assert.Equal(t, types.ColorPlanningPink, column.Color)
}

func testUpdateColumnTemplateVisibility(t *testing.T) {
	column, err := testDb.UpdateColumnTemplate(ColumnTemplateUpdate{
		ID:            firstColumnTemplate.ID,
		BoardTemplate: boardForColumnTemplatesTest,
		Name:          "First column",
		Color:         types.ColorBacklogBlue,
		Visible:       true,
		Index:         0,
	})
	assert.Nil(t, err)
	assert.Equal(t, true, column.Visible)
}

func testMoveFirstColumnTemplateOnLastIndex(t *testing.T) {
	_, err := testDb.UpdateColumnTemplate(ColumnTemplateUpdate{
		ID:            firstColumnTemplate.ID,
		BoardTemplate: boardForColumnTemplatesTest,
		Name:          "First column",
		Color:         types.ColorBacklogBlue,
		Visible:       true,
		Index:         100,
	})
	assert.Nil(t, err)
	verifyColumnTemplateOrder(t, secondColumnTemplate.ID, thirdColumnTemplate.ID, firstColumnTemplate.ID)
}

func testMoveLastColumnTemplateOnFirstIndex(t *testing.T) {
	_, err := testDb.UpdateColumnTemplate(ColumnTemplateUpdate{
		ID:            firstColumnTemplate.ID,
		BoardTemplate: boardForColumnTemplatesTest,
		Name:          "First column",
		Color:         types.ColorBacklogBlue,
		Visible:       true,
		Index:         0,
	})
	assert.Nil(t, err)
	verifyColumnTemplateOrder(t, firstColumnTemplate.ID, secondColumnTemplate.ID, thirdColumnTemplate.ID)
}

func testMoveFirstColumnTemplateOnSecondIndex(t *testing.T) {
	_, err := testDb.UpdateColumnTemplate(ColumnTemplateUpdate{
		ID:            firstColumnTemplate.ID,
		BoardTemplate: boardForColumnTemplatesTest,
		Name:          "First column",
		Color:         types.ColorBacklogBlue,
		Visible:       true,
		Index:         1,
	})
	assert.Nil(t, err)
	verifyColumnTemplateOrder(t, secondColumnTemplate.ID, firstColumnTemplate.ID, thirdColumnTemplate.ID)
}

func testMoveSecondColumnTemplateOnFirstIndex(t *testing.T) {
	_, err := testDb.UpdateColumnTemplate(ColumnTemplateUpdate{
		ID:            firstColumnTemplate.ID,
		BoardTemplate: boardForColumnTemplatesTest,
		Name:          "First column",
		Color:         types.ColorBacklogBlue,
		Visible:       true,
		Index:         0,
	})
	assert.Nil(t, err)
	verifyColumnTemplateOrder(t, firstColumnTemplate.ID, secondColumnTemplate.ID, thirdColumnTemplate.ID)
}

func testUpdateColumnTemplateDescription(t *testing.T) {
	column, err := testDb.UpdateColumnTemplate(ColumnTemplateUpdate{
		ID:            firstColumnTemplate.ID,
		BoardTemplate: boardForColumnTemplatesTest,
		Name:          "FirstColumn",
		Description:   "Updated Column Template Description",
		Color:         types.ColorBacklogBlue,
		Visible:       true,
		Index:         0,
	})
	assert.Nil(t, err)
	assert.Equal(t, "Updated Column Template Description", column.Description)
}

func verifyColumnTemplateOrder(t *testing.T, ids ...uuid.UUID) {
	expectedOrder := ids

	columns, err := testDb.ListColumnTemplates(boardForColumnTemplatesTest)
	assert.Nil(t, err)
	assert.Equal(t, len(ids), len(columns))

	for index, value := range columns {
		assert.Equal(t, expectedOrder[index], value.ID)
		assert.Equal(t, index, value.Index)
	}
}
