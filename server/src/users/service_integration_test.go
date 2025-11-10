package users

import (
	"context"
	"log"
	"slices"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/nats"
	"github.com/uptrace/bun"
	"scrumlr.io/server/cache"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/initialize/testDbTemplates"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessions"
)

type UserServiceIntegrationTestsuite struct {
	suite.Suite
	natsContainer        *nats.NATSContainer
	natsConnectionString string
	baseData             testDbTemplates.DbBaseIDs
	userService          UserService
	broker               *realtime.Broker

	// Additional test-specific data
	updateUser  testDbTemplates.TestUser
	deleteUser  testDbTemplates.TestUser
	updateBoard testDbTemplates.TestBoard
}

func TestUserServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(UserServiceIntegrationTestsuite))
}

func (suite *UserServiceIntegrationTestsuite) SetupSuite() {
	natsContainer, connectionString := initialize.StartTestNats()

	suite.natsContainer = natsContainer
	suite.natsConnectionString = connectionString
	suite.baseData = testDbTemplates.GetBaseIDs()
}

func (suite *UserServiceIntegrationTestsuite) TeardownSuite() {
	initialize.StopTestNats(suite.natsContainer)
}

func (suite *UserServiceIntegrationTestsuite) SetupTest() {
	suite.updateUser = testDbTemplates.TestUser{
		Name:        "UpdateMe",
		ID:          uuid.MustParse("a1b2c3d4-e5f6-7890-abcd-ef1234567890"),
		AccountType: common.Anonymous,
	}
	suite.deleteUser = testDbTemplates.TestUser{
		Name:        "DeleteMe",
		ID:          uuid.MustParse("b2c3d4e5-f6a7-8901-bcde-f12345678901"),
		AccountType: common.GitHub,
	}
	suite.updateBoard = testDbTemplates.TestBoard{
		Name: "UsersTestUpdate",
		ID:   uuid.MustParse("c3d4e5f6-a7b8-9012-cdef-123456789012"),
	}

	db := testDbTemplates.NewBaseTestDB(
		suite.T(),
		true,
		testDbTemplates.AdditionalSeed{
			Name: "users_test_data",
			Func: suite.seedUsersTestData,
		},
	)

	broker, err := realtime.NewNats(suite.natsConnectionString)
	require.NoError(suite.T(), err, "Failed to connect to nats server")

	ch, err := cache.NewNats(suite.natsConnectionString, "scrumlr-test-users")
	require.NoError(suite.T(), err, "Failed to connect to nats cache")

	noteDatabase := notes.NewNotesDatabase(db)
	noteService := notes.NewNotesService(noteDatabase, broker, ch)
	columnDatabase := columns.NewColumnsDatabase(db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	userDatabase := NewUserDatabase(db)
	userService := NewUserService(userDatabase, broker, sessionService)

	suite.userService = userService
	suite.broker = broker
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateAnonymous() {
	t := suite.T()
	ctx := context.Background()

	userName := "Test User"

	user, err := suite.userService.CreateAnonymous(ctx, userName)

	assert.Nil(t, err)
	assert.Equal(t, userName, user.Name)
	assert.Equal(t, common.Anonymous, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateAppleUser() {
	t := suite.T()
	ctx := context.Background()

	userName := "Test User"

	user, err := suite.userService.CreateAppleUser(ctx, "appleId", userName, "")

	assert.Nil(t, err)
	assert.Equal(t, userName, user.Name)
	assert.Equal(t, common.Apple, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateAzureAdUser() {
	t := suite.T()
	ctx := context.Background()

	userName := "Test User"

	user, err := suite.userService.CreateAzureAdUser(ctx, "azureId", userName, "")

	assert.Nil(t, err)
	assert.Equal(t, userName, user.Name)
	assert.Equal(t, common.AzureAd, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateGitHubUser() {
	t := suite.T()
	ctx := context.Background()

	userName := "Test User"

	user, err := suite.userService.CreateGitHubUser(ctx, "githubId", userName, "")

	assert.Nil(t, err)
	assert.Equal(t, userName, user.Name)
	assert.Equal(t, common.GitHub, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateGoogleUser() {
	t := suite.T()
	ctx := context.Background()

	userName := "Test User"

	user, err := suite.userService.CreateGoogleUser(ctx, "googleId", userName, "")

	assert.Nil(t, err)
	assert.Equal(t, userName, user.Name)
	assert.Equal(t, common.Google, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateMicrosoft() {
	t := suite.T()
	ctx := context.Background()

	userName := "Test User"

	user, err := suite.userService.CreateMicrosoftUser(ctx, "microsoftId", userName, "")

	assert.Nil(t, err)
	assert.Equal(t, userName, user.Name)
	assert.Equal(t, common.Microsoft, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateOIDCUser() {
	t := suite.T()
	ctx := context.Background()

	userName := "Test User"

	user, err := suite.userService.CreateOIDCUser(ctx, "oidcId", userName, "")

	assert.Nil(t, err)
	assert.Equal(t, userName, user.Name)
	assert.Equal(t, common.TypeOIDC, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_Update() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.updateUser.ID
	boardId := suite.updateBoard.ID
	userName := "Test User"

	events := suite.broker.GetBoardChannel(ctx, boardId)

	user, err := suite.userService.Update(ctx, UserUpdateRequest{ID: userId, Name: userName})

	assert.Nil(t, err)
	assert.Equal(t, userId, user.ID)
	assert.Equal(t, userName, user.Name)

	msg := <-events
	assert.Equal(t, realtime.BoardEventParticipantUpdated, msg.Type)
	sessionData := msg.Data.(map[string]interface{})
	assert.True(t, sessionData["connected"].(bool))
	assert.Equal(t, string(common.OwnerRole), sessionData["role"].(string))
}

func (suite *UserServiceIntegrationTestsuite) Test_Delete() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.deleteUser.ID

	err := suite.userService.Delete(ctx, userId)

	assert.Nil(t, err)
}

func (suite *UserServiceIntegrationTestsuite) Test_Get() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.baseData.Users["Stan"].ID

	user, err := suite.userService.Get(ctx, userId)

	assert.Nil(t, err)
	assert.Equal(t, userId, user.ID)
	assert.Equal(t, suite.baseData.Users["Stan"].Name, user.Name)
}

func (suite *UserServiceIntegrationTestsuite) Test_Get_NotFound() {
	t := suite.T()
	ctx := context.Background()

	userId := uuid.New()

	user, err := suite.userService.Get(ctx, userId)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func (suite *UserServiceIntegrationTestsuite) Test_GetBoardUsers() {
	t := suite.T()
	ctx := context.Background()

	board := suite.updateBoard
	userIds := []uuid.UUID{suite.baseData.Users["Stan"].ID, suite.updateUser.ID}

	users, err := suite.userService.GetBoardUsers(ctx, board.ID)

	ids := slices.Collect(func(yield func(uuid.UUID) bool) {
		for _, user := range users {
			yield(user.ID)
		}
	})
	assert.Nil(t, err)
	assert.ElementsMatch(t, userIds, ids)
}

func (suite *UserServiceIntegrationTestsuite) Test_AvailableForKeyMigration() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.baseData.Users["Santa"].ID

	available, err := suite.userService.IsUserAvailableForKeyMigration(ctx, userId)

	assert.Nil(t, err)
	assert.True(t, available)
}

func (suite *UserServiceIntegrationTestsuite) Test_SetKeyMigration() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.baseData.Users["Stan"].ID

	user, err := suite.userService.SetKeyMigration(ctx, userId)

	assert.Nil(t, err)
	assert.Equal(t, userId, user.ID)
}

func (suite *UserServiceIntegrationTestsuite) seedUsersTestData(db *bun.DB) {
	log.Println("Seeding users test data")

	if err := testDbTemplates.InsertUser(db, suite.updateUser.ID, suite.updateUser.Name, string(suite.updateUser.AccountType)); err != nil {
		log.Fatalf("Failed to insert update user: %s", err)
	}
	if err := testDbTemplates.InsertUser(db, suite.deleteUser.ID, suite.deleteUser.Name, string(suite.deleteUser.AccountType)); err != nil {
		log.Fatalf("Failed to insert delete user: %s", err)
	}

	if err := testDbTemplates.InsertBoard(db, suite.updateBoard.ID, suite.updateBoard.Name, "", nil, nil, "PUBLIC", true, true, true, true, false); err != nil {
		log.Fatalf("Failed to insert test board: %s", err)
	}

	if err := testDbTemplates.InsertSession(db, suite.baseData.Users["Stan"].ID, suite.updateBoard.ID, string(common.OwnerRole), false, false, true, false); err != nil {
		log.Fatalf("Failed to insert Stan session: %s", err)
	}
	if err := testDbTemplates.InsertSession(db, suite.updateUser.ID, suite.updateBoard.ID, string(common.OwnerRole), false, false, true, false); err != nil {
		log.Fatalf("Failed to insert Update user session: %s", err)
	}
}
