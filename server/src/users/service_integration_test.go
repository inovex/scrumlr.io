package users

import (
	"context"
	"log"
	"slices"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/nats"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/uptrace/bun"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/votings"
)

type TestBoard struct {
	id   uuid.UUID
	name string
}

type UserServiceIntegrationTestsuite struct {
	suite.Suite
	dbContainer          *postgres.PostgresContainer
	natsContainer        *nats.NATSContainer
	db                   *bun.DB
	natsConnectionString string
	users                map[string]User
	boards               map[string]TestBoard
	sessions             map[string]sessions.BoardSession
}

func TestUserServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(UserServiceIntegrationTestsuite))
}

func (suite *UserServiceIntegrationTestsuite) SetupSuite() {
	dbContainer, bun := initialize.StartTestDatabase()
	suite.SeedDatabase(bun)
	natsContainer, connectionString := initialize.StartTestNats()

	suite.dbContainer = dbContainer
	suite.natsContainer = natsContainer
	suite.db = bun
	suite.natsConnectionString = connectionString
}

func (suite *UserServiceIntegrationTestsuite) TeardownSuite() {
	initialize.StopTestDatabase(suite.dbContainer)
	initialize.StopTestNats(suite.natsContainer)
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateAnonymous() {
	t := suite.T()
	ctx := context.Background()

	userName := "Test User"

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	userDatabase := NewUserDatabase(suite.db)
	userService := NewUserService(userDatabase, broker, sessionService)

	user, err := userService.CreateAnonymous(ctx, userName)

	assert.Nil(t, err)
	assert.Equal(t, userName, user.Name)
	assert.Equal(t, common.Anonymous, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateAppleUser() {
	t := suite.T()
	ctx := context.Background()

	userName := "Test User"

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	userDatabase := NewUserDatabase(suite.db)
	userService := NewUserService(userDatabase, broker, sessionService)

	user, err := userService.CreateAppleUser(ctx, "appleId", userName, "")

	assert.Nil(t, err)
	assert.Equal(t, userName, user.Name)
	assert.Equal(t, common.Apple, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateAzureadUser() {
	t := suite.T()
	ctx := context.Background()

	userName := "Test User"

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	userDatabase := NewUserDatabase(suite.db)
	userService := NewUserService(userDatabase, broker, sessionService)

	user, err := userService.CreateAzureAdUser(ctx, "azureId", userName, "")

	assert.Nil(t, err)
	assert.Equal(t, userName, user.Name)
	assert.Equal(t, common.AzureAd, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateGitHubUser() {
	t := suite.T()
	ctx := context.Background()

	userName := "Test User"

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	userDatabase := NewUserDatabase(suite.db)
	userService := NewUserService(userDatabase, broker, sessionService)

	user, err := userService.CreateGitHubUser(ctx, "githubId", userName, "")

	assert.Nil(t, err)
	assert.Equal(t, userName, user.Name)
	assert.Equal(t, common.GitHub, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateGoogleUser() {
	t := suite.T()
	ctx := context.Background()

	userName := "Test User"

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	userDatabase := NewUserDatabase(suite.db)
	userService := NewUserService(userDatabase, broker, sessionService)

	user, err := userService.CreateGoogleUser(ctx, "googleId", userName, "")

	assert.Nil(t, err)
	assert.Equal(t, userName, user.Name)
	assert.Equal(t, common.Google, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateMicrosoft() {
	t := suite.T()
	ctx := context.Background()

	userName := "Test User"

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	userDatabase := NewUserDatabase(suite.db)
	userService := NewUserService(userDatabase, broker, sessionService)

	user, err := userService.CreateMicrosoftUser(ctx, "microsoftId", userName, "")

	assert.Nil(t, err)
	assert.Equal(t, userName, user.Name)
	assert.Equal(t, common.Microsoft, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_CreateOIDCUser() {
	t := suite.T()
	ctx := context.Background()

	userName := "Test User"

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	userDatabase := NewUserDatabase(suite.db)
	userService := NewUserService(userDatabase, broker, sessionService)

	user, err := userService.CreateOIDCUser(ctx, "oidcId", userName, "")

	assert.Nil(t, err)
	assert.Equal(t, userName, user.Name)
	assert.Equal(t, common.TypeOIDC, user.AccountType)
}

func (suite *UserServiceIntegrationTestsuite) Test_Update() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.users["Update"].ID
	boardId := suite.boards["Update"].id
	userName := "Test User"

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	userDatabase := NewUserDatabase(suite.db)
	userService := NewUserService(userDatabase, broker, sessionService)

	events := broker.GetBoardChannel(ctx, boardId)

	user, err := userService.Update(ctx, UserUpdateRequest{ID: userId, Name: userName})

	assert.Nil(t, err)
	assert.Equal(t, userId, user.ID)
	assert.Equal(t, userName, user.Name)

	msg := <-events
	assert.Equal(t, realtime.BoardEventParticipantUpdated, msg.Type)
	sessionData := msg.Data.(map[string]interface{})
	assert.True(t, sessionData["connected"].(bool))
	assert.Equal(t, string(common.OwnerRole), sessionData["role"].(string))
}

func (suite *UserServiceIntegrationTestsuite) Test_Get() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.users["Stan"].ID

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	userDatabase := NewUserDatabase(suite.db)
	userService := NewUserService(userDatabase, broker, sessionService)

	user, err := userService.Get(ctx, userId)

	assert.Nil(t, err)
	assert.Equal(t, userId, user.ID)
	assert.Equal(t, suite.users["Stan"].Name, user.Name)
}

func (suite *UserServiceIntegrationTestsuite) Test_Get_NotFound() {
	t := suite.T()
	ctx := context.Background()

	userId := uuid.New()

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	userDatabase := NewUserDatabase(suite.db)
	userService := NewUserService(userDatabase, broker, sessionService)

	user, err := userService.Get(ctx, userId)

	assert.Nil(t, user)
	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func (suite *UserServiceIntegrationTestsuite) Test_GetBoardUsers() {
	t := suite.T()
	ctx := context.Background()

	board := suite.boards["Update"]
	userIds := []uuid.UUID{suite.users["Stan"].ID, suite.users["Santa"].ID, suite.users["Update"].ID}

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	userDatabase := NewUserDatabase(suite.db)
	userService := NewUserService(userDatabase, broker, sessionService)

	users, err := userService.GetBoardUsers(ctx, board.id)

	ids := slices.Collect(func(yield func(uuid.UUID) bool) {
		for _, user := range users {
			yield(user.ID)
		}
		return
	})
	assert.Nil(t, err)
	assert.ElementsMatch(t, userIds, ids)
}

func (suite *UserServiceIntegrationTestsuite) Test_AvailableForKeyMigration() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.users["Santa"].ID

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	userDatabase := NewUserDatabase(suite.db)
	userService := NewUserService(userDatabase, broker, sessionService)

	available, err := userService.IsUserAvailableForKeyMigration(ctx, userId)

	assert.Nil(t, err)
	assert.True(t, available)
}

func (suite *UserServiceIntegrationTestsuite) Test_SetKeyMigration() {
	t := suite.T()
	ctx := context.Background()

	userId := suite.users["Stan"].ID

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	voteDatabase := votings.NewVotingDatabase(suite.db)
	voteService := votings.NewVotingService(voteDatabase, broker)
	noteDatabase := notes.NewNotesDatabase(suite.db)
	noteService := notes.NewNotesService(noteDatabase, broker, voteService)
	columnDatabase := columns.NewColumnsDatabase(suite.db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)
	sessionDatabase := sessions.NewSessionDatabase(suite.db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)
	userDatabase := NewUserDatabase(suite.db)
	userService := NewUserService(userDatabase, broker, sessionService)

	user, err := userService.SetKeyMigration(ctx, userId)

	assert.Nil(t, err)
	assert.Equal(t, userId, user.ID)
}

func (suite *UserServiceIntegrationTestsuite) SeedDatabase(db *bun.DB) {
	// test users
	suite.users = make(map[string]User, 3)
	suite.users["Stan"] = User{ID: uuid.New(), Name: "Stan", AccountType: common.Google}
	suite.users["Santa"] = User{ID: uuid.New(), Name: "Santa", AccountType: common.Anonymous}
	suite.users["Update"] = User{ID: uuid.New(), Name: "UpdateMe", AccountType: common.Anonymous}

	// test boards
	suite.boards = make(map[string]TestBoard, 1)
	suite.boards["Update"] = TestBoard{id: uuid.New(), name: "Update"}

	// test sessions
	suite.sessions = make(map[string]sessions.BoardSession, 1)
	suite.sessions["Stan"] = sessions.BoardSession{UserID: suite.users["Stan"].ID, Board: suite.boards["Update"].id, Role: common.OwnerRole, Connected: true}
	suite.sessions["Santa"] = sessions.BoardSession{UserID: suite.users["Santa"].ID, Board: suite.boards["Update"].id, Role: common.ParticipantRole, Connected: true}
	suite.sessions["Update"] = sessions.BoardSession{UserID: suite.users["Update"].ID, Board: suite.boards["Update"].id, Role: common.OwnerRole, Connected: true}

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
