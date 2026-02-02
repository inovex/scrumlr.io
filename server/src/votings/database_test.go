package votings

import (
	"context"
	"database/sql"
	"log"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/uptrace/bun"
	"scrumlr.io/server/initialize/testDbTemplates"
)

type DatabaseVotingTestSuite struct {
	suite.Suite
	db       *bun.DB
	baseData testDbTemplates.DbBaseIDs
}

func TestDatabaseVotingTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseVotingTestSuite))
}

func (suite *DatabaseVotingTestSuite) SetupSuite() {
	suite.baseData = testDbTemplates.GetBaseIDs()
}

func (suite *DatabaseVotingTestSuite) SetupTest() {
	suite.db = testDbTemplates.NewBaseTestDB(
		suite.T(),
		true,
		testDbTemplates.AdditionalSeed{
			Name: "voting_database_test_data",
			Func: suite.seedVotes,
		},
	)
}

func (suite *DatabaseVotingTestSuite) Test_Database_Create() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.baseData.Boards["Create"].ID
	voteLimit := 10
	allowMultiple := true
	showOfOthers := false
	anonymous := false
	status := Open

	dbVoting, err := database.Create(context.Background(),
		DatabaseVotingInsert{
			Board:              boardId,
			VoteLimit:          voteLimit,
			AllowMultipleVotes: allowMultiple,
			ShowVotesOfOthers:  showOfOthers,
			IsAnonymous:        anonymous,
			Status:             status,
		},
	)

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbVoting.Board)
	assert.Equal(t, voteLimit, dbVoting.VoteLimit)
	assert.Equal(t, allowMultiple, dbVoting.AllowMultipleVotes)
	assert.Equal(t, showOfOthers, dbVoting.ShowVotesOfOthers)
	assert.Equal(t, anonymous, dbVoting.IsAnonymous)
	assert.Equal(t, status, dbVoting.Status)
	assert.NotNil(t, dbVoting.CreatedAt)
}

func (suite *DatabaseVotingTestSuite) Test_Database_Close() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	votingId := suite.baseData.Votings["Update"].ID
	boardId := suite.baseData.Boards["Update"].ID

	dbVoting, err := database.Close(context.Background(),
		DatabaseVotingUpdate{
			ID:     votingId,
			Board:  boardId,
			Status: Closed,
		},
	)

	assert.Nil(t, err)
	assert.Equal(t, votingId, dbVoting.ID)
	assert.Equal(t, boardId, dbVoting.Board)
	assert.Equal(t, Closed, dbVoting.Status)
	assert.Equal(t, 7, dbVoting.VoteLimit)
	assert.True(t, dbVoting.AllowMultipleVotes)
	assert.False(t, dbVoting.ShowVotesOfOthers)
	assert.False(t, dbVoting.IsAnonymous)
	assert.NotNil(t, dbVoting.CreatedAt)
	// TODO: test note rank
}

func (suite *DatabaseVotingTestSuite) Test_Database_Get_Open() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.baseData.Boards["Read"].ID
	votingId := suite.baseData.Votings["ReadOpen"].ID

	dbVoting, err := database.Get(context.Background(), boardId, votingId)

	assert.Nil(t, err)

	assert.Equal(t, votingId, dbVoting.ID)
	assert.Equal(t, boardId, dbVoting.Board)
	assert.Equal(t, suite.baseData.Votings["ReadOpen"].VoteLimit, dbVoting.VoteLimit)
	assert.Equal(t, suite.baseData.Votings["ReadOpen"].AllowMultipleVotes, dbVoting.AllowMultipleVotes)
	assert.Equal(t, suite.baseData.Votings["ReadOpen"].ShowVotesOfOthers, dbVoting.ShowVotesOfOthers)
	assert.Equal(t, suite.baseData.Votings["ReadOpen"].IsAnonymous, dbVoting.IsAnonymous)
	assert.Equal(t, Open, dbVoting.Status)
	assert.NotNil(t, dbVoting.CreatedAt)
}

func (suite *DatabaseVotingTestSuite) Test_Database_Get_Closed() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.baseData.Boards["Read"].ID
	votingId := suite.baseData.Votings["ReadClosed"].ID

	dbVoting, err := database.Get(context.Background(), boardId, votingId)

	assert.Nil(t, err)

	assert.Equal(t, votingId, dbVoting.ID)
	assert.Equal(t, boardId, dbVoting.Board)
	assert.Equal(t, suite.baseData.Votings["ReadClosed"].VoteLimit, dbVoting.VoteLimit)
	assert.Equal(t, suite.baseData.Votings["ReadClosed"].AllowMultipleVotes, dbVoting.AllowMultipleVotes)
	assert.Equal(t, suite.baseData.Votings["ReadClosed"].ShowVotesOfOthers, dbVoting.ShowVotesOfOthers)
	assert.Equal(t, suite.baseData.Votings["ReadClosed"].IsAnonymous, dbVoting.IsAnonymous)
	assert.Equal(t, Closed, dbVoting.Status)
	assert.NotNil(t, dbVoting.CreatedAt)
}

func (suite *DatabaseVotingTestSuite) Test_Database_GetAll() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.baseData.Boards["Read"].ID

	dbVotings, err := database.GetAll(context.Background(), boardId)

	assert.Nil(t, err)
	assert.Len(t, dbVotings, 2)
}

func (suite *DatabaseVotingTestSuite) Test_Database_GetOpenVoting() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.baseData.Boards["Read"].ID

	dbVoting, err := database.GetOpenVoting(context.Background(), boardId)

	assert.Nil(t, err)
	assert.Equal(t, suite.baseData.Votings["ReadOpen"].ID, dbVoting.ID)
	assert.Equal(t, boardId, dbVoting.Board)
	assert.Equal(t, suite.baseData.Votings["ReadOpen"].VoteLimit, dbVoting.VoteLimit)
	assert.Equal(t, suite.baseData.Votings["ReadOpen"].AllowMultipleVotes, dbVoting.AllowMultipleVotes)
	assert.Equal(t, suite.baseData.Votings["ReadOpen"].ShowVotesOfOthers, dbVoting.ShowVotesOfOthers)
	assert.Equal(t, suite.baseData.Votings["ReadOpen"].IsAnonymous, dbVoting.IsAnonymous)
	assert.Equal(t, Open, dbVoting.Status)
	assert.NotNil(t, dbVoting.CreatedAt)
}

func (suite *DatabaseVotingTestSuite) Test_Database_AddVote() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.baseData.Boards["Write"].ID
	userId := suite.baseData.Users["Santa"].ID
	noteId := suite.baseData.Notes["WriteAdd"].ID

	dbVote, err := database.AddVote(context.Background(), boardId, userId, noteId)

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbVote.Board)
	assert.Equal(t, noteId, dbVote.Note)
	assert.Equal(t, userId, dbVote.User)
	assert.Equal(t, suite.baseData.Votings["Write"].ID, dbVote.Voting)
}

func (suite *DatabaseVotingTestSuite) Test_Database_AddVote_Closed() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.baseData.Boards["WriteClosed"].ID
	userId := suite.baseData.Users["Santa"].ID
	noteId := suite.baseData.Notes["WriteClosed"].ID

	dbVote, err := database.AddVote(context.Background(), boardId, userId, noteId)

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseVote{}, dbVote)
}

func (suite *DatabaseVotingTestSuite) Test_Database_AddVote_AboveLimit() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.baseData.Boards["WriteLimit"].ID
	userId := suite.baseData.Users["Stan"].ID
	noteId := suite.baseData.Notes["WriteLimit"].ID

	dbVote, err := database.AddVote(context.Background(), boardId, userId, noteId)

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseVote{}, dbVote)
}

func (suite *DatabaseVotingTestSuite) Test_Database_AddVote_MultipleNotAllowed() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.baseData.Boards["WriteMultiple"].ID
	userId := suite.baseData.Users["Stan"].ID
	noteId := suite.baseData.Notes["WriteMultiple"].ID

	dbVote, err := database.AddVote(context.Background(), boardId, userId, noteId)

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseVote{}, dbVote)
}

func (suite *DatabaseVotingTestSuite) Test_Database_RemoveVote() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.baseData.Boards["Write"].ID
	userId := suite.baseData.Users["Stan"].ID
	noteId := suite.baseData.Notes["WriteRemove"].ID

	err := database.RemoveVote(context.Background(), boardId, userId, noteId)

	assert.Nil(t, err)
}

func (suite *DatabaseVotingTestSuite) Test_Database_RemoveVote_Closed() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.baseData.Boards["WriteClosed"].ID
	userId := suite.baseData.Users["Stan"].ID
	noteId := suite.baseData.Notes["WriteClosed"].ID

	err := database.RemoveVote(context.Background(), boardId, userId, noteId)

	assert.Nil(t, err)
}

func (suite *DatabaseVotingTestSuite) Test_Database_GetVotes() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.baseData.Boards["Read"].ID

	dbVotes, err := database.GetVotes(context.Background(), boardId, VoteFilter{})

	assert.Nil(t, err)
	assert.Len(t, dbVotes, 18)
}

func (suite *DatabaseVotingTestSuite) seedVotes(db *bun.DB) {
	log.Println("Seeding voting database test votes")

	votes := []struct {
		board, voting, user, note string
	}{
		// votes for the Update voting
		{"Update", "Update", "Stan", "Update3"},
		{"Update", "Update", "Stan", "Update3"},
		{"Update", "Update", "Stan", "Update3"},
		{"Update", "Update", "Stan", "Update1"},
		{"Update", "Update", "Stan", "Update1"},
		{"Update", "Update", "Stan", "Update2"},

		// votes for the open voting (Read board)
		{"Read", "ReadOpen", "Stan", "Read1"},
		{"Read", "ReadOpen", "Stan", "Read1"},
		{"Read", "ReadOpen", "Stan", "Read2"},
		{"Read", "ReadOpen", "Stan", "Read2"},
		{"Read", "ReadOpen", "Stan", "Read1"},
		{"Read", "ReadOpen", "Santa", "Read1"},
		{"Read", "ReadOpen", "Santa", "Read2"},
		{"Read", "ReadOpen", "Santa", "Read1"},
		{"Read", "ReadOpen", "Santa", "Read1"},

		// votes for the closed voting (Read board)
		{"Read", "ReadClosed", "Stan", "Read1"},
		{"Read", "ReadClosed", "Stan", "Read1"},
		{"Read", "ReadClosed", "Stan", "Read2"},
		{"Read", "ReadClosed", "Stan", "Read2"},
		{"Read", "ReadClosed", "Stan", "Read1"},
		{"Read", "ReadClosed", "Santa", "Read1"},
		{"Read", "ReadClosed", "Santa", "Read2"},
		{"Read", "ReadClosed", "Santa", "Read1"},
		{"Read", "ReadClosed", "Santa", "Read1"},

		// votes for adding and removing votes
		{"Write", "Write", "Stan", "WriteRemove"},
		{"WriteLimit", "WriteLimit", "Stan", "WriteLimit"},
		{"WriteClosed", "WriteClosed", "Stan", "WriteClosed"},
		{"WriteMultiple", "WriteMultiple", "Stan", "WriteMultiple"},
	}

	for _, v := range votes {
		err := testDbTemplates.InsertVote(
			db,
			suite.baseData.Boards[v.board].ID,
			suite.baseData.Votings[v.voting].ID,
			suite.baseData.Users[v.user].ID,
			suite.baseData.Notes[v.note].ID,
		)
		if err != nil {
			log.Fatalf("Failed to insert vote (board=%s, voting=%s, user=%s, note=%s): %v",
				v.board, v.voting, v.user, v.note, err)
		}
	}
}
