package sessionrequests

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

func (suite *DatabaseSessionRequestTestSuite) TearDownSuite() {
	if err := testcontainers.TerminateContainer(suite.container); err != nil {
		log.Fatalf("Failed to terminate container: %s", err)
	}
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

func (suite *DatabaseSessionRequestTestSuite) Test_Database_Update() {
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

func (suite *DatabaseSessionRequestTestSuite) Test_Database_GetAll() {
	t := suite.T()
	database := NewSessionRequestDatabase(suite.db)

	dbRequests, err := database.GetAll(suite.boards["Read"].id, RequestPending)

	assert.Nil(t, err)
	assert.Len(t, dbRequests, 2)

	assert.Equal(t, suite.sessionsRequests["Read2"].Board, dbRequests[0].Board)
	assert.Equal(t, suite.sessionsRequests["Read2"].User, dbRequests[0].User)
	assert.Equal(t, suite.sessionsRequests["Read2"].Status, dbRequests[0].Status)
	assert.NotNil(t, dbRequests[0].CreatedAt)

	assert.Equal(t, suite.sessionsRequests["Read3"].Board, dbRequests[0].Board)
	assert.Equal(t, suite.sessionsRequests["Read3"].User, dbRequests[0].User)
	assert.Equal(t, suite.sessionsRequests["Read3"].Status, dbRequests[0].Status)
	assert.NotNil(t, dbRequests[0].CreatedAt)
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
	suite.users = make(map[string]TestUser, 7)
	suite.users["Stan"] = TestUser{id: uuid.New(), name: "Stan", accountType: common.Google}
	suite.users["Friend"] = TestUser{id: uuid.New(), name: "Friend", accountType: common.Anonymous}
	suite.users["Santa"] = TestUser{id: uuid.New(), name: "Santa", accountType: common.Anonymous}
	suite.users["Bob"] = TestUser{id: uuid.New(), name: "Bob", accountType: common.Anonymous}

	// test boards
	suite.boards = make(map[string]TestBoard, 2)
	suite.boards["Write"] = TestBoard{id: uuid.New(), name: "Write"}
	suite.boards["Read"] = TestBoard{id: uuid.New(), name: "Read"}

	// test session requests
	suite.sessionsRequests = make(map[string]DatabaseBoardSessionRequest, 5)
	//test session requests for writing
	suite.sessionsRequests["Write1"] = DatabaseBoardSessionRequest{User: suite.users["Santa"].id, Board: suite.boards["Write"].id, Status: RequestPending}
	// test session requests for reading
	suite.sessionsRequests["Read1"] = DatabaseBoardSessionRequest{User: suite.users["Stan"].id, Board: suite.boards["Read"].id, Status: RequestAccepted}
	suite.sessionsRequests["Read2"] = DatabaseBoardSessionRequest{User: suite.users["Friend"].id, Board: suite.boards["Read"].id, Status: RequestPending}
	suite.sessionsRequests["Read3"] = DatabaseBoardSessionRequest{User: suite.users["Santa"].id, Board: suite.boards["Read"].id, Status: RequestPending}
	suite.sessionsRequests["Read4"] = DatabaseBoardSessionRequest{User: suite.users["Bob"].id, Board: suite.boards["Read"].id, Status: RequestRejected}

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

	for _, sessionRequest := range suite.sessionsRequests {
		err := databaseinitialize.InsertSessionRequest(db, sessionRequest.User, sessionRequest.Board, string(sessionRequest.Status))
		if err != nil {
			log.Fatalf("Failed to insert test session requests %s", err)
		}
	}
}
