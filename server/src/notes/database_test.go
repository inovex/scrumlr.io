package notes

import (
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
)

type DatabaseNoteTestSuite struct {
	suite.Suite
	container *postgres.PostgresContainer
	db        *bun.DB
	users     map[string]TestUser
	boards    map[string]TestBoard
	sessions  map[string]TestSession
	columns   map[string]TestColumn
	notes     []DatabaseNote //map iteration order is not defined
}

func TestDatabaseBoardTemplateTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseNoteTestSuite))
}

func (suite *DatabaseNoteTestSuite) SetupSuite() {
	container, bun := initialize.StartTestDatabase()

	suite.SeedDatabase(bun)

	suite.container = container
	suite.db = bun
}

func (suite *DatabaseNoteTestSuite) TearDownSuite() {
	initialize.StopTestDatabase(suite.container)
}

func (suite *DatabaseNoteTestSuite) Test_Database_Create() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	authorId := suite.users["Stan"].id
	boardId := suite.boards["Write"].id
	columnId := suite.columns["Write"].id
	text := "This is a created note"

	dbNote, err := database.CreateNote(DatabaseNoteInsert{Author: authorId, Board: boardId, Column: columnId, Text: text})

	assert.Nil(t, err)
	assert.Equal(t, authorId, dbNote.Author)
	assert.Equal(t, boardId, dbNote.Board)
	assert.Equal(t, columnId, dbNote.Column)
	assert.Equal(t, text, dbNote.Text)
	assert.Equal(t, 0, dbNote.Rank)
	assert.Equal(t, uuid.NullUUID{}, dbNote.Stack)
	assert.False(t, dbNote.Edited)
	assert.NotNil(t, dbNote.CreatedAt)
}

func (suite *DatabaseNoteTestSuite) Test_Database_Create_EmptyText() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	authorId := suite.users["Stan"].id
	boardId := suite.boards["Write"].id
	columnId := suite.columns["Write1"].id
	text := ""

	dbNote, err := database.CreateNote(DatabaseNoteInsert{Author: authorId, Board: boardId, Column: columnId, Text: text})

	assert.NotNil(t, err)
	assert.Equal(t, DatabaseNote{}, dbNote)
}

func (suite *DatabaseNoteTestSuite) Test_Database_Import() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	userId := suite.users["Santa"].id
	boardId := suite.boards["Write"].id
	text := "This note is imported"
	columnId := suite.columns["Write"].id

	dbNote, err := database.ImportNote(DatabaseNoteImport{Author: userId, Board: boardId, Text: text, Position: &NoteUpdatePosition{Column: columnId}})

	assert.Nil(t, err)
	assert.Equal(t, userId, dbNote.Author)
	assert.Equal(t, boardId, dbNote.Board)
	assert.Equal(t, text, dbNote.Text)
	assert.Equal(t, columnId, dbNote.Column)
	assert.Equal(t, 0, dbNote.Rank)
	assert.Equal(t, uuid.NullUUID{}, dbNote.Stack)
	assert.False(t, dbNote.Edited)
	assert.NotNil(t, dbNote.CreatedAt)
}

func (suite *DatabaseNoteTestSuite) Test_Database_Update_Text() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	userId := suite.users["Stan"].id
	noteId := suite.notes[0].ID
	boardId := suite.boards["Update"].id
	columnId := suite.columns["Update"].id
	text := "This note was updated"

	dbNote, err := database.UpdateNote(userId, DatabaseNoteUpdate{ID: noteId, Board: boardId, Text: &text, Edited: true})

	assert.Nil(t, err)
	assert.Equal(t, noteId, dbNote.ID)
	assert.Equal(t, userId, dbNote.Author)
	assert.Equal(t, boardId, dbNote.Board)
	assert.Equal(t, columnId, dbNote.Column)
	assert.Equal(t, text, dbNote.Text)
	assert.Equal(t, 0, dbNote.Rank)
	assert.Equal(t, uuid.NullUUID{}, dbNote.Stack)
	assert.True(t, dbNote.Edited)
	assert.NotNil(t, dbNote.CreatedAt)
}

func (suite *DatabaseNoteTestSuite) Test_Database_Update_HigherPosition() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	userId := suite.users["Stan"].id
	noteId := suite.notes[1].ID
	boardId := suite.boards["Update"].id
	columnId := suite.columns["UpdateUp"].id
	text := suite.notes[1].Text

	dbNote, err := database.UpdateNote(userId, DatabaseNoteUpdate{ID: noteId, Board: boardId, Position: &NoteUpdatePosition{Rank: 1, Column: columnId}})

	assert.Nil(t, err)
	assert.Equal(t, noteId, dbNote.ID)
	assert.Equal(t, userId, dbNote.Author)
	assert.Equal(t, boardId, dbNote.Board)
	assert.Equal(t, columnId, dbNote.Column)
	assert.Equal(t, text, dbNote.Text)
	assert.Equal(t, 1, dbNote.Rank)
	assert.Equal(t, uuid.NullUUID{}, dbNote.Stack)
	assert.False(t, dbNote.Edited)
	assert.NotNil(t, dbNote.CreatedAt)
}

func (suite *DatabaseNoteTestSuite) Test_Database_Update_HighPosition() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	userId := suite.users["Stan"].id
	noteId := suite.notes[2].ID
	boardId := suite.boards["Update"].id
	columnId := suite.columns["UpdateUp"].id
	text := suite.notes[2].Text

	dbNote, err := database.UpdateNote(userId, DatabaseNoteUpdate{ID: noteId, Board: boardId, Position: &NoteUpdatePosition{Rank: 1000, Column: columnId}})

	assert.Nil(t, err)
	assert.Equal(t, noteId, dbNote.ID)
	assert.Equal(t, userId, dbNote.Author)
	assert.Equal(t, boardId, dbNote.Board)
	assert.Equal(t, columnId, dbNote.Column)
	assert.Equal(t, text, dbNote.Text)
	assert.Equal(t, 2, dbNote.Rank)
	assert.Equal(t, uuid.NullUUID{}, dbNote.Stack)
	assert.False(t, dbNote.Edited)
	assert.NotNil(t, dbNote.CreatedAt)
}

func (suite *DatabaseNoteTestSuite) Test_Database_Update_LowerPosition() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	userId := suite.users["Stan"].id
	noteId := suite.notes[6].ID
	boardId := suite.boards["Update"].id
	columnId := suite.columns["UpdateDown"].id
	text := suite.notes[6].Text

	dbNote, err := database.UpdateNote(userId, DatabaseNoteUpdate{ID: noteId, Board: boardId, Position: &NoteUpdatePosition{Rank: 1, Column: columnId}})

	assert.Nil(t, err)
	assert.Equal(t, noteId, dbNote.ID)
	assert.Equal(t, userId, dbNote.Author)
	assert.Equal(t, boardId, dbNote.Board)
	assert.Equal(t, columnId, dbNote.Column)
	assert.Equal(t, text, dbNote.Text)
	assert.Equal(t, 1, dbNote.Rank)
	assert.Equal(t, uuid.NullUUID{}, dbNote.Stack)
	assert.False(t, dbNote.Edited)
	assert.NotNil(t, dbNote.CreatedAt)
}

func (suite *DatabaseNoteTestSuite) Test_Database_Update_NegativePosition() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	userId := suite.users["Stan"].id
	noteId := suite.notes[5].ID
	boardId := suite.boards["Update"].id
	columnId := suite.columns["UpdateDown"].id
	text := suite.notes[5].Text

	dbNote, err := database.UpdateNote(userId, DatabaseNoteUpdate{ID: noteId, Board: boardId, Position: &NoteUpdatePosition{Rank: -99, Column: columnId}})

	assert.Nil(t, err)
	assert.Equal(t, noteId, dbNote.ID)
	assert.Equal(t, userId, dbNote.Author)
	assert.Equal(t, boardId, dbNote.Board)
	assert.Equal(t, columnId, dbNote.Column)
	assert.Equal(t, text, dbNote.Text)
	assert.Equal(t, 0, dbNote.Rank)
	assert.Equal(t, uuid.NullUUID{}, dbNote.Stack)
	assert.False(t, dbNote.Edited)
	assert.NotNil(t, dbNote.CreatedAt)
}

func (suite *DatabaseNoteTestSuite) Test_Database_Update_ZeroPosition() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	userId := suite.users["Stan"].id
	noteId := suite.notes[6].ID
	boardId := suite.boards["Update"].id
	columnId := suite.columns["UpdateDown"].id
	text := suite.notes[6].Text

	dbNote, err := database.UpdateNote(userId, DatabaseNoteUpdate{ID: noteId, Board: boardId, Position: &NoteUpdatePosition{Rank: 0, Column: columnId}})

	assert.Nil(t, err)
	assert.Equal(t, noteId, dbNote.ID)
	assert.Equal(t, userId, dbNote.Author)
	assert.Equal(t, boardId, dbNote.Board)
	assert.Equal(t, columnId, dbNote.Column)
	assert.Equal(t, text, dbNote.Text)
	assert.Equal(t, 0, dbNote.Rank)
	assert.Equal(t, uuid.NullUUID{}, dbNote.Stack)
	assert.False(t, dbNote.Edited)
	assert.NotNil(t, dbNote.CreatedAt)
}

func (suite *DatabaseNoteTestSuite) Test_Database_Update_MoveStack() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	userId := suite.users["Santa"].id
	noteId := suite.notes[8].ID
	boardId := suite.boards["Update"].id
	columnId := suite.columns["UpdateStack2"].id

	dbNote, err := database.UpdateNote(userId, DatabaseNoteUpdate{ID: noteId, Board: boardId, Position: &NoteUpdatePosition{Column: columnId}})

	assert.Nil(t, err)
	assert.Equal(t, noteId, dbNote.ID)
	assert.Equal(t, userId, dbNote.Author)
	assert.Equal(t, boardId, dbNote.Board)
	assert.Equal(t, columnId, dbNote.Column)
	assert.Equal(t, 0, dbNote.Rank)
	assert.Equal(t, uuid.NullUUID{}, dbNote.Stack)
	assert.False(t, dbNote.Edited)
	assert.NotNil(t, dbNote.CreatedAt)
}

func (suite *DatabaseNoteTestSuite) Test_Database_Update_MoveNoteToOtherStack() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	userId := suite.users["Santa"].id
	baseNoteId := suite.notes[10].ID
	noteId := suite.notes[11].ID
	boardId := suite.boards["Update"].id
	columnId := suite.columns["UpdateStack1"].id

	dbNote, err := database.UpdateNote(userId, DatabaseNoteUpdate{ID: noteId, Board: boardId, Position: &NoteUpdatePosition{Stack: uuid.NullUUID{UUID: baseNoteId, Valid: true}, Column: columnId}})

	assert.Nil(t, err)
	assert.Equal(t, noteId, dbNote.ID)
	assert.Equal(t, userId, dbNote.Author)
	assert.Equal(t, boardId, dbNote.Board)
	assert.Equal(t, columnId, dbNote.Column)
	assert.Equal(t, 0, dbNote.Rank)
	assert.Equal(t, uuid.NullUUID{UUID: baseNoteId, Valid: true}, dbNote.Stack)
	assert.False(t, dbNote.Edited)
	assert.NotNil(t, dbNote.CreatedAt)
}

func (suite *DatabaseNoteTestSuite) Test_Database_Update_MoveWithinStack() { //TODO
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	userId := suite.users["Santa"].id
	stackId := suite.notes[12].ID
	noteId := suite.notes[14].ID
	boardId := suite.boards["Update"].id
	columnId := suite.columns["UpdateStack1"].id

	dbNote, err := database.UpdateNote(userId, DatabaseNoteUpdate{ID: noteId, Board: boardId, Position: &NoteUpdatePosition{Column: columnId, Stack: uuid.NullUUID{UUID: stackId, Valid: true}}})

	assert.Nil(t, err)
	assert.Equal(t, noteId, dbNote.ID)
	assert.Equal(t, userId, dbNote.Author)
	assert.Equal(t, boardId, dbNote.Board)
	assert.Equal(t, columnId, dbNote.Column)
	assert.Equal(t, 1, dbNote.Rank)
	assert.Equal(t, uuid.NullUUID{UUID: stackId, Valid: true}, dbNote.Stack)
	assert.False(t, dbNote.Edited)
	assert.NotNil(t, dbNote.CreatedAt)
}

func (suite *DatabaseNoteTestSuite) Test_Database_Delete() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	noteId := suite.notes[15].ID
	boardId := suite.boards["Delete"].id
	userId := suite.users["Santa"].id

	err := database.DeleteNote(userId, boardId, noteId, false)

	assert.Nil(t, err)
}

func (suite *DatabaseNoteTestSuite) Test_Database_Delete_Stack() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	noteId := suite.notes[16].ID
	boardId := suite.boards["Delete"].id
	userId := suite.users["Santa"].id

	err := database.DeleteNote(userId, boardId, noteId, true)

	assert.Nil(t, err)
}

func (suite *DatabaseNoteTestSuite) Test_Database_Delete_StackParent() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	noteId := suite.notes[18].ID
	boardId := suite.boards["Delete"].id
	userId := suite.users["Santa"].id

	err := database.DeleteNote(userId, boardId, noteId, false)

	assert.Nil(t, err)
}

func (suite *DatabaseNoteTestSuite) Test_Database_Get() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	noteId := suite.notes[23].ID

	dbNote, err := database.Get(noteId)

	assert.Nil(t, err)
	assert.Equal(t, noteId, dbNote.ID)
	assert.Equal(t, suite.notes[23].Author, dbNote.Author)
	assert.Equal(t, suite.notes[23].Board, dbNote.Board)
	assert.Equal(t, suite.notes[23].Column, dbNote.Column)
	assert.Equal(t, suite.notes[23].Text, dbNote.Text)
	assert.Equal(t, suite.notes[23].Rank, dbNote.Rank)
	assert.Equal(t, suite.notes[23].Stack, dbNote.Stack)
	assert.Equal(t, suite.notes[23].Edited, dbNote.Edited)
	assert.NotNil(t, dbNote.CreatedAt)
}

func (suite *DatabaseNoteTestSuite) Test_Database_GetAll() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	boardId := suite.boards["Read"].id

	dbNotes, err := database.GetAll(boardId)

	assert.Nil(t, err)
	assert.Len(t, dbNotes, 4)

	firstNote := checkNoteInList(dbNotes, suite.notes[23].ID)
	assert.NotNil(t, firstNote)
	assert.Equal(t, suite.notes[23].ID, firstNote.ID)
	assert.Equal(t, suite.notes[23].Author, firstNote.Author)
	assert.Equal(t, suite.notes[23].Board, firstNote.Board)
	assert.Equal(t, suite.notes[23].Column, firstNote.Column)
	assert.Equal(t, suite.notes[23].Text, firstNote.Text)
	assert.Equal(t, suite.notes[23].Rank, firstNote.Rank)
	assert.Equal(t, suite.notes[23].Stack, firstNote.Stack)
	assert.Equal(t, suite.notes[23].Edited, firstNote.Edited)
	assert.NotNil(t, firstNote.CreatedAt)

	secondNote := checkNoteInList(dbNotes, suite.notes[24].ID)
	assert.NotNil(t, secondNote)
	assert.Equal(t, suite.notes[24].ID, secondNote.ID)
	assert.Equal(t, suite.notes[24].Author, secondNote.Author)
	assert.Equal(t, suite.notes[24].Board, secondNote.Board)
	assert.Equal(t, suite.notes[24].Column, secondNote.Column)
	assert.Equal(t, suite.notes[24].Text, secondNote.Text)
	assert.Equal(t, suite.notes[24].Rank, secondNote.Rank)
	assert.Equal(t, suite.notes[24].Stack, secondNote.Stack)
	assert.Equal(t, suite.notes[24].Edited, secondNote.Edited)
	assert.NotNil(t, secondNote.CreatedAt)

	thirdNote := checkNoteInList(dbNotes, suite.notes[25].ID)
	assert.NotNil(t, thirdNote)
	assert.Equal(t, suite.notes[25].ID, thirdNote.ID)
	assert.Equal(t, suite.notes[25].Author, thirdNote.Author)
	assert.Equal(t, suite.notes[25].Board, thirdNote.Board)
	assert.Equal(t, suite.notes[25].Column, thirdNote.Column)
	assert.Equal(t, suite.notes[25].Text, thirdNote.Text)
	assert.Equal(t, suite.notes[25].Rank, thirdNote.Rank)
	assert.Equal(t, suite.notes[25].Stack, thirdNote.Stack)
	assert.Equal(t, suite.notes[25].Edited, thirdNote.Edited)
	assert.NotNil(t, thirdNote.CreatedAt)

	fourthNote := checkNoteInList(dbNotes, suite.notes[26].ID)
	assert.NotNil(t, fourthNote)
	assert.Equal(t, suite.notes[26].ID, fourthNote.ID)
	assert.Equal(t, suite.notes[26].Author, fourthNote.Author)
	assert.Equal(t, suite.notes[26].Board, fourthNote.Board)
	assert.Equal(t, suite.notes[26].Column, fourthNote.Column)
	assert.Equal(t, suite.notes[26].Text, fourthNote.Text)
	assert.Equal(t, suite.notes[26].Rank, fourthNote.Rank)
	assert.Equal(t, suite.notes[26].Stack, fourthNote.Stack)
	assert.Equal(t, suite.notes[26].Edited, fourthNote.Edited)
	assert.NotNil(t, fourthNote.CreatedAt)
}

func (suite *DatabaseNoteTestSuite) Test_Database_GetAll_ColumnFilter() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	boardId := suite.boards["Read"].id
	firstColumnId := suite.columns["Read1"].id

	dbNotes, err := database.GetAll(boardId, firstColumnId)

	assert.Nil(t, err)
	assert.Len(t, dbNotes, 2)

	assert.Equal(t, suite.notes[23].ID, dbNotes[1].ID)
	assert.Equal(t, suite.notes[23].Author, dbNotes[1].Author)
	assert.Equal(t, suite.notes[23].Board, dbNotes[1].Board)
	assert.Equal(t, suite.notes[23].Column, dbNotes[1].Column)
	assert.Equal(t, suite.notes[23].Text, dbNotes[1].Text)
	assert.Equal(t, suite.notes[23].Rank, dbNotes[1].Rank)
	assert.Equal(t, suite.notes[23].Stack, dbNotes[1].Stack)
	assert.Equal(t, suite.notes[23].Edited, dbNotes[1].Edited)
	assert.NotNil(t, dbNotes[1].CreatedAt)

	assert.Equal(t, suite.notes[24].ID, dbNotes[0].ID)
	assert.Equal(t, suite.notes[24].Author, dbNotes[0].Author)
	assert.Equal(t, suite.notes[24].Board, dbNotes[0].Board)
	assert.Equal(t, suite.notes[24].Column, dbNotes[0].Column)
	assert.Equal(t, suite.notes[24].Text, dbNotes[0].Text)
	assert.Equal(t, suite.notes[24].Rank, dbNotes[0].Rank)
	assert.Equal(t, suite.notes[24].Stack, dbNotes[0].Stack)
	assert.Equal(t, suite.notes[24].Edited, dbNotes[0].Edited)
	assert.NotNil(t, dbNotes[0].CreatedAt)
}

func (suite *DatabaseNoteTestSuite) Test_Database_GetChild() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	noteId := suite.notes[20].ID

	dbNotes, err := database.GetChildNotes(noteId)

	assert.Nil(t, err)
	assert.Len(t, dbNotes, 2)

	assert.Equal(t, suite.notes[21].ID, dbNotes[0].ID)
	assert.Equal(t, suite.notes[21].Author, dbNotes[0].Author)
	assert.Equal(t, suite.notes[21].Board, dbNotes[0].Board)
	assert.Equal(t, suite.notes[21].Column, dbNotes[0].Column)
	assert.Equal(t, suite.notes[21].Edited, dbNotes[0].Edited)
	assert.Equal(t, suite.notes[21].Rank, dbNotes[0].Rank)
	assert.Equal(t, suite.notes[21].Stack, dbNotes[0].Stack)
	assert.Equal(t, suite.notes[21].Text, dbNotes[0].Text)
	assert.NotNil(t, dbNotes[0].CreatedAt)

	assert.Equal(t, suite.notes[22].ID, dbNotes[1].ID)
	assert.Equal(t, suite.notes[22].Author, dbNotes[1].Author)
	assert.Equal(t, suite.notes[22].Board, dbNotes[1].Board)
	assert.Equal(t, suite.notes[22].Column, dbNotes[1].Column)
	assert.Equal(t, suite.notes[22].Edited, dbNotes[1].Edited)
	assert.Equal(t, suite.notes[22].Rank, dbNotes[1].Rank)
	assert.Equal(t, suite.notes[22].Stack, dbNotes[1].Stack)
	assert.Equal(t, suite.notes[22].Text, dbNotes[1].Text)
	assert.NotNil(t, dbNotes[1].CreatedAt)
}

func (suite *DatabaseNoteTestSuite) Test_Database_GetStack() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	noteId := suite.notes[20].ID

	dbNotes, err := database.GetStack(noteId)

	assert.Nil(t, err)
	assert.Len(t, dbNotes, 3)

	assert.Equal(t, suite.notes[20].ID, dbNotes[0].ID)
	assert.Equal(t, suite.notes[20].Author, dbNotes[0].Author)
	assert.Equal(t, suite.notes[20].Board, dbNotes[0].Board)
	assert.Equal(t, suite.notes[20].Column, dbNotes[0].Column)
	assert.Equal(t, suite.notes[20].Edited, dbNotes[0].Edited)
	assert.Equal(t, suite.notes[20].Rank, dbNotes[0].Rank)
	assert.Equal(t, suite.notes[20].Stack, dbNotes[0].Stack)
	assert.Equal(t, suite.notes[20].Text, dbNotes[0].Text)
	assert.NotNil(t, dbNotes[0].CreatedAt)

	assert.Equal(t, suite.notes[21].ID, dbNotes[1].ID)
	assert.Equal(t, suite.notes[21].Author, dbNotes[1].Author)
	assert.Equal(t, suite.notes[21].Board, dbNotes[1].Board)
	assert.Equal(t, suite.notes[21].Column, dbNotes[1].Column)
	assert.Equal(t, suite.notes[21].Edited, dbNotes[1].Edited)
	assert.Equal(t, suite.notes[21].Rank, dbNotes[1].Rank)
	assert.Equal(t, suite.notes[21].Stack, dbNotes[1].Stack)
	assert.Equal(t, suite.notes[21].Text, dbNotes[1].Text)
	assert.NotNil(t, dbNotes[1].CreatedAt)

	assert.Equal(t, suite.notes[22].ID, dbNotes[2].ID)
	assert.Equal(t, suite.notes[22].Author, dbNotes[2].Author)
	assert.Equal(t, suite.notes[22].Board, dbNotes[2].Board)
	assert.Equal(t, suite.notes[22].Column, dbNotes[2].Column)
	assert.Equal(t, suite.notes[22].Edited, dbNotes[2].Edited)
	assert.Equal(t, suite.notes[22].Rank, dbNotes[2].Rank)
	assert.Equal(t, suite.notes[22].Stack, dbNotes[2].Stack)
	assert.Equal(t, suite.notes[22].Text, dbNotes[2].Text)
	assert.NotNil(t, dbNotes[2].CreatedAt)
}

type TestUser struct {
	id          uuid.UUID
	name        string
	accountType common.AccountType
}

type TestBoard struct {
	id   uuid.UUID
	name string
}

type TestSession struct {
	userId  uuid.UUID
	boardId uuid.UUID
}

type TestColumn struct {
	id      uuid.UUID
	boardId uuid.UUID
	name    string
	index   int
}

func (suite *DatabaseNoteTestSuite) SeedDatabase(db *bun.DB) {
	// tests users
	suite.users = make(map[string]TestUser, 2)
	suite.users["Stan"] = TestUser{id: uuid.New(), name: "Stan", accountType: common.Google}
	suite.users["Santa"] = TestUser{id: uuid.New(), name: "Santa", accountType: common.Anonymous}

	// test boards
	suite.boards = make(map[string]TestBoard, 5)
	suite.boards["Write"] = TestBoard{id: uuid.New(), name: "Write Board"}
	suite.boards["Update"] = TestBoard{id: uuid.New(), name: "Update Board"}
	suite.boards["Delete"] = TestBoard{id: uuid.New(), name: "Delete Board"}
	suite.boards["Stack"] = TestBoard{id: uuid.New(), name: "Stack Board"}
	suite.boards["Read"] = TestBoard{id: uuid.New(), name: "Read Board"}

	// test sessions
	suite.sessions = make(map[string]TestSession, 1)
	suite.sessions["Write1"] = TestSession{userId: suite.users["Stan"].id, boardId: suite.boards["Write"].id}

	// test columns
	suite.columns = make(map[string]TestColumn, 10)
	suite.columns["Write"] = TestColumn{id: uuid.New(), boardId: suite.boards["Write"].id, name: "Write Column", index: 0}
	suite.columns["Update"] = TestColumn{id: uuid.New(), boardId: suite.boards["Update"].id, name: "Update column", index: 0}
	suite.columns["UpdateUp"] = TestColumn{id: uuid.New(), boardId: suite.boards["Update"].id, name: "Update move up Column", index: 1}
	suite.columns["UpdateDown"] = TestColumn{id: uuid.New(), boardId: suite.boards["Update"].id, name: "Update move down Column", index: 2}
	suite.columns["UpdateStack1"] = TestColumn{id: uuid.New(), boardId: suite.boards["Update"].id, name: "Update stack Column", index: 3}
	suite.columns["UpdateStack2"] = TestColumn{id: uuid.New(), boardId: suite.boards["Update"].id, name: "Update stack Column", index: 4}
	suite.columns["Delete"] = TestColumn{id: uuid.New(), boardId: suite.boards["Delete"].id, name: "Delete Column", index: 0}
	suite.columns["DeleteStack"] = TestColumn{id: uuid.New(), boardId: suite.boards["Delete"].id, name: "Delete stack Column", index: 1}
	suite.columns["Stack"] = TestColumn{id: uuid.New(), boardId: suite.boards["Stack"].id, name: "Stack Column", index: 0}
	suite.columns["Read1"] = TestColumn{id: uuid.New(), boardId: suite.boards["Read"].id, name: "Read Column", index: 0}
	suite.columns["Read2"] = TestColumn{id: uuid.New(), boardId: suite.boards["Read"].id, name: "Read Column", index: 1}

	// test notes
	suite.notes = make([]DatabaseNote, 27)
	// test notes for writing
	suite.notes[0] = DatabaseNote{ID: uuid.New(), Author: suite.users["Stan"].id, Board: suite.boards["Update"].id, Column: suite.columns["Update"].id, Text: "This text is not yet updated", Rank: 0}
	suite.notes[1] = DatabaseNote{ID: uuid.New(), Author: suite.users["Stan"].id, Board: suite.boards["Update"].id, Column: suite.columns["UpdateUp"].id, Text: "This is a note", Rank: 0}
	suite.notes[2] = DatabaseNote{ID: uuid.New(), Author: suite.users["Stan"].id, Board: suite.boards["Update"].id, Column: suite.columns["UpdateUp"].id, Text: "This is a note", Rank: 1}
	suite.notes[3] = DatabaseNote{ID: uuid.New(), Author: suite.users["Stan"].id, Board: suite.boards["Update"].id, Column: suite.columns["UpdateUp"].id, Text: "This is a note", Rank: 2}
	suite.notes[4] = DatabaseNote{ID: uuid.New(), Author: suite.users["Stan"].id, Board: suite.boards["Update"].id, Column: suite.columns["UpdateDown"].id, Text: "This is a note", Rank: 0}
	suite.notes[5] = DatabaseNote{ID: uuid.New(), Author: suite.users["Stan"].id, Board: suite.boards["Update"].id, Column: suite.columns["UpdateDown"].id, Text: "This is a note", Rank: 1}
	suite.notes[6] = DatabaseNote{ID: uuid.New(), Author: suite.users["Stan"].id, Board: suite.boards["Update"].id, Column: suite.columns["UpdateDown"].id, Text: "This is a note", Rank: 2}
	suite.notes[7] = DatabaseNote{ID: uuid.New(), Author: suite.users["Stan"].id, Board: suite.boards["Update"].id, Column: suite.columns["UpdateDown"].id, Text: "This is a note", Rank: 3}
	suite.notes[8] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Update"].id, Column: suite.columns["UpdateStack1"].id, Text: "Update stack base"}
	suite.notes[9] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Update"].id, Column: suite.columns["UpdateStack1"].id, Text: "Update stack rank 0", Stack: uuid.NullUUID{UUID: suite.notes[8].ID, Valid: true}}
	suite.notes[10] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Update"].id, Column: suite.columns["UpdateStack1"].id, Text: "Will become stack base"}
	suite.notes[11] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Update"].id, Column: suite.columns["UpdateStack1"].id, Text: "Move into stack"}
	suite.notes[12] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Update"].id, Column: suite.columns["UpdateStack1"].id, Text: "Base stack"}
	suite.notes[13] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Update"].id, Column: suite.columns["UpdateStack1"].id, Text: "First note of stack", Stack: uuid.NullUUID{UUID: suite.notes[12].ID, Valid: true}, Rank: 0}
	suite.notes[14] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Update"].id, Column: suite.columns["UpdateStack1"].id, Text: "Second note of stack", Stack: uuid.NullUUID{UUID: suite.notes[13].ID, Valid: true}, Rank: 1}
	suite.notes[15] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Delete"].id, Column: suite.columns["Delete"].id, Text: "Also a note"}
	suite.notes[16] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Delete"].id, Column: suite.columns["DeleteStack"].id, Text: "Delete stack base"}
	suite.notes[17] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Delete"].id, Column: suite.columns["DeleteStack"].id, Text: "Delete stack rank 0", Stack: uuid.NullUUID{UUID: suite.notes[16].ID, Valid: true}}
	suite.notes[18] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Delete"].id, Column: suite.columns["DeleteStack"].id, Text: "Delete stack base"}
	suite.notes[19] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Delete"].id, Column: suite.columns["DeleteStack"].id, Text: "Delete stack rank 0", Stack: uuid.NullUUID{UUID: suite.notes[18].ID, Valid: true}}
	// test notes for stacking
	suite.notes[20] = DatabaseNote{ID: uuid.New(), Author: suite.users["Stan"].id, Board: suite.boards["Stack"].id, Column: suite.columns["Stack"].id, Text: "This the base of a stack"}
	suite.notes[21] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Stack"].id, Column: suite.columns["Stack"].id, Text: "Stack note rank 0", Stack: uuid.NullUUID{UUID: suite.notes[20].ID, Valid: true}, Rank: 0}
	suite.notes[22] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Stack"].id, Column: suite.columns["Stack"].id, Text: "Stack note rank 1", Stack: uuid.NullUUID{UUID: suite.notes[20].ID, Valid: true}, Rank: 1}
	// test notes for reading
	suite.notes[23] = DatabaseNote{ID: uuid.New(), Author: suite.users["Stan"].id, Board: suite.boards["Read"].id, Column: suite.columns["Read1"].id, Text: "This is a note", Rank: 0}
	suite.notes[24] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Read"].id, Column: suite.columns["Read1"].id, Text: "Also a note", Rank: 1}
	suite.notes[25] = DatabaseNote{ID: uuid.New(), Author: suite.users["Stan"].id, Board: suite.boards["Read"].id, Column: suite.columns["Read2"].id, Text: "Test note", Rank: 0}
	suite.notes[26] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Read"].id, Column: suite.columns["Read2"].id, Text: "I have no idea", Rank: 1}

	for _, user := range suite.users {
		err := initialize.InsertUser(db, user.id, user.name, string(user.accountType))
		if err != nil {
			log.Fatalf("Failed to insert test user %s", err)
		}
	}

	for _, board := range suite.boards {
		err := initialize.InsertBoard(db, board.id, board.name, "", nil, nil, "PUBLIC", true, true, true, true, false)
		if err != nil {
			log.Fatalf("Failed to insert test board %s", err)
		}
	}

	for _, session := range suite.sessions {
		err := initialize.InsertSession(db, session.userId, session.boardId, string(common.ParticipantRole), false, false, true, false)
		if err != nil {
			log.Fatalf("Failed to insert test session %s", err)
		}
	}

	for _, column := range suite.columns {
		err := initialize.InsertColumn(db, column.id, column.boardId, column.name, "", "backlog-blue", true, column.index)
		if err != nil {
			log.Fatalf("Failed to insert test board %s", err)
		}
	}

	for _, note := range suite.notes {
		err := initialize.InsertNote(db, note.ID, note.Author, note.Board, note.Column, note.Text, note.Stack, note.Rank)
		if err != nil {
			log.Fatalf("Failed to insert test notes %s", err)
		}
	}
}

func checkNoteInList(list []DatabaseNote, id uuid.UUID) *DatabaseNote {
	for _, note := range list {
		if note.ID == id {
			return &note
		}
	}
	return nil
}
