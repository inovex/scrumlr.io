package votings

import (
	"context"
	"log"
	"testing"

	"github.com/google/uuid"
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

type DatabaseVotingTestSuite struct {
	suite.Suite
	container *postgres.PostgresContainer
	db        *bun.DB
	users     map[string]TestUser
	boards    map[string]TestBoard
	columns   map[string]TestColumn
	notes     map[string]TestNote
	votings   map[string]DatabaseVoting
	votes     map[string]DatabaseVote
}

func TestDatabaseBoardTemplateTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseVotingTestSuite))
}

func (suite *DatabaseVotingTestSuite) SetupSuite() {
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

	bunDb := databaseinitialize.InitializeBun(db, true) // setup bun

	suite.SeedDatabase(bunDb)

	suite.container = pgcontainer
	suite.db = bunDb
}

func (suite *DatabaseVotingTestSuite) TearDownSuite() {
	if err := testcontainers.TerminateContainer(suite.container); err != nil {
		log.Fatalf("Failed to terminate container: %s", err)
	}
}

func (suite *DatabaseVotingTestSuite) Test_Database_Create() {

}

func (suite *DatabaseVotingTestSuite) Test_Database_Update() {

}

func (suite *DatabaseVotingTestSuite) Test_Database_Get() {

}

func (suite *DatabaseVotingTestSuite) Test_Database_GetAll() {

}

func (suite *DatabaseVotingTestSuite) Test_Database_GetopenVoting() {

}

func (suite *DatabaseVotingTestSuite) Test_Database_AddVote() {

}

func (suite *DatabaseVotingTestSuite) Test_Database_DeleteVote() {

}

func (suite *DatabaseVotingTestSuite) Test_Database_GetVotes() {

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

func (suite *DatabaseVotingTestSuite) SeedDatabase(db *bun.DB) {
	// tests users
	suite.users = make(map[string]TestUser, 2)
	suite.users["Stan"] = TestUser{id: uuid.New(), name: "Stan", accountType: common.Google}
	suite.users["Santa"] = TestUser{id: uuid.New(), name: "Santa", accountType: common.Anonymous}

	// test board
	suite.boards = make(map[string]TestBoard)
	suite.boards["Write"] = TestBoard{id: uuid.New(), name: "Write Board"}
	suite.boards["Read"] = TestBoard{id: uuid.New(), name: "Read Board"}

	// test columns
	suite.columns = make(map[string]TestColumn)
	suite.columns["Write"] = TestColumn{id: uuid.New(), boardId: suite.boards["Write"].id, name: "Write Column", index: 0}
	suite.columns["Read"] = TestColumn{id: uuid.New(), boardId: suite.boards["Read"].id, name: "Read Column", index: 1}

	// test notes
	suite.notes = make(map[string]TestNote)
	suite.notes["Insert"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["Write"].id, columnId: suite.columns["Write"].id, text: "Insert vote note"}
	suite.notes["Update"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["Write"].id, columnId: suite.columns["Write"].id, text: "Update vote note"}
	suite.notes["Delete"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["Write"].id, columnId: suite.columns["Write"].id, text: "Delete vote note"}
	// notes for reading reactions. these don't change
	suite.notes["Read1"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["Read"].id, columnId: suite.columns["Read"].id, text: "Get votes note"}
	suite.notes["Read2"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["Read"].id, columnId: suite.columns["Read"].id, text: "Get votes note"}

	// test voting
	suite.votings = make(map[string]DatabaseVoting)
	suite.votings["ReadOpen"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["Read"].id, VoteLimit: 5, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}
	suite.votings["ReadClosed"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["Read"].id, VoteLimit: 5, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Closed}

	// test votes
	suite.votes = make(map[string]DatabaseVote)
	// votes for the open voting
	suite.votes["Read1"] = DatabaseVote{Board: suite.boards["Read"].id, Voting: suite.votings["ReadOpen"].ID, User: suite.users["Stan"].id, Note: suite.notes["Read1"].id}
	suite.votes["Read2"] = DatabaseVote{Board: suite.boards["Read"].id, Voting: suite.votings["ReadOpen"].ID, User: suite.users["Stan"].id, Note: suite.notes["Read1"].id}
	suite.votes["Read3"] = DatabaseVote{Board: suite.boards["Read"].id, Voting: suite.votings["ReadOpen"].ID, User: suite.users["Stan"].id, Note: suite.notes["Read2"].id}
	suite.votes["Read4"] = DatabaseVote{Board: suite.boards["Read"].id, Voting: suite.votings["ReadOpen"].ID, User: suite.users["Stan"].id, Note: suite.notes["Read2"].id}
	suite.votes["Read5"] = DatabaseVote{Board: suite.boards["Read"].id, Voting: suite.votings["ReadOpen"].ID, User: suite.users["Stan"].id, Note: suite.notes["Read1"].id}
	suite.votes["Read6"] = DatabaseVote{Board: suite.boards["Read"].id, Voting: suite.votings["ReadOpen"].ID, User: suite.users["Santa"].id, Note: suite.notes["Read1"].id}
	suite.votes["Read7"] = DatabaseVote{Board: suite.boards["Read"].id, Voting: suite.votings["ReadOpen"].ID, User: suite.users["Santa"].id, Note: suite.notes["Read2"].id}
	suite.votes["Read8"] = DatabaseVote{Board: suite.boards["Read"].id, Voting: suite.votings["ReadOpen"].ID, User: suite.users["Santa"].id, Note: suite.notes["Read1"].id}
	suite.votes["Read9"] = DatabaseVote{Board: suite.boards["Read"].id, Voting: suite.votings["ReadOpen"].ID, User: suite.users["Santa"].id, Note: suite.notes["Read1"].id}

	// votes for the colsed voting
	suite.votes["Read10"] = DatabaseVote{Board: suite.boards["Read"].id, Voting: suite.votings["ReadClosed"].ID, User: suite.users["Stan"].id, Note: suite.notes["Read1"].id}
	suite.votes["Read11"] = DatabaseVote{Board: suite.boards["Read"].id, Voting: suite.votings["ReadClosed"].ID, User: suite.users["Stan"].id, Note: suite.notes["Read1"].id}
	suite.votes["Read12"] = DatabaseVote{Board: suite.boards["Read"].id, Voting: suite.votings["ReadClosed"].ID, User: suite.users["Stan"].id, Note: suite.notes["Read2"].id}
	suite.votes["Read13"] = DatabaseVote{Board: suite.boards["Read"].id, Voting: suite.votings["ReadClosed"].ID, User: suite.users["Stan"].id, Note: suite.notes["Read2"].id}
	suite.votes["Read14"] = DatabaseVote{Board: suite.boards["Read"].id, Voting: suite.votings["ReadClosed"].ID, User: suite.users["Stan"].id, Note: suite.notes["Read1"].id}
	suite.votes["Read15"] = DatabaseVote{Board: suite.boards["Read"].id, Voting: suite.votings["ReadClosed"].ID, User: suite.users["Santa"].id, Note: suite.notes["Read1"].id}
	suite.votes["Read16"] = DatabaseVote{Board: suite.boards["Read"].id, Voting: suite.votings["ReadClosed"].ID, User: suite.users["Santa"].id, Note: suite.notes["Read2"].id}
	suite.votes["Read17"] = DatabaseVote{Board: suite.boards["Read"].id, Voting: suite.votings["ReadClosed"].ID, User: suite.users["Santa"].id, Note: suite.notes["Read1"].id}
	suite.votes["Read18"] = DatabaseVote{Board: suite.boards["Read"].id, Voting: suite.votings["ReadClosed"].ID, User: suite.users["Santa"].id, Note: suite.notes["Read1"].id}

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

	for _, voting := range suite.votings {
		err := databaseinitialize.InsertVoting(db, voting.ID, voting.Board, voting.VoteLimit, voting.AllowMultipleVotes, voting.ShowVotesOfOthers, string(voting.Status), voting.IsAnonymous)
		if err != nil {
			log.Fatalf("Failed to insert test user %s", err)
		}
	}

	for _, vote := range suite.votes {
		err := databaseinitialize.InsertVote(db, vote.Board, vote.Voting, vote.User, vote.Note)
		if err != nil {
			log.Fatalf("Failed to insert test user %s", err)
		}
	}
}
