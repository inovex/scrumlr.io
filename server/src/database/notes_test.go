package database

import (
	"testing"

	"scrumlr.io/server/columns"
	"scrumlr.io/server/notes"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/users"
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

var notesTestBoard *Board

var columnA *columns.DatabaseColumn
var columnB *columns.DatabaseColumn

var noteA1 *notes.NoteDB
var noteA2 *notes.NoteDB
var noteA3 *notes.NoteDB
var noteA4 *notes.NoteDB
var noteA5 *notes.NoteDB
var noteA6 *notes.NoteDB
var noteB1 *notes.NoteDB
var noteB2 *notes.NoteDB
var noteB3 *notes.NoteDB
var noteC1 *notes.NoteDB

var stackTestBoard *Board
var stackTestColumnA *columns.DatabaseColumn
var stackTestColumnB *columns.DatabaseColumn
var stackA *notes.NoteDB
var stackB *notes.NoteDB
var stackC *notes.NoteDB
var stackD *notes.NoteDB
var stackE *notes.NoteDB
var stackF *notes.NoteDB
var stackG *notes.NoteDB
var stackH *notes.NoteDB

var stackUser *users.DatabaseUser

var author *users.DatabaseUser

var deleteStack bool

func testGetNote(t *testing.T) {
	note := fixture.MustRow("NoteDB.notesTestA1").(*notes.NoteDB)
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
	notesTestBoard = fixture.MustRow("Board.notesTestBoard").(*Board)
	listOfNotes, err := notesDb.GetAll(notesTestBoard.ID)
	assert.Nil(t, err)
	assert.Equal(t, 9, len(listOfNotes))
}
func testGetFilterByColumn(t *testing.T) {
	columnA = fixture.MustRow("DatabaseColumn.notesColumnA").(*columns.DatabaseColumn)
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
	noteA1 = fixture.MustRow("NoteDB.notesTestA1").(*notes.NoteDB)
	noteA2 = fixture.MustRow("NoteDB.notesTestA2").(*notes.NoteDB)
	noteA3 = fixture.MustRow("NoteDB.notesTestA3").(*notes.NoteDB)
	noteA4 = fixture.MustRow("NoteDB.notesTestA4").(*notes.NoteDB)
	noteA5 = fixture.MustRow("NoteDB.notesTestA5").(*notes.NoteDB)

	notesOnBoard, _ := notesDb.GetAll(notesTestBoard.ID, columnA.ID)
	verifyNoteOrder(t, notesOnBoard, noteA1, noteA2, noteA4, noteA5, noteA3)

	noteB1 = fixture.MustRow("NoteDB.notesTestB1").(*notes.NoteDB)
	noteB2 = fixture.MustRow("NoteDB.notesTestB2").(*notes.NoteDB)
	noteB3 = fixture.MustRow("NoteDB.notesTestB3").(*notes.NoteDB)

	notesOnBoard, _ = notesDb.GetAll(notesTestBoard.ID, columnB.ID)
	verifyNoteOrder(t, notesOnBoard, noteB1, noteB2, noteB3)
}

func verifyNoteOrder(t *testing.T, notes []notes.NoteDB, expected ...*notes.NoteDB) {
	for index, note := range notes {
		assert.Equal(t, expected[index].ID, note.ID)
	}
}

func testCreateNote(t *testing.T) {
	author = fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)

	note, err := notesDb.CreateNote(notes.NoteInsertDB{
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
	author = fixture.MustRow("DatabaseUser.jack").(*users.DatabaseUser)
	_, err := notesDb.CreateNote(notes.NoteInsertDB{
		Author: author.ID,
		Board:  notesTestBoard.ID,
		Column: columnA.ID,
		Text:   "",
	})
	assert.NotNil(t, err)
}

func testUpdateOfNoteText(t *testing.T) {
	newText := "I update the text and I like it"

	note, err := notesDb.UpdateNote(author.ID, notes.NoteUpdateDB{
		ID:    noteA6.ID,
		Board: notesTestBoard.ID,
		Text:  &newText,
	})
	assert.Nil(t, err)
	assert.Equal(t, newText, note.Text)
	assert.Equal(t, 3, note.Rank)
}
func testOrderOnRaiseRankOfNote(t *testing.T) {
	note, err := notesDb.UpdateNote(author.ID, notes.NoteUpdateDB{
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
	note, err := notesDb.UpdateNote(author.ID, notes.NoteUpdateDB{
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
	note, err := notesDb.UpdateNote(author.ID, notes.NoteUpdateDB{
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
	note, err := notesDb.UpdateNote(author.ID, notes.NoteUpdateDB{
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
	note, err := notesDb.UpdateNote(author.ID, notes.NoteUpdateDB{
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
	note, err := notesDb.UpdateNote(author.ID, notes.NoteUpdateDB{
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
	note, err := notesDb.UpdateNote(author.ID, notes.NoteUpdateDB{
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
	note, err := notesDb.UpdateNote(author.ID, notes.NoteUpdateDB{
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
	note, err := notesDb.UpdateNote(author.ID, notes.NoteUpdateDB{
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
	note, err := notesDb.UpdateNote(author.ID, notes.NoteUpdateDB{
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
	note, err := notesDb.UpdateNote(author.ID, notes.NoteUpdateDB{
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
	stackTestBoard = fixture.MustRow("Board.stackTestBoard").(*Board)
	stackTestColumnA = fixture.MustRow("DatabaseColumn.stackTestColumnA").(*columns.DatabaseColumn)
	stackA = fixture.MustRow("NoteDB.stackTestNote1").(*notes.NoteDB)
	stackB = fixture.MustRow("NoteDB.stackTestNote2").(*notes.NoteDB)
	stackC = fixture.MustRow("NoteDB.stackTestNote3").(*notes.NoteDB)
	stackD = fixture.MustRow("NoteDB.stackTestNote4").(*notes.NoteDB)
	stackUser = fixture.MustRow("DatabaseUser.justin").(*users.DatabaseUser)

	/*
	   A: Rank 1337, Stack null
	   B: Rank 0, Stack A
	   C: Rank 1, Stack A
	   D: Rank 2, Stack A
	*/

	notesOnBoard, _ := notesDb.GetAll(stackTestBoard.ID, stackTestColumnA.ID)
	verifyNoteOrder(t, notesOnBoard, stackA, stackD, stackC, stackB)

	note, err := notesDb.UpdateNote(stackUser.ID, notes.NoteUpdateDB{
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
	note, err := notesDb.UpdateNote(stackUser.ID, notes.NoteUpdateDB{
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
	note, err := notesDb.UpdateNote(stackUser.ID, notes.NoteUpdateDB{
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
	note, err := notesDb.UpdateNote(stackUser.ID, notes.NoteUpdateDB{
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
	note, err := notesDb.UpdateNote(stackUser.ID, notes.NoteUpdateDB{
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
	noteC1 = fixture.MustRow("NoteDB.notesTestC1").(*notes.NoteDB)

	_, updateBoardError := testDb.UpdateBoard(BoardUpdate{
		ID:         notesTestBoard.ID,
		SharedNote: uuid.NullUUID{UUID: noteC1.ID, Valid: true},
		ShowVoting: uuid.NullUUID{Valid: false},
	})
	assert.Nil(t, updateBoardError)

	board, getBoardError := testDb.GetBoard(notesTestBoard.ID)
	assert.Nil(t, getBoardError)
	assert.Equal(t, board.SharedNote, uuid.NullUUID{UUID: noteC1.ID, Valid: true})

	deleteNoteError := notesDb.DeleteNote(author.ID, notesTestBoard.ID, noteC1.ID, deleteStack)
	assert.Nil(t, deleteNoteError)

	updatedBoard, getUpdatedBoardError := testDb.GetBoard(notesTestBoard.ID)
	assert.Nil(t, getUpdatedBoardError)
	assert.Equal(t, uuid.NullUUID{Valid: false}, updatedBoard.SharedNote)
}

func testDeleteStackParent(t *testing.T) {
	stackTestBoard = fixture.MustRow("Board.stackTestBoard").(*Board)
	stackTestColumnB = fixture.MustRow("DatabaseColumn.stackTestColumnB").(*columns.DatabaseColumn)
	stackE = fixture.MustRow("NoteDB.stackTestNote5").(*notes.NoteDB)
	stackF = fixture.MustRow("NoteDB.stackTestNote6").(*notes.NoteDB)
	stackG = fixture.MustRow("NoteDB.stackTestNote7").(*notes.NoteDB)
	stackH = fixture.MustRow("NoteDB.stackTestNote8").(*notes.NoteDB)
	stackUser = fixture.MustRow("DatabaseUser.justin").(*users.DatabaseUser)
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

	var newParent notes.NoteDB
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
	stackTestBoard = fixture.MustRow("Board.stackTestBoard").(*Board)
	stackTestColumnB = fixture.MustRow("DatabaseColumn.stackTestColumnB").(*columns.DatabaseColumn)
	stackH = fixture.MustRow("NoteDB.stackTestNote8").(*notes.NoteDB)
	stackUser = fixture.MustRow("DatabaseUser.justin").(*users.DatabaseUser)

	notesInStack, _ := notesDb.GetAll(stackTestBoard.ID, stackTestColumnB.ID)
	assert.Equal(t, 3, len(notesInStack))

	deleteStack = true
	err := notesDb.DeleteNote(stackUser.ID, stackTestBoard.ID, stackH.ID, deleteStack)
	assert.Nil(t, err)

	notesInStack, _ = notesDb.GetAll(stackTestBoard.ID, stackTestColumnB.ID)
	assert.Equal(t, 0, len(notesInStack))
}
