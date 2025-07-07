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
	"scrumlr.io/server/common/avatar"
	"scrumlr.io/server/databaseinitialize"
)

const POSTGRES_IMAGE = "postgres:17.5-alpine"
const DATABASE_NAME = "scrumlr_test"
const DATABASE_USERNAME = "stan"
const DATABASE_PASSWORD = "scrumlr"

type DatabaseUserTestSuite struct {
	suite.Suite
	container *postgres.PostgresContainer
	db        *bun.DB
}

func TestDatabaseUserTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseUserTestSuite))
}

func (suite *DatabaseUserTestSuite) SetupSuite() {
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

	path := filepath.Join("user_testdata.sql") // seding database
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

func (suite *DatabaseUserTestSuite) TearDownSuite() {
	if err := testcontainers.TerminateContainer(suite.container); err != nil {
		log.Fatalf("Failed to terminate container: %s", err)
	}
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

	userId := uuid.MustParse("8d513993-c4ac-4248-b699-a4053621337a")
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

	userId := uuid.MustParse("41ae8867-5dc0-4d9a-8de5-64a65156f017")
	user := DatabaseUser{
		ID:          userId,
		Name:        "Stan",
		AccountType: common.Google,
	}

	dbUser, err := database.GetUser(userId)

	assert.Nil(t, err)
	assert.Equal(t, user.ID, dbUser.ID)
	assert.Equal(t, user.Name, dbUser.Name)
	assert.Equal(t, user.AccountType, dbUser.AccountType)
	assert.Equal(t, user.KeyMigration, dbUser.KeyMigration)
	assert.Equal(t, user.Avatar, dbUser.Avatar)
}

func (suite *DatabaseUserTestSuite) Test_Database_GetUser_NotFound() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := uuid.MustParse("a06b3b65-465a-41be-b50a-c2cb5f3efb94")

	dbUser, err := database.GetUser(userId)

	assert.Equal(t, DatabaseUser{}, dbUser)
	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
}

func (suite *DatabaseUserTestSuite) Test_Database_IsAnonymousUser_True() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := uuid.MustParse("dfb63b1d-0f87-448d-99e4-d83c51ad4dbb")

	isAnonymous, err := database.IsUserAnonymous(userId)

	assert.Nil(t, err)
	assert.True(t, isAnonymous)
}

func (suite *DatabaseUserTestSuite) Test_Database_IsAnonymousUser_False() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := uuid.MustParse("41ae8867-5dc0-4d9a-8de5-64a65156f017")

	isAnonymous, err := database.IsUserAnonymous(userId)

	assert.Nil(t, err)
	assert.False(t, isAnonymous)
}

func (suite *DatabaseUserTestSuite) Test_Database_IsAvailableForKeyMigration_True() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := uuid.MustParse("dfb63b1d-0f87-448d-99e4-d83c51ad4dbb")

	isAvailable, err := database.IsUserAvailableForKeyMigration(userId)

	assert.Nil(t, err)
	assert.True(t, isAvailable)
}

func (suite *DatabaseUserTestSuite) Test_Database_IsAvailableForKeyMigration_False() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := uuid.MustParse("41ae8867-5dc0-4d9a-8de5-64a65156f017")

	isAvailable, err := database.IsUserAvailableForKeyMigration(userId)

	assert.Nil(t, err)
	assert.False(t, isAvailable)
}

func (suite *DatabaseUserTestSuite) Test_Database_SetKeyMigration() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := uuid.MustParse("9785798a-c57b-450f-b105-2d9b4f5f6edb")
	user := DatabaseUser{
		ID:          userId,
		Name:        "Santa",
		AccountType: common.Anonymous,
	}

	dbUser, err := database.SetKeyMigration(userId)

	assert.Nil(t, err)
	assert.Equal(t, user.ID, dbUser.ID)
	assert.Equal(t, user.Name, dbUser.Name)
	assert.Equal(t, user.AccountType, dbUser.AccountType)
	assert.NotNil(t, dbUser.KeyMigration)
	assert.Equal(t, user.Avatar, dbUser.Avatar)
}
