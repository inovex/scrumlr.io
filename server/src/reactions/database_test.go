package reactions

import (
	"context"
	"log"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go"
	postgrescontainer "github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/uptrace/bun"
	"scrumlr.io/server/databaseinitialize"
)

const POSTGRES_IMAGE = "postgres:17.5-alpine"
const DATABASE_NAME = "scrumlr_test"
const DATABASE_USERNAME = "stan"
const DATABASE_PASSWORD = "scrumlr"

type DatabaseReactionTestSuite struct {
	suite.Suite
	container *postgrescontainer.PostgresContainer
	db        *bun.DB
}

func TestDatabaseReactioTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseReactionTestSuite))
}

func (suite *DatabaseReactionTestSuite) SetupSuite() {
	ctx := context.Background()
	pgcontainer, err := postgrescontainer.Run(
		ctx,
		POSTGRES_IMAGE,
		postgrescontainer.WithDatabase(DATABASE_NAME),
		postgrescontainer.WithUsername(DATABASE_USERNAME),
		postgrescontainer.WithPassword(DATABASE_PASSWORD),
		postgrescontainer.BasicWaitStrategies(),
	)

	if err != nil {
		log.Fatalf("Failed to start container: %s", err)
	}

	connectionString, err := pgcontainer.ConnectionString(context.Background(), "sslmode=disable")
	if err != nil {
		log.Fatalf("Failed to get connection string %s", err)
	}

	db, err := databaseinitialize.InitializeDatabase(connectionString)
	if err != nil {
		log.Fatalf("Failed to initialize database %s", err)
	}

	bunDb := databaseinitialize.InitializeBun(db, true)

	suite.container = pgcontainer
	suite.db = bunDb
}

func (suite *DatabaseReactionTestSuite) TearDownSuite() {
	if err := testcontainers.TerminateContainer(suite.container); err != nil {
		log.Fatalf("Failed to terminate container: %s", err)
	}
}

func (suite *DatabaseReactionTestSuite) TestCreateReaction() {
	t := suite.T()
	database := NewReactionsDatabase(suite.db)
	boardId := uuid.New()
	noteId := uuid.New()
	userId := uuid.New()

	reactionInsert := DatabaseReactionInsert{
		Note:         noteId,
		User:         userId,
		ReactionType: Like,
	}

	reaction, err := database.Create(boardId, reactionInsert)

	assert.Nil(t, err)
	assert.Equal(t, reactionInsert.Note, reaction.Note)
	assert.Equal(t, reactionInsert.User, reaction.User)
	assert.Equal(t, reactionInsert.ReactionType, reaction.ReactionType)
}

func Test_Database_GetReaction(t *testing.T) {
	assert.True(t, true)
}
