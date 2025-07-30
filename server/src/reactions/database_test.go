package reactions

import (
	"database/sql"
	"errors"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/databaseinitialize"
)

type DatabaseReactionTestSuite struct {
	suite.Suite
	container *postgres.PostgresContainer
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

func (suite *DatabaseReactionTestSuite) SetupSuite() {
	container, bun := databaseinitialize.StartTestDatabase()

	suite.SeedDatabase(bun)

	suite.container = container
	suite.db = bun
}

func (suite *DatabaseReactionTestSuite) TearDownSuite() {
	databaseinitialize.StopTestDatabase(suite.container)
}

func (suite *DatabaseReactionTestSuite) Test_Database_CreateReaction() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	reaction := DatabaseReactionInsert{
		Note:         suite.notes["Insert"].id,
		User:         suite.users["Stan"].id,
		ReactionType: Like,
	}

	dbReaction, err := database.Create(suite.boards["Write"].id, reaction)

	assert.Nil(t, err)
	assert.Equal(t, reaction.Note, dbReaction.Note)
	assert.Equal(t, reaction.User, dbReaction.User)
	assert.Equal(t, reaction.ReactionType, dbReaction.ReactionType)
}

func (suite *DatabaseReactionTestSuite) Test_Database_CreateReaction_MultipleReaction() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	reactionInsert := DatabaseReactionInsert{
		Note:         suite.notes["Update"].id,
		User:         suite.users["Santa"].id,
		ReactionType: Like,
	}

	dbReaction, err := database.Create(suite.boards["Write"].id, reactionInsert)

	assert.Equal(t, DatabaseReaction{}, dbReaction)
	assert.Equal(t, errors.New("cannot make multiple reactions on the same note by the same user"), err)
}

func (suite *DatabaseReactionTestSuite) Test_Database_Delete() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	boardId := suite.boards["Write"].id
	userId := suite.users["Stan"].id
	reactionId := suite.reactions["Delete"].ID

	err := database.Delete(boardId, userId, reactionId)

	assert.Nil(t, err)
}

func (suite *DatabaseReactionTestSuite) Test_Database_Delete_NotFound() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	boardId := suite.boards["Write"].id
	userId := suite.users["Stan"].id
	reactionId := uuid.New()

	err := database.Delete(boardId, userId, reactionId)

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
}

func (suite *DatabaseReactionTestSuite) Test_Database_Delete_UserError() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	boardId := suite.boards["Write"].id
	userId := suite.users["Stan"].id
	reactionId := suite.reactions["Update"].ID

	err := database.Delete(boardId, userId, reactionId)

	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("forbidden")), err)
}

func (suite *DatabaseReactionTestSuite) Test_Database_Update() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	boardId := suite.boards["Write"].id
	userId := suite.users["Santa"].id
	noteId := suite.notes["Update"].id
	reactionId := suite.reactions["Update"].ID

	reaction := DatabaseReaction{
		ID:           reactionId,
		Note:         noteId,
		User:         userId,
		ReactionType: Poop,
	}

	dbReaction, err := database.Update(boardId, userId, reactionId, DatabaseReactionUpdate{ReactionType: Poop})

	assert.Nil(t, err)
	assert.Equal(t, reaction.ID, dbReaction.ID)
	assert.Equal(t, reaction.Note, dbReaction.Note)
	assert.Equal(t, reaction.User, dbReaction.User)
	assert.Equal(t, reaction.ReactionType, dbReaction.ReactionType)
}

func (suite *DatabaseReactionTestSuite) Test_Database_Update_NotFound() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	boardId := suite.boards["Write"].id
	userId := suite.users["Santa"].id
	reactionId := uuid.New()

	dbReaction, err := database.Update(boardId, userId, reactionId, DatabaseReactionUpdate{ReactionType: Poop})

	assert.Equal(t, DatabaseReaction{}, dbReaction)
	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
}

func (suite *DatabaseReactionTestSuite) Test_Database_Update_UserError() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	boardId := suite.boards["Write"].id
	userId := suite.users["Stan"].id
	reactionId := suite.reactions["Update"].ID

	dbReaction, err := database.Update(boardId, userId, reactionId, DatabaseReactionUpdate{ReactionType: Poop})

	assert.Equal(t, DatabaseReaction{}, dbReaction)
	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("forbidden")), err)
}

func (suite *DatabaseReactionTestSuite) Test_Database_GetReaction() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	reactionId := suite.reactions["Get1"].ID

	dbReaction, err := database.Get(reactionId)

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

	dbReactions, err := database.GetAll(boardId) // TODO: check order

	assert.Nil(t, err)
	assert.Len(t, dbReactions, 3)

	assert.Equal(t, suite.reactions["Get1"].ID, dbReactions[0].ID)
	assert.Equal(t, suite.reactions["Get1"].Note, dbReactions[0].Note)
	assert.Equal(t, suite.reactions["Get1"].User, dbReactions[0].User)
	assert.Equal(t, suite.reactions["Get1"].ReactionType, dbReactions[0].ReactionType)

	assert.Equal(t, suite.reactions["Get2"].ID, dbReactions[1].ID)
	assert.Equal(t, suite.reactions["Get2"].Note, dbReactions[1].Note)
	assert.Equal(t, suite.reactions["Get2"].User, dbReactions[1].User)
	assert.Equal(t, suite.reactions["Get2"].ReactionType, dbReactions[1].ReactionType)

	assert.Equal(t, suite.reactions["Get3"].ID, dbReactions[2].ID)
	assert.Equal(t, suite.reactions["Get3"].Note, dbReactions[2].Note)
	assert.Equal(t, suite.reactions["Get3"].User, dbReactions[2].User)
	assert.Equal(t, suite.reactions["Get3"].ReactionType, dbReactions[2].ReactionType)
}

func (suite *DatabaseReactionTestSuite) Test_Database_GetAllForNote() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	noteId := suite.notes["Read1"].id

	dbReactions, err := database.GetAllForNote(noteId)

	assert.Nil(t, err)
	assert.Len(t, dbReactions, 2)

	assert.Equal(t, suite.reactions["Get1"].ID, dbReactions[0].ID)
	assert.Equal(t, suite.reactions["Get1"].Note, dbReactions[0].Note)
	assert.Equal(t, suite.reactions["Get1"].User, dbReactions[0].User)
	assert.Equal(t, suite.reactions["Get1"].ReactionType, dbReactions[0].ReactionType)

	assert.Equal(t, suite.reactions["Get2"].ID, dbReactions[1].ID)
	assert.Equal(t, suite.reactions["Get2"].Note, dbReactions[1].Note)
	assert.Equal(t, suite.reactions["Get2"].User, dbReactions[1].User)
	assert.Equal(t, suite.reactions["Get2"].ReactionType, dbReactions[1].ReactionType)
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

func (suite *DatabaseReactionTestSuite) SeedDatabase(db *bun.DB) {
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
		err := databaseinitialize.InsertUser(db, user.id, user.name, string(user.accountType))
		if err != nil {
			log.Fatalf("Failed to insert test user %s", err)
		}
	}

	for _, board := range suite.boards {
		err := databaseinitialize.InsertBoard(db, board.id, board.name, "", nil, nil, "PUBLIC", true, true, true, true, false)
		if err != nil {
			log.Fatalf("Failed to insert test board %s", err)
		}
	}

	for _, column := range suite.columns {
		err := databaseinitialize.InsertColumn(db, column.id, column.boardId, column.name, "", "backlog-blue", true, column.index)
		if err != nil {
			log.Fatalf("Failed to insert test board %s", err)
		}
	}

	for _, note := range suite.notes {
		err := databaseinitialize.InsertNote(db, note.id, note.authorId, note.boardId, note.columnId, note.text, uuid.NullUUID{UUID: uuid.Nil, Valid: false}, 0)
		if err != nil {
			log.Fatalf("Failed to insert test board %s", err)
		}
	}

	for _, reaction := range suite.reactions {
		err := databaseinitialize.InsertReaction(db, reaction.ID, reaction.Note, reaction.User, string(reaction.ReactionType))
		if err != nil {
			log.Fatalf("Failed to insert test board %s", err)
		}
	}
}
