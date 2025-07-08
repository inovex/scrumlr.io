package sessions

import (
	"context"
	"database/sql"
	"errors"
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

// const POSTGRES_IMAGE = "postgres:17.5-alpine"
// const DATABASE_NAME = "scrumlr_test"
// const DATABASE_USERNAME = "stan"
// const DATABASE_PASSWORD = "scrumlr"

type DatabaseSessionTestSuite struct {
	suite.Suite
	container *postgres.PostgresContainer
	db        *bun.DB
	users     map[string]TestUser
	boards    map[string]TestBoard
	sessions  map[string]DatabaseBoardSession
}

func TestDatabaseSessionTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseSessionTestSuite))
}

func (suite *DatabaseSessionTestSuite) SetupSuite() {
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

func (suite *DatabaseSessionTestSuite) TearDownSuite() {
	if err := testcontainers.TerminateContainer(suite.container); err != nil {
		log.Fatalf("Failed to terminate container: %s", err)
	}
}

func (suite *DatabaseSessionTestSuite) Test_Database_CreateSession_Particpant() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Luke"].id
	boardId := suite.boards["Write"].id

	dbSession, err := database.Create(DatabaseBoardSessionInsert{User: userId, Board: boardId, Role: common.ParticipantRole})

	assert.Nil(t, err)
	assert.Equal(t, userId, dbSession.User)
	assert.Equal(t, boardId, dbSession.Board)
	assert.Equal(t, common.ParticipantRole, dbSession.Role)
	assert.True(t, dbSession.ShowHiddenColumns)
	assert.False(t, dbSession.Connected)
	assert.False(t, dbSession.Ready)
	assert.False(t, dbSession.RaisedHand)
	assert.NotNil(t, dbSession.CreatedAt)
}

func (suite *DatabaseSessionTestSuite) Test_Database_CreateSession_Moderator() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Leia"].id
	boardId := suite.boards["Write"].id

	dbSession, err := database.Create(DatabaseBoardSessionInsert{User: userId, Board: boardId, Role: common.ModeratorRole})

	assert.Nil(t, err)
	assert.Equal(t, userId, dbSession.User)
	assert.Equal(t, boardId, dbSession.Board)
	assert.Equal(t, common.ModeratorRole, dbSession.Role)
	assert.True(t, dbSession.ShowHiddenColumns)
	assert.False(t, dbSession.Connected)
	assert.False(t, dbSession.Ready)
	assert.False(t, dbSession.RaisedHand)
	assert.NotNil(t, dbSession.CreatedAt)
}

func (suite *DatabaseSessionTestSuite) Test_Database_CreateSession_Owner() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Luke"].id
	boardId := suite.boards["Write"].id

	dbSession, err := database.Create(DatabaseBoardSessionInsert{User: userId, Board: boardId, Role: common.OwnerRole})

	assert.NotNil(t, err)
	assert.Equal(t, err, errors.New("not allowed to create board session with owner role"))
	assert.Equal(t, DatabaseBoardSession{}, dbSession)
}

func (suite *DatabaseSessionTestSuite) Test_Database_CreateSession_Duplicate() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Han"].id
	boardId := suite.boards["Write"].id

	dbSession, err := database.Create(DatabaseBoardSessionInsert{User: userId, Board: boardId, Role: common.ParticipantRole})

	assert.NotNil(t, err)
	assert.Equal(t, DatabaseBoardSession{}, dbSession)
}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateSession_Connected() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Han"].id
	boardId := suite.boards["Write"].id
	connected := true

	dbSession, err := database.Update(DatabaseBoardSessionUpdate{Board: boardId, User: userId, Connected: &connected})

	assert.Nil(t, err)
	assert.Equal(t, userId, dbSession.User)
	assert.Equal(t, boardId, dbSession.Board)
	assert.Equal(t, connected, dbSession.Connected)
}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateSession_Ready() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Han"].id
	boardId := suite.boards["Write"].id
	ready := true

	dbSession, err := database.Update(DatabaseBoardSessionUpdate{Board: boardId, User: userId, Connected: &ready})

	assert.Nil(t, err)
	assert.Equal(t, userId, dbSession.User)
	assert.Equal(t, boardId, dbSession.Board)
	assert.Equal(t, ready, dbSession.Connected)
}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateSession_RaisedHand() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Han"].id
	boardId := suite.boards["Write"].id
	raisedHand := true

	dbSession, err := database.Update(DatabaseBoardSessionUpdate{Board: boardId, User: userId, RaisedHand: &raisedHand})

	assert.Nil(t, err)
	assert.Equal(t, userId, dbSession.User)
	assert.Equal(t, boardId, dbSession.Board)
	assert.Equal(t, raisedHand, dbSession.RaisedHand)
}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateSession_Banned() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Han"].id
	boardId := suite.boards["Write"].id
	banned := true

	dbSession, err := database.Update(DatabaseBoardSessionUpdate{Board: boardId, User: userId, Banned: &banned})

	assert.Nil(t, err)
	assert.Equal(t, userId, dbSession.User)
	assert.Equal(t, boardId, dbSession.Board)
	assert.Equal(t, banned, dbSession.Banned)
}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateSession_ParticipantToModerator() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Luke"].id
	boardId := suite.boards["Update"].id
	role := common.ModeratorRole

	dbSession, err := database.Update(DatabaseBoardSessionUpdate{Board: boardId, User: userId, Role: &role})

	assert.Nil(t, err)
	assert.Equal(t, userId, dbSession.User)
	assert.Equal(t, boardId, dbSession.Board)
	assert.Equal(t, role, dbSession.Role)
}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateSession_ParticipantToOwner() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Leia"].id
	boardId := suite.boards["update"].id
	role := common.OwnerRole

	dbSession, err := database.Update(DatabaseBoardSessionUpdate{Board: boardId, User: userId, Role: &role})

	assert.NotNil(t, err)
	assert.Equal(t, err, sql.ErrNoRows)
	assert.Equal(t, DatabaseBoardSession{}, dbSession)
}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateSession_ModeratorToOwner() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Han"].id
	boardId := suite.boards["Write"].id
	role := common.OwnerRole

	dbSession, err := database.Update(DatabaseBoardSessionUpdate{Board: boardId, User: userId, Role: &role})

	assert.NotNil(t, err)
	assert.Equal(t, err, sql.ErrNoRows)
	assert.Equal(t, DatabaseBoardSession{}, dbSession)
}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateAllSession() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)
	ready := true

	dbSessions, err := database.UpdateAll(DatabaseBoardSessionUpdate{Board: suite.boards["UpdateAll"].id, Ready: &ready})

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 4)

	assert.Equal(t, suite.users["Stan"].id, dbSessions[0].User) // TODO: check order
	assert.Equal(t, suite.boards["UpdateAll"].id, dbSessions[0].Board)
	assert.True(t, dbSessions[0].Connected)
	assert.True(t, dbSessions[0].Ready)

	assert.Equal(t, suite.users["Luke"].id, dbSessions[1].User)
	assert.Equal(t, suite.boards["UpdateAll"].id, dbSessions[1].Board)
	assert.True(t, dbSessions[1].Connected)
	assert.True(t, dbSessions[1].Ready)

	assert.Equal(t, suite.users["Leia"].id, dbSessions[2].User)
	assert.Equal(t, suite.boards["UpdateAll"].id, dbSessions[2].Board)
	assert.True(t, dbSessions[2].Connected)
	assert.True(t, dbSessions[2].Ready)

	assert.Equal(t, suite.users["Han"].id, dbSessions[3].User)
	assert.Equal(t, suite.boards["UpdateAll"].id, dbSessions[3].Board)
	assert.True(t, dbSessions[3].Connected)
	assert.True(t, dbSessions[3].Ready)
}

func (suite *DatabaseSessionTestSuite) Test_Database_Exists_True() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Stan"].id

	exists, err := database.Exists(boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_Exists_NotFound_Board() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := uuid.New()
	userId := suite.users["Stan"].id

	exists, err := database.Exists(boardId, userId)

	assert.Nil(t, err)
	assert.False(t, exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_Exists_NotFound_User() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := uuid.New()

	exists, err := database.Exists(boardId, userId)

	assert.Nil(t, err)
	assert.False(t, exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_ModeratorExists_Owner() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Stan"].id

	exists, err := database.ModeratorExists(boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_ModeratorExists_Moderator() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Friend"].id

	exists, err := database.ModeratorExists(boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_ModeratorExists_Participant() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Santa"].id

	exists, err := database.ModeratorExists(boardId, userId)

	assert.Nil(t, err)
	assert.False(t, exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_IsBanned() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Bob"].id

	banned, err := database.IsParticipantBanned(boardId, userId)

	assert.Nil(t, err)
	assert.True(t, banned)
}

func (suite *DatabaseSessionTestSuite) Test_Database_IsNotBanned() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Santa"].id

	banned, err := database.IsParticipantBanned(boardId, userId)

	assert.Nil(t, err)
	assert.False(t, banned)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetSession() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Santa"].id

	dbSession, err := database.Get(boardId, userId)

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbSession.Board)
	assert.Equal(t, userId, dbSession.User)
	assert.Equal(t, common.ParticipantRole, dbSession.Role)
	assert.True(t, dbSession.ShowHiddenColumns)
	assert.False(t, dbSession.Connected)
	assert.False(t, dbSession.Ready)
	assert.False(t, dbSession.RaisedHand)
	assert.NotNil(t, dbSession.CreatedAt)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetSession_NotFound_Board() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := uuid.New()
	userId := suite.users["Santa"].id

	dbSession, err := database.Get(boardId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseBoardSession{}, dbSession)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetSession_NotFound_User() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := uuid.New()

	dbSession, err := database.Get(boardId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseBoardSession{}, dbSession)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id

	dbSessions, err := database.GetAll(boardId)

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 4)

	assert.Equal(t, suite.sessions["Read1"].Board, dbSessions[0].Board)
	assert.Equal(t, suite.sessions["Read1"].User, dbSessions[0].User)

	assert.Equal(t, suite.sessions["Read2"].Board, dbSessions[1].Board)
	assert.Equal(t, suite.sessions["Read2"].User, dbSessions[1].User)

	assert.Equal(t, suite.sessions["Read3"].Board, dbSessions[2].Board)
	assert.Equal(t, suite.sessions["Read3"].User, dbSessions[2].User)

	assert.Equal(t, suite.sessions["Read4"].Board, dbSessions[3].Board)
	assert.Equal(t, suite.sessions["Read4"].User, dbSessions[3].User)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions_WithFilter_Ready() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["ReadFilter"].id
	ready := true

	dbSessions, err := database.GetAll(boardId, BoardSessionFilter{Ready: &ready})

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 2)

	assert.Equal(t, suite.sessions["ReadFilter1"].Board, dbSessions[0].Board)
	assert.Equal(t, suite.sessions["ReadFilter1"].User, dbSessions[0].User)
	assert.True(t, dbSessions[0].Ready)

	assert.Equal(t, suite.sessions["ReadFilter2"].Board, dbSessions[1].Board)
	assert.Equal(t, suite.sessions["ReadFilter2"].User, dbSessions[1].User)
	assert.True(t, dbSessions[1].Ready)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions_WithFilter_RaisedHand() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["ReadFilter"].id
	raisedHand := true

	dbSessions, err := database.GetAll(boardId, BoardSessionFilter{RaisedHand: &raisedHand})

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 2)

	assert.Equal(t, suite.sessions["ReadFilter3"].Board, dbSessions[0].Board)
	assert.Equal(t, suite.sessions["ReadFilter3"].User, dbSessions[0].User)
	assert.True(t, dbSessions[0].RaisedHand)

	assert.Equal(t, suite.sessions["ReadFilter4"].Board, dbSessions[1].Board)
	assert.Equal(t, suite.sessions["ReadFilter4"].User, dbSessions[1].User)
	assert.True(t, dbSessions[1].RaisedHand)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions_WithFilter_Connected() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["ReadFilter"].id
	connected := true

	dbSessions, err := database.GetAll(boardId, BoardSessionFilter{Connected: &connected})

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 2)

	assert.Equal(t, suite.sessions["ReadFilter1"].Board, dbSessions[0].Board)
	assert.Equal(t, suite.sessions["ReadFilter1"].User, dbSessions[0].User)
	assert.True(t, dbSessions[0].Connected)

	assert.Equal(t, suite.sessions["ReadFilter3"].Board, dbSessions[1].Board)
	assert.Equal(t, suite.sessions["ReadFilter3"].User, dbSessions[1].User)
	assert.True(t, dbSessions[1].Connected)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions_WithFilter_Role() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["ReadFilter"].id
	role := common.OwnerRole

	dbSessions, err := database.GetAll(boardId, BoardSessionFilter{Role: &role})

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 1)

	assert.Equal(t, suite.sessions["ReadFilter1"].Board, dbSessions[0].Board)
	assert.Equal(t, suite.sessions["ReadFilter1"].User, dbSessions[0].User)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions_WithMultipleFilter() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["ReadFilter"].id
	raisedHand := true
	connected := true

	dbSessions, err := database.GetAll(boardId, BoardSessionFilter{RaisedHand: &raisedHand, Connected: &connected})

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 1)

	assert.Equal(t, suite.sessions["ReadFilter3"].Board, dbSessions[0].Board)
	assert.Equal(t, suite.sessions["ReadFilter3"].User, dbSessions[0].User)
	assert.Equal(t, suite.sessions["ReadFilter3"].Connected, dbSessions[0].Connected)
	assert.Equal(t, suite.sessions["ReadFilter3"].RaisedHand, dbSessions[0].RaisedHand)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetConnectedBoards() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Stan"].id

	dbSessions, err := database.GetUserConnectedBoards(userId)

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 2)

	assert.Equal(t, suite.sessions["UpdateAll1"].Board, dbSessions[0].Board) // TODO: check order
	assert.Equal(t, suite.sessions["UpdateAll1"].User, dbSessions[0].User)
	assert.True(t, dbSessions[0].Connected)

	assert.Equal(t, suite.sessions["ReadFilter1"].Board, dbSessions[1].Board)
	assert.Equal(t, suite.sessions["ReadFilter1"].User, dbSessions[1].User)
	assert.True(t, dbSessions[1].Connected)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetConnectedBoards_NotConnected() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Friend"].id

	dbSessions, err := database.GetUserConnectedBoards(userId)

	assert.Nil(t, err)
	assert.Equal(t, []DatabaseBoardSession(nil), dbSessions)
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

func (suite *DatabaseSessionTestSuite) SeedDatabase(db *bun.DB) {
	// tests users
	suite.users = make(map[string]TestUser, 7)
	suite.users["Stan"] = TestUser{id: uuid.New(), name: "Stan", accountType: common.Google}
	suite.users["Friend"] = TestUser{id: uuid.New(), name: "Friend", accountType: common.Anonymous}
	suite.users["Santa"] = TestUser{id: uuid.New(), name: "Santa", accountType: common.Anonymous}
	suite.users["Bob"] = TestUser{id: uuid.New(), name: "Bob", accountType: common.Anonymous}
	suite.users["Luke"] = TestUser{id: uuid.New(), name: "Luke", accountType: common.Anonymous}
	suite.users["Leia"] = TestUser{id: uuid.New(), name: "Leia", accountType: common.Anonymous}
	suite.users["Han"] = TestUser{id: uuid.New(), name: "Han", accountType: common.Anonymous}

	// test boards
	suite.boards = make(map[string]TestBoard, 5)
	suite.boards["Write"] = TestBoard{id: uuid.New(), name: "Write"}
	suite.boards["Update"] = TestBoard{id: uuid.New(), name: "Update"}
	suite.boards["Read"] = TestBoard{id: uuid.New(), name: "Read"}
	suite.boards["ReadFilter"] = TestBoard{id: uuid.New(), name: "ReadFilter"}
	suite.boards["UpdateAll"] = TestBoard{id: uuid.New(), name: "UpdateAll"}

	// test sessions
	suite.sessions = make(map[string]DatabaseBoardSession, 16)
	// test sessions for the write board
	suite.sessions["Write"] = DatabaseBoardSession{User: suite.users["Han"].id, Board: suite.boards["Write"].id, Role: common.ParticipantRole}
	// test sessions for the update board
	suite.sessions["UpdateParticipantModerator"] = DatabaseBoardSession{User: suite.users["Luke"].id, Board: suite.boards["Update"].id, Role: common.ParticipantRole}
	suite.sessions["UpdateParticipantOwner"] = DatabaseBoardSession{User: suite.users["Leia"].id, Board: suite.boards["Update"].id, Role: common.ParticipantRole}
	suite.sessions["UpdateModeratorOwner"] = DatabaseBoardSession{User: suite.users["Han"].id, Board: suite.boards["Update"].id, Role: common.ParticipantRole}
	// test sessions for the read board
	suite.sessions["Read1"] = DatabaseBoardSession{User: suite.users["Stan"].id, Board: suite.boards["Read"].id, Role: common.OwnerRole}
	suite.sessions["Read2"] = DatabaseBoardSession{User: suite.users["Friend"].id, Board: suite.boards["Read"].id, Role: common.ModeratorRole}
	suite.sessions["Read3"] = DatabaseBoardSession{User: suite.users["Santa"].id, Board: suite.boards["Read"].id, Role: common.ParticipantRole}
	suite.sessions["Read4"] = DatabaseBoardSession{User: suite.users["Bob"].id, Board: suite.boards["Read"].id, Role: common.ParticipantRole, Banned: true}
	// test sessions for the read filter board
	suite.sessions["ReadFilter1"] = DatabaseBoardSession{User: suite.users["Stan"].id, Board: suite.boards["ReadFilter"].id, Role: common.OwnerRole, Ready: true, Connected: true}
	suite.sessions["ReadFilter2"] = DatabaseBoardSession{User: suite.users["Friend"].id, Board: suite.boards["ReadFilter"].id, Role: common.ModeratorRole, Ready: true}
	suite.sessions["ReadFilter3"] = DatabaseBoardSession{User: suite.users["Santa"].id, Board: suite.boards["ReadFilter"].id, Role: common.ParticipantRole, RaisedHand: true, Connected: true}
	suite.sessions["ReadFilter4"] = DatabaseBoardSession{User: suite.users["Bob"].id, Board: suite.boards["ReadFilter"].id, Role: common.ParticipantRole, RaisedHand: true}
	// test sessions for the update all board
	suite.sessions["UpdateAll1"] = DatabaseBoardSession{User: suite.users["Stan"].id, Board: suite.boards["UpdateAll"].id, Role: common.OwnerRole, Connected: true}
	suite.sessions["UpdateAll2"] = DatabaseBoardSession{User: suite.users["Luke"].id, Board: suite.boards["UpdateAll"].id, Role: common.ModeratorRole, Connected: true}
	suite.sessions["UpdateAll3"] = DatabaseBoardSession{User: suite.users["Leia"].id, Board: suite.boards["UpdateAll"].id, Role: common.ParticipantRole, Connected: true}
	suite.sessions["UpdateAll4"] = DatabaseBoardSession{User: suite.users["Han"].id, Board: suite.boards["UpdateAll"].id, Role: common.ParticipantRole, Connected: true}

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
		err := databaseinitialize.InsertSession(db, session.User, session.Board, string(session.Role), session.Banned, session.Ready, session.Connected, session.RaisedHand)
		if err != nil {
			log.Fatalf("Failed to insert test sessions %s", err)
		}
	}
}
