package reactions

import (
	"context"
	"errors"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/nats"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/initialize/testDbTemplates"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/technical_helper"
)

type testNote struct {
	id       uuid.UUID
	authorId uuid.UUID
	boardId  uuid.UUID
	columnId uuid.UUID
	text     string
}

type ReactionServiceIntegrationTestSuite struct {
	suite.Suite
	natsContainer        *nats.NATSContainer
	natsConnectionString string
	baseData             testDbTemplates.DbBaseIDs
	broker               *realtime.Broker
	reactionService      ReactionService

	// Additional test-specific data
	users     map[string]testDbTemplates.TestUser
	boards    map[string]testDbTemplates.TestBoard
	columns   map[string]testDbTemplates.TestColumn
	notes     map[string]testNote
	reactions map[string]Reaction
}

func TestReactionServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(ReactionServiceIntegrationTestSuite))
}

func (suite *ReactionServiceIntegrationTestSuite) SetupSuite() {
	natsContainer, connectionString := initialize.StartTestNats()

	suite.natsContainer = natsContainer
	suite.natsConnectionString = connectionString
	suite.baseData = testDbTemplates.GetBaseIDs()
	suite.initTestData()
}

func (suite *ReactionServiceIntegrationTestSuite) TearDownSuite() {
	initialize.StopTestNats(suite.natsContainer)
}

func (suite *ReactionServiceIntegrationTestSuite) SetupTest() {
	db := testDbTemplates.NewBaseTestDB(
		suite.T(),
		false,
		testDbTemplates.AdditionalSeed{
			Name: "reactions_test",
			Func: suite.seedReactionsTestData,
		},
	)

	broker, err := realtime.NewNats(suite.natsConnectionString)
	require.NoError(suite.T(), err, "Failed to connect to nats server")
	suite.broker = broker

	database := NewReactionsDatabase(db)
	suite.reactionService = NewReactionService(database, broker)
}

func (suite *ReactionServiceIntegrationTestSuite) initTestData() {
	suite.users = map[string]testDbTemplates.TestUser{
		"Stan":  {Name: "Stan", ID: uuid.MustParse("a1b2c3d4-e5f6-7890-abcd-ef1234567001"), AccountType: common.Anonymous},
		"Santa": {Name: "Santa", ID: uuid.MustParse("a1b2c3d4-e5f6-7890-abcd-ef1234567002"), AccountType: common.Anonymous},
	}

	suite.boards = map[string]testDbTemplates.TestBoard{
		"Write": {Name: "Write Board", ID: uuid.MustParse("a1b2c3d4-e5f6-7890-abcd-ef1234567101")},
		"Read":  {Name: "Read Board", ID: uuid.MustParse("a1b2c3d4-e5f6-7890-abcd-ef1234567102")},
	}

	suite.columns = map[string]testDbTemplates.TestColumn{
		"Write": {Name: "Write Column", ID: uuid.MustParse("a1b2c3d4-e5f6-7890-abcd-ef1234567201"), BoardID: suite.boards["Write"].ID},
		"Read":  {Name: "Read Column", ID: uuid.MustParse("a1b2c3d4-e5f6-7890-abcd-ef1234567202"), BoardID: suite.boards["Read"].ID},
	}

	suite.notes = map[string]testNote{
		"Insert": {id: uuid.MustParse("a1b2c3d4-e5f6-7890-abcd-ef1234567301"), authorId: suite.users["Stan"].ID, boardId: suite.boards["Write"].ID, columnId: suite.columns["Write"].ID, text: "Insert reaction note"},
		"Update": {id: uuid.MustParse("a1b2c3d4-e5f6-7890-abcd-ef1234567302"), authorId: suite.users["Stan"].ID, boardId: suite.boards["Write"].ID, columnId: suite.columns["Write"].ID, text: "Update reaction note"},
		"Delete": {id: uuid.MustParse("a1b2c3d4-e5f6-7890-abcd-ef1234567303"), authorId: suite.users["Stan"].ID, boardId: suite.boards["Write"].ID, columnId: suite.columns["Write"].ID, text: "Delete reaction note"},
		"Read1":  {id: uuid.MustParse("a1b2c3d4-e5f6-7890-abcd-ef1234567304"), authorId: suite.users["Stan"].ID, boardId: suite.boards["Read"].ID, columnId: suite.columns["Read"].ID, text: "Get reaction note"},
		"Read2":  {id: uuid.MustParse("a1b2c3d4-e5f6-7890-abcd-ef1234567305"), authorId: suite.users["Stan"].ID, boardId: suite.boards["Read"].ID, columnId: suite.columns["Read"].ID, text: "Get reaction note"},
	}

	suite.reactions = map[string]Reaction{
		"Delete":    {ID: uuid.MustParse("a1b2c3d4-e5f6-7890-abcd-ef1234567401"), Note: suite.notes["Delete"].id, User: suite.users["Stan"].ID, ReactionType: Like},
		"DeleteNot": {ID: uuid.MustParse("a1b2c3d4-e5f6-7890-abcd-ef1234567402"), Note: suite.notes["Delete"].id, User: suite.users["Santa"].ID, ReactionType: Poop},
		"Update":    {ID: uuid.MustParse("a1b2c3d4-e5f6-7890-abcd-ef1234567403"), Note: suite.notes["Update"].id, User: suite.users["Santa"].ID, ReactionType: Heart},
		"Get1":      {ID: uuid.MustParse("a1b2c3d4-e5f6-7890-abcd-ef1234567404"), Note: suite.notes["Read1"].id, User: suite.users["Stan"].ID, ReactionType: Heart},
		"Get2":      {ID: uuid.MustParse("a1b2c3d4-e5f6-7890-abcd-ef1234567405"), Note: suite.notes["Read1"].id, User: suite.users["Santa"].ID, ReactionType: Like},
		"Get3":      {ID: uuid.MustParse("a1b2c3d4-e5f6-7890-abcd-ef1234567406"), Note: suite.notes["Read2"].id, User: suite.users["Santa"].ID, ReactionType: Heart},
	}
}

func (suite *ReactionServiceIntegrationTestSuite) Test_Create() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].ID
	noteId := suite.notes["Insert"].id
	userId := suite.users["Stan"].ID

	events := suite.broker.GetBoardChannel(ctx, boardId)

	reaction, err := suite.reactionService.Create(ctx, ReactionCreateRequest{Board: boardId, Note: noteId, User: userId, ReactionType: Joy})

	assert.Nil(t, err)
	assert.NotNil(t, reaction.ID)
	assert.Equal(t, noteId, reaction.Note)
	assert.Equal(t, userId, reaction.User)
	assert.Equal(t, Joy, reaction.ReactionType)

	msg := <-events
	assert.Equal(t, realtime.BoardEventReactionAdded, msg.Type)
	reactionData, err := technical_helper.Unmarshal[DatabaseReaction](msg.Data)
	assert.Nil(t, err)
	assert.Equal(t, Joy, reactionData.ReactionType)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_Create_NotFound() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].ID
	noteId := uuid.New()
	userId := suite.users["Santa"].ID

	reaction, err := suite.reactionService.Create(ctx, ReactionCreateRequest{Board: boardId, Note: noteId, User: userId, ReactionType: Joy})

	assert.Nil(t, reaction)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_Create_Multiple() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].ID
	noteId := suite.notes["Update"].id
	userId := suite.users["Santa"].ID

	reaction, err := suite.reactionService.Create(ctx, ReactionCreateRequest{Board: boardId, Note: noteId, User: userId, ReactionType: Joy})

	assert.Nil(t, reaction)
	assert.NotNil(t, err)
	assert.Equal(t, common.ConflictError(errors.New("cannot make multiple reactions on the same note by the same user")), err)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_Update() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].ID
	reactionId := suite.reactions["Update"].ID
	userId := suite.users["Santa"].ID

	events := suite.broker.GetBoardChannel(ctx, boardId)

	reaction, err := suite.reactionService.Update(ctx, boardId, userId, reactionId, ReactionUpdateTypeRequest{ReactionType: Thinking})

	assert.Nil(t, err)
	assert.Equal(t, reactionId, reaction.ID)
	assert.Equal(t, userId, reaction.User)
	assert.Equal(t, Thinking, reaction.ReactionType)

	msg := <-events
	assert.Equal(t, realtime.BoardEventReactionUpdated, msg.Type)
	reactionData, err := technical_helper.Unmarshal[DatabaseReaction](msg.Data)
	assert.Nil(t, err)
	assert.Equal(t, Thinking, reactionData.ReactionType)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_Update_NotFound() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].ID
	reactionId := uuid.New()
	userId := suite.users["Santa"].ID

	reaction, err := suite.reactionService.Update(ctx, boardId, userId, reactionId, ReactionUpdateTypeRequest{ReactionType: Thinking})

	assert.Nil(t, reaction)
	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_Update_Forbidden() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].ID
	reactionId := suite.reactions["Update"].ID
	userId := suite.users["Stan"].ID

	reaction, err := suite.reactionService.Update(ctx, boardId, userId, reactionId, ReactionUpdateTypeRequest{ReactionType: Thinking})

	assert.Nil(t, reaction)
	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("forbidden")), err)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_Delete() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].ID
	reactionId := suite.reactions["Delete"].ID
	userId := suite.users["Stan"].ID

	events := suite.broker.GetBoardChannel(ctx, boardId)

	err := suite.reactionService.Delete(ctx, boardId, userId, reactionId)

	assert.Nil(t, err)

	msg := <-events
	assert.Equal(t, realtime.BoardEventReactionDeleted, msg.Type)
	reactionData, err := technical_helper.Unmarshal[uuid.UUID](msg.Data)
	assert.Nil(t, err)
	assert.Equal(t, reactionId, *reactionData)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_Delete_NotFound() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].ID
	reactionId := uuid.New()
	userId := suite.users["Stan"].ID

	err := suite.reactionService.Delete(ctx, boardId, userId, reactionId)

	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_Delete_Forbidden() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].ID
	reactionId := suite.reactions["DeleteNot"].ID
	userId := suite.users["Stan"].ID

	err := suite.reactionService.Delete(ctx, boardId, userId, reactionId)

	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("forbidden")), err)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_Get() {
	t := suite.T()
	ctx := context.Background()

	reactionId := suite.reactions["Get1"].ID
	reaction, err := suite.reactionService.Get(ctx, reactionId)

	assert.Nil(t, err)
	assert.Equal(t, suite.reactions["Get1"].ID, reaction.ID)
	assert.Equal(t, suite.reactions["Get1"].Note, reaction.Note)
	assert.Equal(t, suite.reactions["Get1"].User, reaction.User)
	assert.Equal(t, suite.reactions["Get1"].ReactionType, reaction.ReactionType)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_Get_NotFound() {
	t := suite.T()
	ctx := context.Background()

	reactionId := uuid.New()
	reaction, err := suite.reactionService.Get(ctx, reactionId)

	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
	assert.Nil(t, reaction)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_GetAll() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].ID
	reactions, err := suite.reactionService.GetAll(ctx, boardId)

	assert.Nil(t, err)
	assert.Len(t, reactions, 3)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_GetAll_Empty() {
	t := suite.T()
	ctx := context.Background()

	boardId := uuid.New()
	reactions, err := suite.reactionService.GetAll(ctx, boardId)

	assert.Nil(t, err)
	assert.Equal(t, []*Reaction(nil), reactions)
	assert.Len(t, reactions, 0)
}

func (suite *ReactionServiceIntegrationTestSuite) seedReactionsTestData(db *bun.DB) {
	log.Println("Seeding reactions test data")

	for _, user := range suite.users {
		if err := initialize.InsertUser(db, user.ID, user.Name, string(user.AccountType)); err != nil {
			log.Fatalf("Failed to insert user %s: %s", user.Name, err)
		}
	}

	for _, board := range suite.boards {
		if err := initialize.InsertBoard(db, board.ID, board.Name, "", nil, nil, "PUBLIC", true, true, true, true, false); err != nil {
			log.Fatalf("Failed to insert board %s: %s", board.Name, err)
		}
	}

	for _, column := range suite.columns {
		if err := initialize.InsertColumn(db, column.ID, column.BoardID, column.Name, "", "backlog-blue", true, 0); err != nil {
			log.Fatalf("Failed to insert column %s: %s", column.Name, err)
		}
	}

	for _, note := range suite.notes {
		if err := initialize.InsertNote(db, note.id, note.authorId, note.boardId, note.columnId, note.text, uuid.NullUUID{UUID: uuid.Nil, Valid: false}, 0); err != nil {
			log.Fatalf("Failed to insert note: %s", err)
		}
	}

	for _, reaction := range suite.reactions {
		if err := initialize.InsertReaction(db, reaction.ID, reaction.Note, reaction.User, string(reaction.ReactionType)); err != nil {
			log.Fatalf("Failed to insert reaction: %s", err)
		}
	}
}
