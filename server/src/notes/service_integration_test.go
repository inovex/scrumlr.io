package notes

import (
	"context"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/nats"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/technical_helper"
	"scrumlr.io/server/votings"
)

type NoteServiceIntegrationTestSuite struct {
	suite.Suite
	dbContainer          *postgres.PostgresContainer
	natsContainer        *nats.NATSContainer
	db                   *bun.DB
	natsConnectionString string
	users                map[string]TestUser
	boards               map[string]TestBoard
	sessions             map[string]TestSession
	columns              map[string]TestColumn
	notes                []DatabaseNote //map iteration order is not defined
}

func TestNoteServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(NoteServiceIntegrationTestSuite))
}

func (suite *NoteServiceIntegrationTestSuite) SetupSuite() {
	dbContainer, bun := initialize.StartTestDatabase()
	suite.SeedDatabase(bun)
	natsContainer, connectionString := initialize.StartTestNats()

	suite.dbContainer = dbContainer
	suite.natsContainer = natsContainer
	suite.db = bun
	suite.natsConnectionString = connectionString
}

func (suite *NoteServiceIntegrationTestSuite) TearDownSuite() {
	initialize.StopTestDatabase(suite.dbContainer)
	initialize.StopTestNats(suite.natsContainer)
}

func (suite *NoteServiceIntegrationTestSuite) Test_Create() {
	t := suite.T()
	ctx := context.Background()

	authorId := suite.users["Stan"].id
	boardId := suite.boards["Write"].id
	columnId := suite.columns["Write"].id
	text := "This is a created note"

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	database := NewNotesDatabase(suite.db)
	service := NewNotesService(database, broker, voteService)

	note, err := service.Create(ctx, NoteCreateRequest{Board: boardId, User: authorId, Column: columnId, Text: text})

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

	userId := suite.users["Santa"].id
	boardId := suite.boards["Write"].id
	text := "This note is imported"
	columnId := suite.columns["Write"].id

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	database := NewNotesDatabase(suite.db)
	service := NewNotesService(database, broker, voteService)

	note, err := service.Import(ctx, NoteImportRequest{User: userId, Board: boardId, Text: text, Position: NotePosition{Column: columnId}})

	assert.Nil(t, err)
	assert.Equal(t, userId, note.Author)
	assert.Equal(t, text, note.Text)
	assert.Equal(t, columnId, note.Position.Column)
}

func (suite *NoteServiceIntegrationTestSuite) Test_Update() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.users["Stan"].id
	noteId := suite.notes[1].ID
	boardId := suite.boards["Update"].id
	columnId := suite.columns["UpdateUp"].id
	text := "This note was updated"
	rank := 1

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	database := NewNotesDatabase(suite.db)
	service := NewNotesService(database, broker, voteService)

	note, err := service.Update(ctx, userId, NoteUpdateRequest{
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
	boardId := suite.boards["Delete"].id
	userId := suite.users["Santa"].id
	deleteStack := true

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	database := NewNotesDatabase(suite.db)
	service := NewNotesService(database, broker, voteService)

	err = service.Delete(ctx, userId, NoteDeleteRequest{ID: noteId, Board: boardId, DeleteStack: deleteStack})

	assert.Nil(t, err)

	msgNoteDelete := <-events
	assert.Equal(t, realtime.BoardEventNoteDeleted, msgNoteDelete.Type)
	type NoteData struct {
		Note        uuid.UUID `json:"note"`
		DeleteStack bool      `json:"deleteStack"`
	}
	noteData, err := technical_helper.Unmarshal[NoteData](msgNoteDelete.Data)
	assert.Nil(t, err)
	assert.Equal(t, noteId, noteData.Note)
	assert.Equal(t, deleteStack, noteData.DeleteStack)

	msgVoteDelete := <-events
	assert.Equal(t, realtime.BoardEventVotesDeleted, msgVoteDelete.Type)
	voteData, err := technical_helper.Unmarshal[[]*votings.Vote](msgVoteDelete.Data)
	assert.Nil(t, err)
	assert.Nil(t, voteData)
}

func (suite *NoteServiceIntegrationTestSuite) Test_Get() {
	t := suite.T()
	ctx := context.Background()

	noteId := suite.notes[23].ID

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	database := NewNotesDatabase(suite.db)
	service := NewNotesService(database, broker, voteService)

	note, err := service.Get(ctx, noteId)

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

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	database := NewNotesDatabase(suite.db)
	service := NewNotesService(database, broker, voteService)

	note, err := service.Get(ctx, noteId)

	assert.Nil(t, note)
	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func (suite *NoteServiceIntegrationTestSuite) Test_GetAll() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].id
	columnId := suite.columns["Read1"].id

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	database := NewNotesDatabase(suite.db)
	service := NewNotesService(database, broker, voteService)

	notes, err := service.GetAll(ctx, boardId, columnId)

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

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	database := NewNotesDatabase(suite.db)
	service := NewNotesService(database, broker, voteService)

	notes, err := service.GetStack(ctx, noteId)

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

func (suite *NoteServiceIntegrationTestSuite) SeedDatabase(db *bun.DB) {
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
