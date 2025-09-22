package sessions

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
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/technical_helper"
	"scrumlr.io/server/votings"
)

type SessionServiceIntegrationTestSuite struct {
	suite.Suite
	dbContainer          *postgres.PostgresContainer
	natsContainer        *nats.NATSContainer
	db                   *bun.DB
	natsConnectionString string
	users                map[string]User
	boards               map[string]TestBoard
	sessions             map[string]BoardSession
}

func TestSessionServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(SessionServiceIntegrationTestSuite))
}

func (suite *SessionServiceIntegrationTestSuite) SetupSuite() {
	dbContainer, bun := initialize.StartTestDatabase()
	suite.SeedDatabase(bun)
	natsContainer, connectionString := initialize.StartTestNats()

	suite.dbContainer = dbContainer
	suite.natsContainer = natsContainer
	suite.db = bun
	suite.natsConnectionString = connectionString
}

func (suite *SessionServiceIntegrationTestSuite) TearDownSuite() {
	initialize.StopTestDatabase(suite.dbContainer)
	initialize.StopTestNats(suite.natsContainer)
}

func (suite *SessionServiceIntegrationTestSuite) Test_Create() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].id
	userId := suite.users["Luke"].ID

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := NewSessionDatabase(suite.db)
	sessionService := NewSessionService(sessionDatabase, broker, columnService, noteService)

	session, err := sessionService.Create(ctx, boardId, userId)

	assert.Nil(t, err)
	assert.Equal(t, boardId, session.Board)
	assert.Equal(t, userId, session.User.ID)
	assert.Equal(t, common.ParticipantRole, session.Role)

	msg := <-events
	assert.Equal(t, realtime.BoardEventParticipantCreated, msg.Type)
	sessionData, err := technical_helper.Unmarshal[BoardSession](msg.Data)
	assert.Nil(t, err)
	assert.Equal(t, userId, sessionData.User.ID)
	assert.Equal(t, common.ParticipantRole, sessionData.Role)
}

func (suite *SessionServiceIntegrationTestSuite) Test_Update() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Update"].id
	userId := suite.users["Luke"].ID
	callerId := suite.users["Stan"].ID
	role := common.ModeratorRole

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := NewSessionDatabase(suite.db)
	sessionService := NewSessionService(sessionDatabase, broker, columnService, noteService)

	session, err := sessionService.Update(ctx, BoardSessionUpdateRequest{Caller: callerId, Board: boardId, User: userId, Role: &role})

	assert.Nil(t, err)
	assert.Equal(t, boardId, session.Board)
	assert.Equal(t, userId, session.User.ID)
	assert.Equal(t, common.ModeratorRole, session.Role)

	msgSession := <-events
	msgColumns := <-events
	msgNotes := <-events
	assert.Equal(t, realtime.BoardEventParticipantUpdated, msgSession.Type)
	assert.Equal(t, realtime.BoardEventColumnsUpdated, msgColumns.Type)
	assert.Equal(t, realtime.BoardEventNotesSync, msgNotes.Type)
	sessionData, err := technical_helper.Unmarshal[BoardSession](msgSession.Data)
	assert.Nil(t, err)
	assert.Equal(t, userId, session.User.ID)
	assert.Equal(t, common.ModeratorRole, sessionData.Role)
}

func (suite *SessionServiceIntegrationTestSuite) Test_UpdateAll() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["UpdateAll"].id
	ready := false
	raisedHand := false

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := NewSessionDatabase(suite.db)
	sessionService := NewSessionService(sessionDatabase, broker, columnService, noteService)

	sessions, err := sessionService.UpdateAll(ctx, BoardSessionsUpdateRequest{Board: boardId, Ready: &ready, RaisedHand: &raisedHand})

	assert.Nil(t, err)
	assert.Len(t, sessions, 4)

	msg := <-events
	assert.Equal(t, realtime.BoardEventParticipantsUpdated, msg.Type)
	sessionData, err := technical_helper.UnmarshalSlice[BoardSession](msg.Data)
	assert.Nil(t, err)
	assert.Len(t, sessionData, 4)
}

func (suite *SessionServiceIntegrationTestSuite) Test_UpdateUserBoard() {

}

func (suite *SessionServiceIntegrationTestSuite) Test_Get() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].id
	userId := suite.users["Santa"].ID

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := NewSessionDatabase(suite.db)
	sessionService := NewSessionService(sessionDatabase, broker, columnService, noteService)

	session, err := sessionService.Get(ctx, boardId, userId)

	assert.Nil(t, err)
	assert.Equal(t, boardId, session.Board)
	assert.Equal(t, userId, session.User.ID)
}

func (suite *SessionServiceIntegrationTestSuite) Test_GetAll() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].id

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := NewSessionDatabase(suite.db)
	sessionService := NewSessionService(sessionDatabase, broker, columnService, noteService)

	sessions, err := sessionService.GetAll(ctx, boardId, BoardSessionFilter{})
	assert.Nil(t, err)
	assert.Len(t, sessions, 4)
}

func (suite *SessionServiceIntegrationTestSuite) Test_GetUserConnectedBoards() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.users["Stan"].ID

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := NewSessionDatabase(suite.db)
	sessionService := NewSessionService(sessionDatabase, broker, columnService, noteService)

	sessions, err := sessionService.GetUserConnectedBoards(ctx, userId)

	assert.Nil(t, err)
	assert.Len(t, sessions, 2)
}

func (suite *SessionServiceIntegrationTestSuite) Test_Connect() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Update"].id
	userId := suite.users["Luke"].ID

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := NewSessionDatabase(suite.db)
	sessionService := NewSessionService(sessionDatabase, broker, columnService, noteService)

	err = sessionService.Connect(ctx, boardId, userId)

	assert.Nil(t, err)

	msg := <-events
	assert.Equal(t, realtime.BoardEventParticipantUpdated, msg.Type)
}

func (suite *SessionServiceIntegrationTestSuite) Test_Disconnect() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Update"].id
	userId := suite.users["Leia"].ID

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := NewSessionDatabase(suite.db)
	sessionService := NewSessionService(sessionDatabase, broker, columnService, noteService)

	err = sessionService.Disconnect(ctx, boardId, userId)

	assert.Nil(t, err)

	msgColumn := <-events
	msgNote := <-events
	assert.Equal(t, realtime.BoardEventColumnsUpdated, msgColumn.Type)
	assert.Equal(t, realtime.BoardEventNotesSync, msgNote.Type)
}

func (suite *SessionServiceIntegrationTestSuite) Test_Exists() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].id
	userId := suite.users["Stan"].ID

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := NewSessionDatabase(suite.db)
	sessionService := NewSessionService(sessionDatabase, broker, columnService, noteService)

	exists, err := sessionService.Exists(ctx, boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func (suite *SessionServiceIntegrationTestSuite) Test_ModeratorExists() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].id
	userId := suite.users["Stan"].ID

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := NewSessionDatabase(suite.db)
	sessionService := NewSessionService(sessionDatabase, broker, columnService, noteService)

	exists, err := sessionService.ModeratorSessionExists(ctx, boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func (suite *SessionServiceIntegrationTestSuite) Test_IsParticipantBanned() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].id
	userId := suite.users["Bob"].ID

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := NewSessionDatabase(suite.db)
	sessionService := NewSessionService(sessionDatabase, broker, columnService, noteService)

	banned, err := sessionService.IsParticipantBanned(ctx, boardId, userId)

	assert.Nil(t, err)
	assert.True(t, banned)
}

func (suite *SessionServiceIntegrationTestSuite) SeedDatabase(db *bun.DB) {
	// tests users
	suite.users = make(map[string]User, 7)
	suite.users["Stan"] = User{ID: uuid.New(), Name: "Stan", AccountType: common.Google}
	suite.users["Friend"] = User{ID: uuid.New(), Name: "Friend", AccountType: common.Anonymous}
	suite.users["Santa"] = User{ID: uuid.New(), Name: "Santa", AccountType: common.Anonymous}
	suite.users["Bob"] = User{ID: uuid.New(), Name: "Bob", AccountType: common.Anonymous}
	suite.users["Luke"] = User{ID: uuid.New(), Name: "Luke", AccountType: common.Anonymous}
	suite.users["Leia"] = User{ID: uuid.New(), Name: "Leia", AccountType: common.Anonymous}
	suite.users["Han"] = User{ID: uuid.New(), Name: "Han", AccountType: common.Anonymous}

	// test boards
	suite.boards = make(map[string]TestBoard, 5)
	suite.boards["Write"] = TestBoard{id: uuid.New(), name: "Write"}
	suite.boards["Update"] = TestBoard{id: uuid.New(), name: "Update"}
	suite.boards["Read"] = TestBoard{id: uuid.New(), name: "Read"}
	suite.boards["ReadFilter"] = TestBoard{id: uuid.New(), name: "ReadFilter"}
	suite.boards["UpdateAll"] = TestBoard{id: uuid.New(), name: "UpdateAll"}

	// test sessions
	suite.sessions = make(map[string]BoardSession, 16)
	// test sessions for the write board
	suite.sessions["Write"] = BoardSession{User: suite.users["Han"], Board: suite.boards["Write"].id, Role: common.ParticipantRole}
	// test sessions for the update board
	suite.sessions["UpdateOwner"] = BoardSession{User: suite.users["Stan"], Board: suite.boards["Update"].id, Role: common.OwnerRole}
	suite.sessions["UpdateParticipantModerator"] = BoardSession{User: suite.users["Luke"], Board: suite.boards["Update"].id, Role: common.ParticipantRole, Connected: true}
	suite.sessions["UpdateParticipantOwner"] = BoardSession{User: suite.users["Leia"], Board: suite.boards["Update"].id, Role: common.ParticipantRole, Connected: true}
	suite.sessions["UpdateModeratorOwner"] = BoardSession{User: suite.users["Han"], Board: suite.boards["Update"].id, Role: common.ParticipantRole}
	// test sessions for the read board
	suite.sessions["Read1"] = BoardSession{User: suite.users["Stan"], Board: suite.boards["Read"].id, Role: common.OwnerRole}
	suite.sessions["Read2"] = BoardSession{User: suite.users["Friend"], Board: suite.boards["Read"].id, Role: common.ModeratorRole}
	suite.sessions["Read3"] = BoardSession{User: suite.users["Santa"], Board: suite.boards["Read"].id, Role: common.ParticipantRole}
	suite.sessions["Read4"] = BoardSession{User: suite.users["Bob"], Board: suite.boards["Read"].id, Role: common.ParticipantRole, Banned: true}
	// test sessions for the read filter board
	suite.sessions["ReadFilter1"] = BoardSession{User: suite.users["Stan"], Board: suite.boards["ReadFilter"].id, Role: common.OwnerRole, Ready: true, Connected: true}
	suite.sessions["ReadFilter2"] = BoardSession{User: suite.users["Friend"], Board: suite.boards["ReadFilter"].id, Role: common.ModeratorRole, Ready: true}
	suite.sessions["ReadFilter3"] = BoardSession{User: suite.users["Santa"], Board: suite.boards["ReadFilter"].id, Role: common.ParticipantRole, RaisedHand: true, Connected: true}
	suite.sessions["ReadFilter4"] = BoardSession{User: suite.users["Bob"], Board: suite.boards["ReadFilter"].id, Role: common.ParticipantRole, RaisedHand: true}
	// test sessions for the update all board
	suite.sessions["UpdateAll1"] = BoardSession{User: suite.users["Stan"], Board: suite.boards["UpdateAll"].id, Role: common.OwnerRole, Connected: true, RaisedHand: true, Ready: false}
	suite.sessions["UpdateAll2"] = BoardSession{User: suite.users["Luke"], Board: suite.boards["UpdateAll"].id, Role: common.ModeratorRole, Connected: true, RaisedHand: false, Ready: true}
	suite.sessions["UpdateAll3"] = BoardSession{User: suite.users["Leia"], Board: suite.boards["UpdateAll"].id, Role: common.ParticipantRole, Connected: true, RaisedHand: false, Ready: false}
	suite.sessions["UpdateAll4"] = BoardSession{User: suite.users["Han"], Board: suite.boards["UpdateAll"].id, Role: common.ParticipantRole, Connected: true, RaisedHand: true, Ready: true}

	for _, user := range suite.users {
		err := initialize.InsertUser(db, user.ID, user.Name, string(user.AccountType))
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
		err := initialize.InsertSession(db, session.User.ID, session.Board, string(session.Role), session.Banned, session.Ready, session.Connected, session.RaisedHand)
		if err != nil {
			log.Fatalf("Failed to insert test sessions %s", err)
		}
	}
}
