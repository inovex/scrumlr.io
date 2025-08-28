package sessionrequests

import (
	"database/sql"
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

type DatabaseSessionRequestTestSuite struct {
	suite.Suite
	container        *postgres.PostgresContainer
	db               *bun.DB
	users            map[string]TestUser
	boards           map[string]TestBoard
	sessionsRequests map[string]DatabaseBoardSessionRequest
}

func TestDatabaseSessionRequestTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseSessionRequestTestSuite))
}

func (suite *DatabaseSessionRequestTestSuite) SetupSuite() {
	container, bun := initialize.StartTestDatabase()

	suite.SeedDatabase(bun)

	suite.container = container
	suite.db = bun
}

func (suite *DatabaseSessionRequestTestSuite) TearDownSuite() {
	initialize.StopTestDatabase(suite.container)
}

func (suite *DatabaseSessionRequestTestSuite) Test_Database_Create() {
	t := suite.T()
	database := NewSessionRequestDatabase(suite.db)

	boardId := suite.boards["Write"].id
	userId := suite.users["Stan"].id

	dbRequest, err := database.Create(DatabaseBoardSessionRequestInsert{Board: boardId, User: userId})

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbRequest.Board)
	assert.Equal(t, userId, dbRequest.User)
	assert.Equal(t, RequestPending, dbRequest.Status)
	assert.NotNil(t, dbRequest.CreatedAt)
}

func (suite *DatabaseSessionRequestTestSuite) Test_Database_Create_Conflict() {
	t := suite.T()
	database := NewSessionRequestDatabase(suite.db)

	boardId := suite.boards["Write"].id
	userId := suite.users["Stan"].id

	dbRequest, err := database.Create(DatabaseBoardSessionRequestInsert{Board: boardId, User: userId})

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbRequest.Board)
	assert.Equal(t, userId, dbRequest.User)
	assert.Equal(t, RequestPending, dbRequest.Status)
	assert.NotNil(t, dbRequest.CreatedAt)
}

func (suite *DatabaseSessionRequestTestSuite) Test_Database_Update_Accepted() {
	t := suite.T()
	database := NewSessionRequestDatabase(suite.db)

	boardId := suite.boards["Write"].id
	userId := suite.users["Santa"].id

	dbRequest, err := database.Update(DatabaseBoardSessionRequestUpdate{Board: boardId, User: userId, Status: RequestAccepted})

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbRequest.Board)
	assert.Equal(t, userId, dbRequest.User)
	assert.Equal(t, RequestAccepted, dbRequest.Status)
	assert.NotNil(t, dbRequest.CreatedAt)
}

func (suite *DatabaseSessionRequestTestSuite) Test_Database_Update_Rejected() {
	t := suite.T()
	database := NewSessionRequestDatabase(suite.db)

	boardId := suite.boards["Write"].id
	userId := suite.users["Friend"].id

	dbRequest, err := database.Update(DatabaseBoardSessionRequestUpdate{Board: boardId, User: userId, Status: RequestRejected})

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbRequest.Board)
	assert.Equal(t, userId, dbRequest.User)
	assert.Equal(t, RequestRejected, dbRequest.Status)
	assert.NotNil(t, dbRequest.CreatedAt)
}

func (suite *DatabaseSessionRequestTestSuite) Test_Database_Update_PendingFromRejected() {
	t := suite.T()
	database := NewSessionRequestDatabase(suite.db)

	boardId := suite.boards["Write"].id
	userId := suite.users["Bob"].id

	dbRequest, err := database.Update(DatabaseBoardSessionRequestUpdate{Board: boardId, User: userId, Status: RequestPending})

	assert.NotNil(t, err)
	assert.Equal(t, err, sql.ErrNoRows)
	assert.Equal(t, dbRequest, DatabaseBoardSessionRequest{})
}

func (suite *DatabaseSessionRequestTestSuite) Test_Database_Update_PendingFromAccepted() {
	t := suite.T()
	database := NewSessionRequestDatabase(suite.db)

	boardId := suite.boards["Write"].id
	userId := suite.users["Luke"].id

	dbRequest, err := database.Update(DatabaseBoardSessionRequestUpdate{Board: boardId, User: userId, Status: RequestPending})

	assert.NotNil(t, err)
	assert.Equal(t, err, sql.ErrNoRows)
	assert.Equal(t, dbRequest, DatabaseBoardSessionRequest{})
}

func (suite *DatabaseSessionRequestTestSuite) Test_Database_Update_RejectedFromAccepted() {
	t := suite.T()
	database := NewSessionRequestDatabase(suite.db)

	boardId := suite.boards["Write"].id
	userId := suite.users["Leia"].id

	dbRequest, err := database.Update(DatabaseBoardSessionRequestUpdate{Board: boardId, User: userId, Status: RequestRejected})

	assert.NotNil(t, err)
	assert.Equal(t, err, sql.ErrNoRows)
	assert.Equal(t, dbRequest, DatabaseBoardSessionRequest{})
}

func (suite *DatabaseSessionRequestTestSuite) Test_Database_Get() {
	t := suite.T()
	database := NewSessionRequestDatabase(suite.db)

	dbRequest, err := database.Get(suite.sessionsRequests["Read1"].Board, suite.sessionsRequests["Read1"].User)

	assert.Nil(t, err)
	assert.Equal(t, suite.sessionsRequests["Read1"].Board, dbRequest.Board)
	assert.Equal(t, suite.sessionsRequests["Read1"].User, dbRequest.User)
	assert.Equal(t, suite.sessionsRequests["Read1"].Status, dbRequest.Status)
	assert.NotNil(t, dbRequest.CreatedAt)
}

func (suite *DatabaseSessionRequestTestSuite) Test_Database_Get_NotFound() {
	t := suite.T()
	database := NewSessionRequestDatabase(suite.db)

	dbRequest, err := database.Get(uuid.New(), uuid.New())

	assert.NotNil(t, err)
	assert.Equal(t, err, sql.ErrNoRows)
	assert.Equal(t, dbRequest, DatabaseBoardSessionRequest{})
}

func (suite *DatabaseSessionRequestTestSuite) Test_Database_GetAll_Accepted() {
	t := suite.T()
	database := NewSessionRequestDatabase(suite.db)

	dbRequests, err := database.GetAll(suite.boards["Read"].id, RequestAccepted)

	assert.Nil(t, err)
	assert.Len(t, dbRequests, 1)

	assert.Equal(t, suite.sessionsRequests["Read1"].Board, dbRequests[0].Board)
	assert.Equal(t, suite.sessionsRequests["Read1"].User, dbRequests[0].User)
	assert.Equal(t, suite.sessionsRequests["Read1"].Status, dbRequests[0].Status)
	assert.NotNil(t, dbRequests[0].CreatedAt)
}

func (suite *DatabaseSessionRequestTestSuite) Test_Database_GetAll_Pending() {
	t := suite.T()
	database := NewSessionRequestDatabase(suite.db)

	dbRequests, err := database.GetAll(suite.boards["Read"].id, RequestPending)

	assert.Nil(t, err)
	assert.Len(t, dbRequests, 2)

	firstSessionRequest := checkSessioRequestInList(dbRequests, suite.sessionsRequests["Read2"].Board, suite.sessionsRequests["Read2"].User)
	assert.NotNil(t, firstSessionRequest)
	assert.Equal(t, suite.sessionsRequests["Read2"].Board, firstSessionRequest.Board)
	assert.Equal(t, suite.sessionsRequests["Read2"].User, firstSessionRequest.User)
	assert.Equal(t, suite.sessionsRequests["Read2"].Status, firstSessionRequest.Status)
	assert.NotNil(t, firstSessionRequest.CreatedAt)

	secondSessionRequest := checkSessioRequestInList(dbRequests, suite.sessionsRequests["Read3"].Board, suite.sessionsRequests["Read3"].User)
	assert.NotNil(t, secondSessionRequest)
	assert.Equal(t, suite.sessionsRequests["Read3"].Board, secondSessionRequest.Board)
	assert.Equal(t, suite.sessionsRequests["Read3"].User, secondSessionRequest.User)
	assert.Equal(t, suite.sessionsRequests["Read3"].Status, secondSessionRequest.Status)
	assert.NotNil(t, secondSessionRequest.CreatedAt)
}

func (suite *DatabaseSessionRequestTestSuite) Test_Database_GetAll_Rejected() {
	t := suite.T()
	database := NewSessionRequestDatabase(suite.db)

	dbRequests, err := database.GetAll(suite.boards["Read"].id, RequestRejected)

	assert.Nil(t, err)
	assert.Len(t, dbRequests, 1)

	assert.Equal(t, suite.sessionsRequests["Read4"].Board, dbRequests[0].Board)
	assert.Equal(t, suite.sessionsRequests["Read4"].User, dbRequests[0].User)
	assert.Equal(t, suite.sessionsRequests["Read4"].Status, dbRequests[0].Status)
	assert.NotNil(t, dbRequests[0].CreatedAt)
}

func (suite *DatabaseSessionRequestTestSuite) Test_Database_GetAll_Multifilter() {
	t := suite.T()
	database := NewSessionRequestDatabase(suite.db)

	dbRequests, err := database.GetAll(suite.boards["Read"].id, RequestAccepted, RequestPending)

	assert.Nil(t, err)
	assert.Len(t, dbRequests, 3)

	firstSessionRequest := checkSessioRequestInList(dbRequests, suite.sessionsRequests["Read1"].Board, suite.sessionsRequests["Read1"].User)
	assert.NotNil(t, firstSessionRequest)
	assert.Equal(t, suite.sessionsRequests["Read1"].Board, firstSessionRequest.Board)
	assert.Equal(t, suite.sessionsRequests["Read1"].User, firstSessionRequest.User)
	assert.Equal(t, suite.sessionsRequests["Read1"].Status, firstSessionRequest.Status)
	assert.NotNil(t, firstSessionRequest.CreatedAt)

	secondSessionRequest := checkSessioRequestInList(dbRequests, suite.sessionsRequests["Read2"].Board, suite.sessionsRequests["Read2"].User)
	assert.NotNil(t, secondSessionRequest)
	assert.Equal(t, suite.sessionsRequests["Read2"].Board, secondSessionRequest.Board)
	assert.Equal(t, suite.sessionsRequests["Read2"].User, secondSessionRequest.User)
	assert.Equal(t, suite.sessionsRequests["Read2"].Status, secondSessionRequest.Status)
	assert.NotNil(t, dbRequests[0].CreatedAt)

	thirdSessionRequest := checkSessioRequestInList(dbRequests, suite.sessionsRequests["Read3"].Board, suite.sessionsRequests["Read3"].User)
	assert.NotNil(t, thirdSessionRequest)
	assert.Equal(t, suite.sessionsRequests["Read3"].Board, thirdSessionRequest.Board)
	assert.Equal(t, suite.sessionsRequests["Read3"].User, thirdSessionRequest.User)
	assert.Equal(t, suite.sessionsRequests["Read3"].Status, thirdSessionRequest.Status)
	assert.NotNil(t, dbRequests[0].CreatedAt)
}

func (suite *DatabaseSessionRequestTestSuite) Test_Database_GetAll_NotFound() {
	t := suite.T()
	database := NewSessionRequestDatabase(suite.db)

	dbRequests, err := database.GetAll(uuid.New(), RequestPending)

	assert.Nil(t, err)
	assert.Len(t, dbRequests, 0)
}

func (suite *DatabaseSessionRequestTestSuite) Test_Database_Exists() {
	t := suite.T()
	database := NewSessionRequestDatabase(suite.db)

	exists, err := database.Exists(suite.boards["Read"].id, suite.users["Stan"].id)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func (suite *DatabaseSessionRequestTestSuite) Test_Database_NotExists() {
	t := suite.T()
	database := NewSessionRequestDatabase(suite.db)

	exists, err := database.Exists(uuid.New(), suite.users["Stan"].id)

	assert.Nil(t, err)
	assert.False(t, exists)
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

func (suite *DatabaseSessionRequestTestSuite) SeedDatabase(db *bun.DB) {
	// tests users
	suite.users = make(map[string]TestUser, 6)
	suite.users["Stan"] = TestUser{id: uuid.New(), name: "Stan", accountType: common.Google}
	suite.users["Friend"] = TestUser{id: uuid.New(), name: "Friend", accountType: common.Anonymous}
	suite.users["Santa"] = TestUser{id: uuid.New(), name: "Santa", accountType: common.Anonymous}
	suite.users["Bob"] = TestUser{id: uuid.New(), name: "Bob", accountType: common.Anonymous}
	suite.users["Luke"] = TestUser{id: uuid.New(), name: "Luke", accountType: common.Anonymous}
	suite.users["Leia"] = TestUser{id: uuid.New(), name: "Leia", accountType: common.Anonymous}

	// test boards
	suite.boards = make(map[string]TestBoard, 2)
	suite.boards["Write"] = TestBoard{id: uuid.New(), name: "Write"}
	suite.boards["Read"] = TestBoard{id: uuid.New(), name: "Read"}

	// test session requests
	suite.sessionsRequests = make(map[string]DatabaseBoardSessionRequest, 10)
	//test session requests for writing
	suite.sessionsRequests["Write"] = DatabaseBoardSessionRequest{User: suite.users["Stan"].id, Board: suite.boards["Write"].id, Status: RequestPending}
	suite.sessionsRequests["UpdateAccepted"] = DatabaseBoardSessionRequest{User: suite.users["Santa"].id, Board: suite.boards["Write"].id, Status: RequestPending}
	suite.sessionsRequests["UpdateRejected"] = DatabaseBoardSessionRequest{User: suite.users["Friend"].id, Board: suite.boards["Write"].id, Status: RequestPending}
	suite.sessionsRequests["UpdatePending"] = DatabaseBoardSessionRequest{User: suite.users["Bob"].id, Board: suite.boards["Write"].id, Status: RequestRejected}
	suite.sessionsRequests["UpdateAccptedToPending"] = DatabaseBoardSessionRequest{User: suite.users["Luke"].id, Board: suite.boards["Write"].id, Status: RequestAccepted}
	suite.sessionsRequests["UpdateAcceptedToRejected"] = DatabaseBoardSessionRequest{User: suite.users["Leia"].id, Board: suite.boards["Write"].id, Status: RequestAccepted}

	// test session requests for reading
	suite.sessionsRequests["Read1"] = DatabaseBoardSessionRequest{User: suite.users["Stan"].id, Board: suite.boards["Read"].id, Status: RequestAccepted}
	suite.sessionsRequests["Read2"] = DatabaseBoardSessionRequest{User: suite.users["Friend"].id, Board: suite.boards["Read"].id, Status: RequestPending}
	suite.sessionsRequests["Read3"] = DatabaseBoardSessionRequest{User: suite.users["Santa"].id, Board: suite.boards["Read"].id, Status: RequestPending}
	suite.sessionsRequests["Read4"] = DatabaseBoardSessionRequest{User: suite.users["Bob"].id, Board: suite.boards["Read"].id, Status: RequestRejected}

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

	for _, sessionRequest := range suite.sessionsRequests {
		err := initialize.InsertSessionRequest(db, sessionRequest.User, sessionRequest.Board, string(sessionRequest.Status))
		if err != nil {
			log.Fatalf("Failed to insert test session requests %s", err)
		}
	}
}

func checkSessioRequestInList(list []DatabaseBoardSessionRequest, boardId uuid.UUID, userId uuid.UUID) *DatabaseBoardSessionRequest {
	for _, request := range list {
		if request.Board == boardId && request.User == userId {
			return &request
		}
	}
	return nil
}
