package notes

import (
	"context"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/nats"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/initialize/testDbTemplates"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/technical_helper"
)

type NoteServiceIntegrationTestSuite struct {
	suite.Suite
	natsContainer        *nats.NATSContainer
	natsConnectionString string
	baseData             testDbTemplates.DbBaseIDs
	broker               *realtime.Broker
	noteService          NotesService

	// Additional test-specific data
	boards  map[string]testDbTemplates.TestBoard
	columns map[string]testDbTemplates.TestColumn
	notes   []DatabaseNote
}

func TestNoteServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(NoteServiceIntegrationTestSuite))
}

func (suite *NoteServiceIntegrationTestSuite) SetupSuite() {
	natsContainer, connectionString := initialize.StartTestNats()

	suite.natsContainer = natsContainer
	suite.natsConnectionString = connectionString
	suite.baseData = testDbTemplates.GetBaseIDs()
	suite.initTestData()
}

func (suite *NoteServiceIntegrationTestSuite) TearDownSuite() {
	initialize.StopTestNats(suite.natsContainer)
}

func (suite *NoteServiceIntegrationTestSuite) SetupTest() {
	db := testDbTemplates.NewBaseTestDB(
		suite.T(),
		true,
		testDbTemplates.AdditionalSeed{
			Name: "notes_test",
			Func: suite.seedNotesTestData,
		},
	)

	broker, err := realtime.NewNats(suite.natsConnectionString)
	require.NoError(suite.T(), err, "Failed to connect to nats server")
	suite.broker = broker

	database := NewNotesDatabase(db)
	boardLastModifiedUpdater := NewMockBoardLastModifiedUpdater(suite.T())
	suite.noteService = NewNotesService(database, broker, boardLastModifiedUpdater)
}

func (suite *NoteServiceIntegrationTestSuite) initTestData() {
	suite.boards = map[string]testDbTemplates.TestBoard{
		"Write":  {Name: "NotesWrite", ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560001")},
		"Update": {Name: "NotesUpdate", ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560002")},
		"Delete": {Name: "NotesDelete", ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560003")},
		"Stack":  {Name: "NotesStack", ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560004")},
		"Read":   {Name: "NotesRead", ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560005")},
	}

	suite.columns = map[string]testDbTemplates.TestColumn{
		"Write":        {Name: "Write Column", ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560101"), BoardID: suite.boards["Write"].ID},
		"Update":       {Name: "Update Column", ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560102"), BoardID: suite.boards["Update"].ID},
		"UpdateUp":     {Name: "Update Up Column", ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560103"), BoardID: suite.boards["Update"].ID},
		"UpdateDown":   {Name: "Update Down Column", ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560104"), BoardID: suite.boards["Update"].ID},
		"UpdateStack1": {Name: "Update Stack1 Column", ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560105"), BoardID: suite.boards["Update"].ID},
		"UpdateStack2": {Name: "Update Stack2 Column", ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560106"), BoardID: suite.boards["Update"].ID},
		"Delete":       {Name: "Delete Column", ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560107"), BoardID: suite.boards["Delete"].ID},
		"DeleteStack":  {Name: "Delete Stack Column", ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560108"), BoardID: suite.boards["Delete"].ID},
		"Stack":        {Name: "Stack Column", ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560109"), BoardID: suite.boards["Stack"].ID},
		"Read1":        {Name: "Read1 Column", ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560110"), BoardID: suite.boards["Read"].ID},
		"Read2":        {Name: "Read2 Column", ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560111"), BoardID: suite.boards["Read"].ID},
	}

	stanID := suite.baseData.Users["Stan"].ID
	santaID := suite.baseData.Users["Santa"].ID

	// Test notes - using slice to maintain order
	suite.notes = make([]DatabaseNote, 27)
	// Update board notes
	suite.notes[0] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560200"), Author: stanID, Board: suite.boards["Update"].ID, Column: suite.columns["Update"].ID, Text: "This text is not yet updated", Rank: 0}
	suite.notes[1] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560201"), Author: stanID, Board: suite.boards["Update"].ID, Column: suite.columns["UpdateUp"].ID, Text: "This is a note", Rank: 0}
	suite.notes[2] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560202"), Author: stanID, Board: suite.boards["Update"].ID, Column: suite.columns["UpdateUp"].ID, Text: "This is a note", Rank: 1}
	suite.notes[3] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560203"), Author: stanID, Board: suite.boards["Update"].ID, Column: suite.columns["UpdateUp"].ID, Text: "This is a note", Rank: 2}
	suite.notes[4] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560204"), Author: stanID, Board: suite.boards["Update"].ID, Column: suite.columns["UpdateDown"].ID, Text: "This is a note", Rank: 0}
	suite.notes[5] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560205"), Author: stanID, Board: suite.boards["Update"].ID, Column: suite.columns["UpdateDown"].ID, Text: "This is a note", Rank: 1}
	suite.notes[6] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560206"), Author: stanID, Board: suite.boards["Update"].ID, Column: suite.columns["UpdateDown"].ID, Text: "This is a note", Rank: 2}
	suite.notes[7] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560207"), Author: stanID, Board: suite.boards["Update"].ID, Column: suite.columns["UpdateDown"].ID, Text: "This is a note", Rank: 3}
	suite.notes[8] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560208"), Author: santaID, Board: suite.boards["Update"].ID, Column: suite.columns["UpdateStack1"].ID, Text: "Update stack base"}
	suite.notes[9] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560209"), Author: santaID, Board: suite.boards["Update"].ID, Column: suite.columns["UpdateStack1"].ID, Text: "Update stack rank 0", Stack: uuid.NullUUID{UUID: suite.notes[8].ID, Valid: true}}
	suite.notes[10] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef123456020a"), Author: santaID, Board: suite.boards["Update"].ID, Column: suite.columns["UpdateStack1"].ID, Text: "Will become stack base"}
	suite.notes[11] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef123456020b"), Author: santaID, Board: suite.boards["Update"].ID, Column: suite.columns["UpdateStack1"].ID, Text: "Move into stack"}
	suite.notes[12] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef123456020c"), Author: santaID, Board: suite.boards["Update"].ID, Column: suite.columns["UpdateStack1"].ID, Text: "Base stack"}
	suite.notes[13] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef123456020d"), Author: santaID, Board: suite.boards["Update"].ID, Column: suite.columns["UpdateStack1"].ID, Text: "First note of stack", Stack: uuid.NullUUID{UUID: suite.notes[12].ID, Valid: true}, Rank: 0}
	suite.notes[14] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef123456020e"), Author: santaID, Board: suite.boards["Update"].ID, Column: suite.columns["UpdateStack1"].ID, Text: "Second note of stack", Stack: uuid.NullUUID{UUID: suite.notes[13].ID, Valid: true}, Rank: 1}
	// Delete board notes
	suite.notes[15] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef123456020f"), Author: santaID, Board: suite.boards["Delete"].ID, Column: suite.columns["Delete"].ID, Text: "Also a note"}
	suite.notes[16] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560210"), Author: santaID, Board: suite.boards["Delete"].ID, Column: suite.columns["DeleteStack"].ID, Text: "Delete stack base"}
	suite.notes[17] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560211"), Author: santaID, Board: suite.boards["Delete"].ID, Column: suite.columns["DeleteStack"].ID, Text: "Delete stack rank 0", Stack: uuid.NullUUID{UUID: suite.notes[16].ID, Valid: true}}
	suite.notes[18] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560212"), Author: santaID, Board: suite.boards["Delete"].ID, Column: suite.columns["DeleteStack"].ID, Text: "Delete stack base"}
	suite.notes[19] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560213"), Author: santaID, Board: suite.boards["Delete"].ID, Column: suite.columns["DeleteStack"].ID, Text: "Delete stack rank 0", Stack: uuid.NullUUID{UUID: suite.notes[18].ID, Valid: true}}
	// Stack board notes
	suite.notes[20] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560214"), Author: stanID, Board: suite.boards["Stack"].ID, Column: suite.columns["Stack"].ID, Text: "This the base of a stack"}
	suite.notes[21] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560215"), Author: santaID, Board: suite.boards["Stack"].ID, Column: suite.columns["Stack"].ID, Text: "Stack note rank 0", Stack: uuid.NullUUID{UUID: suite.notes[20].ID, Valid: true}, Rank: 0}
	suite.notes[22] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560216"), Author: santaID, Board: suite.boards["Stack"].ID, Column: suite.columns["Stack"].ID, Text: "Stack note rank 1", Stack: uuid.NullUUID{UUID: suite.notes[20].ID, Valid: true}, Rank: 1}
	// Read board notes
	suite.notes[23] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560217"), Author: stanID, Board: suite.boards["Read"].ID, Column: suite.columns["Read1"].ID, Text: "This is a note", Rank: 0}
	suite.notes[24] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560218"), Author: santaID, Board: suite.boards["Read"].ID, Column: suite.columns["Read1"].ID, Text: "Also a note", Rank: 1}
	suite.notes[25] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef1234560219"), Author: stanID, Board: suite.boards["Read"].ID, Column: suite.columns["Read2"].ID, Text: "Test note", Rank: 0}
	suite.notes[26] = DatabaseNote{ID: uuid.MustParse("f1a2b3c4-d5e6-7890-abcd-ef123456021a"), Author: santaID, Board: suite.boards["Read"].ID, Column: suite.columns["Read2"].ID, Text: "I have no idea", Rank: 1}
}

func (suite *NoteServiceIntegrationTestSuite) Test_Create() {
	t := suite.T()
	ctx := context.Background()

	authorId := suite.baseData.Users["Stan"].ID
	boardId := suite.boards["Write"].ID
	columnId := suite.columns["Write"].ID
	text := "This is a created note"

	events := suite.broker.GetBoardChannel(ctx, boardId)

	note, err := suite.noteService.Create(ctx, NoteCreateRequest{Board: boardId, User: authorId, Column: columnId, Text: text})

	assert.Nil(t, err)
	assert.Equal(t, authorId, note.Author)
	assert.Equal(t, columnId, note.Position.Column)
	assert.Equal(t, 0, note.Position.Rank)
	assert.Equal(t, uuid.NullUUID{}, note.Position.Stack)
	assert.Equal(t, text, note.Text)

	msg := <-events
	assert.Equal(t, realtime.BoardEventNotesUpdated, msg.Type)
	noteData, err := technical_helper.Unmarshal[[]Note](msg.Data)
	assert.Nil(t, err)
	assert.Len(t, *noteData, 1)
}

func (suite *NoteServiceIntegrationTestSuite) Test_Import() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.baseData.Users["Santa"].ID
	boardId := suite.boards["Write"].ID
	text := "This note is imported"
	columnId := suite.columns["Write"].ID

	note, err := suite.noteService.Import(ctx, NoteImportRequest{User: userId, Board: boardId, Text: text, Position: NotePosition{Column: columnId}})

	assert.Nil(t, err)
	assert.Equal(t, userId, note.Author)
	assert.Equal(t, text, note.Text)
	assert.Equal(t, columnId, note.Position.Column)
}

func (suite *NoteServiceIntegrationTestSuite) Test_Update() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.baseData.Users["Stan"].ID
	noteId := suite.notes[1].ID
	boardId := suite.boards["Update"].ID
	columnId := suite.columns["UpdateUp"].ID
	text := "This note was updated"
	rank := 1

	events := suite.broker.GetBoardChannel(ctx, boardId)

	note, err := suite.noteService.Update(ctx, userId, NoteUpdateRequest{
		ID:     noteId,
		Board:  boardId,
		Edited: true,
		Text:   &text,
		Position: &NotePosition{
			Column: columnId,
			Rank:   rank,
		},
	})

	assert.Nil(t, err)
	assert.Equal(t, noteId, note.ID)
	assert.Equal(t, userId, note.Author)
	assert.Equal(t, text, note.Text)
	assert.Equal(t, columnId, note.Position.Column)
	assert.Equal(t, rank, note.Position.Rank)
	assert.Equal(t, uuid.NullUUID{}, note.Position.Stack)

	msg := <-events
	assert.Equal(t, realtime.BoardEventNotesUpdated, msg.Type)
	noteData, err := technical_helper.Unmarshal[[]Note](msg.Data)
	assert.Nil(t, err)
	assert.Len(t, *noteData, 15)
}

func (suite *NoteServiceIntegrationTestSuite) Test_Delete() {
	t := suite.T()
	ctx := context.Background()

	noteId := suite.notes[16].ID
	boardId := suite.boards["Delete"].ID
	userId := suite.baseData.Users["Santa"].ID
	deleteStack := true

	events := suite.broker.GetBoardChannel(ctx, boardId)

	err := suite.noteService.Delete(ctx, userId, NoteDeleteRequest{ID: noteId, Board: boardId, DeleteStack: deleteStack})

	assert.Nil(t, err)

	msgNoteDelete := <-events
	assert.Equal(t, realtime.BoardEventNoteDeleted, msgNoteDelete.Type)
	noteData, err := technical_helper.Unmarshal[[]uuid.UUID](msgNoteDelete.Data)
	assert.Nil(t, err)
	assert.Contains(t, *noteData, noteId)
}

func (suite *NoteServiceIntegrationTestSuite) Test_Get() {
	t := suite.T()
	ctx := context.Background()

	noteId := suite.notes[23].ID

	note, err := suite.noteService.Get(ctx, noteId)

	assert.Nil(t, err)
	assert.Equal(t, noteId, note.ID)
	assert.Equal(t, suite.notes[23].Author, note.Author)
	assert.Equal(t, suite.notes[23].Text, note.Text)
	assert.Equal(t, suite.notes[23].Column, note.Position.Column)
	assert.Equal(t, suite.notes[23].Rank, note.Position.Rank)
	assert.Equal(t, suite.notes[23].Stack, note.Position.Stack)
	assert.Equal(t, suite.notes[23].Edited, note.Edited)
}

func (suite *NoteServiceIntegrationTestSuite) Test_Get_NotFound() {
	t := suite.T()
	ctx := context.Background()

	noteId := uuid.New()

	note, err := suite.noteService.Get(ctx, noteId)

	assert.Nil(t, note)
	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func (suite *NoteServiceIntegrationTestSuite) Test_GetAll() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].ID
	columnId := suite.columns["Read1"].ID

	notes, err := suite.noteService.GetAll(ctx, boardId, columnId)

	assert.Nil(t, err)
	assert.Len(t, notes, 2)

	assert.Equal(t, suite.notes[23].ID, notes[1].ID)
	assert.Equal(t, suite.notes[23].Author, notes[1].Author)
	assert.Equal(t, suite.notes[23].Text, notes[1].Text)
	assert.Equal(t, suite.notes[23].Column, notes[1].Position.Column)
	assert.Equal(t, suite.notes[23].Rank, notes[1].Position.Rank)
	assert.Equal(t, suite.notes[23].Stack, notes[1].Position.Stack)
	assert.Equal(t, suite.notes[23].Edited, notes[1].Edited)

	assert.Equal(t, suite.notes[24].ID, notes[0].ID)
	assert.Equal(t, suite.notes[24].Author, notes[0].Author)
	assert.Equal(t, suite.notes[24].Text, notes[0].Text)
	assert.Equal(t, suite.notes[24].Column, notes[0].Position.Column)
	assert.Equal(t, suite.notes[24].Rank, notes[0].Position.Rank)
	assert.Equal(t, suite.notes[24].Stack, notes[0].Position.Stack)
	assert.Equal(t, suite.notes[24].Edited, notes[0].Edited)
}

func (suite *NoteServiceIntegrationTestSuite) Test_GetStack() {
	t := suite.T()
	ctx := context.Background()

	noteId := suite.notes[20].ID

	notes, err := suite.noteService.GetStack(ctx, noteId)

	assert.Nil(t, err)
	assert.Len(t, notes, 3)

	assert.Equal(t, suite.notes[20].ID, notes[0].ID)
	assert.Equal(t, suite.notes[20].Author, notes[0].Author)
	assert.Equal(t, suite.notes[20].Text, notes[0].Text)
	assert.Equal(t, suite.notes[20].Column, notes[0].Position.Column)
	assert.Equal(t, suite.notes[20].Rank, notes[0].Position.Rank)
	assert.Equal(t, suite.notes[20].Stack, notes[0].Position.Stack)
	assert.Equal(t, suite.notes[20].Edited, notes[0].Edited)

	assert.Equal(t, suite.notes[21].ID, notes[1].ID)
	assert.Equal(t, suite.notes[21].Author, notes[1].Author)
	assert.Equal(t, suite.notes[21].Text, notes[1].Text)
	assert.Equal(t, suite.notes[21].Column, notes[1].Position.Column)
	assert.Equal(t, suite.notes[21].Rank, notes[1].Position.Rank)
	assert.Equal(t, suite.notes[21].Stack, notes[1].Position.Stack)
	assert.Equal(t, suite.notes[21].Edited, notes[1].Edited)

	assert.Equal(t, suite.notes[22].ID, notes[2].ID)
	assert.Equal(t, suite.notes[22].Author, notes[2].Author)
	assert.Equal(t, suite.notes[22].Text, notes[2].Text)
	assert.Equal(t, suite.notes[22].Column, notes[2].Position.Column)
	assert.Equal(t, suite.notes[22].Rank, notes[2].Position.Rank)
	assert.Equal(t, suite.notes[22].Stack, notes[2].Position.Stack)
	assert.Equal(t, suite.notes[22].Edited, notes[2].Edited)
}

func (suite *NoteServiceIntegrationTestSuite) seedNotesTestData(db *bun.DB) {
	log.Println("Seeding notes test data")

	// Insert boards
	for _, board := range suite.boards {
		if err := testDbTemplates.InsertBoard(db, board.ID, board.Name, "", nil, nil, "PUBLIC", true, true, true, true, false); err != nil {
			log.Fatalf("Failed to insert board %s: %s", board.Name, err)
		}
	}

	// Insert session for Write board
	if err := testDbTemplates.InsertSession(db, suite.baseData.Users["Stan"].ID, suite.boards["Write"].ID, string(common.ParticipantRole), false, false, true, false); err != nil {
		log.Fatalf("Failed to insert session: %s", err)
	}

	// Insert columns with proper indices
	columnIndices := map[string]int{
		"Write": 0, "Update": 0, "UpdateUp": 1, "UpdateDown": 2, "UpdateStack1": 3, "UpdateStack2": 4,
		"Delete": 0, "DeleteStack": 1, "Stack": 0, "Read1": 0, "Read2": 1,
	}
	for name, col := range suite.columns {
		if err := testDbTemplates.InsertColumn(db, col.ID, col.BoardID, col.Name, "", "backlog-blue", true, columnIndices[name]); err != nil {
			log.Fatalf("Failed to insert column %s: %s", col.Name, err)
		}
	}

	// Insert notes
	for _, note := range suite.notes {
		if err := testDbTemplates.InsertNote(db, note.ID, note.Author, note.Board, note.Column, note.Text, note.Stack, note.Rank); err != nil {
			log.Fatalf("Failed to insert note: %s", err)
		}
	}
}
