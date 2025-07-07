package reactions

import (
	"context"
	"database/sql"
	"errors"
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
	"scrumlr.io/server/databaseinitialize"
)

const POSTGRES_IMAGE = "postgres:17.5-alpine"
const DATABASE_NAME = "scrumlr_test"
const DATABASE_USERNAME = "stan"
const DATABASE_PASSWORD = "scrumlr"

type DatabaseReactionTestSuite struct {
	suite.Suite
	container *postgres.PostgresContainer
	db        *bun.DB
}

func TestDatabaseReactionTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseReactionTestSuite))
}

func (suite *DatabaseReactionTestSuite) SetupSuite() {
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

	path := filepath.Join("testdata.sql") // seding database
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

func (suite *DatabaseReactionTestSuite) TearDownSuite() {
	if err := testcontainers.TerminateContainer(suite.container); err != nil {
		log.Fatalf("Failed to terminate container: %s", err)
	}
}

func (suite *DatabaseReactionTestSuite) Test_Database_CreateReaction() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	boardId := uuid.MustParse("f23ac3e5-21a2-4e66-81db-c23df904badc")
	noteId := uuid.MustParse("c53c722c-e82a-4904-a387-aa1eea0c57db")
	userId := uuid.MustParse("7a6e0a1a-bdc2-4ac7-91eb-45587d65c8b4")

	reaction := DatabaseReactionInsert{
		Note:         noteId,
		User:         userId,
		ReactionType: Like,
	}

	dbReaction, err := database.Create(boardId, reaction)

	assert.Nil(t, err)
	assert.Equal(t, reaction.Note, dbReaction.Note)
	assert.Equal(t, reaction.User, dbReaction.User)
	assert.Equal(t, reaction.ReactionType, dbReaction.ReactionType)
}

func (suite *DatabaseReactionTestSuite) Test_Database_CreateReaction_MultipleReaction() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	boardId := uuid.MustParse("f23ac3e5-21a2-4e66-81db-c23df904badc")
	noteId := uuid.MustParse("b1a61dbb-0d55-49c1-9b78-cb2c38d49ae8")
	userId := uuid.MustParse("7efcbaad-f72e-4f01-9b2c-70d42426d036")

	reactionInsert := DatabaseReactionInsert{
		Note:         noteId,
		User:         userId,
		ReactionType: Like,
	}

	dbReaction, err := database.Create(boardId, reactionInsert)

	assert.Equal(t, DatabaseReaction{}, dbReaction)
	assert.Equal(t, errors.New("cannot make multiple reactions on the same note by the same user"), err)
}

func (suite *DatabaseReactionTestSuite) Test_Database_Delete() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	boardId := uuid.MustParse("f23ac3e5-21a2-4e66-81db-c23df904badc")
	userId := uuid.MustParse("7a6e0a1a-bdc2-4ac7-91eb-45587d65c8b4")
	reactionId := uuid.MustParse("b193c436-4d6f-4630-90a3-3415843f38f7")

	err := database.Delete(boardId, userId, reactionId)

	assert.Nil(t, err)
}

func (suite *DatabaseReactionTestSuite) Test_Database_Delete_NotFound() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	boardId := uuid.MustParse("f23ac3e5-21a2-4e66-81db-c23df904badc")
	userId := uuid.MustParse("7a6e0a1a-bdc2-4ac7-91eb-45587d65c8b4")
	reactionId := uuid.MustParse("8d140114-bfb8-4de4-94ed-f4f6f43f522d")

	err := database.Delete(boardId, userId, reactionId)

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
}

func (suite *DatabaseReactionTestSuite) Test_Database_Delete_UserError() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	boardId := uuid.MustParse("f23ac3e5-21a2-4e66-81db-c23df904badc")
	userId := uuid.MustParse("7a6e0a1a-bdc2-4ac7-91eb-45587d65c8b4")
	reactionId := uuid.MustParse("ac7102c8-0c7d-45d0-afaa-3d6b39984923")

	err := database.Delete(boardId, userId, reactionId)

	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("forbidden")), err)
}

func (suite *DatabaseReactionTestSuite) Test_Database_Update() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	reactionId := uuid.MustParse("ac7102c8-0c7d-45d0-afaa-3d6b39984923")
	boardId := uuid.MustParse("f23ac3e5-21a2-4e66-81db-c23df904badc")
	userId := uuid.MustParse("7efcbaad-f72e-4f01-9b2c-70d42426d036")
	reaction := DatabaseReaction{
		ID:           reactionId,
		Note:         uuid.MustParse("b1a61dbb-0d55-49c1-9b78-cb2c38d49ae8"),
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

	reactionId := uuid.MustParse("8d140114-bfb8-4de4-94ed-f4f6f43f522d")
	boardId := uuid.MustParse("f23ac3e5-21a2-4e66-81db-c23df904badc")
	userId := uuid.MustParse("7efcbaad-f72e-4f01-9b2c-70d42426d036")

	dbReaction, err := database.Update(boardId, userId, reactionId, DatabaseReactionUpdate{ReactionType: Poop})

	assert.Equal(t, DatabaseReaction{}, dbReaction)
	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
}

func (suite *DatabaseReactionTestSuite) Test_Database_Update_UserError() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	reactionId := uuid.MustParse("ac7102c8-0c7d-45d0-afaa-3d6b39984923")
	boardId := uuid.MustParse("f23ac3e5-21a2-4e66-81db-c23df904badc")
	userId := uuid.MustParse("7a6e0a1a-bdc2-4ac7-91eb-45587d65c8b4")

	dbReaction, err := database.Update(boardId, userId, reactionId, DatabaseReactionUpdate{ReactionType: Poop})

	assert.Equal(t, DatabaseReaction{}, dbReaction)
	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("forbidden")), err)
}

func (suite *DatabaseReactionTestSuite) Test_Database_GetReaction() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	reactionId := uuid.MustParse("57c398c0-8a37-42af-b5b7-c1b4056538e7")
	reaction := DatabaseReaction{
		ID:           reactionId,
		Note:         uuid.MustParse("abb08905-3efc-4fe8-b2b3-cb27393fe84b"),
		User:         uuid.MustParse("7a6e0a1a-bdc2-4ac7-91eb-45587d65c8b4"),
		ReactionType: Heart,
	}

	dbReaction, err := database.Get(reactionId)

	assert.Nil(t, err)
	assert.Equal(t, reaction.ID, dbReaction.ID)
	assert.Equal(t, reaction.Note, dbReaction.Note)
	assert.Equal(t, reaction.User, dbReaction.User)
	assert.Equal(t, reaction.ReactionType, dbReaction.ReactionType)
}

func (suite *DatabaseReactionTestSuite) Test_Database_GetAll() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	boardId := uuid.MustParse("493b3d06-c3a4-4fd0-94ea-f64819a007e4")
	reactions := []DatabaseReaction{
		{
			ID:           uuid.MustParse("57c398c0-8a37-42af-b5b7-c1b4056538e7"),
			User:         uuid.MustParse("7a6e0a1a-bdc2-4ac7-91eb-45587d65c8b4"),
			Note:         uuid.MustParse("abb08905-3efc-4fe8-b2b3-cb27393fe84b"),
			ReactionType: Heart,
		},
		{
			ID:           uuid.MustParse("ce18cd27-09bc-4201-9b1e-8916530063d0"),
			User:         uuid.MustParse("7efcbaad-f72e-4f01-9b2c-70d42426d036"),
			Note:         uuid.MustParse("abb08905-3efc-4fe8-b2b3-cb27393fe84b"),
			ReactionType: Like,
		},
		{
			ID:           uuid.MustParse("09a7e64d-bd74-45c5-8c77-642eb229193b"),
			User:         uuid.MustParse("7efcbaad-f72e-4f01-9b2c-70d42426d036"),
			Note:         uuid.MustParse("04b00221-8eaf-4594-8f7d-0865ca97d6c0"),
			ReactionType: Heart,
		},
	}

	dbReactions, err := database.GetAll(boardId)

	assert.Nil(t, err)
	assert.Len(t, dbReactions, len(reactions))

	assert.Equal(t, reactions[0].ID, dbReactions[0].ID)
	assert.Equal(t, reactions[0].Note, dbReactions[0].Note)
	assert.Equal(t, reactions[0].User, dbReactions[0].User)
	assert.Equal(t, reactions[0].ReactionType, dbReactions[0].ReactionType)

	assert.Equal(t, reactions[1].ID, dbReactions[1].ID)
	assert.Equal(t, reactions[1].Note, dbReactions[1].Note)
	assert.Equal(t, reactions[1].User, dbReactions[1].User)
	assert.Equal(t, reactions[1].ReactionType, dbReactions[1].ReactionType)

	assert.Equal(t, reactions[2].ID, dbReactions[2].ID)
	assert.Equal(t, reactions[2].Note, dbReactions[2].Note)
	assert.Equal(t, reactions[2].User, dbReactions[2].User)
	assert.Equal(t, reactions[2].ReactionType, dbReactions[2].ReactionType)
}

func (suite *DatabaseReactionTestSuite) Test_Database_GetAllForNote() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)

	noteId := uuid.MustParse("abb08905-3efc-4fe8-b2b3-cb27393fe84b")
	reactions := []DatabaseReaction{
		{
			ID:           uuid.MustParse("57c398c0-8a37-42af-b5b7-c1b4056538e7"),
			User:         uuid.MustParse("7a6e0a1a-bdc2-4ac7-91eb-45587d65c8b4"),
			Note:         noteId,
			ReactionType: Heart,
		},
		{
			ID:           uuid.MustParse("ce18cd27-09bc-4201-9b1e-8916530063d0"),
			User:         uuid.MustParse("7efcbaad-f72e-4f01-9b2c-70d42426d036"),
			Note:         noteId,
			ReactionType: Like,
		},
	}

	dbReactions, err := database.GetAllForNote(noteId)

	assert.Nil(t, err)
	assert.Len(t, dbReactions, len(reactions))

	assert.Equal(t, reactions[0].ID, dbReactions[0].ID)
	assert.Equal(t, reactions[0].Note, dbReactions[0].Note)
	assert.Equal(t, reactions[0].User, dbReactions[0].User)
	assert.Equal(t, reactions[0].ReactionType, dbReactions[0].ReactionType)

	assert.Equal(t, reactions[1].ID, dbReactions[1].ID)
	assert.Equal(t, reactions[1].Note, dbReactions[1].Note)
	assert.Equal(t, reactions[1].User, dbReactions[1].User)
	assert.Equal(t, reactions[1].ReactionType, dbReactions[1].ReactionType)
}
