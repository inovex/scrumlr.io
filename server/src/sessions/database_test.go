package sessions

import (
	"context"
	"database/sql"
	"log"
	"testing"

	"scrumlr.io/server/initialize/testDbTemplates"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
)

type DatabaseSessionTestSuite struct {
	suite.Suite
	db       *bun.DB
	users    map[string]TestUser
	boards   map[string]TestBoard
	sessions map[string]DatabaseBoardSession
}

func TestDatabaseSessionTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseSessionTestSuite))
}

func (suite *DatabaseSessionTestSuite) SetupTest() {
	suite.db = testDbTemplates.NewBaseTestDB(
		suite.T(),
		false,
		testDbTemplates.AdditionalSeed{
			Name: "sessions_database_test_data",
			Func: suite.seedData,
		},
	)
}

func (suite *DatabaseSessionTestSuite) Test_Database_CreateSession_Participant() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Luke"].id
	boardId := suite.boards["Write"].id

	dbSession, err := database.Create(context.Background(), DatabaseBoardSessionInsert{User: userId, Board: boardId, Role: common.ParticipantRole})

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

	dbSession, err := database.Create(context.Background(), DatabaseBoardSessionInsert{User: userId, Board: boardId, Role: common.ModeratorRole})

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

func (suite *DatabaseSessionTestSuite) Test_Database_CreateSession_Duplicate() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Han"].id
	boardId := suite.boards["Write"].id

	dbSession, err := database.Create(context.Background(), DatabaseBoardSessionInsert{User: userId, Board: boardId, Role: common.ParticipantRole})

	assert.NotNil(t, err)
	assert.Equal(t, DatabaseBoardSession{}, dbSession)
}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateSession_Connected() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Han"].id
	boardId := suite.boards["Write"].id
	connected := true

	dbSession, err := database.Update(context.Background(), DatabaseBoardSessionUpdate{Board: boardId, User: userId, Connected: &connected})

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

	dbSession, err := database.Update(context.Background(), DatabaseBoardSessionUpdate{Board: boardId, User: userId, Connected: &ready})

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

	dbSession, err := database.Update(context.Background(), DatabaseBoardSessionUpdate{Board: boardId, User: userId, RaisedHand: &raisedHand})

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

	dbSession, err := database.Update(context.Background(), DatabaseBoardSessionUpdate{Board: boardId, User: userId, Banned: &banned})

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

	dbSession, err := database.Update(context.Background(), DatabaseBoardSessionUpdate{Board: boardId, User: userId, Role: &role})

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

	dbSession, err := database.Update(context.Background(), DatabaseBoardSessionUpdate{Board: boardId, User: userId, Role: &role})

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

	dbSession, err := database.Update(context.Background(), DatabaseBoardSessionUpdate{Board: boardId, User: userId, Role: &role})

	assert.NotNil(t, err)
	assert.Equal(t, err, sql.ErrNoRows)
	assert.Equal(t, DatabaseBoardSession{}, dbSession)
}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateAllSession() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)
	ready := true

	dbSessions, err := database.UpdateAll(context.Background(), DatabaseBoardSessionUpdate{Board: suite.boards["UpdateAll"].id, Ready: &ready})

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 4)

	firstSession := checkSessionInList(dbSessions, suite.boards["UpdateAll"].id, suite.users["Stan"].id)
	assert.NotNil(t, firstSession)
	assert.Equal(t, suite.users["Stan"].id, firstSession.User)
	assert.Equal(t, suite.boards["UpdateAll"].id, firstSession.Board)
	assert.True(t, firstSession.Connected)
	assert.True(t, firstSession.Ready)

	secondSession := checkSessionInList(dbSessions, suite.boards["UpdateAll"].id, suite.users["Luke"].id)
	assert.NotNil(t, secondSession)
	assert.Equal(t, suite.users["Luke"].id, secondSession.User)
	assert.Equal(t, suite.boards["UpdateAll"].id, secondSession.Board)
	assert.True(t, secondSession.Connected)
	assert.True(t, secondSession.Ready)

	thirdSession := checkSessionInList(dbSessions, suite.boards["UpdateAll"].id, suite.users["Leia"].id)
	assert.NotNil(t, thirdSession)
	assert.Equal(t, suite.users["Leia"].id, thirdSession.User)
	assert.Equal(t, suite.boards["UpdateAll"].id, thirdSession.Board)
	assert.True(t, thirdSession.Connected)
	assert.True(t, thirdSession.Ready)

	fourthSession := checkSessionInList(dbSessions, suite.boards["UpdateAll"].id, suite.users["Han"].id)
	assert.NotNil(t, fourthSession)
	assert.Equal(t, suite.users["Han"].id, fourthSession.User)
	assert.Equal(t, suite.boards["UpdateAll"].id, fourthSession.Board)
	assert.True(t, fourthSession.Connected)
	assert.True(t, fourthSession.Ready)
}

func (suite *DatabaseSessionTestSuite) Test_Database_Exists_True() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Stan"].id

	exists, err := database.Exists(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_Exists_NotFound_Board() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := uuid.New()
	userId := suite.users["Stan"].id

	exists, err := database.Exists(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.False(t, exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_Exists_NotFound_User() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := uuid.New()

	exists, err := database.Exists(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.False(t, exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_ModeratorExists_Owner() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Stan"].id

	exists, err := database.ModeratorExists(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_ModeratorExists_Moderator() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Friend"].id

	exists, err := database.ModeratorExists(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_ModeratorExists_Participant() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Santa"].id

	exists, err := database.ModeratorExists(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.False(t, exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_IsBanned() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Bob"].id

	banned, err := database.IsParticipantBanned(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.True(t, banned)
}

func (suite *DatabaseSessionTestSuite) Test_Database_IsNotBanned() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Santa"].id

	banned, err := database.IsParticipantBanned(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.False(t, banned)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetSession() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Santa"].id

	dbSession, err := database.Get(context.Background(), boardId, userId)

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

	dbSession, err := database.Get(context.Background(), boardId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseBoardSession{}, dbSession)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetSession_NotFound_User() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := uuid.New()

	dbSession, err := database.Get(context.Background(), boardId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseBoardSession{}, dbSession)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id

	dbSessions, err := database.GetAll(context.Background(), boardId)

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 4)

	firstSession := checkSessionInList(dbSessions, boardId, suite.sessions["Read1"].User)
	assert.NotNil(t, firstSession)
	assert.Equal(t, suite.sessions["Read1"].Board, firstSession.Board)
	assert.Equal(t, suite.sessions["Read1"].User, firstSession.User)

	secondSession := checkSessionInList(dbSessions, boardId, suite.sessions["Read2"].User)
	assert.NotNil(t, secondSession)
	assert.Equal(t, suite.sessions["Read2"].Board, secondSession.Board)
	assert.Equal(t, suite.sessions["Read2"].User, secondSession.User)

	thirdSession := checkSessionInList(dbSessions, boardId, suite.sessions["Read3"].User)
	assert.NotNil(t, thirdSession)
	assert.Equal(t, suite.sessions["Read3"].Board, thirdSession.Board)
	assert.Equal(t, suite.sessions["Read3"].User, thirdSession.User)

	fourthSession := checkSessionInList(dbSessions, boardId, suite.sessions["Read4"].User)
	assert.NotNil(t, fourthSession)
	assert.Equal(t, suite.sessions["Read4"].Board, fourthSession.Board)
	assert.Equal(t, suite.sessions["Read4"].User, fourthSession.User)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions_WithFilter_Ready() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["ReadFilter"].id
	ready := true

	dbSessions, err := database.GetAll(context.Background(), boardId, BoardSessionFilter{Ready: &ready})

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 2)

	firstSession := checkSessionInList(dbSessions, boardId, suite.sessions["ReadFilter1"].User)
	assert.NotNil(t, firstSession)
	assert.Equal(t, suite.sessions["ReadFilter1"].Board, firstSession.Board)
	assert.Equal(t, suite.sessions["ReadFilter1"].User, firstSession.User)
	assert.True(t, firstSession.Ready)

	secondSession := checkSessionInList(dbSessions, boardId, suite.sessions["ReadFilter2"].User)
	assert.NotNil(t, secondSession)
	assert.Equal(t, suite.sessions["ReadFilter2"].Board, secondSession.Board)
	assert.Equal(t, suite.sessions["ReadFilter2"].User, secondSession.User)
	assert.True(t, secondSession.Ready)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions_WithFilter_RaisedHand() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["ReadFilter"].id
	raisedHand := true

	dbSessions, err := database.GetAll(context.Background(), boardId, BoardSessionFilter{RaisedHand: &raisedHand})

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 2)

	firstSession := checkSessionInList(dbSessions, boardId, suite.sessions["ReadFilter3"].User)
	assert.NotNil(t, firstSession)
	assert.Equal(t, suite.sessions["ReadFilter3"].Board, firstSession.Board)
	assert.Equal(t, suite.sessions["ReadFilter3"].User, firstSession.User)
	assert.True(t, firstSession.RaisedHand)

	secondSession := checkSessionInList(dbSessions, boardId, suite.sessions["ReadFilter4"].User)
	assert.NotNil(t, secondSession)
	assert.Equal(t, suite.sessions["ReadFilter4"].Board, secondSession.Board)
	assert.Equal(t, suite.sessions["ReadFilter4"].User, secondSession.User)
	assert.True(t, secondSession.RaisedHand)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions_WithFilter_Connected() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["ReadFilter"].id
	connected := true

	dbSessions, err := database.GetAll(context.Background(), boardId, BoardSessionFilter{Connected: &connected})

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 2)

	firstSession := checkSessionInList(dbSessions, boardId, suite.sessions["ReadFilter1"].User)
	assert.NotNil(t, firstSession)
	assert.Equal(t, suite.sessions["ReadFilter1"].Board, firstSession.Board)
	assert.Equal(t, suite.sessions["ReadFilter1"].User, firstSession.User)
	assert.True(t, firstSession.Connected)

	secondSession := checkSessionInList(dbSessions, boardId, suite.sessions["ReadFilter3"].User)
	assert.NotNil(t, secondSession)
	assert.Equal(t, suite.sessions["ReadFilter3"].Board, secondSession.Board)
	assert.Equal(t, suite.sessions["ReadFilter3"].User, secondSession.User)
	assert.True(t, secondSession.Connected)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions_WithFilter_Role() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["ReadFilter"].id
	role := common.OwnerRole

	dbSessions, err := database.GetAll(context.Background(), boardId, BoardSessionFilter{Role: &role})

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

	dbSessions, err := database.GetAll(context.Background(), boardId, BoardSessionFilter{RaisedHand: &raisedHand, Connected: &connected})

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

	dbSessions, err := database.GetUserConnectedBoards(context.Background(), userId)

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 2)

	firstSession := checkSessionInList(dbSessions, suite.sessions["UpdateAll1"].Board, suite.sessions["UpdateAll1"].User)
	assert.NotNil(t, firstSession)
	assert.Equal(t, suite.sessions["UpdateAll1"].Board, firstSession.Board)
	assert.Equal(t, suite.sessions["UpdateAll1"].User, firstSession.User)
	assert.True(t, firstSession.Connected)

	secondSession := checkSessionInList(dbSessions, suite.sessions["ReadFilter1"].Board, suite.sessions["ReadFilter1"].User)
	assert.NotNil(t, secondSession)
	assert.Equal(t, suite.sessions["ReadFilter1"].Board, secondSession.Board)
	assert.Equal(t, suite.sessions["ReadFilter1"].User, secondSession.User)
	assert.True(t, secondSession.Connected)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetConnectedBoards_NotConnected() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Friend"].id

	dbSessions, err := database.GetUserConnectedBoards(context.Background(), userId)

	assert.Nil(t, err)
	assert.Equal(t, []DatabaseBoardSession(nil), dbSessions)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetBoards() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Stan"].id

	dbSessions, err := database.GetUserBoards(context.Background(), userId)

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 3)

	firstSession := checkSessionInList(dbSessions, suite.sessions["Read1"].Board, suite.sessions["Read1"].User)
	assert.NotNil(t, firstSession)
	assert.Equal(t, suite.sessions["Read1"].Board, firstSession.Board)
	assert.Equal(t, suite.sessions["Read1"].User, firstSession.User)
	assert.True(t, !firstSession.Connected)

	secondSession := checkSessionInList(dbSessions, suite.sessions["UpdateAll1"].Board, suite.sessions["UpdateAll1"].User)
	assert.NotNil(t, secondSession)
	assert.Equal(t, suite.sessions["UpdateAll1"].Board, secondSession.Board)
	assert.Equal(t, suite.sessions["UpdateAll1"].User, secondSession.User)
	assert.True(t, secondSession.Connected)

	thirdSession := checkSessionInList(dbSessions, suite.sessions["ReadFilter1"].Board, suite.sessions["ReadFilter1"].User)
	assert.NotNil(t, thirdSession)
	assert.Equal(t, suite.sessions["ReadFilter1"].Board, thirdSession.Board)
	assert.Equal(t, suite.sessions["ReadFilter1"].User, thirdSession.User)
	assert.True(t, thirdSession.Connected)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetBoards_NoBoards() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Blubb"].id

	dbSessions, err := database.GetUserBoards(context.Background(), userId)

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

func (suite *DatabaseSessionTestSuite) seedData(db *bun.DB) {
	// tests users
	suite.users = make(map[string]TestUser, 7)
	suite.users["Stan"] = TestUser{id: uuid.New(), name: "Stan", accountType: common.Google}
	suite.users["Friend"] = TestUser{id: uuid.New(), name: "Friend", accountType: common.Anonymous}
	suite.users["Santa"] = TestUser{id: uuid.New(), name: "Santa", accountType: common.Anonymous}
	suite.users["Bob"] = TestUser{id: uuid.New(), name: "Bob", accountType: common.Anonymous}
	suite.users["Luke"] = TestUser{id: uuid.New(), name: "Luke", accountType: common.Anonymous}
	suite.users["Leia"] = TestUser{id: uuid.New(), name: "Leia", accountType: common.Anonymous}
	suite.users["Han"] = TestUser{id: uuid.New(), name: "Han", accountType: common.Anonymous}
	suite.users["Blubb"] = TestUser{id: uuid.New(), name: "Blubb", accountType: common.Anonymous}

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
		err := testDbTemplates.InsertUser(db, user.id, user.name, string(user.accountType))
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

	for _, session := range suite.sessions {
		err := testDbTemplates.InsertSession(db, session.User, session.Board, string(session.Role), session.Banned, session.Ready, session.Connected, session.RaisedHand)
		if err != nil {
			log.Fatalf("Failed to insert test sessions %s", err)
		}
	}
}

func checkSessionInList(list []DatabaseBoardSession, boardId uuid.UUID, userId uuid.UUID) *DatabaseBoardSession {
	for _, session := range list {
		if session.Board == boardId && session.User == userId {
			return &session
		}
	}
	return nil
}
