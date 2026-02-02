package users

import (
	"context"
	"database/sql"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/avatar"
	"scrumlr.io/server/initialize/testDbTemplates"
	"scrumlr.io/server/sessions"
)

type testBoard struct {
	id   uuid.UUID
	name string
}

type DatabaseUserTestSuite struct {
	suite.Suite
	db       *bun.DB
	users    map[string]DatabaseUser
	boards   map[string]testBoard
	sessions map[string]sessions.BoardSession
}

func TestDatabaseUserTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseUserTestSuite))
}

func (suite *DatabaseUserTestSuite) SetupTest() {
	suite.db = testDbTemplates.NewBaseTestDB(
		suite.T(),
		false,
		testDbTemplates.AdditionalSeed{
			Name: "users_database_test_data",
			Func: suite.seedData,
		},
	)
}

func (suite *DatabaseUserTestSuite) TesDatabaseCreatAnonymousUser() {
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

func (suite *DatabaseUserTestSuite) TesDatabaseCreatAppleUser() {
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

func (suite *DatabaseUserTestSuite) TesDatabaseCreatAzureAdUser() {
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

func (suite *DatabaseUserTestSuite) TesDatabaseCreatGitHubUser() {
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

func (suite *DatabaseUserTestSuite) TestDatabaseCreateGoogleUser() {
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

func (suite *DatabaseUserTestSuite) TestDatabaseUpdateGoogleUser() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	existingUserID := suite.users["ExistingGoogleUser"].ID
	googleID := "existingGoogleId"
	updatedName := "UpdatedName"
	updatedAvatarUrl := "https://example.com/avatar.jpg"

	dbUser, err := database.CreateGoogleUser(context.Background(), googleID, updatedName, updatedAvatarUrl)

	// check that the existing user was updated in the main users table
	assert.Nil(t, err)
	assert.Equal(t, existingUserID, dbUser.ID)
	assert.Equal(t, updatedName, dbUser.Name)
	assert.Equal(t, common.Google, dbUser.AccountType)
	assert.Nil(t, dbUser.KeyMigration)
	assert.NotNil(t, dbUser.CreatedAt)

	// check the same for the external google_users table
	var externalUser struct {
		Name      string
		AvatarUrl string
	}
	err = suite.db.NewSelect().
		Table("google_users").
		Column("name", "avatar_url").
		Where("id = ?", googleID).
		Scan(context.Background(), &externalUser)

	assert.Nil(t, err)
	assert.Equal(t, updatedName, externalUser.Name)
	assert.Equal(t, updatedAvatarUrl, externalUser.AvatarUrl)
}

func (suite *DatabaseUserTestSuite) TestDatabaseCreateMicrosoftUser() {
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

func (suite *DatabaseUserTestSuite) TestDatabaseCreateOIDCUser() {
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

func (suite *DatabaseUserTestSuite) TestDatabaseUpdateUser() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := suite.users["Update"].ID
	userName := "Stan"
	userAvatar := common.Avatar{ClotheColor: avatar.ClotheColorBlack, ClotheType: avatar.ClotheTypeCollarSweater}

	dbUser, err := database.UpdateUser(context.Background(), DatabaseUserUpdate{ID: userId, Name: userName, Avatar: &userAvatar})

	assert.Nil(t, err)
	assert.Equal(t, userId, dbUser.ID)
	assert.Equal(t, userName, dbUser.Name)
	assert.Equal(t, common.Anonymous, dbUser.AccountType)
	assert.Equal(t, &userAvatar, dbUser.Avatar)
	assert.Nil(t, dbUser.KeyMigration)
	assert.NotNil(t, dbUser.CreatedAt)
}

func (suite *DatabaseUserTestSuite) TestDatabaseDeleteUser() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := suite.users["Delete"].ID

	err := database.DeleteUser(context.Background(), userId)

	assert.Nil(t, err)
}

func (suite *DatabaseUserTestSuite) TestDatabaseGetUser() {
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

func (suite *DatabaseUserTestSuite) TestDatabaseGetBoardUsersWithSessions() {
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

func (suite *DatabaseUserTestSuite) TestDatabaseGetBoardUsersEmpty() {
	t := suite.T()
	database := NewUserDatabase(suite.db)
	boardID := uuid.New()

	dbUser, err := database.GetUsers(context.Background(), boardID)

	assert.Nil(t, err)
	assert.Empty(t, dbUser)
}

func (suite *DatabaseUserTestSuite) TestDatabaseGetUserNotFound() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := uuid.New()

	dbUser, err := database.GetUser(context.Background(), userId)

	assert.Equal(t, DatabaseUser{}, dbUser)
	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
}

func (suite *DatabaseUserTestSuite) TesDatabasIsAnonymousUseTrue() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := suite.users["Friend"].ID

	isAnonymous, err := database.IsUserAnonymous(context.Background(), userId)

	assert.Nil(t, err)
	assert.True(t, isAnonymous)
}

func (suite *DatabaseUserTestSuite) TesDatabasIsAnonymousUseFalse() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := suite.users["Stan"].ID

	isAnonymous, err := database.IsUserAnonymous(context.Background(), userId)

	assert.Nil(t, err)
	assert.False(t, isAnonymous)
}

func (suite *DatabaseUserTestSuite) TesDatabasIsAvailableForKeyMigratioTrue() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := suite.users["Friend"].ID

	isAvailable, err := database.IsUserAvailableForKeyMigration(context.Background(), userId)

	assert.Nil(t, err)
	assert.True(t, isAvailable)
}

func (suite *DatabaseUserTestSuite) TesDatabasIsAvailableForKeyMigratioFalse() {
	t := suite.T()
	database := NewUserDatabase(suite.db)

	userId := suite.users["Stan"].ID

	isAvailable, err := database.IsUserAvailableForKeyMigration(context.Background(), userId)

	assert.Nil(t, err)
	assert.False(t, isAvailable)
}

func (suite *DatabaseUserTestSuite) TesDatabasSetKeyMigration() {
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

func (suite *DatabaseUserTestSuite) seedData(db *bun.DB) {
	log.Println("Seeding users database test data")

	// test users
	suite.users = make(map[string]DatabaseUser, 6)
	suite.users["Stan"] = DatabaseUser{ID: uuid.New(), Name: "Stan", AccountType: common.Google}
	suite.users["Friend"] = DatabaseUser{ID: uuid.New(), Name: "Friend", AccountType: common.Anonymous}
	suite.users["Santa"] = DatabaseUser{ID: uuid.New(), Name: "Santa", AccountType: common.Anonymous}
	suite.users["Update"] = DatabaseUser{ID: uuid.New(), Name: "UpdateMe", AccountType: common.Anonymous}
	suite.users["Delete"] = DatabaseUser{ID: uuid.New(), Name: "DeleteMe", AccountType: common.GitHub}
	suite.users["ExistingGoogleUser"] = DatabaseUser{ID: uuid.New(), Name: "OldName", AccountType: common.Google}

	// test boards
	suite.boards = make(map[string]testBoard, 1)
	suite.boards["Update"] = testBoard{id: uuid.New(), name: "Update"}

	// test sessions
	suite.sessions = make(map[string]sessions.BoardSession, 1)
	suite.sessions["Stan"] = sessions.BoardSession{UserID: suite.users["Stan"].ID, Board: suite.boards["Update"].id, Role: common.OwnerRole, Connected: true}
	suite.sessions["Friend"] = sessions.BoardSession{UserID: suite.users["Friend"].ID, Board: suite.boards["Update"].id, Role: common.ParticipantRole, Connected: true}
	suite.sessions["Santa"] = sessions.BoardSession{UserID: suite.users["Santa"].ID, Board: suite.boards["Update"].id, Role: common.ParticipantRole, Connected: true}

	for _, user := range suite.users {
		err := testDbTemplates.InsertUser(db, user.ID, user.Name, string(user.AccountType))
		if err != nil {
			log.Fatalf("Failed to insert test user %s", err)
		}
	}

	err := testDbTemplates.InsertGoogleUser(db, suite.users["ExistingGoogleUser"].ID, "existingGoogleId", "OldName", "")
	if err != nil {
		log.Fatalf("Failed to insert google_users entry %s", err)
	}

	for _, board := range suite.boards {
		err := testDbTemplates.InsertBoard(db, board.id, board.name, "", nil, nil, "PUBLIC", true, true, true, true, false)
		if err != nil {
			log.Fatalf("Failed to insert test board %s", err)
		}
	}

	for _, session := range suite.sessions {
		err := testDbTemplates.InsertSession(db, session.UserID, session.Board, string(session.Role), session.Banned, session.Ready, session.Connected, session.RaisedHand)
		if err != nil {
			log.Fatalf("Failed to insert test sessions %s", err)
		}
	}
}
