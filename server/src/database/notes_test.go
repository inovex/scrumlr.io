package database

import (
	"scrumlr.io/server/sessions"
	"testing"

	"scrumlr.io/server/boards"

	"scrumlr.io/server/columns"
	"scrumlr.io/server/notes"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
)

func TestRunnerForNotes(t *testing.T) {
	t.Run("Get=0", testGetNote)
	t.Run("Get=1", testGetNotes)
	t.Run("Get=2", testGetFilterByColumn)
	t.Run("Get=3", testGetFilterByMultipleColumns)
	t.Run("Get=4", testGetNotesAndVerifyOrder)
	t.Run("Get=5", testGetStack)

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

	t.Run("Update=12", testChangeOrderWhenMoveWithinStackToLower)
	t.Run("Update=13", testChangeOrderWhenMoveWithinStackToHigher)
	t.Run("Update=14", testChangeOrderWhenMoveWithinStackToNegative)
	t.Run("Update=15", testChangeOrderWhenMoveWithinStackToLargeRank)
	t.Run("Update=16", testOrderWhenChangeStackParent)

	t.Run("Delete=0", testDeleteNote)
	t.Run("Delete=1", testDeleteSharedNote)
	t.Run("Delete=2", testDeleteStackParent)
	t.Run("Delete=3", testDeleteStack)
}

var notesTestBoard *boards.DatabaseBoard

var columnA *columns.DatabaseColumn
var columnB *columns.DatabaseColumn

var noteA1 *notes.DatabaseNote
var noteA2 *notes.DatabaseNote
var noteA3 *notes.DatabaseNote
var noteA4 *notes.DatabaseNote
var noteA5 *notes.DatabaseNote
var noteA6 *notes.DatabaseNote
var noteB1 *notes.DatabaseNote
var noteB2 *notes.DatabaseNote
var noteB3 *notes.DatabaseNote
var noteC1 *notes.DatabaseNote

var stackTestBoard *boards.DatabaseBoard
var stackTestColumnA *columns.DatabaseColumn
var stackTestColumnB *columns.DatabaseColumn
var stackA *notes.DatabaseNote
var stackB *notes.DatabaseNote
var stackC *notes.DatabaseNote
var stackD *notes.DatabaseNote
var stackE *notes.DatabaseNote
var stackF *notes.DatabaseNote
var stackG *notes.DatabaseNote
var stackH *notes.DatabaseNote

var stackUser *sessions.DatabaseUser

var author *sessions.DatabaseUser

var deleteStack bool

func testGetNote(t *testing.T) {
	note := fixture.MustRow("DatabaseNote.notesTestA1").(*notes.DatabaseNote)
	n, err := notesDb.Get(note.ID)
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
	notesTestBoard = fixture.MustRow("DatabaseBoard.notesTestBoard").(*boards.DatabaseBoard)
	listOfNotes, err := notesDb.GetAll(notesTestBoard.ID)
	assert.Nil(t, err)
	assert.Equal(t, 9, len(listOfNotes))
}

func testGetFilterByColumn(t *testing.T) {
	columnA = fixture.MustRow("DatabaseColumn.notesColumnA").(*columns.DatabaseColumn)
	assert.NotNil(t, columnA)
	notesInColumnA, err := notesDb.GetAll(notesTestBoard.ID, columnA.ID)
	assert.Nil(t, err)
	assert.Equal(t, 5, len(notesInColumnA))

	columnB = fixture.MustRow("DatabaseColumn.notesColumnB").(*columns.DatabaseColumn)
	notesInColumnB, err := notesDb.GetAll(notesTestBoard.ID, columnB.ID)
	assert.Nil(t, err)
	assert.Equal(t, 3, len(notesInColumnB))
}

func testGetFilterByMultipleColumns(t *testing.T) {
	listOfNotes, err := notesDb.GetAll(notesTestBoard.ID, columnA.ID, columnB.ID)
	assert.Nil(t, err)
	assert.Equal(t, 8, len(listOfNotes))
}

func testGetNotesAndVerifyOrder(t *testing.T) {
	noteA1 = fixture.MustRow("DatabaseNote.notesTestA1").(*notes.DatabaseNote)
	noteA2 = fixture.MustRow("DatabaseNote.notesTestA2").(*notes.DatabaseNote)
	noteA3 = fixture.MustRow("DatabaseNote.notesTestA3").(*notes.DatabaseNote)
	noteA4 = fixture.MustRow("DatabaseNote.notesTestA4").(*notes.DatabaseNote)
	noteA5 = fixture.MustRow("DatabaseNote.notesTestA5").(*notes.DatabaseNote)

	notesOnBoard, _ := notesDb.GetAll(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, notesOnBoard, noteA1, noteA2, noteA4, noteA5, noteA3)

	noteB1 = fixture.MustRow("DatabaseNote.notesTestB1").(*notes.DatabaseNote)
	noteB2 = fixture.MustRow("DatabaseNote.notesTestB2").(*notes.DatabaseNote)
	noteB3 = fixture.MustRow("DatabaseNote.notesTestB3").(*notes.DatabaseNote)

	notesOnBoard, _ = notesDb.GetAll(notesTestBoard.ID, columnB.ID)
	verifyNoteOrder(t, notesOnBoard, noteB1, noteB2, noteB3)
}

func testGetStack(t *testing.T) {
	noteA2 = fixture.MustRow("DatabaseNote.notesTestA2").(*notes.DatabaseNote)
	noteA3 = fixture.MustRow("DatabaseNote.notesTestA3").(*notes.DatabaseNote)

	noteStack, err := notesDb.GetStack(noteA2.ID)

	assert.Nil(t, err)
	verifyNoteOrder(t, noteStack, noteA2, noteA3)
}

func verifyNoteOrder(t *testing.T, notes []notes.DatabaseNote, expected ...*notes.DatabaseNote) {
	for index, note := range notes {
		assert.Equal(t, expected[index].ID, note.ID)
	}
}

func testCreateNote(t *testing.T) {
	author = fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)

	note, err := notesDb.CreateNote(notes.DatabaseNoteInsert{
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
	author = fixture.MustRow("DatabaseUser.jack").(*sessions.DatabaseUser)
	_, err := notesDb.CreateNote(notes.DatabaseNoteInsert{
		Author: author.ID,
		Board:  notesTestBoard.ID,
		Column: columnA.ID,
		Text:   "",
	})
	assert.NotNil(t, err)
}

func testUpdateOfNoteText(t *testing.T) {
	newText := "I update the text and I like it"

	note, err := notesDb.UpdateNote(author.ID, notes.DatabaseNoteUpdate{
		ID:    noteA6.ID,
		Board: notesTestBoard.ID,
		Text:  &newText,
	})
	assert.Nil(t, err)
	assert.Equal(t, newText, note.Text)
	assert.Equal(t, 3, note.Rank)
}

func testOrderOnRaiseRankOfNote(t *testing.T) {
	note, err := notesDb.UpdateNote(author.ID, notes.DatabaseNoteUpdate{
		ID:    noteA1.ID,
		Board: notesTestBoard.ID,
		Position: &notes.NoteUpdatePosition{
			Column: noteA1.Column,
			Stack:  uuid.NullUUID{Valid: false},
			Rank:   3,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 3, note.Rank)

	listOfNotes, _ := notesDb.GetAll(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, listOfNotes, noteA1, noteA6, noteA2, noteA4, noteA5, noteA3)
}

func testOrderOnLowerRankOfNote(t *testing.T) {
	note, err := notesDb.UpdateNote(author.ID, notes.DatabaseNoteUpdate{
		ID:    noteA1.ID,
		Board: notesTestBoard.ID,
		Position: &notes.NoteUpdatePosition{
			Column: noteA1.Column,
			Stack:  uuid.NullUUID{Valid: false},
			Rank:   2,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 2, note.Rank)

	listOfNotes, _ := notesDb.GetAll(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, listOfNotes, noteA6, noteA1, noteA2, noteA4, noteA5, noteA3)
}

func testOrderOnNegativeRankOfNote(t *testing.T) {
	note, err := notesDb.UpdateNote(author.ID, notes.DatabaseNoteUpdate{
		ID:    noteA6.ID,
		Board: notesTestBoard.ID,
		Position: &notes.NoteUpdatePosition{
			Column: noteA6.Column,
			Stack:  uuid.NullUUID{Valid: false},
			Rank:   -100,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 0, note.Rank)

	listOfNotes, _ := notesDb.GetAll(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, listOfNotes, noteA1, noteA2, noteA4, noteA6, noteA5, noteA3)
}

func testOrderOnZeroRankOfNote(t *testing.T) {
	note, err := notesDb.UpdateNote(author.ID, notes.DatabaseNoteUpdate{
		ID:    noteA1.ID,
		Board: notesTestBoard.ID,
		Position: &notes.NoteUpdatePosition{
			Column: noteA1.Column,
			Stack:  uuid.NullUUID{Valid: false},
			Rank:   0,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 0, note.Rank)

	listOfNotes, _ := notesDb.GetAll(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, listOfNotes, noteA2, noteA4, noteA6, noteA1, noteA5, noteA3)
}

func testOrderOnVeryHighRank(t *testing.T) {
	note, err := notesDb.UpdateNote(author.ID, notes.DatabaseNoteUpdate{
		ID:    noteA1.ID,
		Board: notesTestBoard.ID,
		Position: &notes.NoteUpdatePosition{
			Column: noteA1.Column,
			Stack:  uuid.NullUUID{Valid: false},
			Rank:   1000000,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 3, note.Rank)

	listOfNotes, _ := notesDb.GetAll(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, listOfNotes, noteA1, noteA2, noteA4, noteA6, noteA5, noteA3)
}

func testOrderWhenMoveIntoStack(t *testing.T) {
	note, err := notesDb.UpdateNote(author.ID, notes.DatabaseNoteUpdate{
		ID:    noteA6.ID,
		Board: notesTestBoard.ID,
		Position: &notes.NoteUpdatePosition{
			Column: noteA6.Column,
			Stack:  uuid.NullUUID{UUID: noteA2.ID, Valid: true},
			Rank:   1000000,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 1, note.Rank)

	listOfNotes, _ := notesDb.GetAll(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, listOfNotes, noteA1, noteA2, noteA4, noteA5, noteA6, noteA3)
}

func testOrderWhenMoveToOtherStack(t *testing.T) {
	note, err := notesDb.UpdateNote(author.ID, notes.DatabaseNoteUpdate{
		ID:    noteA6.ID,
		Board: notesTestBoard.ID,
		Position: &notes.NoteUpdatePosition{
			Column: noteA6.Column,
			Stack:  uuid.NullUUID{UUID: noteA4.ID, Valid: true},
			Rank:   1000000,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 1, note.Rank)

	listOfNotes, _ := notesDb.GetAll(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, listOfNotes, noteA1, noteA2, noteA4, noteA6, noteA5, noteA3)
}

func testOrderOnUnstack(t *testing.T) {
	note, err := notesDb.UpdateNote(author.ID, notes.DatabaseNoteUpdate{
		ID:    noteA6.ID,
		Board: notesTestBoard.ID,
		Position: &notes.NoteUpdatePosition{
			Column: noteA6.Column,
			Stack:  uuid.NullUUID{Valid: false},
			Rank:   1000000,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 3, note.Rank)

	listOfNotes, _ := notesDb.GetAll(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, listOfNotes, noteA6, noteA1, noteA2, noteA4, noteA5, noteA3)
}

func testOrderOnShiftToOtherColumn(t *testing.T) {
	note, err := notesDb.UpdateNote(author.ID, notes.DatabaseNoteUpdate{
		ID:    noteA6.ID,
		Board: notesTestBoard.ID,
		Position: &notes.NoteUpdatePosition{
			Column: columnB.ID,
			Stack:  uuid.NullUUID{Valid: false},
			Rank:   1000000,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 2, note.Rank)

	listOfNotes, _ := notesDb.GetAll(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, listOfNotes, noteA1, noteA2, noteA4, noteA5, noteA3)

	listOfNotes, _ = notesDb.GetAll(notesTestBoard.ID, columnB.ID)
	verifyNoteOrder(t, listOfNotes, noteA6, noteB1, noteB2, noteB3)
}

func testOrderOnShiftToStackWithinOtherColumn(t *testing.T) {
	note, err := notesDb.UpdateNote(author.ID, notes.DatabaseNoteUpdate{
		ID:    noteA6.ID,
		Board: notesTestBoard.ID,
		Position: &notes.NoteUpdatePosition{
			Column: noteA6.Column,
			Stack:  uuid.NullUUID{UUID: noteA2.ID, Valid: true},
			Rank:   1000000,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 1, note.Rank)

	listOfNotes, _ := notesDb.GetAll(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, listOfNotes, noteA1, noteA2, noteA4, noteA5, noteA6, noteA3)
}

func testOrderWhenMergingStacks(t *testing.T) {
	note, err := notesDb.UpdateNote(author.ID, notes.DatabaseNoteUpdate{
		ID:    noteA2.ID,
		Board: notesTestBoard.ID,
		Position: &notes.NoteUpdatePosition{
			Column: noteA2.Column,
			Stack:  uuid.NullUUID{UUID: noteA4.ID, Valid: true},
			Rank:   1000000,
		},
	})
	assert.Nil(t, err)
	assert.Equal(t, 3, note.Rank)

	mergedNotes, _ := notesDb.GetAll(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, mergedNotes, noteA1, noteA4, noteA2, noteA6, noteA3, noteA5)
}

func testChangeOrderWhenMoveWithinStackToLower(t *testing.T) {
	stackTestBoard = fixture.MustRow("DatabaseBoard.stackTestBoard").(*boards.DatabaseBoard)
	stackTestColumnA = fixture.MustRow("DatabaseColumn.stackTestColumnA").(*columns.DatabaseColumn)
	stackA = fixture.MustRow("DatabaseNote.stackTestNote1").(*notes.DatabaseNote)
	stackB = fixture.MustRow("DatabaseNote.stackTestNote2").(*notes.DatabaseNote)
	stackC = fixture.MustRow("DatabaseNote.stackTestNote3").(*notes.DatabaseNote)
	stackD = fixture.MustRow("DatabaseNote.stackTestNote4").(*notes.DatabaseNote)
	stackUser = fixture.MustRow("DatabaseUser.justin").(*sessions.DatabaseUser)

	/*
	   A: Rank 1337, Stack null
	   B: Rank 0, Stack A
	   C: Rank 1, Stack A
	   D: Rank 2, Stack A
	*/

	notesOnBoard, _ := notesDb.GetAll(stackTestBoard.ID, stackTestColumnA.ID)
	verifyNoteOrder(t, notesOnBoard, stackA, stackD, stackC, stackB)

	note, err := notesDb.UpdateNote(stackUser.ID, notes.DatabaseNoteUpdate{
		ID:    stackD.ID,
		Board: stackTestBoard.ID,
		Position: &notes.NoteUpdatePosition{
			Column: stackD.Column,
			Stack:  uuid.NullUUID{UUID: stackA.ID, Valid: true},
			Rank:   0,
		},
	})

	assert.Nil(t, err)
	assert.Equal(t, 0, note.Rank)

	notesOnBoard, _ = notesDb.GetAll(stackTestBoard.ID, stackTestColumnA.ID)
	verifyNoteOrder(t, notesOnBoard, stackA, stackC, stackB, stackD)
}

func testChangeOrderWhenMoveWithinStackToHigher(t *testing.T) {
	note, err := notesDb.UpdateNote(stackUser.ID, notes.DatabaseNoteUpdate{
		ID:    stackD.ID,
		Board: stackTestBoard.ID,
		Position: &notes.NoteUpdatePosition{
			Column: stackA.Column,
			Stack:  uuid.NullUUID{UUID: stackA.ID, Valid: true},
			Rank:   2,
		},
	})

	assert.Nil(t, err)
	assert.Equal(t, 2, note.Rank)

	listOfNotes, _ := notesDb.GetAll(stackTestBoard.ID, stackTestColumnA.ID)
	verifyNoteOrder(t, listOfNotes, stackA, stackD, stackC, stackB)
}

func testChangeOrderWhenMoveWithinStackToNegative(t *testing.T) {
	note, err := notesDb.UpdateNote(stackUser.ID, notes.DatabaseNoteUpdate{
		ID:    stackD.ID,
		Board: stackTestBoard.ID,
		Position: &notes.NoteUpdatePosition{
			Column: stackA.Column,
			Stack:  uuid.NullUUID{UUID: stackA.ID, Valid: true},
			Rank:   -100,
		},
	})

	assert.Nil(t, err)
	assert.Equal(t, 0, note.Rank)

	listOfNotes, _ := notesDb.GetAll(stackTestBoard.ID, stackTestColumnA.ID)
	verifyNoteOrder(t, listOfNotes, stackA, stackC, stackB, stackD)
}

func testChangeOrderWhenMoveWithinStackToLargeRank(t *testing.T) {
	note, err := notesDb.UpdateNote(stackUser.ID, notes.DatabaseNoteUpdate{
		ID:    stackD.ID,
		Board: stackTestBoard.ID,
		Position: &notes.NoteUpdatePosition{
			Column: stackA.Column,
			Stack:  uuid.NullUUID{UUID: stackA.ID, Valid: true},
			Rank:   9999,
		},
	})

	assert.Nil(t, err)
	assert.Equal(t, 2, note.Rank)

	listOfNotes, _ := notesDb.GetAll(stackTestBoard.ID, stackTestColumnA.ID)
	verifyNoteOrder(t, listOfNotes, stackA, stackD, stackC, stackB)
}

func testOrderWhenChangeStackParent(t *testing.T) {
	note, err := notesDb.UpdateNote(stackUser.ID, notes.DatabaseNoteUpdate{
		ID:    stackA.ID,
		Board: stackTestBoard.ID,
		Position: &notes.NoteUpdatePosition{
			Column: stackD.Column,
			Stack:  uuid.NullUUID{UUID: stackD.ID, Valid: true},
			Rank:   9999,
		},
	})

	assert.Nil(t, err)
	assert.Equal(t, 2, note.Rank)

	listOfNotes, _ := notesDb.GetAll(stackTestBoard.ID, stackTestColumnA.ID)
	verifyNoteOrder(t, listOfNotes, stackD, stackA, stackC, stackB)
}

func testDeleteNote(t *testing.T) {
	err := notesDb.DeleteNote(author.ID, notesTestBoard.ID, noteB1.ID, deleteStack)
	assert.Nil(t, err)

	listOfNotes, _ := notesDb.GetAll(notesTestBoard.ID, columnB.ID)
	verifyNoteOrder(t, listOfNotes, noteB2, noteB3)
}

func testDeleteSharedNote(t *testing.T) {
	noteC1 = fixture.MustRow("DatabaseNote.notesTestC1").(*notes.DatabaseNote)

	_, updateBoardError := boardDb.UpdateBoard(boards.DatabaseBoardUpdate{
		ID:         notesTestBoard.ID,
		SharedNote: uuid.NullUUID{UUID: noteC1.ID, Valid: true},
		ShowVoting: uuid.NullUUID{Valid: false},
	})
	assert.Nil(t, updateBoardError)

	board, getBoardError := boardDb.GetBoard(notesTestBoard.ID)
	assert.Nil(t, getBoardError)
	assert.Equal(t, board.SharedNote, uuid.NullUUID{UUID: noteC1.ID, Valid: true})

	deleteNoteError := notesDb.DeleteNote(author.ID, notesTestBoard.ID, noteC1.ID, deleteStack)
	assert.Nil(t, deleteNoteError)

	updatedBoard, getUpdatedBoardError := boardDb.GetBoard(notesTestBoard.ID)
	assert.Nil(t, getUpdatedBoardError)
	assert.Equal(t, uuid.NullUUID{Valid: false}, updatedBoard.SharedNote)
}

func testDeleteStackParent(t *testing.T) {
	stackTestBoard = fixture.MustRow("DatabaseBoard.stackTestBoard").(*boards.DatabaseBoard)
	stackTestColumnB = fixture.MustRow("DatabaseColumn.stackTestColumnB").(*columns.DatabaseColumn)
	stackE = fixture.MustRow("DatabaseNote.stackTestNote5").(*notes.DatabaseNote)
	stackF = fixture.MustRow("DatabaseNote.stackTestNote6").(*notes.DatabaseNote)
	stackG = fixture.MustRow("DatabaseNote.stackTestNote7").(*notes.DatabaseNote)
	stackH = fixture.MustRow("DatabaseNote.stackTestNote8").(*notes.DatabaseNote)
	stackUser = fixture.MustRow("DatabaseUser.justin").(*sessions.DatabaseUser)
	deleteStack = false

	/*
	   E: Rank 1338, Stack null
	   F: Rank 0, Stack E
	   G: Rank 1, Stack E
	   H: Rank 2, Stack E
	*/

	err := notesDb.DeleteNote(stackUser.ID, stackTestBoard.ID, stackE.ID, deleteStack)
	assert.Nil(t, err)

	stackNotes, _ := notesDb.GetAll(stackTestBoard.ID, stackTestColumnB.ID)

	var newParent notes.DatabaseNote
	for _, note := range stackNotes {
		if note.Text == "H" {
			newParent = note
			break
		}
	}

	// length should have shrinked from 4 to 3
	assert.Equal(t, 3, len(stackNotes))
	// order should stay consistent
	verifyNoteOrder(t, stackNotes, stackH, stackG, stackF)
	// newParent stack should be null (uuid.Nil in GO)
	assert.Equal(t, uuid.Nil, newParent.Stack.UUID)
	// children should have id of stackH(newParent) as their stack
	for _, note := range stackNotes {
		switch note.Text {
		case "F":
			assert.Equal(t, newParent.ID, note.Stack.UUID)
		case "G":
			assert.Equal(t, newParent.ID, note.Stack.UUID)
		}
	}
}

func testDeleteStack(t *testing.T) {
	stackTestBoard = fixture.MustRow("DatabaseBoard.stackTestBoard").(*boards.DatabaseBoard)
	stackTestColumnB = fixture.MustRow("DatabaseColumn.stackTestColumnB").(*columns.DatabaseColumn)
	stackH = fixture.MustRow("DatabaseNote.stackTestNote8").(*notes.DatabaseNote)
	stackUser = fixture.MustRow("DatabaseUser.justin").(*sessions.DatabaseUser)

	notesInStack, _ := notesDb.GetAll(stackTestBoard.ID, stackTestColumnB.ID)
	assert.Equal(t, 3, len(notesInStack))

	deleteStack = true
	err := notesDb.DeleteNote(stackUser.ID, stackTestBoard.ID, stackH.ID, deleteStack)
	assert.Nil(t, err)

	notesInStack, _ = notesDb.GetAll(stackTestBoard.ID, stackTestColumnB.ID)
	assert.Equal(t, 0, len(notesInStack))
}
