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

func (o *AssignmentsObserverForTests) Reset() {
  o.board = nil
  o.deletedAssignment = nil
}

var assignmentsObserver AssignmentsObserverForTests

func TestAssignmentsObserver(t *testing.T) {
  assignmentsObserver = AssignmentsObserverForTests{t: t}
  testDb.AttachObserver(&assignmentsObserver)

}

func testAssignmentsObserverOnDelete(t *testing.T) {
  board := fixture.MustRow("Board.assignmentsTestBoard").(*Board)
  assignment := fixture.MustRow("Assignment.assignmentB").(*Assignment)

  err := testDb.DeleteAssignment(board.ID, assignment.ID)
  assert.NoError(t, err)
  assert.Equal(t, board.ID, *assignmentsObserver.board)
  assert.Equal(t, assignment.ID, *assignmentsObserver.deletedAssignment)
}

func testAssignmentsObserverOnDeleteNotExisting(t *testing.T) {
  board := fixture.MustRow("Board.assignmentsTestBoard").(*Board)
  assignment := fixture.MustRow("Assignment.assignmentB").(*Assignment)

  err := testDb.DeleteAssignment(board.ID, assignment.ID)
  assert.NoError(t, err)
  assert.Nil(t, assignmentsObserver.board)
  assert.Nil(t, assignmentsObserver.deletedAssignment)
}

