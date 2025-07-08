package sessions

import (
	"context"
	"database/sql"
	"log"
	"os"
	"path/filepath"
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

	path := filepath.Join("session_testdata.sql") // seding database
	sql, err := os.ReadFile(path)
	if err != nil {
		log.Fatalf("Failed to read testdata %s", err)
	}

	_, err = db.Exec(string(sql))
	if err != nil {
		log.Fatalf("Failed to seed database %s", err)
	}

	bunDb := databaseinitialize.InitializeBun(db, true) // setup bun

	suite.container = pgcontainer
	suite.db = bunDb
}

func (suite *DatabaseSessionTestSuite) TearDownSuite() {
	if err := testcontainers.TerminateContainer(suite.container); err != nil {
		log.Fatalf("Failed to terminate container: %s", err)
	}
}

func (suite *DatabaseSessionTestSuite) Test_Database_CreateSession() {

}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateSession() {

}

func (suite *DatabaseSessionTestSuite) Test_Database_UpdateAllSession() {

}

func (suite *DatabaseSessionTestSuite) Test_Database_Exists_True() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := uuid.MustParse("a359f156-7a13-4afc-8a0c-beddc9ccd455")
	userId := uuid.MustParse("7c57533e-3f39-477a-a753-56e7a92f9831")

	exists, err := database.Exists(boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_Exists_NotFound_Board() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := uuid.MustParse("772ee44a-3408-4188-8ecc-0e1626ecffbc")
	userId := uuid.MustParse("7c57533e-3f39-477a-a753-56e7a92f9831")

	exists, err := database.Exists(boardId, userId)

	assert.Nil(t, err)
	assert.False(t, exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_Exists_Notfound_User() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := uuid.MustParse("a359f156-7a13-4afc-8a0c-beddc9ccd455")
	userId := uuid.MustParse("c48b3023-7462-4d44-919f-b05600e40b43")

	exists, err := database.Exists(boardId, userId)

	assert.Nil(t, err)
	assert.False(t, exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_ModeratorExists_Owner() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := uuid.MustParse("a359f156-7a13-4afc-8a0c-beddc9ccd455")
	userId := uuid.MustParse("7c57533e-3f39-477a-a753-56e7a92f9831")

	exists, err := database.ModeratorExists(boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_ModeratorExists_Moderator() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := uuid.MustParse("a359f156-7a13-4afc-8a0c-beddc9ccd455")
	userId := uuid.MustParse("88894c86-51cb-4f5b-8ac7-cefc7e1aec00")

	exists, err := database.ModeratorExists(boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_ModeratorExists_Participant() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := uuid.MustParse("a359f156-7a13-4afc-8a0c-beddc9ccd455")
	userId := uuid.MustParse("ebe9194d-11ea-4c66-b130-03523e566919")

	exists, err := database.ModeratorExists(boardId, userId)

	assert.Nil(t, err)
	assert.False(t, exists)
}

func (suite *DatabaseSessionTestSuite) Test_Database_IsBanned() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := uuid.MustParse("a359f156-7a13-4afc-8a0c-beddc9ccd455")
	userId := uuid.MustParse("71be6023-6c01-4059-a05f-d5f67eeeafc3")

	banned, err := database.IsParticipantBanned(boardId, userId)

	assert.Nil(t, err)
	assert.False(t, banned)
}

func (suite *DatabaseSessionTestSuite) Test_Database_IsNotBanned() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := uuid.MustParse("a359f156-7a13-4afc-8a0c-beddc9ccd455")
	userId := uuid.MustParse("ebe9194d-11ea-4c66-b130-03523e566919")

	banned, err := database.IsParticipantBanned(boardId, userId)

	assert.Nil(t, err)
	assert.False(t, banned)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetSession() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := uuid.MustParse("a359f156-7a13-4afc-8a0c-beddc9ccd455")
	userId := uuid.MustParse("ebe9194d-11ea-4c66-b130-03523e566919")

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

	boardId := uuid.MustParse("b0cfb43a-e3b0-4bd4-9f90-9357366e8130")
	userId := uuid.MustParse("ebe9194d-11ea-4c66-b130-03523e566919")

	dbSession, err := database.Get(boardId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseBoardSession{}, dbSession)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetSessionNotFound_User() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := uuid.MustParse("a359f156-7a13-4afc-8a0c-beddc9ccd455")
	userId := uuid.MustParse("5438fafb-e2ce-45b7-8256-f456fa36214c")

	dbSession, err := database.Get(boardId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseBoardSession{}, dbSession)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := uuid.MustParse("a359f156-7a13-4afc-8a0c-beddc9ccd455")
	sessions := []DatabaseBoardSession{
		{
			Board:       boardId,
			User:        uuid.MustParse("7c57533e-3f39-477a-a753-56e7a92f9831"),
			AccountType: common.Google,
			Name:        "Stan",
			Role:        common.OwnerRole,
		},
		{
			Board:       boardId,
			User:        uuid.MustParse("88894c86-51cb-4f5b-8ac7-cefc7e1aec00"),
			AccountType: common.Anonymous,
			Name:        "Friend",
			Role:        common.ModeratorRole,
		},
		{
			Board:       boardId,
			User:        uuid.MustParse("ebe9194d-11ea-4c66-b130-03523e566919"),
			AccountType: common.Anonymous,
			Name:        "Santa",
			Role:        common.ParticipantRole,
		},
		{
			Board:       boardId,
			User:        uuid.MustParse("71be6023-6c01-4059-a05f-d5f67eeeafc3"),
			AccountType: common.Anonymous,
			Name:        "Bob",
			Role:        common.ParticipantRole,
		},
	}

	dbSessions, err := database.GetAll(boardId)

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 4)

	assert.Equal(t, sessions[0].Board, dbSessions[0].Board)
	assert.Equal(t, sessions[0].User, dbSessions[0].User)
	assert.Equal(t, sessions[0].Name, dbSessions[0].Name)
	assert.Equal(t, sessions[0].AccountType, dbSessions[0].AccountType)
	assert.Equal(t, sessions[0].Role, dbSessions[0].Role)

	assert.Equal(t, sessions[1].Board, dbSessions[1].Board)
	assert.Equal(t, sessions[1].User, dbSessions[1].User)
	assert.Equal(t, sessions[1].Name, dbSessions[1].Name)
	assert.Equal(t, sessions[1].AccountType, dbSessions[1].AccountType)
	assert.Equal(t, sessions[1].Role, dbSessions[1].Role)

	assert.Equal(t, sessions[2].Board, dbSessions[2].Board)
	assert.Equal(t, sessions[2].User, dbSessions[2].User)
	assert.Equal(t, sessions[2].Name, dbSessions[2].Name)
	assert.Equal(t, sessions[2].AccountType, dbSessions[2].AccountType)
	assert.Equal(t, sessions[2].Role, dbSessions[2].Role)

	assert.Equal(t, sessions[3].Board, dbSessions[3].Board)
	assert.Equal(t, sessions[3].User, dbSessions[3].User)
	assert.Equal(t, sessions[3].Name, dbSessions[3].Name)
	assert.Equal(t, sessions[3].AccountType, dbSessions[3].AccountType)
	assert.Equal(t, sessions[3].Role, dbSessions[3].Role)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions_WithFilter_Ready() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := uuid.MustParse("799bf01f-a3dd-40fe-bc24-6cf4d18cca3f")
	ready := true
	sessions := []DatabaseBoardSession{
		{
			Board:       boardId,
			User:        uuid.MustParse("7c57533e-3f39-477a-a753-56e7a92f9831"),
			AccountType: common.Google,
			Name:        "Stan",
			Role:        common.OwnerRole,
		},
		{
			Board:       boardId,
			User:        uuid.MustParse("88894c86-51cb-4f5b-8ac7-cefc7e1aec00"),
			AccountType: common.Anonymous,
			Name:        "Friend",
			Role:        common.ModeratorRole,
		},
	}

	dbSessions, err := database.GetAll(boardId, BoardSessionFilter{Ready: &ready})

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 2)

	assert.Equal(t, sessions[0].Board, dbSessions[0].Board)
	assert.Equal(t, sessions[0].User, dbSessions[0].User)
	assert.Equal(t, sessions[0].Name, dbSessions[0].Name)
	assert.Equal(t, sessions[0].AccountType, dbSessions[0].AccountType)
	assert.Equal(t, sessions[0].Role, dbSessions[0].Role)
	assert.True(t, dbSessions[0].Ready)

	assert.Equal(t, sessions[1].Board, dbSessions[1].Board)
	assert.Equal(t, sessions[1].User, dbSessions[1].User)
	assert.Equal(t, sessions[1].Name, dbSessions[1].Name)
	assert.Equal(t, sessions[1].AccountType, dbSessions[1].AccountType)
	assert.Equal(t, sessions[1].Role, dbSessions[1].Role)
	assert.True(t, dbSessions[1].Ready)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions_WithFilter_RaisedHand() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := uuid.MustParse("799bf01f-a3dd-40fe-bc24-6cf4d18cca3f")
	raisedHand := true
	sessions := []DatabaseBoardSession{
		{
			Board:       boardId,
			User:        uuid.MustParse("ebe9194d-11ea-4c66-b130-03523e566919"),
			AccountType: common.Anonymous,
			Name:        "Santa",
			Role:        common.ParticipantRole,
		},
		{
			Board:       boardId,
			User:        uuid.MustParse("71be6023-6c01-4059-a05f-d5f67eeeafc3"),
			AccountType: common.Anonymous,
			Name:        "Bob",
			Role:        common.ParticipantRole,
		},
	}

	dbSessions, err := database.GetAll(boardId, BoardSessionFilter{RaisedHand: &raisedHand})

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 2)

	assert.Equal(t, sessions[0].Board, dbSessions[0].Board)
	assert.Equal(t, sessions[0].User, dbSessions[0].User)
	assert.Equal(t, sessions[0].Name, dbSessions[0].Name)
	assert.Equal(t, sessions[0].AccountType, dbSessions[0].AccountType)
	assert.Equal(t, sessions[0].Role, dbSessions[0].Role)
	assert.True(t, dbSessions[0].RaisedHand)

	assert.Equal(t, sessions[1].Board, dbSessions[1].Board)
	assert.Equal(t, sessions[1].User, dbSessions[1].User)
	assert.Equal(t, sessions[1].Name, dbSessions[1].Name)
	assert.Equal(t, sessions[1].AccountType, dbSessions[1].AccountType)
	assert.Equal(t, sessions[1].Role, dbSessions[1].Role)
	assert.True(t, dbSessions[1].RaisedHand)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions_WithFilter_Connected() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := uuid.MustParse("799bf01f-a3dd-40fe-bc24-6cf4d18cca3f")
	connected := true
	sessions := []DatabaseBoardSession{
		{
			Board:       boardId,
			User:        uuid.MustParse("7c57533e-3f39-477a-a753-56e7a92f9831"),
			AccountType: common.Google,
			Name:        "Stan",
			Role:        common.OwnerRole,
		},
		{
			Board:       boardId,
			User:        uuid.MustParse("ebe9194d-11ea-4c66-b130-03523e566919"),
			AccountType: common.Anonymous,
			Name:        "Santa",
			Role:        common.ParticipantRole,
		},
	}

	dbSessions, err := database.GetAll(boardId, BoardSessionFilter{Connected: &connected})

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 2)

	assert.Equal(t, sessions[0].Board, dbSessions[0].Board)
	assert.Equal(t, sessions[0].User, dbSessions[0].User)
	assert.Equal(t, sessions[0].Name, dbSessions[0].Name)
	assert.Equal(t, sessions[0].AccountType, dbSessions[0].AccountType)
	assert.Equal(t, sessions[0].Role, dbSessions[0].Role)
	assert.True(t, dbSessions[0].Connected)

	assert.Equal(t, sessions[1].Board, dbSessions[1].Board)
	assert.Equal(t, sessions[1].User, dbSessions[1].User)
	assert.Equal(t, sessions[1].Name, dbSessions[1].Name)
	assert.Equal(t, sessions[1].AccountType, dbSessions[1].AccountType)
	assert.Equal(t, sessions[1].Role, dbSessions[1].Role)
	assert.True(t, dbSessions[1].Connected)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetAllSessions_WithFilter_Role() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	boardId := uuid.MustParse("799bf01f-a3dd-40fe-bc24-6cf4d18cca3f")
	role := common.OwnerRole
	sessions := []DatabaseBoardSession{
		{
			Board:       boardId,
			User:        uuid.MustParse("7c57533e-3f39-477a-a753-56e7a92f9831"),
			AccountType: common.Google,
			Name:        "Stan",
			Role:        common.OwnerRole,
		},
	}

	dbSessions, err := database.GetAll(boardId, BoardSessionFilter{Role: &role})

	assert.Nil(t, err)
	assert.Len(t, dbSessions, 1)

	assert.Equal(t, sessions[0].Board, dbSessions[0].Board)
	assert.Equal(t, sessions[0].User, dbSessions[0].User)
	assert.Equal(t, sessions[0].Name, dbSessions[0].Name)
	assert.Equal(t, sessions[0].AccountType, dbSessions[0].AccountType)
	assert.Equal(t, sessions[0].Role, dbSessions[0].Role)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetConnectedBoards() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := uuid.MustParse("7c57533e-3f39-477a-a753-56e7a92f9831")
	sessions := []DatabaseBoardSession{
		{
			Board:       uuid.MustParse("799bf01f-a3dd-40fe-bc24-6cf4d18cca3f"),
			User:        userId,
			AccountType: common.Google,
			Name:        "Stan",
			Role:        common.OwnerRole,
		},
	}

	dbSessions, err := database.GetUserConnectedBoards(userId)

	assert.Nil(t, err)
	assert.Equal(t, sessions[0].Board, dbSessions[0].Board)
	assert.Equal(t, sessions[0].User, dbSessions[0].User)
	assert.Equal(t, sessions[0].Name, dbSessions[0].Name)
	assert.Equal(t, sessions[0].AccountType, dbSessions[0].AccountType)
	assert.Equal(t, sessions[0].Role, dbSessions[0].Role)
}

func (suite *DatabaseSessionTestSuite) Test_Database_GetConnectedBoards_NotConnected() {
	t := suite.T()
	database := NewSessionDatabase(suite.db)

	userId := uuid.MustParse("88894c86-51cb-4f5b-8ac7-cefc7e1aec00")

	dbSessions, err := database.GetUserConnectedBoards(userId)

	assert.Nil(t, err)
	assert.Equal(t, []DatabaseBoardSession(nil), dbSessions)
}
