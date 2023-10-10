package database

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRunnerForAssignments(t *testing.T) {
	t.Run("Get=0", testGetAssignments)
	t.Run("Delete=0", testDeleteAssignment)
	t.Run("Create=0", testCreateAssignment)
}

func testGetAssignments(t *testing.T) {
	board := fixture.MustRow("Board.assignmentsTestBoard").(*Board)

	assignments, err := testDb.GetAssignments(board.ID)

	assert.Nil(t, err)
	assert.Equal(t, 3, len(assignments))
}

func testDeleteAssignment(t *testing.T) {
	board := fixture.MustRow("Board.assignmentsTestBoard").(*Board)
	assignment := fixture.MustRow("Assignment.assignmentA").(*Assignment)

	err := testDb.DeleteAssignment(board.ID, assignment.ID)
	assignments, _ := testDb.GetAssignments(board.ID)

	assert.Nil(t, err)
	assert.Equal(t, 2, len(assignments))
}

func testCreateAssignment(t *testing.T) {
	board := fixture.MustRow("Board.assignmentsTestBoard").(*Board)
	note := fixture.MustRow("Note.assignmentsTestNote").(*Note)

	assignment, err := testDb.CreateAssignment(AssignmentInsert{
		Board: board.ID,
		Note:  note.ID,
		Name:  "Test Assignment Name",
	})

	assert.Nil(t, err)
	assert.NotNil(t, assignment.ID)
	assert.Equal(t, assignment.Board, board.ID)
	assert.Equal(t, assignment.Note, note.ID)
	assert.Equal(t, assignment.Name, "Test Assignment Name")
}
