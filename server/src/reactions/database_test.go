package reactions

import (
	"context"
	"log"
	"testing"

	"scrumlr.io/server/initialize/testDbTemplates"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
)

type DatabaseReactionTestSuite struct {
	suite.Suite
	db        *bun.DB
	users     map[string]TestUser
	boards    map[string]TestBoard
	columns   map[string]TestColumn
	notes     map[string]TestNote
	reactions map[string]DatabaseReaction
}

func TestDatabaseReactionTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseReactionTestSuite))
}

func (suite *DatabaseReactionTestSuite) SetupTest() {
	suite.db = testDbTemplates.NewBaseTestDB(
		suite.T(),
		false,
		testDbTemplates.AdditionalSeed{
			Name: "sessions_database_test_data",
			Func: suite.seedData,
		},
	)
}

func (suite *DatabaseReactionTestSuite) Test_Database_CreateReaction() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	reaction := DatabaseReactionInsert{
		Note:         suite.notes["Insert"].id,
		User:         suite.users["Stan"].id,
		ReactionType: Like,
	}

	dbReaction, err := database.Create(context.Background(), suite.boards["Write"].id, reaction)

	assert.Nil(t, err)
	assert.Equal(t, reaction.Note, dbReaction.Note)
	assert.Equal(t, reaction.User, dbReaction.User)
	assert.Equal(t, reaction.ReactionType, dbReaction.ReactionType)
}

func (suite *DatabaseReactionTestSuite) Test_Database_Delete() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	reactionId := suite.reactions["Delete"].ID

	err := database.Delete(context.Background(), reactionId)

	assert.Nil(t, err)
}

func (suite *DatabaseReactionTestSuite) Test_Database_Delete_NotFound() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	reactionId := uuid.New()

	err := database.Delete(context.Background(), reactionId)

	assert.Nil(t, err)
}

func (suite *DatabaseReactionTestSuite) Test_Database_Update() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	userId := suite.users["Santa"].id
	noteId := suite.notes["Update"].id
	reactionId := suite.reactions["Update"].ID

	reaction := DatabaseReaction{
		ID:           reactionId,
		Note:         noteId,
		User:         userId,
		ReactionType: Poop,
	}

	dbReaction, err := database.Update(context.Background(), reactionId, DatabaseReactionUpdate{ReactionType: Poop})

	assert.Nil(t, err)
	assert.Equal(t, reaction.ID, dbReaction.ID)
	assert.Equal(t, reaction.Note, dbReaction.Note)
	assert.Equal(t, reaction.User, dbReaction.User)
	assert.Equal(t, reaction.ReactionType, dbReaction.ReactionType)
}

func (suite *DatabaseReactionTestSuite) Test_Database_Update_NotFound() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	reactionId := uuid.New()

	dbReaction, err := database.Update(context.Background(), reactionId, DatabaseReactionUpdate{ReactionType: Poop})

	assert.Equal(t, DatabaseReaction{}, dbReaction)
	assert.Nil(t, err)
}

func (suite *DatabaseReactionTestSuite) Test_Database_GetReaction() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	reactionId := suite.reactions["Get1"].ID

	dbReaction, err := database.Get(context.Background(), reactionId)

	assert.Nil(t, err)
	assert.Equal(t, suite.reactions["Get1"].ID, dbReaction.ID)
	assert.Equal(t, suite.reactions["Get1"].Note, dbReaction.Note)
	assert.Equal(t, suite.reactions["Get1"].User, dbReaction.User)
	assert.Equal(t, suite.reactions["Get1"].ReactionType, dbReaction.ReactionType)
}

func (suite *DatabaseReactionTestSuite) Test_Database_GetAll() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	boardId := suite.boards["Read"].id

	dbReactions, err := database.GetAll(context.Background(), boardId)

	assert.Nil(t, err)
	assert.Len(t, dbReactions, 3)

	firstReaction := checkReactionInList(dbReactions, suite.reactions["Get1"].ID)
	assert.NotNil(t, firstReaction)
	assert.Equal(t, suite.reactions["Get1"].ID, firstReaction.ID)
	assert.Equal(t, suite.reactions["Get1"].Note, firstReaction.Note)
	assert.Equal(t, suite.reactions["Get1"].User, firstReaction.User)
	assert.Equal(t, suite.reactions["Get1"].ReactionType, firstReaction.ReactionType)

	secondReaction := checkReactionInList(dbReactions, suite.reactions["Get2"].ID)
	assert.NotNil(t, secondReaction)
	assert.Equal(t, suite.reactions["Get2"].ID, secondReaction.ID)
	assert.Equal(t, suite.reactions["Get2"].Note, secondReaction.Note)
	assert.Equal(t, suite.reactions["Get2"].User, secondReaction.User)
	assert.Equal(t, suite.reactions["Get2"].ReactionType, secondReaction.ReactionType)

	thirdReaction := checkReactionInList(dbReactions, suite.reactions["Get3"].ID)
	assert.NotNil(t, thirdReaction)
	assert.Equal(t, suite.reactions["Get3"].ID, thirdReaction.ID)
	assert.Equal(t, suite.reactions["Get3"].Note, thirdReaction.Note)
	assert.Equal(t, suite.reactions["Get3"].User, thirdReaction.User)
	assert.Equal(t, suite.reactions["Get3"].ReactionType, thirdReaction.ReactionType)
}

func (suite *DatabaseReactionTestSuite) Test_Database_GetAllForNote() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	noteId := suite.notes["Read1"].id

	dbReactions, err := database.GetAllForNote(context.Background(), noteId)

	assert.Nil(t, err)
	assert.Len(t, dbReactions, 2)

	firstReaction := checkReactionInList(dbReactions, suite.reactions["Get1"].ID)
	assert.NotNil(t, firstReaction)
	assert.Equal(t, suite.reactions["Get1"].ID, firstReaction.ID)
	assert.Equal(t, suite.reactions["Get1"].Note, firstReaction.Note)
	assert.Equal(t, suite.reactions["Get1"].User, firstReaction.User)
	assert.Equal(t, suite.reactions["Get1"].ReactionType, firstReaction.ReactionType)

	secondReaction := checkReactionInList(dbReactions, suite.reactions["Get2"].ID)
	assert.NotNil(t, secondReaction)
	assert.Equal(t, suite.reactions["Get2"].ID, secondReaction.ID)
	assert.Equal(t, suite.reactions["Get2"].Note, secondReaction.Note)
	assert.Equal(t, suite.reactions["Get2"].User, secondReaction.User)
	assert.Equal(t, suite.reactions["Get2"].ReactionType, secondReaction.ReactionType)
}

type TestUser struct {
	id          uuid.UUID
	name        string
	accountType common.AccountType
}

type TestBoard struct {
	id   uuid.UUID
	name string
}

type TestColumn struct {
	id      uuid.UUID
	boardId uuid.UUID
	name    string
	index   int
}

type TestNote struct {
	id       uuid.UUID
	authorId uuid.UUID
	boardId  uuid.UUID
	columnId uuid.UUID
	text     string
}

func (suite *DatabaseReactionTestSuite) seedData(db *bun.DB) {
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
	suite.reactions = make(map[string]DatabaseReaction, 5)
	suite.reactions["Delete"] = DatabaseReaction{ID: uuid.New(), Note: suite.notes["Delete"].id, User: suite.users["Stan"].id, ReactionType: Like}
	suite.reactions["Update"] = DatabaseReaction{ID: uuid.New(), Note: suite.notes["Update"].id, User: suite.users["Santa"].id, ReactionType: Heart}
	// reactions for reading reactions, these don't change
	suite.reactions["Get1"] = DatabaseReaction{ID: uuid.New(), Note: suite.notes["Read1"].id, User: suite.users["Stan"].id, ReactionType: Heart}
	suite.reactions["Get2"] = DatabaseReaction{ID: uuid.New(), Note: suite.notes["Read1"].id, User: suite.users["Santa"].id, ReactionType: Like}
	suite.reactions["Get3"] = DatabaseReaction{ID: uuid.New(), Note: suite.notes["Read2"].id, User: suite.users["Santa"].id, ReactionType: Heart}

	for _, user := range suite.users {
		err := testDbTemplates.InsertUser(db, user.id, user.name, string(user.accountType))
		if err != nil {
			log.Fatalf("Failed to insert test user %s", err)
		}
	}

	for _, board := range suite.boards {
		err := testDbTemplates.InsertBoard(db, board.id, board.name, "", nil, nil, "PUBLIC", true, true, true, true, false)
		if err != nil {
			log.Fatalf("Failed to insert test board %s", err)
		}
	}

	for _, column := range suite.columns {
		err := testDbTemplates.InsertColumn(db, column.id, column.boardId, column.name, "", "backlog-blue", true, column.index)
		if err != nil {
			log.Fatalf("Failed to insert test board %s", err)
		}
	}

	for _, note := range suite.notes {
		err := testDbTemplates.InsertNote(db, note.id, note.authorId, note.boardId, note.columnId, note.text, uuid.NullUUID{UUID: uuid.Nil, Valid: false}, 0)
		if err != nil {
			log.Fatalf("Failed to insert test board %s", err)
		}
	}

	for _, reaction := range suite.reactions {
		err := testDbTemplates.InsertReaction(db, reaction.ID, reaction.Note, reaction.User, string(reaction.ReactionType))
		if err != nil {
			log.Fatalf("Failed to insert test board %s", err)
		}
	}
}

func checkReactionInList(list []DatabaseReaction, id uuid.UUID) *DatabaseReaction {
	for _, reaction := range list {
		if reaction.ID == id {
			return &reaction
		}
	}
	return nil
}
