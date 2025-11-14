package users

import (
	"context"
	"database/sql"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/avatar"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/sessions"
)

type DatabaseUserTestSuite struct {
	suite.Suite
	container *postgres.PostgresContainer
	db        *bun.DB
	users     map[string]DatabaseUser
	boards    map[string]TestBoard
	sessions  map[string]sessions.BoardSession
}

func TestDatabaseUserTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseUserTestSuite))
}

func (suite *DatabaseUserTestSuite) SetupSuite() {
	container, bun := initialize.StartTestDatabase()

	suite.SeedDatabase(bun)

	suite.container = container
	suite.db = bun
}

func (suite *DatabaseUserTestSuite) TearDownSuite() {
	initialize.StopTestDatabase(suite.container)
}

func (suite *DatabaseUserTestSuite) Test_Database_Create_AnonymousUser() {
	t := suite.T()
	database := NewUserDatabase(suite.db)
	userName := "Stan"

	dbUser, err := database.CreateAnonymousUser(context.Background(), userName)

	assert.Nil(t, err)
	assert.Equal(t, userName, dbUser.Name)
	assert.Equal(t, common.Anonymous, dbUser.AccountType)
	assert.Nil(t, dbUser.KeyMigration)
	assert.NotNil(t, dbUser.CreatedAt)
	assert.Nil(t, dbUser.Avatar)
}

func (suite *DatabaseUserTestSuite) Test_Database_Create_AppleUser() {
	t := suite.T()
	database := NewUserDatabase(suite.db)
	userName := "Stan"

	dbUser, err := database.CreateAppleUser(context.Background(), "appleId", userName, "")

	assert.Nil(t, err)
	assert.Equal(t, userName, dbUser.Name)
	assert.Equal(t, common.Apple, dbUser.AccountType)
	assert.Nil(t, dbUser.KeyMigration)
	assert.NotNil(t, dbUser.CreatedAt)
	assert.Nil(t, dbUser.Avatar)
}

func (suite *DatabaseUserTestSuite) Test_Database_Create_AzureAdUser() {
	t := suite.T()
	database := NewUserDatabase(suite.db)
	userName := "Stan"

	dbUser, err := database.CreateAzureAdUser(context.Background(), "azureId", userName, "")

	assert.Nil(t, err)
	assert.Equal(t, userName, dbUser.Name)
	assert.Equal(t, common.AzureAd, dbUser.AccountType)
	assert.Nil(t, dbUser.KeyMigration)
	assert.NotNil(t, dbUser.CreatedAt)
	assert.Nil(t, dbUser.Avatar)
}

func (suite *DatabaseUserTestSuite) Test_Database_Create_GitHubUser() {
	t := suite.T()
	database := NewUserDatabase(suite.db)
	userName := "Stan"

	dbUser, err := database.CreateGitHubUser(context.Background(), "githubId", userName, "")

	assert.Nil(t, err)
	assert.Equal(t, userName, dbUser.Name)
	assert.Equal(t, common.GitHub, dbUser.AccountType)
	assert.Nil(t, dbUser.KeyMigration)
	assert.NotNil(t, dbUser.CreatedAt)
	assert.Nil(t, dbUser.Avatar)
}

func (suite *DatabaseUserTestSuite) Test_Database_Create_GoogleUser() {
	t := suite.T()
	database := NewUserDatabase(suite.db)
	userName := "Stan"

	dbUser, err := database.CreateGoogleUser(context.Background(), "googleId", userName, "")

	assert.Nil(t, err)
	assert.Equal(t, userName, dbUser.Name)
	assert.Equal(t, common.Google, dbUser.AccountType)
	assert.Nil(t, dbUser.KeyMigration)
	assert.NotNil(t, dbUser.CreatedAt)
	assert.Nil(t, dbUser.Avatar)
}

func (suite *DatabaseUserTestSuite) Test_Database_Create_MicrosoftUser() {
	t := suite.T()
	database := NewUserDatabase(suite.db)
	userName := "Stan"

	dbUser, err := database.CreateMicrosoftUser(context.Background(), "microsoftId", userName, "")

	assert.Nil(t, err)
	assert.Equal(t, userName, dbUser.Name)
	assert.Equal(t, common.Microsoft, dbUser.AccountType)
	assert.Nil(t, dbUser.KeyMigration)
	assert.NotNil(t, dbUser.CreatedAt)
	assert.Nil(t, dbUser.Avatar)
}

func (suite *DatabaseUserTestSuite) Test_Database_Create_OIDCUser() {
	t := suite.T()
	database := NewUserDatabase(suite.db)
	userName := "Stan"

	dbUser, err := database.CreateOIDCUser(context.Background(), "oidcId", userName, "")

	assert.Nil(t, err)
	assert.Equal(t, userName, dbUser.Name)
	assert.Equal(t, common.TypeOIDC, dbUser.AccountType)
	assert.Nil(t, dbUser.KeyMigration)
	assert.NotNil(t, dbUser.CreatedAt)
	assert.Nil(t, dbUser.Avatar)
}

func (suite *DatabaseUserTestSuite) Test_Database_UpdateUser() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := suite.users["Update"].ID
	userName := "Stan"
	avatar := common.Avatar{ClotheColor: avatar.ClotheColorBlack, ClotheType: avatar.ClotheTypeCollarSweater}

	dbUser, err := database.UpdateUser(context.Background(), DatabaseUserUpdate{ID: userId, Name: userName, Avatar: &avatar})

	assert.Nil(t, err)
	assert.Equal(t, userId, dbUser.ID)
	assert.Equal(t, userName, dbUser.Name)
	assert.Equal(t, common.Anonymous, dbUser.AccountType)
	assert.Equal(t, &avatar, dbUser.Avatar)
	assert.Nil(t, dbUser.KeyMigration)
	assert.NotNil(t, dbUser.CreatedAt)
}

func (suite *DatabaseUserTestSuite) Test_Database_GetUser() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := suite.users["Stan"].ID

	dbUser, err := database.GetUser(context.Background(), userId)

	assert.Nil(t, err)
	assert.Equal(t, suite.users["Stan"].ID, dbUser.ID)
	assert.Equal(t, suite.users["Stan"].Name, dbUser.Name)
	assert.Equal(t, suite.users["Stan"].AccountType, dbUser.AccountType)
	assert.Equal(t, suite.users["Stan"].KeyMigration, dbUser.KeyMigration)
	assert.Equal(t, suite.users["Stan"].Avatar, dbUser.Avatar)
}

func (suite *DatabaseUserTestSuite) Test_Database_GetBoardUsers_WithSessions() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	boardID := suite.boards["Update"].id

	// call the method under test
	users, err := database.GetUsers(context.Background(), boardID)
	assert.Nil(t, err)
	assert.Len(t, users, 3)

	// verify returned user IDs contain both expected users
	found := make(map[uuid.UUID]bool)
	for _, u := range users {
		found[u.ID] = true
	}

	assert.True(t, found[suite.users["Stan"].ID], "expected Stan to be returned")
	assert.True(t, found[suite.users["Friend"].ID], "expected Friend to be returned")
	assert.True(t, found[suite.users["Santa"].ID], "expected Santa to be returned")

}

func (suite *DatabaseUserTestSuite) Test_Database_GetBoardUsers_Empty() {
	t := suite.T()
	database := NewUserDatabase(suite.db)
	boardID := uuid.New()

	dbUser, err := database.GetUsers(context.Background(), boardID)

	assert.Nil(t, err)
	assert.Empty(t, dbUser)
}

func (suite *DatabaseUserTestSuite) Test_Database_GetUser_NotFound() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := uuid.New()

	dbUser, err := database.GetUser(context.Background(), userId)

	assert.Equal(t, DatabaseUser{}, dbUser)
	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
}

func (suite *DatabaseUserTestSuite) Test_Database_IsAnonymousUser_True() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := suite.users["Friend"].ID

	isAnonymous, err := database.IsUserAnonymous(context.Background(), userId)

	assert.Nil(t, err)
	assert.True(t, isAnonymous)
}

func (suite *DatabaseUserTestSuite) Test_Database_IsAnonymousUser_False() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := suite.users["Stan"].ID

	isAnonymous, err := database.IsUserAnonymous(context.Background(), userId)

	assert.Nil(t, err)
	assert.False(t, isAnonymous)
}

func (suite *DatabaseUserTestSuite) Test_Database_IsAvailableForKeyMigration_True() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := suite.users["Friend"].ID

	isAvailable, err := database.IsUserAvailableForKeyMigration(context.Background(), userId)

	assert.Nil(t, err)
	assert.True(t, isAvailable)
}

func (suite *DatabaseUserTestSuite) Test_Database_IsAvailableForKeyMigration_False() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := suite.users["Stan"].ID

	isAvailable, err := database.IsUserAvailableForKeyMigration(context.Background(), userId)

	assert.Nil(t, err)
	assert.False(t, isAvailable)
}

func (suite *DatabaseUserTestSuite) Test_Database_SetKeyMigration() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := suite.users["Santa"].ID

	dbUser, err := database.SetKeyMigration(context.Background(), userId)

	assert.Nil(t, err)
	assert.Equal(t, suite.users["Santa"].ID, dbUser.ID)
	assert.Equal(t, suite.users["Santa"].Name, dbUser.Name)
	assert.Equal(t, suite.users["Santa"].AccountType, dbUser.AccountType)
	assert.NotNil(t, dbUser.KeyMigration)
	assert.Equal(t, suite.users["Santa"].Avatar, dbUser.Avatar)
}

func (suite *DatabaseUserTestSuite) SeedDatabase(db *bun.DB) {
	// test users
	suite.users = make(map[string]DatabaseUser, 4)
	suite.users["Stan"] = DatabaseUser{ID: uuid.New(), Name: "Stan", AccountType: common.Google}
	suite.users["Friend"] = DatabaseUser{ID: uuid.New(), Name: "Friend", AccountType: common.Anonymous}
	suite.users["Santa"] = DatabaseUser{ID: uuid.New(), Name: "Santa", AccountType: common.Anonymous}
	suite.users["Update"] = DatabaseUser{ID: uuid.New(), Name: "UpdateMe", AccountType: common.Anonymous}

	// test boards
	suite.boards = make(map[string]TestBoard, 1)
	suite.boards["Update"] = TestBoard{id: uuid.New(), name: "Update"}

	// test sessions
	suite.sessions = make(map[string]sessions.BoardSession, 1)
	suite.sessions["Stan"] = sessions.BoardSession{UserID: suite.users["Stan"].ID, Board: suite.boards["Update"].id, Role: common.OwnerRole, Connected: true}
	suite.sessions["Friend"] = sessions.BoardSession{UserID: suite.users["Friend"].ID, Board: suite.boards["Update"].id, Role: common.ParticipantRole, Connected: true}
	suite.sessions["Santa"] = sessions.BoardSession{UserID: suite.users["Santa"].ID, Board: suite.boards["Update"].id, Role: common.ParticipantRole, Connected: true}

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
		err := initialize.InsertSession(db, session.UserID, session.Board, string(session.Role), session.Banned, session.Ready, session.Connected, session.RaisedHand)
		if err != nil {
			log.Fatalf("Failed to insert test sessions %s", err)
		}
	}
}
