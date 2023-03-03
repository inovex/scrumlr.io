package database

import (
	"testing"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

type AssignmentsObserverForTests struct {
  t *testing.T
  board *uuid.UUID
  deletedAssignment *uuid.UUID
}

func (o *AssignmentsObserverForTests) DeletedAssignment(board uuid.UUID, assignment uuid.UUID) {
  o.board = &board
  o.deletedAssignment = &assignment
}

var assignmentsObserver AssignmentsObserverForTests

func TestAssignmentsObserver(t *testing.T) {
  assignmentsObserver = AssignmentsObserverForTests{t: t}
  testDb.AttachObserver(&assignmentsObserver)

  t.Run("Test=1", testAssignmentsObserverOnDelete)

	_, _ = testDb.DetachObserver(assignmentsObserver)
}

func testAssignmentsObserverOnDelete(t *testing.T) {
  board := fixture.MustRow("Board.assignmentsTestBoard").(*Board)
  assignment := fixture.MustRow("Assignment.assignmentC").(*Assignment)

  err := testDb.DeleteAssignment(board.ID, assignment.ID)
  assert.NoError(t, err)
  assert.Equal(t, board.ID, *assignmentsObserver.board)
  assert.Equal(t, assignment.ID, *assignmentsObserver.deletedAssignment)
}

