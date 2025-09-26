package reactions

import (
	"context"
	"errors"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/nats"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/technical_helper"
)

type ReactionServiceIntegrationTestSuite struct {
	suite.Suite
	dbContainer          *postgres.PostgresContainer
	natsContainer        *nats.NATSContainer
	db                   *bun.DB
	natsConnectionString string
	users                map[string]TestUser
	boards               map[string]TestBoard
	columns              map[string]TestColumn
	notes                map[string]TestNote
	reactions            map[string]Reaction
}

func TestReactionServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(ReactionServiceIntegrationTestSuite))
}

func (suite *ReactionServiceIntegrationTestSuite) SetupSuite() {
	dbContainer, bun := initialize.StartTestDatabase()
	suite.SeedDatabase(bun)
	natsContainer, connectionString := initialize.StartTestNats()

	suite.dbContainer = dbContainer
	suite.natsContainer = natsContainer
	suite.db = bun
	suite.natsConnectionString = connectionString
}

func (suite *ReactionServiceIntegrationTestSuite) TearDownSuite() {
	initialize.StopTestDatabase(suite.dbContainer)
	initialize.StopTestNats(suite.natsContainer)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_Create() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].id
	noteId := suite.notes["Insert"].id
	userId := suite.users["Stan"].id

	database := NewReactionsDatabase(suite.db)
	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	service := NewReactionService(database, broker)

	reaction, err := service.Create(ctx, ReactionCreateRequest{Board: boardId, Note: noteId, User: userId, ReactionType: Joy})

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

	boardId := suite.boards["Write"].id
	noteId := uuid.New()
	userId := suite.users["Santa"].id

	database := NewReactionsDatabase(suite.db)
	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	service := NewReactionService(database, broker)

	reaction, err := service.Create(ctx, ReactionCreateRequest{Board: boardId, Note: noteId, User: userId, ReactionType: Joy})

	assert.Nil(t, reaction)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_Create_Multiple() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].id
	noteId := suite.notes["Update"].id
	userId := suite.users["Santa"].id

	database := NewReactionsDatabase(suite.db)
	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	service := NewReactionService(database, broker)

	reaction, err := service.Create(ctx, ReactionCreateRequest{Board: boardId, Note: noteId, User: userId, ReactionType: Joy})

	assert.Nil(t, reaction)
	assert.NotNil(t, err)
	assert.Equal(t, common.ConflictError(errors.New("cannot make multiple reactions on the same note by the same user")), err)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_Update() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].id
	reactionId := suite.reactions["Update"].ID
	userId := suite.users["Santa"].id

	database := NewReactionsDatabase(suite.db)
	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	service := NewReactionService(database, broker)

	reaction, err := service.Update(ctx, boardId, userId, reactionId, ReactionUpdateTypeRequest{ReactionType: Thinking})

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

	boardId := suite.boards["Write"].id
	reactionId := uuid.New()
	userId := suite.users["Santa"].id

	database := NewReactionsDatabase(suite.db)
	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	service := NewReactionService(database, broker)

	reaction, err := service.Update(ctx, boardId, userId, reactionId, ReactionUpdateTypeRequest{ReactionType: Thinking})

	assert.Nil(t, reaction)
	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_Update_Forbidden() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].id
	reactionId := suite.reactions["Update"].ID
	userId := suite.users["Stan"].id

	database := NewReactionsDatabase(suite.db)
	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	service := NewReactionService(database, broker)

	reaction, err := service.Update(ctx, boardId, userId, reactionId, ReactionUpdateTypeRequest{ReactionType: Thinking})

	assert.Nil(t, reaction)
	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("forbidden")), err)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_Delete() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].id
	reactionId := suite.reactions["Delete"].ID
	userId := suite.users["Stan"].id

	database := NewReactionsDatabase(suite.db)
	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	service := NewReactionService(database, broker)

	err = service.Delete(ctx, boardId, userId, reactionId)

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

	boardId := suite.boards["Write"].id
	reactionId := uuid.New()
	userId := suite.users["Stan"].id

	database := NewReactionsDatabase(suite.db)
	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	service := NewReactionService(database, broker)

	err = service.Delete(ctx, boardId, userId, reactionId)

	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_Delete_Forbidden() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].id
	reactionId := suite.reactions["DeleteNot"].ID
	userId := suite.users["Stan"].id

	database := NewReactionsDatabase(suite.db)
	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	service := NewReactionService(database, broker)

	err = service.Delete(ctx, boardId, userId, reactionId)

	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("forbidden")), err)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_Get() {
	t := suite.T()
	ctx := context.Background()

	database := NewReactionsDatabase(suite.db)
	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	service := NewReactionService(database, broker)

	reactionId := suite.reactions["Get1"].ID
	reaction, err := service.Get(ctx, reactionId)

	assert.Nil(t, err)
	assert.Equal(t, suite.reactions["Get1"].ID, reaction.ID)
	assert.Equal(t, suite.reactions["Get1"].Note, reaction.Note)
	assert.Equal(t, suite.reactions["Get1"].User, reaction.User)
	assert.Equal(t, suite.reactions["Get1"].ReactionType, reaction.ReactionType)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_Get_NotFound() {
	t := suite.T()
	ctx := context.Background()

	database := NewReactionsDatabase(suite.db)
	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	service := NewReactionService(database, broker)

	reactionId := uuid.New()
	reaction, err := service.Get(ctx, reactionId)

	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
	assert.Nil(t, reaction)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_GetAll() {
	t := suite.T()
	ctx := context.Background()

	database := NewReactionsDatabase(suite.db)
	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	service := NewReactionService(database, broker)

	boardId := suite.boards["Read"].id
	reactions, err := service.GetAll(ctx, boardId)

	assert.Nil(t, err)
	assert.Len(t, reactions, 3)
}

func (suite *ReactionServiceIntegrationTestSuite) Test_GetAll_Empty() {
	t := suite.T()
	ctx := context.Background()

	database := NewReactionsDatabase(suite.db)
	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	service := NewReactionService(database, broker)

	boardId := uuid.New()
	reactions, err := service.GetAll(ctx, boardId)

	assert.Nil(t, err)
	assert.Equal(t, []*Reaction(nil), reactions)
	assert.Len(t, reactions, 0)
}

func (suite *ReactionServiceIntegrationTestSuite) SeedDatabase(db *bun.DB) {
	// test users
	suite.users = make(map[string]TestUser, 2)
	suite.users["Stan"] = TestUser{id: uuid.New(), name: "Stan", accountType: common.Anonymous}
	suite.users["Santa"] = TestUser{id: uuid.New(), name: "Santa", accountType: common.Anonymous}

	// test boards
	suite.boards = make(map[string]TestBoard, 2)
	suite.boards["Write"] = TestBoard{id: uuid.New(), name: "Write Board"}
	suite.boards["Read"] = TestBoard{id: uuid.New(), name: "Read Board"}

	// test columns
	suite.columns = make(map[string]TestColumn, 2)
	suite.columns["Write"] = TestColumn{id: uuid.New(), boardId: suite.boards["Write"].id, name: "Write Column", index: 0}
	suite.columns["Read"] = TestColumn{id: uuid.New(), boardId: suite.boards["Read"].id, name: "Read Column", index: 1}

	// test notes
	// notes for changing reactions (insert, update, delete)
	suite.notes = make(map[string]TestNote, 5)
	suite.notes["Insert"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["Write"].id, columnId: suite.columns["Write"].id, text: "Insert reaction note"}
	suite.notes["Update"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["Write"].id, columnId: suite.columns["Write"].id, text: "Update reaction note"}
	suite.notes["Delete"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["Write"].id, columnId: suite.columns["Write"].id, text: "Delete reaction note"}
	// notes for reading reactions. these don't change
	suite.notes["Read1"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["Read"].id, columnId: suite.columns["Read"].id, text: "Get reaction note"}
	suite.notes["Read2"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["Read"].id, columnId: suite.columns["Read"].id, text: "Get reaction note"}

	// test reactions
	// reaction for writing (update, delete, insert error)
	suite.reactions = make(map[string]Reaction, 5)
	suite.reactions["Delete"] = Reaction{ID: uuid.New(), Note: suite.notes["Delete"].id, User: suite.users["Stan"].id, ReactionType: Like}
	suite.reactions["DeleteNot"] = Reaction{ID: uuid.New(), Note: suite.notes["Delete"].id, User: suite.users["Santa"].id, ReactionType: Poop}
	suite.reactions["Update"] = Reaction{ID: uuid.New(), Note: suite.notes["Update"].id, User: suite.users["Santa"].id, ReactionType: Heart}
	// reactions for reading reactions, these don't change
	suite.reactions["Get1"] = Reaction{ID: uuid.New(), Note: suite.notes["Read1"].id, User: suite.users["Stan"].id, ReactionType: Heart}
	suite.reactions["Get2"] = Reaction{ID: uuid.New(), Note: suite.notes["Read1"].id, User: suite.users["Santa"].id, ReactionType: Like}
	suite.reactions["Get3"] = Reaction{ID: uuid.New(), Note: suite.notes["Read2"].id, User: suite.users["Santa"].id, ReactionType: Heart}

	for _, user := range suite.users {
		err := initialize.InsertUser(db, user.id, user.name, string(user.accountType))
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

	for _, column := range suite.columns {
		err := initialize.InsertColumn(db, column.id, column.boardId, column.name, "", "backlog-blue", true, column.index)
		if err != nil {
			log.Fatalf("Failed to insert test board %s", err)
		}
	}

	for _, note := range suite.notes {
		err := initialize.InsertNote(db, note.id, note.authorId, note.boardId, note.columnId, note.text, uuid.NullUUID{UUID: uuid.Nil, Valid: false}, 0)
		if err != nil {
			log.Fatalf("Failed to insert test board %s", err)
		}
	}

	for _, reaction := range suite.reactions {
		err := initialize.InsertReaction(db, reaction.ID, reaction.Note, reaction.User, string(reaction.ReactionType))
		if err != nil {
			log.Fatalf("Failed to insert test board %s", err)
		}
	}
}
