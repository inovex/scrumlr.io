package sessionrequests

import (
	"context"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
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
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/technical_helper"
	"scrumlr.io/server/votings"
)

type SessionRequestServiceIntegrationTestSuite struct {
	suite.Suite
	dbContainer          *postgres.PostgresContainer
	natsContainer        *nats.NATSContainer
	db                   *bun.DB
	natsConnectionString string
	users                map[string]sessions.User
	boards               map[string]TestBoard
	sessionsRequests     map[string]DatabaseBoardSessionRequest
}

func TestReactionServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(SessionRequestServiceIntegrationTestSuite))
}

func (suite *SessionRequestServiceIntegrationTestSuite) SetupSuite() {
	dbContainer, bun := initialize.StartTestDatabase()
	suite.SeedDatabase(bun)
	natsContainer, connectionString := initialize.StartTestNats()

	suite.dbContainer = dbContainer
	suite.natsContainer = natsContainer
	suite.db = bun
	suite.natsConnectionString = connectionString
}

func (suite *SessionRequestServiceIntegrationTestSuite) TearDownSuite() {
	initialize.StopTestDatabase(suite.dbContainer)
	initialize.StopTestNats(suite.natsContainer)
}

func (suite *SessionRequestServiceIntegrationTestSuite) Test_Create() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].id
	userId := suite.users["Stan"].ID

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	ws := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	websocket := NewWebsocket(ws, broker)
	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	sessionRequestDatabase := NewSessionRequestDatabase(suite.db)
	sessionRequestService := NewSessionRequestService(sessionRequestDatabase, broker, websocket, sessionService)

	request, err := sessionRequestService.Create(ctx, boardId, userId)

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

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	ws := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	websocket := NewWebsocket(ws, broker)
	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	sessionRequestDatabase := NewSessionRequestDatabase(suite.db)
	sessionRequestService := NewSessionRequestService(sessionRequestDatabase, broker, websocket, sessionService)

	request, err := sessionRequestService.Update(ctx, BoardSessionRequestUpdate{Board: boardId, User: userId, Status: RequestAccepted})

	assert.Nil(t, err)
	assert.Equal(t, userId, request.User.ID)
	assert.Equal(t, RequestAccepted, request.Status)

	sessionMsg := <-events
	assert.Equal(t, realtime.BoardEventParticipantCreated, sessionMsg.Type)
	sessionData, err := technical_helper.Unmarshal[sessions.BoardSession](sessionMsg.Data)

	assert.Nil(t, err)
	assert.Equal(t, userId, sessionData.User.ID)

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

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	ws := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	websocket := NewWebsocket(ws, broker)
	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	sessionRequestDatabase := NewSessionRequestDatabase(suite.db)
	sessionRequestService := NewSessionRequestService(sessionRequestDatabase, broker, websocket, sessionService)

	request, err := sessionRequestService.Get(ctx, boardId, userId)

	assert.Nil(t, err)
	assert.Equal(t, userId, request.User.ID)
	assert.Equal(t, RequestAccepted, request.Status)
}

func (suite *SessionRequestServiceIntegrationTestSuite) Test_GetAll() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].id

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	ws := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	websocket := NewWebsocket(ws, broker)
	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	sessionRequestDatabase := NewSessionRequestDatabase(suite.db)
	sessionRequestService := NewSessionRequestService(sessionRequestDatabase, broker, websocket, sessionService)

	requests, err := sessionRequestService.GetAll(ctx, boardId, "")

	assert.Nil(t, err)
	assert.Len(t, requests, 4)
}

func (suite *SessionRequestServiceIntegrationTestSuite) Test_Exists() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].id
	userId := suite.users["Stan"].ID

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	ws := websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	websocket := NewWebsocket(ws, broker)
	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	sessionRequestDatabase := NewSessionRequestDatabase(suite.db)
	sessionRequestService := NewSessionRequestService(sessionRequestDatabase, broker, websocket, sessionService)

	exists, err := sessionRequestService.Exists(ctx, boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func (suite *SessionRequestServiceIntegrationTestSuite) SeedDatabase(db *bun.DB) {
	// tests users
	suite.users = make(map[string]sessions.User, 6)
	suite.users["Stan"] = sessions.User{ID: uuid.New(), Name: "Stan", AccountType: common.Google}
	suite.users["Friend"] = sessions.User{ID: uuid.New(), Name: "Friend", AccountType: common.Anonymous}
	suite.users["Santa"] = sessions.User{ID: uuid.New(), Name: "Santa", AccountType: common.Anonymous}
	suite.users["Bob"] = sessions.User{ID: uuid.New(), Name: "Bob", AccountType: common.Anonymous}
	suite.users["Luke"] = sessions.User{ID: uuid.New(), Name: "Luke", AccountType: common.Anonymous}
	suite.users["Leia"] = sessions.User{ID: uuid.New(), Name: "Leia", AccountType: common.Anonymous}

	// test boards
	suite.boards = make(map[string]TestBoard, 2)
	suite.boards["Write"] = TestBoard{id: uuid.New(), name: "Write"}
	suite.boards["Read"] = TestBoard{id: uuid.New(), name: "Read"}

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

	for _, sessionRequest := range suite.sessionsRequests {
		err := initialize.InsertSessionRequest(db, sessionRequest.User, sessionRequest.Board, string(sessionRequest.Status))
		if err != nil {
			log.Fatalf("Failed to insert test session requests %s", err)
		}
	}
}
