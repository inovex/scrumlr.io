package sessions

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
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/initialize/testDbTemplates"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/technical_helper"
)

type SessionServiceIntegrationTestSuite struct {
	suite.Suite
	natsContainer        *nats.NATSContainer
	natsConnectionString string
	baseData             testDbTemplates.DbBaseIDs
	db                   *bun.DB
	broker               *realtime.Broker
	sessionService       SessionService

	// Additional test-specific data
	users  map[string]testDbTemplates.TestUser
	boards map[string]testDbTemplates.TestBoard
}

func TestSessionServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(SessionServiceIntegrationTestSuite))
}

func (suite *SessionServiceIntegrationTestSuite) SetupSuite() {
	natsContainer, connectionString := initialize.StartTestNats()

	suite.natsContainer = natsContainer
	suite.natsConnectionString = connectionString
	suite.baseData = testDbTemplates.GetBaseIDs()
	suite.initTestData()
}

func (suite *SessionServiceIntegrationTestSuite) TearDownSuite() {
	initialize.StopTestNats(suite.natsContainer)
}

func (suite *SessionServiceIntegrationTestSuite) SetupTest() {
	db := testDbTemplates.NewBaseTestDB(
		suite.T(),
		true,
		testDbTemplates.AdditionalSeed{
			Name: "sessions_test",
			Func: suite.seedSessionsTestData,
		},
	)
	suite.db = db

	broker, err := realtime.NewNats(suite.natsConnectionString)
	require.NoError(suite.T(), err, "Failed to connect to nats server")
	suite.broker = broker

	boardLastModifiedUpdater := common.NewSimpleBoardLastModifiedUpdater(db)
	noteDatabase := notes.NewNotesDatabase(db)
	noteService := notes.NewNotesService(noteDatabase, broker, boardLastModifiedUpdater)
	columnDatabase := columns.NewColumnsDatabase(db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService, boardLastModifiedUpdater)
	sessionDatabase := NewSessionDatabase(db)
	suite.sessionService = NewSessionService(sessionDatabase, broker, columnService, noteService)
}

func (suite *SessionServiceIntegrationTestSuite) initTestData() {
	// Additional users not in base seed
	suite.users = map[string]testDbTemplates.TestUser{
		"Friend": {Name: "Friend", ID: uuid.MustParse("d1e2f3a4-b5c6-7890-abcd-ef1234567001"), AccountType: common.Anonymous},
		"Bob":    {Name: "Bob", ID: uuid.MustParse("d1e2f3a4-b5c6-7890-abcd-ef1234567002"), AccountType: common.Anonymous},
		"Luke":   {Name: "Luke", ID: uuid.MustParse("d1e2f3a4-b5c6-7890-abcd-ef1234567003"), AccountType: common.Anonymous},
		"Leia":   {Name: "Leia", ID: uuid.MustParse("d1e2f3a4-b5c6-7890-abcd-ef1234567004"), AccountType: common.Anonymous},
		"Han":    {Name: "Han", ID: uuid.MustParse("d1e2f3a4-b5c6-7890-abcd-ef1234567005"), AccountType: common.Anonymous},
	}

	// Test boards
	suite.boards = map[string]testDbTemplates.TestBoard{
		"Write":      {Name: "SessionsWrite", ID: uuid.MustParse("e1f2a3b4-c5d6-7890-abcd-ef1234567010")},
		"Update":     {Name: "SessionsUpdate", ID: uuid.MustParse("e1f2a3b4-c5d6-7890-abcd-ef1234567011")},
		"Read":       {Name: "SessionsRead", ID: uuid.MustParse("e1f2a3b4-c5d6-7890-abcd-ef1234567012")},
		"ReadFilter": {Name: "SessionsReadFilter", ID: uuid.MustParse("e1f2a3b4-c5d6-7890-abcd-ef1234567013")},
		"UpdateAll":  {Name: "SessionsUpdateAll", ID: uuid.MustParse("e1f2a3b4-c5d6-7890-abcd-ef1234567014")},
	}
}

func (suite *SessionServiceIntegrationTestSuite) Test_Create() {
	ctx := context.Background()

	// given
	boardId := suite.boards["Write"].ID
	userId := suite.users["Luke"].ID
	role := common.ParticipantRole

	events := suite.broker.GetBoardChannel(ctx, boardId)

	// when
	session, err := suite.sessionService.Create(ctx, BoardSessionCreateRequest{Board: boardId, User: userId, Role: role})

	// then
	suite.Nil(err)
	suite.Equal(boardId, session.Board)
	suite.Equal(userId, session.UserID)
	suite.Equal(role, session.Role)

	msg := <-events
	suite.Equal(realtime.BoardEventParticipantCreated, msg.Type)
	sessionData, err := technical_helper.Unmarshal[BoardSession](msg.Data)
	suite.Nil(err)
	suite.Equal(userId, sessionData.UserID)
	suite.Equal(role, sessionData.Role)
}

func (suite *SessionServiceIntegrationTestSuite) Test_Update() {
	ctx := context.Background()

	// given
	boardId := suite.boards["Update"].ID
	userId := suite.users["Luke"].ID
	callerId := suite.baseData.Users["Stan"].ID
	role := common.ModeratorRole

	events := suite.broker.GetBoardChannel(ctx, boardId)

	// when
	session, err := suite.sessionService.Update(ctx, BoardSessionUpdateRequest{Caller: callerId, Board: boardId, User: userId, Role: &role})

	// then
	suite.Nil(err)
	suite.Equal(boardId, session.Board)
	suite.Equal(userId, session.UserID)
	suite.Equal(common.ModeratorRole, session.Role)

	msgSession := <-events
	msgColumns := <-events
	msgNotes := <-events
	suite.Equal(realtime.BoardEventParticipantUpdated, msgSession.Type)
	suite.Equal(realtime.BoardEventColumnsUpdated, msgColumns.Type)
	suite.Equal(realtime.BoardEventNotesSync, msgNotes.Type)
	sessionData, err := technical_helper.Unmarshal[BoardSession](msgSession.Data)
	suite.Nil(err)
	suite.Equal(userId, session.UserID)
	suite.Equal(common.ModeratorRole, sessionData.Role)
}

func (suite *SessionServiceIntegrationTestSuite) Test_UpdateAll() {
	// given
	ctx := context.Background()

	boardId := suite.boards["UpdateAll"].ID
	ready := false
	raisedHand := false

	events := suite.broker.GetBoardChannel(ctx, boardId)

	// when
	sessions, err := suite.sessionService.UpdateAll(ctx, BoardSessionsUpdateRequest{Board: boardId, Ready: &ready, RaisedHand: &raisedHand})

	// then
	suite.Nil(err)
	suite.Len(sessions, 4)

	msg := <-events
	suite.Equal(realtime.BoardEventParticipantsUpdated, msg.Type)
	sessionData, err := technical_helper.UnmarshalSlice[BoardSession](msg.Data)
	suite.Nil(err)
	suite.Len(sessionData, 4)
}

func (suite *SessionServiceIntegrationTestSuite) Test_UpdateUserBoard() {

}

func (suite *SessionServiceIntegrationTestSuite) Test_Get() {
	// given
	ctx := context.Background()

	boardId := suite.boards["Read"].ID
	userId := suite.baseData.Users["Santa"].ID

	// when
	session, err := suite.sessionService.Get(ctx, boardId, userId)

	// then
	suite.Nil(err)
	suite.Equal(boardId, session.Board)
	suite.Equal(userId, session.UserID)
}

func (suite *SessionServiceIntegrationTestSuite) Test_GetAll() {
	// given
	ctx := context.Background()

	boardId := suite.boards["Read"].ID

	// when
	sessions, err := suite.sessionService.GetAll(ctx, boardId, BoardSessionFilter{})

	// then
	suite.Nil(err)
	suite.Len(sessions, 4)
}

func (suite *SessionServiceIntegrationTestSuite) Test_GetUserConnectedBoards() {
	// given
	ctx := context.Background()

	userId := suite.baseData.Users["Stan"].ID

	// when
	sessions, err := suite.sessionService.GetUserConnectedBoards(ctx, userId)

	// then
	suite.Nil(err)
	suite.Len(sessions, 2)
}

func (suite *SessionServiceIntegrationTestSuite) Test_Connect() {
	// given
	ctx := context.Background()

	boardId := suite.boards["Update"].ID
	userId := suite.users["Luke"].ID

	events := suite.broker.GetBoardChannel(ctx, boardId)

	// when
	err := suite.sessionService.Connect(ctx, boardId, userId)

	// then
	suite.Nil(err)

	msg := <-events
	suite.Equal(realtime.BoardEventParticipantUpdated, msg.Type)
}

func (suite *SessionServiceIntegrationTestSuite) Test_Disconnect() {
	// given
	ctx := context.Background()

	boardId := suite.boards["Update"].ID
	userId := suite.users["Leia"].ID

	events := suite.broker.GetBoardChannel(ctx, boardId)

	// when
	err := suite.sessionService.Disconnect(ctx, boardId, userId)

	// then
	suite.Nil(err)

	msgColumn := <-events
	msgNote := <-events
	suite.Equal(realtime.BoardEventColumnsUpdated, msgColumn.Type)
	suite.Equal(realtime.BoardEventNotesSync, msgNote.Type)
}

func (suite *SessionServiceIntegrationTestSuite) Test_Exists() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].ID
	userId := suite.baseData.Users["Stan"].ID

	exists, err := suite.sessionService.Exists(ctx, boardId, userId)

	suite.Nil(err)
	assert.True(t, exists)
}

func (suite *SessionServiceIntegrationTestSuite) Test_ModeratorExists() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].ID
	userId := suite.baseData.Users["Stan"].ID

	exists, err := suite.sessionService.ModeratorSessionExists(ctx, boardId, userId)

	suite.Nil(err)
	assert.True(t, exists)
}

func (suite *SessionServiceIntegrationTestSuite) Test_IsParticipantBanned() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].ID
	userId := suite.users["Bob"].ID

	banned, err := suite.sessionService.IsParticipantBanned(ctx, boardId, userId)

	suite.Nil(err)
	assert.True(t, banned)
}

func (suite *SessionServiceIntegrationTestSuite) seedSessionsTestData(db *bun.DB) {
	log.Println("Seeding sessions test data")

	for _, user := range suite.users {
		if err := testDbTemplates.InsertUser(db, user.ID, user.Name, string(user.AccountType)); err != nil {
			log.Fatalf("Failed to insert user %s: %s", user.Name, err)
		}
	}

	for _, board := range suite.boards {
		if err := testDbTemplates.InsertBoard(db, board.ID, board.Name, "", nil, nil, "PUBLIC", true, true, true, true, false); err != nil {
			log.Fatalf("Failed to insert board %s: %s", board.Name, err)
		}
	}

	sessions := []struct {
		userID                               uuid.UUID
		boardID                              uuid.UUID
		role                                 common.SessionRole
		banned, ready, connected, raisedHand bool
	}{
		// Write board
		{suite.users["Han"].ID, suite.boards["Write"].ID, common.ParticipantRole, false, false, false, false},
		// Update board
		{suite.baseData.Users["Stan"].ID, suite.boards["Update"].ID, common.OwnerRole, false, false, false, false},
		{suite.users["Luke"].ID, suite.boards["Update"].ID, common.ParticipantRole, false, false, true, false},
		{suite.users["Leia"].ID, suite.boards["Update"].ID, common.ParticipantRole, false, false, true, false},
		{suite.users["Han"].ID, suite.boards["Update"].ID, common.ParticipantRole, false, false, false, false},
		// Read board
		{suite.baseData.Users["Stan"].ID, suite.boards["Read"].ID, common.OwnerRole, false, false, false, false},
		{suite.users["Friend"].ID, suite.boards["Read"].ID, common.ModeratorRole, false, false, false, false},
		{suite.baseData.Users["Santa"].ID, suite.boards["Read"].ID, common.ParticipantRole, false, false, false, false},
		{suite.users["Bob"].ID, suite.boards["Read"].ID, common.ParticipantRole, true, false, false, false},
		// ReadFilter board
		{suite.baseData.Users["Stan"].ID, suite.boards["ReadFilter"].ID, common.OwnerRole, false, true, true, false},
		{suite.users["Friend"].ID, suite.boards["ReadFilter"].ID, common.ModeratorRole, false, true, false, false},
		{suite.baseData.Users["Santa"].ID, suite.boards["ReadFilter"].ID, common.ParticipantRole, false, false, true, true},
		{suite.users["Bob"].ID, suite.boards["ReadFilter"].ID, common.ParticipantRole, false, false, false, true},
		// UpdateAll board
		{suite.baseData.Users["Stan"].ID, suite.boards["UpdateAll"].ID, common.OwnerRole, false, false, true, true},
		{suite.users["Luke"].ID, suite.boards["UpdateAll"].ID, common.ModeratorRole, false, true, true, false},
		{suite.users["Leia"].ID, suite.boards["UpdateAll"].ID, common.ParticipantRole, false, false, true, false},
		{suite.users["Han"].ID, suite.boards["UpdateAll"].ID, common.ParticipantRole, false, true, true, true},
	}

	for _, s := range sessions {
		if err := testDbTemplates.InsertSession(db, s.userID, s.boardID, string(s.role), s.banned, s.ready, s.connected, s.raisedHand); err != nil {
			log.Fatalf("Failed to insert session: %s", err)
		}
	}
}
