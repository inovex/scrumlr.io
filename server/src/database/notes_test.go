package database

import (
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestRunnerForNotes(t *testing.T) {
	t.Run("Get=0", testGetNote)
	t.Run("Get=1", testGetNotes)
	t.Run("Get=2", testGetFilterByColumn)
	t.Run("Get=3", testGetFilterByMultipleColumns)
	t.Run("Get=4", testGetNotesAndVerifyOrder)

	t.Run("Create=0", testCreateNote)
	t.Run("Create=1", testCreateNoteWithEmptyTextShouldFail)

	t.Run("Update=0", testUpdateOfNoteText)
	t.Run("Update=1", testOrderOnRaiseRankOfNote)
	t.Run("Update=2", testOrderOnLowerRankOfNote)
	t.Run("Update=3", testOrderOnNegativeRankOfNote)
	t.Run("Update=4", testOrderOnZeroRankOfNote)
	t.Run("Update=5", testOrderOnVeryHighRank)
	t.Run("Update=6", testOrderWhenMoveIntoStack)
	t.Run("Update=7", testOrderWhenMoveToOtherStack)
	t.Run("Update=8", testOrderOnUnstack)
	t.Run("Update=9", testOrderOnShiftToOtherColumn)
	t.Run("Update=10", testOrderOnShiftToStackWithinOtherColumn)
	t.Run("Update=11", testOrderWhenMergingStacks)

	t.Run("Delete=0", testDeleteNote)
	t.Run("Delete=1", testDeleteStackParent)
	t.Run("Delete=2", testDeleteSharedNote)
}

var notesTestBoard *Board

var columnA *Column
var columnB *Column

var noteA1 *Note
var noteA2 *Note
var noteA3 *Note
var noteA4 *Note
var noteA5 *Note
var noteA6 *Note
var noteB1 *Note
var noteB2 *Note
var noteB3 *Note
var noteC1 *Note

var author *User

func testGetNote(t *testing.T) {
	note := fixture.MustRow("Note.notesTestA1").(*Note)
	n, err := testDb.GetNote(note.ID)
	assert.Nil(t, err)
	assert.Equal(t, note.ID, n.ID)
	assert.Equal(t, note.Board, n.Board)
	assert.Equal(t, note.Column, n.Column)
	assert.Equal(t, note.Text, n.Text)
	assert.Equal(t, note.Rank, n.Rank)
	assert.Equal(t, note.Stack, n.Stack)
	assert.Equal(t, note.Author, n.Author)
}
func testGetNotes(t *testing.T) {
	notesTestBoard = fixture.MustRow("Board.notesTestBoard").(*Board)
	notes, err := testDb.GetNotes(notesTestBoard.ID)
	assert.Nil(t, err)
	assert.Equal(t, 9, len(notes))
}
func testGetFilterByColumn(t *testing.T) {
	columnA = fixture.MustRow("Column.notesColumnA").(*Column)
	notesInColumnA, err := testDb.GetNotes(notesTestBoard.ID, columnA.ID)
	assert.Nil(t, err)
	assert.Equal(t, 5, len(notesInColumnA))

	columnB = fixture.MustRow("Column.notesColumnB").(*Column)
	notesInColumnB, err := testDb.GetNotes(notesTestBoard.ID, columnB.ID)
	assert.Nil(t, err)
	assert.Equal(t, 3, len(notesInColumnB))
}
func testGetFilterByMultipleColumns(t *testing.T) {
	notes, err := testDb.GetNotes(notesTestBoard.ID, columnA.ID, columnB.ID)
	assert.Nil(t, err)
	assert.Equal(t, 8, len(notes))
}
func testGetNotesAndVerifyOrder(t *testing.T) {
	noteA1 = fixture.MustRow("Note.notesTestA1").(*Note)
	noteA2 = fixture.MustRow("Note.notesTestA2").(*Note)
	noteA3 = fixture.MustRow("Note.notesTestA3").(*Note)
	noteA4 = fixture.MustRow("Note.notesTestA4").(*Note)
	noteA5 = fixture.MustRow("Note.notesTestA5").(*Note)

	notes, _ := testDb.GetNotes(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, notes, noteA1, noteA2, noteA4, noteA5, noteA3)

	noteB1 = fixture.MustRow("Note.notesTestB1").(*Note)
	noteB2 = fixture.MustRow("Note.notesTestB2").(*Note)
	noteB3 = fixture.MustRow("Note.notesTestB3").(*Note)

	notes, _ = testDb.GetNotes(notesTestBoard.ID, columnB.ID)
	verifyNoteOrder(t, notes, noteB1, noteB2, noteB3)
}

func verifyNoteOrder(t *testing.T, notes []Note, expected ...*Note) {
	for index, note := range notes {
		assert.Equal(t, expected[index].ID, note.ID)
	}
}

func testCreateNote(t *testing.T) {
	author = fixture.MustRow("User.jack").(*User)

	note, err := testDb.CreateNote(NoteInsert{
		Author: author.ID,
		Board:  notesTestBoard.ID,
		Column: columnA.ID,
		Text:   "Some text",
	})
	assert.Nil(t, err)
	assert.Equal(t, author.ID, note.Author)
	assert.Equal(t, notesTestBoard.ID, note.Board)
	assert.Equal(t, "Some text", note.Text)
	assert.False(t, note.Stack.Valid)
	assert.Equal(t, columnA.ID, note.Column)
	assert.Equal(t, 3, note.Rank)

	noteA6 = &note
}
func testCreateNoteWithEmptyTextShouldFail(t *testing.T) {
	author = fixture.MustRow("User.jack").(*User)
	_, err := testDb.CreateNote(NoteInsert{
		Author: author.ID,
		Board:  notesTestBoard.ID,
		Column: columnA.ID,
		Text:   "",
	})
	assert.NotNil(t, err)
}

func testUpdateOfNoteText(t *testing.T) {
	newText := "I update the text and I like it"

	note, err := testDb.UpdateNote(author.ID, NoteUpdate{
		ID:    noteA6.ID,
		Board: notesTestBoard.ID,
		Text:  &newText,
	})
	assert.Nil(t, err)
	assert.Equal(t, newText, note.Text)
	assert.Equal(t, 3, note.Rank)
}
func testOrderOnRaiseRankOfNote(t *testing.T) {
	note, err := testDb.UpdateNote(author.ID, NoteUpdate{
		ID:    noteA1.ID,
		Board: notesTestBoard.ID,
		Position: &NoteUpdatePosition{
			Column: noteA1.Column,
			Stack:  uuid.NullUUID{Valid: false},
			Rank:   3,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 3, note.Rank)

	notes, _ := testDb.GetNotes(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, notes, noteA1, noteA6, noteA2, noteA4, noteA5, noteA3)
}
func testOrderOnLowerRankOfNote(t *testing.T) {
	note, err := testDb.UpdateNote(author.ID, NoteUpdate{
		ID:    noteA1.ID,
		Board: notesTestBoard.ID,
		Position: &NoteUpdatePosition{
			Column: noteA1.Column,
			Stack:  uuid.NullUUID{Valid: false},
			Rank:   2,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 2, note.Rank)

	notes, _ := testDb.GetNotes(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, notes, noteA6, noteA1, noteA2, noteA4, noteA5, noteA3)
}
func testOrderOnNegativeRankOfNote(t *testing.T) {
	note, err := testDb.UpdateNote(author.ID, NoteUpdate{
		ID:    noteA6.ID,
		Board: notesTestBoard.ID,
		Position: &NoteUpdatePosition{
			Column: noteA6.Column,
			Stack:  uuid.NullUUID{Valid: false},
			Rank:   -100,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 0, note.Rank)

	notes, _ := testDb.GetNotes(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, notes, noteA1, noteA2, noteA4, noteA6, noteA5, noteA3)
}
func testOrderOnZeroRankOfNote(t *testing.T) {
	note, err := testDb.UpdateNote(author.ID, NoteUpdate{
		ID:    noteA1.ID,
		Board: notesTestBoard.ID,
		Position: &NoteUpdatePosition{
			Column: noteA1.Column,
			Stack:  uuid.NullUUID{Valid: false},
			Rank:   0,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 0, note.Rank)

	notes, _ := testDb.GetNotes(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, notes, noteA2, noteA4, noteA6, noteA1, noteA5, noteA3)
}
func testOrderOnVeryHighRank(t *testing.T) {
	note, err := testDb.UpdateNote(author.ID, NoteUpdate{
		ID:    noteA1.ID,
		Board: notesTestBoard.ID,
		Position: &NoteUpdatePosition{
			Column: noteA1.Column,
			Stack:  uuid.NullUUID{Valid: false},
			Rank:   1000000,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 3, note.Rank)

	notes, _ := testDb.GetNotes(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, notes, noteA1, noteA2, noteA4, noteA6, noteA5, noteA3)
}
func testOrderWhenMoveIntoStack(t *testing.T) {
	note, err := testDb.UpdateNote(author.ID, NoteUpdate{
		ID:    noteA6.ID,
		Board: notesTestBoard.ID,
		Position: &NoteUpdatePosition{
			Column: noteA6.Column,
			Stack:  uuid.NullUUID{UUID: noteA2.ID, Valid: true},
			Rank:   1000000,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 1, note.Rank)

	notes, _ := testDb.GetNotes(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, notes, noteA1, noteA2, noteA4, noteA5, noteA6, noteA3)
}
func testOrderWhenMoveToOtherStack(t *testing.T) {
	note, err := testDb.UpdateNote(author.ID, NoteUpdate{
		ID:    noteA6.ID,
		Board: notesTestBoard.ID,
		Position: &NoteUpdatePosition{
			Column: noteA6.Column,
			Stack:  uuid.NullUUID{UUID: noteA4.ID, Valid: true},
			Rank:   1000000,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 1, note.Rank)

	notes, _ := testDb.GetNotes(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, notes, noteA1, noteA2, noteA4, noteA6, noteA5, noteA3)
}
func testOrderOnUnstack(t *testing.T) {
	note, err := testDb.UpdateNote(author.ID, NoteUpdate{
		ID:    noteA6.ID,
		Board: notesTestBoard.ID,
		Position: &NoteUpdatePosition{
			Column: noteA6.Column,
			Stack:  uuid.NullUUID{Valid: false},
			Rank:   1000000,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 3, note.Rank)

	notes, _ := testDb.GetNotes(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, notes, noteA6, noteA1, noteA2, noteA4, noteA5, noteA3)
}
func testOrderOnShiftToOtherColumn(t *testing.T) {
	note, err := testDb.UpdateNote(author.ID, NoteUpdate{
		ID:    noteA6.ID,
		Board: notesTestBoard.ID,
		Position: &NoteUpdatePosition{
			Column: columnB.ID,
			Stack:  uuid.NullUUID{Valid: false},
			Rank:   1000000,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 2, note.Rank)

	notes, _ := testDb.GetNotes(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, notes, noteA1, noteA2, noteA4, noteA5, noteA3)

	notes, _ = testDb.GetNotes(notesTestBoard.ID, columnB.ID)
	verifyNoteOrder(t, notes, noteA6, noteB1, noteB2, noteB3)
}
func testOrderOnShiftToStackWithinOtherColumn(t *testing.T) {
	note, err := testDb.UpdateNote(author.ID, NoteUpdate{
		ID:    noteA6.ID,
		Board: notesTestBoard.ID,
		Position: &NoteUpdatePosition{
			Column: noteA6.Column,
			Stack:  uuid.NullUUID{UUID: noteA2.ID, Valid: true},
			Rank:   1000000,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 1, note.Rank)

	notes, _ := testDb.GetNotes(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, notes, noteA1, noteA2, noteA4, noteA5, noteA6, noteA3)
}
func testOrderWhenMergingStacks(t *testing.T) {
	note, err := testDb.UpdateNote(author.ID, NoteUpdate{
		ID:    noteA2.ID,
		Board: notesTestBoard.ID,
		Position: &NoteUpdatePosition{
			Column: noteA2.Column,
			Stack:  uuid.NullUUID{UUID: noteA4.ID, Valid: true},
			Rank:   1000000,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 3, note.Rank)

	notes, _ := testDb.GetNotes(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, notes, noteA1, noteA4, noteA2, noteA6, noteA3, noteA5)
}

func testDeleteNote(t *testing.T) {
	err := testDb.DeleteNote(author.ID, notesTestBoard.ID, noteB1.ID)
	assert.Nil(t, err)

	notes, _ := testDb.GetNotes(notesTestBoard.ID, columnB.ID)
	verifyNoteOrder(t, notes, noteB2, noteB3)
}
func testDeleteStackParent(t *testing.T) {
	err := testDb.DeleteNote(author.ID, notesTestBoard.ID, noteB2.ID)
	assert.Nil(t, err)

	notes, _ := testDb.GetNotes(notesTestBoard.ID, columnB.ID)
	assert.Equal(t, 0, len(notes))
}
func testDeleteSharedNote(t *testing.T) {
	noteC1 = fixture.MustRow("Note.notesTestC1").(*Note)

	_, updateBoardError := testDb.UpdateBoard(BoardUpdate{
		ID:         notesTestBoard.ID,
		SharedNote: uuid.NullUUID{UUID: noteC1.ID, Valid: true},
		ShowVoting: uuid.NullUUID{Valid: false},
	})
	assert.Nil(t, updateBoardError)

	board, getBoardError := testDb.GetBoard(notesTestBoard.ID)
	assert.Nil(t, getBoardError)
	assert.Equal(t, board.SharedNote, uuid.NullUUID{UUID: noteC1.ID, Valid: true})

	deleteNoteError := testDb.DeleteNote(author.ID, notesTestBoard.ID, noteC1.ID)
	assert.Nil(t, deleteNoteError)

	updatedBoard, getUpdatedBoardError := testDb.GetBoard(notesTestBoard.ID)
	assert.Nil(t, getUpdatedBoardError)
	assert.Equal(t, uuid.NullUUID{Valid: false}, updatedBoard.SharedNote)
}
