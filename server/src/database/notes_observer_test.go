package database

import (
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

type NotesObserverForTests struct {
	t           *testing.T
	board       *uuid.UUID
	notes       *[]Note
	deletedNote *uuid.UUID
}

func (o *NotesObserverForTests) UpdatedNotes(board uuid.UUID, notes []Note) {
	o.board = &board
	o.notes = &notes
}

func (o *NotesObserverForTests) DeletedNote(user, board, note uuid.UUID, votes []Vote) {
	o.board = &board
	o.deletedNote = &note
}

func (o *NotesObserverForTests) Reset() {
	o.board = nil
	o.notes = nil
	o.deletedNote = nil
}

var notesObserver NotesObserverForTests
var notesObserverForTestNote Note

func TestNotesObserver(t *testing.T) {
	notesObserver = NotesObserverForTests{t: t}
	testDb.AttachObserver(&notesObserver)

	t.Run("Test=1", testNotesObserverOnCreate)
	notesObserver.Reset()
	t.Run("Test=2", testNotesObserverOnUpdate)
	notesObserver.Reset()
	t.Run("Test=3", testNotesObserverOnDelete)
	notesObserver.Reset()
	t.Run("Test=4", testNotesObserverOnDeleteNotExisting)

	_, _ = testDb.DetachObserver(notesObserver)
}

func testNotesObserverOnCreate(t *testing.T) {
	board := fixture.MustRow("Board.notesObserverTestBoard").(*Board)
	column := fixture.MustRow("Column.notesObserverTestColumn").(*Column)
	user := fixture.MustRow("User.jack").(*User)

	note, err := testDb.CreateNote(NoteInsert{
		Author: user.ID,
		Board:  board.ID,
		Column: column.ID,
		Text:   "I just wanna test this",
	})

	assert.Nil(t, err)
	assert.NotNil(t, notesObserver.board)
	assert.NotNil(t, notesObserver.notes)

	assert.Equal(t, 1, len(*notesObserver.notes))
	assert.Equal(t, note.Board, (*notesObserver.notes)[0].Board)
	assert.Equal(t, note.Column, (*notesObserver.notes)[0].Column)

	notesObserverForTestNote = note
}
func testNotesObserverOnUpdate(t *testing.T) {
	textUpdate := "I updated that thing"
	user := fixture.MustRow("User.jack").(*User)

	note, err := testDb.UpdateNote(user.ID, NoteUpdate{
		ID:    notesObserverForTestNote.ID,
		Board: notesObserverForTestNote.Board,
		Text:  &textUpdate,
	})

	assert.Nil(t, err)
	assert.NotNil(t, notesObserver.board)
	assert.NotNil(t, notesObserver.notes)

	assert.Equal(t, 1, len(*notesObserver.notes))
	assert.Equal(t, note.Board, (*notesObserver.notes)[0].Board)
	assert.Equal(t, note.Column, (*notesObserver.notes)[0].Column)
}
func testNotesObserverOnDelete(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)
	deleteStack = false
	err := testDb.DeleteNote(user.ID, notesObserverForTestNote.Board, deleteStack, notesObserverForTestNote.ID)
	assert.Nil(t, err)
	assert.NotNil(t, notesObserver.board)
	assert.NotNil(t, notesObserver.deletedNote)
}
func testNotesObserverOnDeleteNotExisting(t *testing.T) {
	user := fixture.MustRow("User.jack").(*User)
	deleteStack = false
	err := testDb.DeleteNote(user.ID, notesObserverForTestNote.Board, deleteStack, notesObserverForTestNote.ID)
	assert.Nil(t, err)
	assert.Nil(t, notesObserver.board)
	assert.Nil(t, notesObserver.deletedNote)
}
