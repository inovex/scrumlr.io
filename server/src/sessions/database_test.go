package sessions

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
	"scrumlr.io/server/common/avatar"
	"scrumlr.io/server/databaseinitialize"
)

type DatabaseUserTestSuite struct {
	suite.Suite
	container *postgres.PostgresContainer
	db        *bun.DB
	users     map[string]DatabaseUser
}

func TestDatabaseUserTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseUserTestSuite))
}

func (suite *DatabaseUserTestSuite) SetupSuite() {
	container, bun := databaseinitialize.StartTestDatabase()

	suite.SeedDatabase(bun)

	suite.container = container
	suite.db = bun
}

func (suite *DatabaseUserTestSuite) TearDownSuite() {
	databaseinitialize.StopTestDatabase(suite.container)
}

func (suite *DatabaseUserTestSuite) Test_Database_Create_AnonymousUser() {
	t := suite.T()
	database := NewUserDatabase(suite.db)
	userName := "Stan"

	dbUser, err := database.CreateAnonymousUser(userName)

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

	dbUser, err := database.CreateAppleUser("appleId", userName, "")

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

	dbUser, err := database.CreateAzureAdUser("azureId", userName, "")

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

	dbUser, err := database.CreateGitHubUser("githubId", userName, "")

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

	dbUser, err := database.CreateGoogleUser("googleId", userName, "")

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

	dbUser, err := database.CreateMicrosoftUser("microsoftId", userName, "")

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

	dbUser, err := database.CreateOIDCUser("oidcId", userName, "")

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

	dbUser, err := database.UpdateUser(DatabaseUserUpdate{ID: userId, Name: userName, Avatar: &avatar})

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

	dbUser, err := database.GetUser(userId)

	assert.Nil(t, err)
	assert.Equal(t, suite.users["Stan"].ID, dbUser.ID)
	assert.Equal(t, suite.users["Stan"].Name, dbUser.Name)
	assert.Equal(t, suite.users["Stan"].AccountType, dbUser.AccountType)
	assert.Equal(t, suite.users["Stan"].KeyMigration, dbUser.KeyMigration)
	assert.Equal(t, suite.users["Stan"].Avatar, dbUser.Avatar)
}

func (suite *DatabaseUserTestSuite) Test_Database_GetUser_NotFound() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := uuid.New()

	dbUser, err := database.GetUser(userId)

	assert.Equal(t, DatabaseUser{}, dbUser)
	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
}

func (suite *DatabaseUserTestSuite) Test_Database_IsAnonymousUser_True() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := suite.users["Friend"].ID

	isAnonymous, err := database.IsUserAnonymous(userId)

	assert.Nil(t, err)
	assert.True(t, isAnonymous)
}

func (suite *DatabaseUserTestSuite) Test_Database_IsAnonymousUser_False() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := suite.users["Stan"].ID

	isAnonymous, err := database.IsUserAnonymous(userId)

	assert.Nil(t, err)
	assert.False(t, isAnonymous)
}

func (suite *DatabaseUserTestSuite) Test_Database_IsAvailableForKeyMigration_True() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := suite.users["Friend"].ID

	isAvailable, err := database.IsUserAvailableForKeyMigration(userId)

	assert.Nil(t, err)
	assert.True(t, isAvailable)
}

func (suite *DatabaseUserTestSuite) Test_Database_IsAvailableForKeyMigration_False() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := suite.users["Stan"].ID

	isAvailable, err := database.IsUserAvailableForKeyMigration(userId)

	assert.Nil(t, err)
	assert.False(t, isAvailable)
}

func (suite *DatabaseUserTestSuite) Test_Database_SetKeyMigration() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := suite.users["Santa"].ID

	dbUser, err := database.SetKeyMigration(userId)

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

	for _, user := range suite.users {
		err := databaseinitialize.InsertUser(db, user.ID, user.Name, string(user.AccountType))
		if err != nil {
			log.Fatalf("Failed to insert test user %s", err)
		}
	}
}
