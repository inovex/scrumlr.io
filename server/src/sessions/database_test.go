package sessions

import (
	"context"
	"database/sql"
	"log"
	"testing"

	"scrumlr.io/server/initialize/testDbTemplates"

	"github.com/google/uuid"
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
	database := NewSessionDatabase(suite.db)

	userId := suite.users["Luke"].id
	boardId := suite.boards["Write"].id

	dbSession, err := database.Create(context.Background(), DatabaseBoardSessionInsert{User: userId, Board: boardId, Role: common.ParticipantRole})

	suite.Nil(err)
	suite.Equal(userId, dbSession.User)
	suite.Equal(boardId, dbSession.Board)
	suite.Equal(common.ParticipantRole, dbSession.Role)
	suite.True(dbSession.ShowHiddenColumns)
	suite.False(dbSession.Connected)
	suite.False(dbSession.Ready)
	suite.False(dbSession.RaisedHand)
	suite.NotNil(dbSession.CreatedAt)
}

func (suite *DatabaseSessionTestSuite) Test_Database_CreateSession_Moderator() {

	database := NewSessionDatabase(suite.db)

	userId := suite.users["Leia"].id
	boardId := suite.boards["Write"].id

	dbSession, err := database.Create(context.Background(), DatabaseBoardSessionInsert{User: userId, Board: boardId, Role: common.ModeratorRole})

	suite.Nil(err)
	suite.Equal(userId, dbSession.User)
	suite.Equal(boardId, dbSession.Board)
	suite.Equal(common.ModeratorRole, dbSession.Role)
	suite.True(dbSession.ShowHiddenColumns)
	suite.False(dbSession.Connected)
	suite.False(dbSession.Ready)
	suite.False(dbSession.RaisedHand)
	suite.NotNil(dbSession.CreatedAt)
}

func (suite *DatabaseSessionTestSuite) Test_Database_CreateSession_Duplicate() {

	database := NewSessionDatabase(suite.db)

	userId := suite.users["Han"].id
	boardId := suite.boards["Write"].id

	dbSession, err := database.Create(context.Background(), DatabaseBoardSessionInsert{User: userId, Board: boardId, Role: common.ParticipantRole})

	suite.NotNil(err)
	suite.Equal(DatabaseBoardSession{}, dbSession)
}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateSession_Connected() {

	database := NewSessionDatabase(suite.db)

	userId := suite.users["Han"].id
	boardId := suite.boards["Write"].id
	connected := true

	dbSession, err := database.Update(context.Background(), DatabaseBoardSessionUpdate{Board: boardId, User: userId, Connected: &connected})

	suite.Nil(err)
	suite.Equal(userId, dbSession.User)
	suite.Equal(boardId, dbSession.Board)
	suite.Equal(connected, dbSession.Connected)
}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateSession_Ready() {

	database := NewSessionDatabase(suite.db)

	userId := suite.users["Han"].id
	boardId := suite.boards["Write"].id
	ready := true

	dbSession, err := database.Update(context.Background(), DatabaseBoardSessionUpdate{Board: boardId, User: userId, Connected: &ready})

	suite.Nil(err)
	suite.Equal(userId, dbSession.User)
	suite.Equal(boardId, dbSession.Board)
	suite.Equal(ready, dbSession.Connected)
}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateSession_RaisedHand() {

	database := NewSessionDatabase(suite.db)

	userId := suite.users["Han"].id
	boardId := suite.boards["Write"].id
	raisedHand := true

	dbSession, err := database.Update(context.Background(), DatabaseBoardSessionUpdate{Board: boardId, User: userId, RaisedHand: &raisedHand})

	suite.Nil(err)
	suite.Equal(userId, dbSession.User)
	suite.Equal(boardId, dbSession.Board)
	suite.Equal(raisedHand, dbSession.RaisedHand)
}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateSession_Banned() {

	database := NewSessionDatabase(suite.db)

	userId := suite.users["Han"].id
	boardId := suite.boards["Write"].id
	banned := true

	dbSession, err := database.Update(context.Background(), DatabaseBoardSessionUpdate{Board: boardId, User: userId, Banned: &banned})

	suite.Nil(err)
	suite.Equal(userId, dbSession.User)
	suite.Equal(boardId, dbSession.Board)
	suite.Equal(banned, dbSession.Banned)
}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateSession_ParticipantToModerator() {

	database := NewSessionDatabase(suite.db)

	userId := suite.users["Luke"].id
	boardId := suite.boards["Update"].id
	role := common.ModeratorRole

	dbSession, err := database.Update(context.Background(), DatabaseBoardSessionUpdate{Board: boardId, User: userId, Role: &role})

	suite.Nil(err)
	suite.Equal(userId, dbSession.User)
	suite.Equal(boardId, dbSession.Board)
	suite.Equal(role, dbSession.Role)
}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateSession_ParticipantToOwner() {

	database := NewSessionDatabase(suite.db)

	userId := suite.users["Leia"].id
	boardId := suite.boards["update"].id
	role := common.OwnerRole

	dbSession, err := database.Update(context.Background(), DatabaseBoardSessionUpdate{Board: boardId, User: userId, Role: &role})

	suite.NotNil(err)
	suite.Equal(err, sql.ErrNoRows)
	suite.Equal(DatabaseBoardSession{}, dbSession)
}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateSession_ModeratorToOwner() {

	database := NewSessionDatabase(suite.db)

	userId := suite.users["Han"].id
	boardId := suite.boards["Write"].id
	role := common.OwnerRole

	dbSession, err := database.Update(context.Background(), DatabaseBoardSessionUpdate{Board: boardId, User: userId, Role: &role})

	suite.NotNil(err)
	suite.Equal(err, sql.ErrNoRows)
	suite.Equal(DatabaseBoardSession{}, dbSession)
}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateAllSession() {

	database := NewSessionDatabase(suite.db)
	ready := true

	dbSessions, err := database.UpdateAll(context.Background(), DatabaseBoardSessionUpdate{Board: suite.boards["UpdateAll"].id, Ready: &ready})

	suite.Nil(err)
	suite.Len(dbSessions, 4)

	firstSession := getSessionFromList(dbSessions, suite.boards["UpdateAll"].id, suite.users["Stan"].id)
	suite.NotNil(firstSession)
	suite.Equal(suite.users["Stan"].id, firstSession.User)
	suite.Equal(suite.boards["UpdateAll"].id, firstSession.Board)
	suite.True(firstSession.Connected)
	suite.True(firstSession.Ready)

	secondSession := getSessionFromList(dbSessions, suite.boards["UpdateAll"].id, suite.users["Luke"].id)
	suite.NotNil(secondSession)
	suite.Equal(suite.users["Luke"].id, secondSession.User)
	suite.Equal(suite.boards["UpdateAll"].id, secondSession.Board)
	suite.True(secondSession.Connected)
	suite.True(secondSession.Ready)

	thirdSession := getSessionFromList(dbSessions, suite.boards["UpdateAll"].id, suite.users["Leia"].id)
	suite.NotNil(thirdSession)
	suite.Equal(suite.users["Leia"].id, thirdSession.User)
	suite.Equal(suite.boards["UpdateAll"].id, thirdSession.Board)
	suite.True(thirdSession.Connected)
	suite.True(thirdSession.Ready)

	fourthSession := getSessionFromList(dbSessions, suite.boards["UpdateAll"].id, suite.users["Han"].id)
	suite.NotNil(fourthSession)
	suite.Equal(suite.users["Han"].id, fourthSession.User)
	suite.Equal(suite.boards["UpdateAll"].id, fourthSession.Board)
	suite.True(fourthSession.Connected)
	suite.True(fourthSession.Ready)
}

func (suite *DatabaseSessionTestSuite) Test_Database_Exists_True() {

	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Stan"].id

	exists, err := database.Exists(context.Background(), boardId, userId)

	suite.Nil(err)
	suite.True(exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_Exists_NotFound_Board() {

	database := NewSessionDatabase(suite.db)

	boardId := uuid.New()
	userId := suite.users["Stan"].id

	exists, err := database.Exists(context.Background(), boardId, userId)

	suite.Nil(err)
	suite.False(exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_Exists_NotFound_User() {

	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := uuid.New()

	exists, err := database.Exists(context.Background(), boardId, userId)

	suite.Nil(err)
	suite.False(exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_ModeratorExists_Owner() {

	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Stan"].id

	exists, err := database.ModeratorExists(context.Background(), boardId, userId)

	suite.Nil(err)
	suite.True(exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_ModeratorExists_Moderator() {

	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Friend"].id

	exists, err := database.ModeratorExists(context.Background(), boardId, userId)

	suite.Nil(err)
	suite.True(exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_ModeratorExists_Participant() {

	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Santa"].id

	exists, err := database.ModeratorExists(context.Background(), boardId, userId)

	suite.Nil(err)
	suite.False(exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_IsBanned() {

	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Bob"].id

	banned, err := database.IsParticipantBanned(context.Background(), boardId, userId)

	suite.Nil(err)
	suite.True(banned)
}

func (suite *DatabaseSessionTestSuite) Test_Database_IsNotBanned() {

	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Santa"].id

	banned, err := database.IsParticipantBanned(context.Background(), boardId, userId)

	suite.Nil(err)
	suite.False(banned)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetSession() {

	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := suite.users["Santa"].id

	dbSession, err := database.Get(context.Background(), boardId, userId)

	suite.Nil(err)
	suite.Equal(boardId, dbSession.Board)
	suite.Equal(userId, dbSession.User)
	suite.Equal(common.ParticipantRole, dbSession.Role)
	suite.True(dbSession.ShowHiddenColumns)
	suite.False(dbSession.Connected)
	suite.False(dbSession.Ready)
	suite.False(dbSession.RaisedHand)
	suite.NotNil(dbSession.CreatedAt)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetSession_NotFound_Board() {

	database := NewSessionDatabase(suite.db)

	boardId := uuid.New()
	userId := suite.users["Santa"].id

	dbSession, err := database.Get(context.Background(), boardId, userId)

	suite.NotNil(err)
	suite.Equal(sql.ErrNoRows, err)
	suite.Equal(DatabaseBoardSession{}, dbSession)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetSession_NotFound_User() {

	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id
	userId := uuid.New()

	dbSession, err := database.Get(context.Background(), boardId, userId)

	suite.NotNil(err)
	suite.Equal(sql.ErrNoRows, err)
	suite.Equal(DatabaseBoardSession{}, dbSession)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions() {

	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["Read"].id

	dbSessions, err := database.GetAll(context.Background(), boardId)

	suite.Nil(err)
	suite.Len(dbSessions, 4)

	firstSession := getSessionFromList(dbSessions, boardId, suite.sessions["Read1"].User)
	suite.NotNil(firstSession)
	suite.Equal(suite.sessions["Read1"].Board, firstSession.Board)
	suite.Equal(suite.sessions["Read1"].User, firstSession.User)

	secondSession := getSessionFromList(dbSessions, boardId, suite.sessions["Read2"].User)
	suite.NotNil(secondSession)
	suite.Equal(suite.sessions["Read2"].Board, secondSession.Board)
	suite.Equal(suite.sessions["Read2"].User, secondSession.User)

	thirdSession := getSessionFromList(dbSessions, boardId, suite.sessions["Read3"].User)
	suite.NotNil(thirdSession)
	suite.Equal(suite.sessions["Read3"].Board, thirdSession.Board)
	suite.Equal(suite.sessions["Read3"].User, thirdSession.User)

	fourthSession := getSessionFromList(dbSessions, boardId, suite.sessions["Read4"].User)
	suite.NotNil(fourthSession)
	suite.Equal(suite.sessions["Read4"].Board, fourthSession.Board)
	suite.Equal(suite.sessions["Read4"].User, fourthSession.User)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions_WithFilter_Ready() {

	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["ReadFilter"].id
	ready := true

	dbSessions, err := database.GetAll(context.Background(), boardId, BoardSessionFilter{Ready: &ready})

	suite.Nil(err)
	suite.Len(dbSessions, 2)

	firstSession := getSessionFromList(dbSessions, boardId, suite.sessions["ReadFilter1"].User)
	suite.NotNil(firstSession)
	suite.Equal(suite.sessions["ReadFilter1"].Board, firstSession.Board)
	suite.Equal(suite.sessions["ReadFilter1"].User, firstSession.User)
	suite.True(firstSession.Ready)

	secondSession := getSessionFromList(dbSessions, boardId, suite.sessions["ReadFilter2"].User)
	suite.NotNil(secondSession)
	suite.Equal(suite.sessions["ReadFilter2"].Board, secondSession.Board)
	suite.Equal(suite.sessions["ReadFilter2"].User, secondSession.User)
	suite.True(secondSession.Ready)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions_WithFilter_RaisedHand() {

	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["ReadFilter"].id
	raisedHand := true

	dbSessions, err := database.GetAll(context.Background(), boardId, BoardSessionFilter{RaisedHand: &raisedHand})

	suite.Nil(err)
	suite.Len(dbSessions, 2)

	firstSession := getSessionFromList(dbSessions, boardId, suite.sessions["ReadFilter3"].User)
	suite.NotNil(firstSession)
	suite.Equal(suite.sessions["ReadFilter3"].Board, firstSession.Board)
	suite.Equal(suite.sessions["ReadFilter3"].User, firstSession.User)
	suite.True(firstSession.RaisedHand)

	secondSession := getSessionFromList(dbSessions, boardId, suite.sessions["ReadFilter4"].User)
	suite.NotNil(secondSession)
	suite.Equal(suite.sessions["ReadFilter4"].Board, secondSession.Board)
	suite.Equal(suite.sessions["ReadFilter4"].User, secondSession.User)
	suite.True(secondSession.RaisedHand)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions_WithFilter_Connected() {

	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["ReadFilter"].id
	connected := true

	dbSessions, err := database.GetAll(context.Background(), boardId, BoardSessionFilter{Connected: &connected})

	suite.Nil(err)
	suite.Len(dbSessions, 2)

	firstSession := getSessionFromList(dbSessions, boardId, suite.sessions["ReadFilter1"].User)
	suite.NotNil(firstSession)
	suite.Equal(suite.sessions["ReadFilter1"].Board, firstSession.Board)
	suite.Equal(suite.sessions["ReadFilter1"].User, firstSession.User)
	suite.True(firstSession.Connected)

	secondSession := getSessionFromList(dbSessions, boardId, suite.sessions["ReadFilter3"].User)
	suite.NotNil(secondSession)
	suite.Equal(suite.sessions["ReadFilter3"].Board, secondSession.Board)
	suite.Equal(suite.sessions["ReadFilter3"].User, secondSession.User)
	suite.True(secondSession.Connected)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions_WithFilter_Role() {

	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["ReadFilter"].id
	role := common.OwnerRole

	dbSessions, err := database.GetAll(context.Background(), boardId, BoardSessionFilter{Role: &role})

	suite.Nil(err)
	suite.Len(dbSessions, 1)

	suite.Equal(suite.sessions["ReadFilter1"].Board, dbSessions[0].Board)
	suite.Equal(suite.sessions["ReadFilter1"].User, dbSessions[0].User)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions_WithMultipleFilter() {

	database := NewSessionDatabase(suite.db)

	boardId := suite.boards["ReadFilter"].id
	raisedHand := true
	connected := true

	dbSessions, err := database.GetAll(context.Background(), boardId, BoardSessionFilter{RaisedHand: &raisedHand, Connected: &connected})

	suite.Nil(err)
	suite.Len(dbSessions, 1)

	suite.Equal(suite.sessions["ReadFilter3"].Board, dbSessions[0].Board)
	suite.Equal(suite.sessions["ReadFilter3"].User, dbSessions[0].User)
	suite.Equal(suite.sessions["ReadFilter3"].Connected, dbSessions[0].Connected)
	suite.Equal(suite.sessions["ReadFilter3"].RaisedHand, dbSessions[0].RaisedHand)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetConnectedBoards() {

	database := NewSessionDatabase(suite.db)

	userId := suite.users["Stan"].id

	dbSessions, err := database.GetUserBoardSessions(context.Background(), userId, true)

	suite.Nil(err)
	suite.Len(dbSessions, 2)

	firstSession := getSessionFromList(dbSessions, suite.sessions["UpdateAll1"].Board, suite.sessions["UpdateAll1"].User)
	suite.NotNil(firstSession)
	suite.Equal(suite.sessions["UpdateAll1"].Board, firstSession.Board)
	suite.Equal(suite.sessions["UpdateAll1"].User, firstSession.User)
	suite.True(firstSession.Connected)

	secondSession := getSessionFromList(dbSessions, suite.sessions["ReadFilter1"].Board, suite.sessions["ReadFilter1"].User)
	suite.NotNil(secondSession)
	suite.Equal(suite.sessions["ReadFilter1"].Board, secondSession.Board)
	suite.Equal(suite.sessions["ReadFilter1"].User, secondSession.User)
	suite.True(secondSession.Connected)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetConnectedBoards_NotConnected() {

	database := NewSessionDatabase(suite.db)

	userId := suite.users["Friend"].id

	dbSessions, err := database.GetUserBoardSessions(context.Background(), userId, true)

	suite.Nil(err)
	suite.Equal([]DatabaseBoardSession(nil), dbSessions)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetBoards() {

	database := NewSessionDatabase(suite.db)

	userId := suite.users["Stan"].id

	dbSessions, err := database.GetUserBoardSessions(context.Background(), userId, false)

	suite.Nil(err)
	suite.Len(dbSessions, 3)

	session := suite.sessions["Read1"]
	firstSession := getSessionFromList(dbSessions, session.Board, session.User)
	suite.NotNil(firstSession)
	suite.Equal(session.Board, firstSession.Board)
	suite.Equal(session.User, firstSession.User)
	suite.False(firstSession.Connected)

	session = suite.sessions["UpdateAll1"]
	secondSession := getSessionFromList(dbSessions, session.Board, session.User)
	suite.NotNil(secondSession)
	suite.Equal(session.Board, secondSession.Board)
	suite.Equal(session.User, secondSession.User)
	suite.True(secondSession.Connected)

	session = suite.sessions["ReadFilter1"]
	thirdSession := getSessionFromList(dbSessions, session.Board, session.User)
	suite.NotNil(thirdSession)
	suite.Equal(session.Board, thirdSession.Board)
	suite.Equal(session.User, thirdSession.User)
	suite.True(thirdSession.Connected)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetBoards_NoBoards() {

	database := NewSessionDatabase(suite.db)

	unknownUserId := uuid.New()

	dbSessions, err := database.GetUserBoardSessions(context.Background(), unknownUserId, false)

	suite.Nil(err)
	suite.Equal([]DatabaseBoardSession(nil), dbSessions)
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

func getSessionFromList(list []DatabaseBoardSession, boardId uuid.UUID, userId uuid.UUID) *DatabaseBoardSession {
	for _, session := range list {
		if session.Board == boardId && session.User == userId {
			return &session
		}
	}
	return nil
}
