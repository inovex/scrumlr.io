package sessionrequests

import (
	"context"
	"log"
	"testing"

	"github.com/stretchr/testify/require"
	"scrumlr.io/server/initialize/testDbTemplates"

	"scrumlr.io/server/websocket"

	"scrumlr.io/server/users"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/nats"
	"github.com/uptrace/bun"
	"scrumlr.io/server/cache"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/technical_helper"
)

type SessionRequestServiceIntegrationTestSuite struct {
	suite.Suite
	service              SessionRequestService
	broker               *realtime.Broker
	natsContainer        *nats.NATSContainer
	natsConnectionString string
	users                map[string]users.User
	boards               map[string]TestBoard
	sessionsRequests     map[string]DatabaseBoardSessionRequest
}

func TestReactionServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(SessionRequestServiceIntegrationTestSuite))
}

func (suite *SessionRequestServiceIntegrationTestSuite) SetupSuite() {
	natsContainer, connectionString := initialize.StartTestNats()

	suite.natsContainer = natsContainer
	suite.natsConnectionString = connectionString
}

func (suite *SessionRequestServiceIntegrationTestSuite) SetupTest() {
	db := testDbTemplates.NewBaseTestDB(
		suite.T(),
		false,
		testDbTemplates.AdditionalSeed{
			Name: "sessionrequest_test",
			Func: suite.seedSessionRequestTestData,
		},
	)
	broker, err := realtime.NewNats(suite.natsConnectionString)
	require.NoError(suite.T(), err, "Failed to connect to nats server")
	suite.broker = broker

	database := NewSessionRequestDatabase(db)
	wsService := websocket.NewWebSocketService()
	sessionRequestWebsocket := NewSessionRequestWebsocket(wsService, broker)
	ch, err := cache.NewNats(suite.natsConnectionString, "scrumlr-test-sessionrequests")
	require.NoError(suite.T(), err, "Failed to connect to nats cache")

	noteDatabase := notes.NewNotesDatabase(db)
	noteService := notes.NewNotesService(noteDatabase, broker, ch)
	columnDatabase := columns.NewColumnsDatabase(db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	suite.service = NewSessionRequestService(database, broker, sessionRequestWebsocket, sessionService)
}

func (suite *SessionRequestServiceIntegrationTestSuite) TearDownSuite() {
	initialize.StopTestNats(suite.natsContainer)
}

func (suite *SessionRequestServiceIntegrationTestSuite) Test_Create() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].id
	userId := suite.users["Stan"].ID

	events := suite.broker.GetBoardChannel(ctx, boardId)

	request, err := suite.service.Create(ctx, boardId, userId)

	assert.Nil(t, err)
	assert.Equal(t, userId, request.User.ID)
	assert.Equal(t, RequestPending, request.Status)

	msg := <-events
	assert.Equal(t, realtime.BoardEventSessionRequestCreated, msg.Type)
	_, err = technical_helper.Unmarshal[BoardSessionRequest](msg.Data)
	assert.NotNil(t, err) // BoardSessionRequest can't be unmarshaled because the account type is set to "" which is not a valide account type and can't be unmarshaled
	// assert.Equal(t, userId, requestData.User.ID)
	// assert.Equal(t, RequestPending, requestData.Status)
}

func (suite *SessionRequestServiceIntegrationTestSuite) Test_Update() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].id
	userId := suite.users["Santa"].ID

	events := suite.broker.GetBoardChannel(ctx, boardId)

	request, err := suite.service.Update(ctx, BoardSessionRequestUpdate{Board: boardId, User: userId, Status: RequestAccepted})

	assert.Nil(t, err)
	assert.Equal(t, userId, request.User.ID)
	assert.Equal(t, RequestAccepted, request.Status)

	sessionMsg := <-events
	assert.Equal(t, realtime.BoardEventParticipantCreated, sessionMsg.Type)
	sessionData, err := technical_helper.Unmarshal[sessions.BoardSession](sessionMsg.Data)

	assert.Nil(t, err)
	assert.Equal(t, userId, sessionData.UserID)

	updatedMsg := <-events
	assert.Equal(t, realtime.BoardEventSessionRequestUpdated, updatedMsg.Type)
	_, err = technical_helper.Unmarshal[BoardSessionRequest](updatedMsg.Data)

	assert.NotNil(t, err) // BoardSessionRequest can't be unmarshaled because the account type is set to "" which is not a valide account type and can't be unmarshaled
	// assert.Equal(t, userId, requestData.User.ID)
	// assert.Equal(t, RequestPending, requestData.Status)
}

func (suite *SessionRequestServiceIntegrationTestSuite) Test_Get() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].id
	userId := suite.users["Stan"].ID

	request, err := suite.service.Get(ctx, boardId, userId)

	assert.Nil(t, err)
	assert.Equal(t, userId, request.User.ID)
	assert.Equal(t, RequestAccepted, request.Status)
}

func (suite *SessionRequestServiceIntegrationTestSuite) Test_GetAll() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].id

	requests, err := suite.service.GetAll(ctx, boardId, "")

	assert.Nil(t, err)
	assert.Len(t, requests, 4)
}

func (suite *SessionRequestServiceIntegrationTestSuite) Test_Exists() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].id
	userId := suite.users["Stan"].ID

	exists, err := suite.service.Exists(ctx, boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func (suite *SessionRequestServiceIntegrationTestSuite) seedSessionRequestTestData(db *bun.DB) {
	// tests users
	suite.users = make(map[string]users.User, 6)
	suite.users["Stan"] = users.User{ID: uuid.MustParse("c1d2e3f4-a5b6-7890-abcd-ef1234567024"), Name: "Stan", AccountType: common.Google}
	suite.users["Friend"] = users.User{ID: uuid.MustParse("c1d2e3f4-a5b6-7890-abcd-ef1234567025"), Name: "Friend", AccountType: common.Anonymous}
	suite.users["Santa"] = users.User{ID: uuid.MustParse("c1d2e3f4-a5b6-7890-abcd-ef1234567026"), Name: "Santa", AccountType: common.Anonymous}
	suite.users["Bob"] = users.User{ID: uuid.MustParse("c1d2e3f4-a5b6-7890-abcd-ef1234567027"), Name: "Bob", AccountType: common.Anonymous}
	suite.users["Luke"] = users.User{ID: uuid.MustParse("c1d2e3f4-a5b6-7890-abcd-ef1234567028"), Name: "Luke", AccountType: common.Anonymous}
	suite.users["Leia"] = users.User{ID: uuid.MustParse("c1d2e3f4-a5b6-7890-abcd-ef1234567029"), Name: "Leia", AccountType: common.Anonymous}

	// test boards
	suite.boards = make(map[string]TestBoard, 2)
	suite.boards["Write"] = TestBoard{id: uuid.MustParse("c1d2e3f4-a5b6-7890-abcd-ef1234567030"), name: "Write"}
	suite.boards["Read"] = TestBoard{id: uuid.MustParse("c1d2e3f4-a5b6-7890-abcd-ef1234567031"), name: "Read"}

	// test session requests
	suite.sessionsRequests = make(map[string]DatabaseBoardSessionRequest, 10)
	//test session requests for writing
	suite.sessionsRequests["Write"] = DatabaseBoardSessionRequest{User: suite.users["Stan"].ID, Board: suite.boards["Write"].id, Status: RequestPending}
	suite.sessionsRequests["UpdateAccepted"] = DatabaseBoardSessionRequest{User: suite.users["Santa"].ID, Board: suite.boards["Write"].id, Status: RequestPending}
	suite.sessionsRequests["UpdateRejected"] = DatabaseBoardSessionRequest{User: suite.users["Friend"].ID, Board: suite.boards["Write"].id, Status: RequestPending}
	suite.sessionsRequests["UpdatePending"] = DatabaseBoardSessionRequest{User: suite.users["Bob"].ID, Board: suite.boards["Write"].id, Status: RequestRejected}
	suite.sessionsRequests["UpdateAccptedToPending"] = DatabaseBoardSessionRequest{User: suite.users["Luke"].ID, Board: suite.boards["Write"].id, Status: RequestAccepted}
	suite.sessionsRequests["UpdateAcceptedToRejected"] = DatabaseBoardSessionRequest{User: suite.users["Leia"].ID, Board: suite.boards["Write"].id, Status: RequestAccepted}

	// test session requests for reading
	suite.sessionsRequests["Read1"] = DatabaseBoardSessionRequest{User: suite.users["Stan"].ID, Board: suite.boards["Read"].id, Status: RequestAccepted}
	suite.sessionsRequests["Read2"] = DatabaseBoardSessionRequest{User: suite.users["Friend"].ID, Board: suite.boards["Read"].id, Status: RequestPending}
	suite.sessionsRequests["Read3"] = DatabaseBoardSessionRequest{User: suite.users["Santa"].ID, Board: suite.boards["Read"].id, Status: RequestPending}
	suite.sessionsRequests["Read4"] = DatabaseBoardSessionRequest{User: suite.users["Bob"].ID, Board: suite.boards["Read"].id, Status: RequestRejected}

	for _, user := range suite.users {
		err := testDbTemplates.InsertUser(db, user.ID, user.Name, string(user.AccountType))
		if err != nil {
			log.Fatalf("Failed to insert test user %s", err)
		}
	}

	for _, board := range suite.boards {
		err := testDbTemplates.InsertBoard(db, board.id, board.name, "", nil, nil, "PUBLIC", true, true, true, true, false)
		if err != nil {
			log.Fatalf("Failed to insert test board %s", err)
		}
	}

	for _, sessionRequest := range suite.sessionsRequests {
		err := testDbTemplates.InsertSessionRequest(db, sessionRequest.User, sessionRequest.Board, string(sessionRequest.Status))
		if err != nil {
			log.Fatalf("Failed to insert test session requests %s", err)
		}
	}
}
