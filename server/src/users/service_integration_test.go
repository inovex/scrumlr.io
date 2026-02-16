package users

import (
	"context"
	"log"
	"slices"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/nats"
	"github.com/uptrace/bun"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/initialize/testDbTemplates"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/technical_helper"
)

type UserServiceIntegrationTestsuite struct {
	suite.Suite
	natsContainer        *nats.NATSContainer
	natsConnectionString string
	baseData             testDbTemplates.DbBaseIDs
	userService          UserService
	notesService         notes.NotesService
	broker               *realtime.Broker
	ctx                  context.Context
	testUserName         string

	// Additional test-specific data
	updateUser   testDbTemplates.TestUser
	deleteUser   testDbTemplates.TestUser
	updateBoard  testDbTemplates.TestBoard
	deleteColumn testDbTemplates.TestColumn
	deleteNote   testDbTemplates.TestNote
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
	suite.deleteColumn = testDbTemplates.TestColumn{
		Name:    "UsersDeleteColumn",
		ID:      uuid.MustParse("d4e5f6a7-b8c9-0123-def4-234567890123"),
		BoardID: suite.updateBoard.ID,
	}
	suite.deleteNote = testDbTemplates.TestNote{
		Name:     "UsersDeleteNote",
		ID:       uuid.MustParse("e5f6a7b8-c9d0-1234-ef56-345678901234"),
		AuthorID: suite.deleteUser.ID,
		BoardID:  suite.updateBoard.ID,
		ColumnID: suite.deleteColumn.ID,
		Text:     "Delete user note",
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

	noteDatabase := notes.NewNotesDatabase(db)
	noteService := notes.NewNotesService(noteDatabase, broker)
	columnDatabase := columns.NewColumnsDatabase(db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	userDatabase := NewUserDatabase(db)
	userService := NewUserService(userDatabase, broker, sessionService, noteService)

	suite.userService = userService
	suite.notesService = noteService
	suite.broker = broker
	suite.ctx = context.Background()
	suite.testUserName = "Test User"
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateAnonymous() {

	user, err := suite.userService.CreateAnonymous(suite.ctx, suite.testUserName)

	suite.Nil(err)
	suite.Equal(suite.testUserName, user.Name)
	suite.Equal(common.Anonymous, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateAppleUser() {

	user, err := suite.userService.CreateAppleUser(suite.ctx, "appleId", suite.testUserName, "")

	suite.Nil(err)
	suite.Equal(suite.testUserName, user.Name)
	suite.Equal(common.Apple, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateAzureAdUser() {

	user, err := suite.userService.CreateAzureAdUser(suite.ctx, "azureId", suite.testUserName, "")

	suite.Nil(err)
	suite.Equal(suite.testUserName, user.Name)
	suite.Equal(common.AzureAd, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateGitHubUser() {

	user, err := suite.userService.CreateGitHubUser(suite.ctx, "githubId", suite.testUserName, "")

	suite.Nil(err)
	suite.Equal(suite.testUserName, user.Name)
	suite.Equal(common.GitHub, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateGoogleUser() {

	user, err := suite.userService.CreateGoogleUser(suite.ctx, "googleId", suite.testUserName, "")

	suite.Nil(err)
	suite.Equal(suite.testUserName, user.Name)
	suite.Equal(common.Google, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateMicrosoft() {

	user, err := suite.userService.CreateMicrosoftUser(suite.ctx, "microsoftId", suite.testUserName, "")

	suite.Nil(err)
	suite.Equal(suite.testUserName, user.Name)
	suite.Equal(common.Microsoft, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateOIDCUser() {

	user, err := suite.userService.CreateOIDCUser(suite.ctx, "oidcId", suite.testUserName, "")

	suite.Nil(err)
	suite.Equal(suite.testUserName, user.Name)
	suite.Equal(common.TypeOIDC, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_Update() {
	userId := suite.updateUser.ID
	boardId := suite.updateBoard.ID

	events := suite.broker.GetBoardChannel(suite.ctx, boardId)

	user, err := suite.userService.Update(suite.ctx, UserUpdateRequest{ID: userId, Name: suite.testUserName})

	suite.Nil(err)
	suite.Equal(userId, user.ID)
	suite.Equal(suite.testUserName, user.Name)

	msg := <-events
	suite.Equal(realtime.BoardEventParticipantUpdated, msg.Type)
	sessionData := msg.Data.(map[string]interface{})
	suite.True(sessionData["connected"].(bool))
	suite.Equal(string(common.OwnerRole), sessionData["role"].(string))
}

func (suite *UserServiceIntegrationTestsuite) Test_Delete_WithNotes() {
	userId := suite.deleteUser.ID
	boardId := suite.updateBoard.ID
	preDeleteNotes, preDeleteErr := suite.notesService.GetByUserAndBoard(suite.ctx, userId, boardId)
	suite.Nil(preDeleteErr)
	suite.Len(preDeleteNotes, 1)

	events := suite.broker.GetBoardChannel(suite.ctx, boardId)

	err := suite.userService.Delete(suite.ctx, userId)

	suite.Nil(err)

	notesAfterDelete, notesErr := suite.notesService.GetByUserAndBoard(suite.ctx, userId, suite.updateBoard.ID)
	suite.Nil(notesErr)
	suite.Len(notesAfterDelete, 0)

	seenUserDeleted := false
	seenNoteDeleted := false
	deadline := time.After(2 * time.Second)

	for !seenUserDeleted || !seenNoteDeleted {
		select {
		case msg := <-events:
			switch msg.Type {
			case realtime.BoardEventNoteDeleted:
				noteData, err := technical_helper.Unmarshal[[]uuid.UUID](msg.Data)
				suite.Nil(err)
				suite.Contains(*noteData, suite.deleteNote.ID)
				seenNoteDeleted = true
			case realtime.BoardEventUserDeleted:
				userData, err := technical_helper.Unmarshal[uuid.UUID](msg.Data)
				suite.Nil(err)
				suite.Equal(userId, *userData)
				seenUserDeleted = true
			}
		case <-deadline:
			suite.Fail("timed out waiting for delete events")
			return
		}
	}

	suite.True(seenNoteDeleted)
	suite.True(seenUserDeleted)
}

func (suite *UserServiceIntegrationTestsuite) Test_Delete_WithoutNotes() {
	userId := suite.updateUser.ID
	boardId := suite.updateBoard.ID
	preDeleteNotes, preDeleteErr := suite.notesService.GetByUserAndBoard(suite.ctx, userId, boardId)
	suite.Nil(preDeleteErr)
	suite.Len(preDeleteNotes, 0)

	events := suite.broker.GetBoardChannel(suite.ctx, boardId)

	err := suite.userService.Delete(suite.ctx, userId)

	suite.Nil(err)

	notesAfterDelete, notesErr := suite.notesService.GetByUserAndBoard(suite.ctx, userId, suite.updateBoard.ID)
	suite.Nil(notesErr)
	suite.Len(notesAfterDelete, 0)

	seenUserDeleted := false
	deadline := time.After(2 * time.Second)

	for !seenUserDeleted {
		select {
		case msg := <-events:
			switch msg.Type {
			case realtime.BoardEventUserDeleted:
				userData, err := technical_helper.Unmarshal[uuid.UUID](msg.Data)
				suite.Nil(err)
				suite.Equal(userId, *userData)
				seenUserDeleted = true
			case realtime.BoardEventNoteDeleted:
				suite.Fail("unexpected note deletion event")
				return
			}
		case <-deadline:
			suite.Fail("timed out waiting for user deleted event")
			return
		}
	}
}

func (suite *UserServiceIntegrationTestsuite) Test_Get() {

	userId := suite.baseData.Users["Stan"].ID

	user, err := suite.userService.Get(suite.ctx, userId)

	suite.Nil(err)
	suite.Equal(userId, user.ID)
	suite.Equal(suite.baseData.Users["Stan"].Name, user.Name)
}

func (suite *UserServiceIntegrationTestsuite) Test_Get_NotFound() {

	userId := uuid.New()

	user, err := suite.userService.Get(suite.ctx, userId)

	suite.Nil(user)
	suite.NotNil(err)
	suite.Equal(common.NotFoundError, err)
}

func (suite *UserServiceIntegrationTestsuite) Test_GetBoardUsers() {

	board := suite.updateBoard
	userIds := []uuid.UUID{suite.baseData.Users["Stan"].ID, suite.updateUser.ID, suite.deleteUser.ID}

	users, err := suite.userService.GetBoardUsers(suite.ctx, board.ID)

	ids := slices.Collect(func(yield func(uuid.UUID) bool) {
		for _, user := range users {
			yield(user.ID)
		}
	})
	suite.Nil(err)
	suite.ElementsMatch(userIds, ids)
}

func (suite *UserServiceIntegrationTestsuite) Test_AvailableForKeyMigration() {
	userId := suite.baseData.Users["Santa"].ID

	available, err := suite.userService.IsUserAvailableForKeyMigration(suite.ctx, userId)

	suite.Nil(err)
	suite.True(available)
}

func (suite *UserServiceIntegrationTestsuite) Test_SetKeyMigration() {
	userId := suite.baseData.Users["Stan"].ID

	user, err := suite.userService.SetKeyMigration(suite.ctx, userId)

	suite.Nil(err)
	suite.Equal(userId, user.ID)
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
	if err := testDbTemplates.InsertColumn(db, suite.deleteColumn.ID, suite.deleteColumn.BoardID, suite.deleteColumn.Name, "", "backlog-blue", true, 0); err != nil {
		log.Fatalf("Failed to insert delete user column: %s", err)
	}
	if err := testDbTemplates.InsertNote(db, suite.deleteNote.ID, suite.deleteNote.AuthorID, suite.deleteNote.BoardID, suite.deleteNote.ColumnID, suite.deleteNote.Text, uuid.NullUUID{UUID: uuid.Nil, Valid: false}, 0); err != nil {
		log.Fatalf("Failed to insert delete user note: %s", err)
	}

	if err := testDbTemplates.InsertSession(db, suite.baseData.Users["Stan"].ID, suite.updateBoard.ID, string(common.OwnerRole), false, false, true, false); err != nil {
		log.Fatalf("Failed to insert Stan session: %s", err)
	}
	if err := testDbTemplates.InsertSession(db, suite.updateUser.ID, suite.updateBoard.ID, string(common.OwnerRole), false, false, true, false); err != nil {
		log.Fatalf("Failed to insert Update user session: %s", err)
	}
	if err := testDbTemplates.InsertSession(db, suite.deleteUser.ID, suite.updateBoard.ID, string(common.OwnerRole), false, false, true, false); err != nil {
		log.Fatalf("Failed to insert Delete user session: %s", err)
	}
}
