package notes

import (
	"context"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/databaseinitialize"
)

const POSTGRES_IMAGE = "postgres:17.5-alpine"
const DATABASE_NAME = "scrumlr_test"
const DATABASE_USERNAME = "stan"
const DATABASE_PASSWORD = "scrumlr"

type DatabaseNoteTestSuite struct {
	suite.Suite
	container *postgres.PostgresContainer
	db        *bun.DB
	users     map[string]TestUser
	boards    map[string]TestBoard
	sessions  map[string]TestSession
	columns   map[string]TestColumn
	notes     map[string]DatabaseNote
}

func TestDatabaseBoardTemplateTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseNoteTestSuite))
}

func (suite *DatabaseNoteTestSuite) SetupSuite() {
	ctx := context.Background()
	pgcontainer, err := postgres.Run( //creating database
		ctx,
		POSTGRES_IMAGE,
		postgres.WithDatabase(DATABASE_NAME),
		postgres.WithUsername(DATABASE_USERNAME),
		postgres.WithPassword(DATABASE_PASSWORD),
		postgres.BasicWaitStrategies(),
	)

	if err != nil {
		log.Fatalf("Failed to start container: %s", err)
	}

	connectionString, err := pgcontainer.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		log.Fatalf("Failed to get connection string %s", err)
	}

	db, err := databaseinitialize.InitializeDatabase(connectionString) //migrating database
	if err != nil {
		log.Fatalf("Failed to initialize database %s", err)
	}

	bunDb := databaseinitialize.InitializeBun(db, true) // setup bun

	suite.SeedDatabase(bunDb)

	suite.container = pgcontainer
	suite.db = bunDb
}

func (suite *DatabaseNoteTestSuite) TearDownSuite() {
	if err := testcontainers.TerminateContainer(suite.container); err != nil {
		log.Fatalf("Failed to terminate container: %s", err)
	}
}

func (suite *DatabaseNoteTestSuite) Test_Database_Create() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	authorId := suite.users["Stan"].id
	boardId := suite.boards["Write"].id
	columnId := suite.columns["Write1"].id
	text := "This is a created note"

	dbNote, err := database.CreateNote(DatabaseNoteInsert{Author: authorId, Board: boardId, Column: columnId, Text: text})

	assert.Nil(t, err)
	assert.Equal(t, authorId, dbNote.Author)
	assert.Equal(t, boardId, dbNote.Board)
	assert.Equal(t, columnId, dbNote.Column)
	assert.Equal(t, text, dbNote.Text)
	assert.Equal(t, 1, dbNote.Rank)
	assert.Equal(t, uuid.NullUUID{}, dbNote.Stack)
	assert.False(t, dbNote.Edited)
	assert.NotNil(t, dbNote.CreatedAt)
}

func (suite *DatabaseNoteTestSuite) Test_Database_Import() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	userId := suite.users["Santa"].id
	boardId := suite.boards["Write"].id
	text := "This note is imported"
	columnId := suite.columns["Write1"].id

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

func (suite *DatabaseNoteTestSuite) Test_Database_UpdateText() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	userId := suite.users["Stan"].id
	noteId := suite.notes["Update"].ID
	boardId := suite.boards["Write"].id
	columnId := suite.notes["Update"].Column
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

func (suite *DatabaseNoteTestSuite) Test_Database_UpdatePosition() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	userId := suite.users["Stan"].id
	noteId := suite.notes["Update"].ID
	boardId := suite.boards["Write"].id
	columnId := suite.columns["Write2"].id
	text := suite.notes["Update"].Text

	dbNote, err := database.UpdateNote(userId, DatabaseNoteUpdate{ID: noteId, Board: boardId, Position: &NoteUpdatePosition{Column: columnId}})

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

func (suite *DatabaseNoteTestSuite) Test_Database_Delete() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	noteId := suite.notes["Delete"].ID
	boardId := suite.notes["Delete"].Board
	userId := suite.notes["Delete"].Author

	err := database.DeleteNote(userId, boardId, noteId, false)

	assert.Nil(t, err)
}

func (suite *DatabaseNoteTestSuite) Test_Database_DeleteStack() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	noteId := suite.notes["DeleteStack1"].ID
	boardId := suite.notes["DeleteStack1"].Board
	userId := suite.notes["DeleteStack1"].Author

	err := database.DeleteNote(userId, boardId, noteId, true)

	assert.Nil(t, err)
}

func (suite *DatabaseNoteTestSuite) Test_Database_Get() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	noteId := suite.notes["Read1"].ID

	dbNote, err := database.Get(noteId)

	assert.Nil(t, err)
	assert.Equal(t, noteId, dbNote.ID)
	assert.Equal(t, suite.notes["Read1"].Author, dbNote.Author)
	assert.Equal(t, suite.notes["Read1"].Board, dbNote.Board)
	assert.Equal(t, suite.notes["Read1"].Column, dbNote.Column)
	assert.Equal(t, suite.notes["Read1"].Text, dbNote.Text)
	assert.Equal(t, suite.notes["Read1"].Rank, dbNote.Rank)
	assert.Equal(t, suite.notes["Read1"].Stack, dbNote.Stack)
	assert.Equal(t, suite.notes["Read1"].Edited, dbNote.Edited)
	assert.NotNil(t, dbNote.CreatedAt)
}

func (suite *DatabaseNoteTestSuite) Test_Database_GetAll() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	boardId := suite.boards["Read"].id
	firstColumnId := suite.columns["Read1"].id
	secondColumnId := suite.columns["Read2"].id

	dbNotes, err := database.GetAll(boardId, firstColumnId, secondColumnId)

	assert.Nil(t, err)
	assert.Len(t, dbNotes, 4)

	assert.Equal(t, suite.notes["Read1"].ID, dbNotes[0].ID)
	assert.Equal(t, suite.notes["Read1"].Author, dbNotes[0].Author)
	assert.Equal(t, suite.notes["Read1"].Board, dbNotes[0].Board)
	assert.Equal(t, suite.notes["Read1"].Column, dbNotes[0].Column)
	assert.Equal(t, suite.notes["Read1"].Text, dbNotes[0].Text)
	assert.Equal(t, suite.notes["Read1"].Rank, dbNotes[0].Rank)
	assert.Equal(t, suite.notes["Read1"].Stack, dbNotes[0].Stack)
	assert.Equal(t, suite.notes["Read1"].Edited, dbNotes[0].Edited)
	assert.NotNil(t, dbNotes[0].CreatedAt)

	assert.Equal(t, suite.notes["Read2"].ID, dbNotes[1].ID)
	assert.Equal(t, suite.notes["Read2"].Author, dbNotes[1].Author)
	assert.Equal(t, suite.notes["Read2"].Board, dbNotes[1].Board)
	assert.Equal(t, suite.notes["Read2"].Column, dbNotes[1].Column)
	assert.Equal(t, suite.notes["Read2"].Text, dbNotes[1].Text)
	assert.Equal(t, suite.notes["Read2"].Rank, dbNotes[1].Rank)
	assert.Equal(t, suite.notes["Read2"].Stack, dbNotes[1].Stack)
	assert.Equal(t, suite.notes["Read2"].Edited, dbNotes[1].Edited)
	assert.NotNil(t, dbNotes[1].CreatedAt)

	assert.Equal(t, suite.notes["Read3"].ID, dbNotes[2].ID)
	assert.Equal(t, suite.notes["Read3"].Author, dbNotes[2].Author)
	assert.Equal(t, suite.notes["Read3"].Board, dbNotes[2].Board)
	assert.Equal(t, suite.notes["Read3"].Column, dbNotes[2].Column)
	assert.Equal(t, suite.notes["Read3"].Text, dbNotes[2].Text)
	assert.Equal(t, suite.notes["Read3"].Rank, dbNotes[2].Rank)
	assert.Equal(t, suite.notes["Read3"].Stack, dbNotes[2].Stack)
	assert.Equal(t, suite.notes["Read3"].Edited, dbNotes[2].Edited)
	assert.NotNil(t, dbNotes[2].CreatedAt)

	assert.Equal(t, suite.notes["Read4"].ID, dbNotes[3].ID)
	assert.Equal(t, suite.notes["Read4"].Author, dbNotes[3].Author)
	assert.Equal(t, suite.notes["Read4"].Board, dbNotes[3].Board)
	assert.Equal(t, suite.notes["Read4"].Column, dbNotes[3].Column)
	assert.Equal(t, suite.notes["Read4"].Text, dbNotes[3].Text)
	assert.Equal(t, suite.notes["Read4"].Rank, dbNotes[3].Rank)
	assert.Equal(t, suite.notes["Read4"].Stack, dbNotes[3].Stack)
	assert.Equal(t, suite.notes["Read4"].Edited, dbNotes[3].Edited)
	assert.NotNil(t, dbNotes[3].CreatedAt)
}

func (suite *DatabaseNoteTestSuite) Test_Database_GetChild() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	noteId := suite.notes["Stack1"].ID

	dbNotes, err := database.GetChildNotes(noteId)

	assert.Nil(t, err)
	assert.Len(t, dbNotes, 2)

	assert.Equal(t, suite.notes["Stack2"].ID, dbNotes[0].ID)
	assert.Equal(t, suite.notes["Stack2"].Author, dbNotes[0].Author)
	assert.Equal(t, suite.notes["Stack2"].Board, dbNotes[0].Board)
	assert.Equal(t, suite.notes["Stack2"].Column, dbNotes[0].Column)
	assert.Equal(t, suite.notes["Stack2"].Edited, dbNotes[0].Edited)
	assert.Equal(t, suite.notes["Stack2"].Rank, dbNotes[0].Rank)
	assert.Equal(t, suite.notes["Stack2"].Stack, dbNotes[0].Stack)
	assert.Equal(t, suite.notes["Stack2"].Text, dbNotes[0].Text)
	assert.NotNil(t, dbNotes[0].CreatedAt)

	assert.Equal(t, suite.notes["Stack3"].ID, dbNotes[1].ID)
	assert.Equal(t, suite.notes["Stack3"].Author, dbNotes[1].Author)
	assert.Equal(t, suite.notes["Stack3"].Board, dbNotes[1].Board)
	assert.Equal(t, suite.notes["Stack3"].Column, dbNotes[1].Column)
	assert.Equal(t, suite.notes["Stack3"].Edited, dbNotes[1].Edited)
	assert.Equal(t, suite.notes["Stack3"].Rank, dbNotes[1].Rank)
	assert.Equal(t, suite.notes["Stack3"].Stack, dbNotes[1].Stack)
	assert.Equal(t, suite.notes["Stack3"].Text, dbNotes[1].Text)
	assert.NotNil(t, dbNotes[1].CreatedAt)
}

func (suite *DatabaseNoteTestSuite) Test_Database_GetStack() {
	t := suite.T()
	database := NewNotesDatabase(suite.db)

	noteId := suite.notes["Stack1"].ID

	dbNotes, err := database.GetStack(noteId)

	assert.Nil(t, err)
	assert.Len(t, dbNotes, 3)

	assert.Equal(t, suite.notes["Stack1"].ID, dbNotes[0].ID)
	assert.Equal(t, suite.notes["Stack1"].Author, dbNotes[0].Author)
	assert.Equal(t, suite.notes["Stack1"].Board, dbNotes[0].Board)
	assert.Equal(t, suite.notes["Stack1"].Column, dbNotes[0].Column)
	assert.Equal(t, suite.notes["Stack1"].Edited, dbNotes[0].Edited)
	assert.Equal(t, suite.notes["Stack1"].Rank, dbNotes[0].Rank)
	assert.Equal(t, suite.notes["Stack1"].Stack, dbNotes[0].Stack)
	assert.Equal(t, suite.notes["Stack1"].Text, dbNotes[0].Text)
	assert.NotNil(t, dbNotes[0].CreatedAt)

	assert.Equal(t, suite.notes["Stack2"].ID, dbNotes[1].ID)
	assert.Equal(t, suite.notes["Stack2"].Author, dbNotes[1].Author)
	assert.Equal(t, suite.notes["Stack2"].Board, dbNotes[1].Board)
	assert.Equal(t, suite.notes["Stack2"].Column, dbNotes[1].Column)
	assert.Equal(t, suite.notes["Stack2"].Edited, dbNotes[1].Edited)
	assert.Equal(t, suite.notes["Stack2"].Rank, dbNotes[1].Rank)
	assert.Equal(t, suite.notes["Stack2"].Stack, dbNotes[1].Stack)
	assert.Equal(t, suite.notes["Stack2"].Text, dbNotes[1].Text)
	assert.NotNil(t, dbNotes[1].CreatedAt)

	assert.Equal(t, suite.notes["Stack3"].ID, dbNotes[2].ID)
	assert.Equal(t, suite.notes["Stack3"].Author, dbNotes[2].Author)
	assert.Equal(t, suite.notes["Stack3"].Board, dbNotes[2].Board)
	assert.Equal(t, suite.notes["Stack3"].Column, dbNotes[2].Column)
	assert.Equal(t, suite.notes["Stack3"].Edited, dbNotes[2].Edited)
	assert.Equal(t, suite.notes["Stack3"].Rank, dbNotes[2].Rank)
	assert.Equal(t, suite.notes["Stack3"].Stack, dbNotes[2].Stack)
	assert.Equal(t, suite.notes["Stack3"].Text, dbNotes[2].Text)
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
	suite.boards = make(map[string]TestBoard, 3)
	suite.boards["Write"] = TestBoard{id: uuid.New(), name: "Write Board"}
	suite.boards["Stack"] = TestBoard{id: uuid.New(), name: "Stack Board"}
	suite.boards["Read"] = TestBoard{id: uuid.New(), name: "Read Board"}

	// test sessions
	suite.sessions = make(map[string]TestSession)
	suite.sessions["Write1"] = TestSession{userId: suite.users["Stan"].id, boardId: suite.boards["Write"].id}

	// test columns
	suite.columns = make(map[string]TestColumn, 5)
	suite.columns["Write1"] = TestColumn{id: uuid.New(), boardId: suite.boards["Write"].id, name: "Write Column", index: 0}
	suite.columns["Write2"] = TestColumn{id: uuid.New(), boardId: suite.boards["Write"].id, name: "Write Column", index: 1}
	suite.columns["Stack"] = TestColumn{id: uuid.New(), boardId: suite.boards["Stack"].id, name: "Stack Column", index: 0}
	suite.columns["Read1"] = TestColumn{id: uuid.New(), boardId: suite.boards["Read"].id, name: "Read Column", index: 0}
	suite.columns["Read2"] = TestColumn{id: uuid.New(), boardId: suite.boards["Read"].id, name: "Read Column", index: 1}

	// test notes
	suite.notes = make(map[string]DatabaseNote, 11) // todo: map iteration order is not defined. This can lead to an error when insering a stack in the wrong order and the base of the stack is not yet inserted
	// test notes for writing
	suite.notes["Update"] = DatabaseNote{ID: uuid.New(), Author: suite.users["Stan"].id, Board: suite.boards["Write"].id, Column: suite.columns["Write1"].id, Text: "This is a note"}
	suite.notes["Delete"] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Write"].id, Column: suite.columns["Write2"].id, Text: "Also a note"}
	suite.notes["DeleteStack1"] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Write"].id, Column: suite.columns["Write2"].id, Text: "Delete stack base"}
	suite.notes["DeleteStack2"] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Write"].id, Column: suite.columns["Write2"].id, Text: "Delete stack rank 0", Stack: uuid.NullUUID{UUID: suite.notes["DeleteStack1"].ID, Valid: true}, Rank: 0}
	// test notes for stacking
	suite.notes["Stack1"] = DatabaseNote{ID: uuid.New(), Author: suite.users["Stan"].id, Board: suite.boards["Stack"].id, Column: suite.columns["Stack"].id, Text: "This the base of a stack"}
	suite.notes["Stack2"] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Stack"].id, Column: suite.columns["Stack"].id, Text: "Stack note rank 0", Stack: uuid.NullUUID{UUID: suite.notes["Stack1"].ID, Valid: true}, Rank: 0}
	suite.notes["Stack3"] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Stack"].id, Column: suite.columns["Stack"].id, Text: "Stack note rank 1", Stack: uuid.NullUUID{UUID: suite.notes["Stack1"].ID, Valid: true}, Rank: 1}
	// test notes for reading
	suite.notes["Read1"] = DatabaseNote{ID: uuid.New(), Author: suite.users["Stan"].id, Board: suite.boards["Read"].id, Column: suite.columns["Read1"].id, Text: "This is a note"}
	suite.notes["Read2"] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Read"].id, Column: suite.columns["Read1"].id, Text: "Also a note"}
	suite.notes["Read3"] = DatabaseNote{ID: uuid.New(), Author: suite.users["Stan"].id, Board: suite.boards["Read"].id, Column: suite.columns["Read2"].id, Text: "Test note"}
	suite.notes["Read4"] = DatabaseNote{ID: uuid.New(), Author: suite.users["Santa"].id, Board: suite.boards["Read"].id, Column: suite.columns["Read2"].id, Text: "I have no idea"}

	for _, user := range suite.users {
		err := databaseinitialize.InsertUser(db, user.id, user.name, string(user.accountType))
		if err != nil {
			log.Fatalf("Failed to insert test user %s", err)
		}
	}

	for _, board := range suite.boards {
		err := databaseinitialize.InsertBoard(db, board.id, board.name, "", nil, nil, "PUBLIC", true, true, true, true, false)
		if err != nil {
			log.Fatalf("Failed to insert test board %s", err)
		}
	}

	for _, session := range suite.sessions {
		err := databaseinitialize.InsertSession(db, session.userId, session.boardId, string(common.ParticipantRole), false, false, true, false)
		if err != nil {
			log.Fatalf("Failed to insert test session %s", err)
		}
	}

	for _, column := range suite.columns {
		err := databaseinitialize.InsertColumn(db, column.id, column.boardId, column.name, "", "backlog-blue", true, column.index)
		if err != nil {
			log.Fatalf("Failed to insert test board %s", err)
		}
	}

	for _, note := range suite.notes {
		err := databaseinitialize.InsertNote(db, note.ID, note.Author, note.Board, note.Column, note.Text, note.Stack, note.Rank)
		if err != nil {
			log.Fatalf("Failed to insert test notes %s", err)
		}
	}
}
