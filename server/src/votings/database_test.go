package votings

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
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/initialize"
)

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
	container, bun := initialize.StartTestDatabase()

	suite.SeedDatabase(bun)

	suite.container = container
	suite.db = bun
}

func (suite *DatabaseVotingTestSuite) TearDownSuite() {
	initialize.StopTestDatabase(suite.container)
}

func (suite *DatabaseVotingTestSuite) Test_Database_Create() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.boards["Create"].id
	voteLimit := 10
	allowMultiple := true
	showOfOthers := false
	anonymous := false
	status := Open

	dbVoting, err := database.Create(DatabaseVotingInsert{Board: boardId, VoteLimit: voteLimit, AllowMultipleVotes: allowMultiple, ShowVotesOfOthers: showOfOthers, IsAnonymous: anonymous, Status: status})

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbVoting.Board)
	assert.Equal(t, voteLimit, dbVoting.VoteLimit)
	assert.Equal(t, allowMultiple, dbVoting.AllowMultipleVotes)
	assert.Equal(t, showOfOthers, dbVoting.ShowVotesOfOthers)
	assert.Equal(t, anonymous, dbVoting.IsAnonymous)
	assert.Equal(t, status, dbVoting.Status)
	assert.NotNil(t, dbVoting.CreatedAt)
}

func (suite *DatabaseVotingTestSuite) Test_Database_Create_Duplicate() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.boards["Update"].id
	voteLimit := 10
	allowMultiple := true
	showOfOthers := false
	anonymous := false
	status := Open

	dbVoting, err := database.Create(DatabaseVotingInsert{Board: boardId, VoteLimit: voteLimit, AllowMultipleVotes: allowMultiple, ShowVotesOfOthers: showOfOthers, IsAnonymous: anonymous, Status: status})

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseVoting{}, dbVoting)
}

func (suite *DatabaseVotingTestSuite) Test_Database_Create_NegativeVoteLimit() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.boards["CreateEmpty"].id
	voteLimit := -1
	allowMultiple := true
	showOfOthers := false
	anonymous := false
	status := Open

	dbVoting, err := database.Create(DatabaseVotingInsert{Board: boardId, VoteLimit: voteLimit, AllowMultipleVotes: allowMultiple, ShowVotesOfOthers: showOfOthers, IsAnonymous: anonymous, Status: status})

	assert.NotNil(t, err)
	assert.Equal(t, errors.New("vote limit shall not be a negative number"), err)
	assert.Equal(t, DatabaseVoting{}, dbVoting)
}

func (suite *DatabaseVotingTestSuite) Test_Database_Create_HighVoteLimit() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.boards["CreateEmpty"].id
	voteLimit := 100
	allowMultiple := true
	showOfOthers := false
	anonymous := false
	status := Open

	dbVoting, err := database.Create(DatabaseVotingInsert{Board: boardId, VoteLimit: voteLimit, AllowMultipleVotes: allowMultiple, ShowVotesOfOthers: showOfOthers, IsAnonymous: anonymous, Status: status})

	assert.NotNil(t, err)
	assert.Equal(t, errors.New("vote limit shall not be greater than 99"), err)
	assert.Equal(t, DatabaseVoting{}, dbVoting)
}

func (suite *DatabaseVotingTestSuite) Test_Database_Update() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	votingId := suite.votings["Update"].ID
	boardId := suite.boards["Update"].id

	dbVoting, err := database.Update(DatabaseVotingUpdate{ID: votingId, Board: boardId, Status: Closed})

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

func (suite *DatabaseVotingTestSuite) Test_Database_Update_ClosedToOpen() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	votingId := suite.votings["ClosedUpdate"].ID
	boardId := suite.boards["ClosedUpdate"].id

	dbVoting, err := database.Update(DatabaseVotingUpdate{ID: votingId, Board: boardId, Status: Open})

	assert.NotNil(t, err)
	assert.Equal(t, errors.New("only allowed to close or abort a voting"), err)
	assert.Equal(t, DatabaseVoting{}, dbVoting)
}

func (suite *DatabaseVotingTestSuite) Test_Database_Get_Open() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.boards["Read"].id
	votingId := suite.votings["ReadOpen"].ID

	dbVoting, votes, err := database.Get(boardId, votingId)

	assert.Nil(t, err)
	assert.Len(t, votes, 0)

	assert.Equal(t, votingId, dbVoting.ID)
	assert.Equal(t, boardId, dbVoting.Board)
	assert.Equal(t, suite.votings["ReadOpen"].VoteLimit, dbVoting.VoteLimit)
	assert.Equal(t, suite.votings["ReadOpen"].AllowMultipleVotes, dbVoting.AllowMultipleVotes)
	assert.Equal(t, suite.votings["ReadOpen"].ShowVotesOfOthers, dbVoting.ShowVotesOfOthers)
	assert.Equal(t, suite.votings["ReadOpen"].IsAnonymous, dbVoting.IsAnonymous)
	assert.Equal(t, Open, dbVoting.Status)
	assert.NotNil(t, dbVoting.CreatedAt)
}

func (suite *DatabaseVotingTestSuite) Test_Database_Get_Closed() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.boards["Read"].id
	votingId := suite.votings["ReadClosed"].ID

	dbVoting, votes, err := database.Get(boardId, votingId)

	assert.Nil(t, err)
	assert.Len(t, votes, 9)

	assert.Equal(t, votingId, dbVoting.ID)
	assert.Equal(t, boardId, dbVoting.Board)
	assert.Equal(t, suite.votings["ReadClosed"].VoteLimit, dbVoting.VoteLimit)
	assert.Equal(t, suite.votings["ReadClosed"].AllowMultipleVotes, dbVoting.AllowMultipleVotes)
	assert.Equal(t, suite.votings["ReadClosed"].ShowVotesOfOthers, dbVoting.ShowVotesOfOthers)
	assert.Equal(t, suite.votings["ReadClosed"].IsAnonymous, dbVoting.IsAnonymous)
	assert.Equal(t, Closed, dbVoting.Status)
	assert.NotNil(t, dbVoting.CreatedAt)
}

func (suite *DatabaseVotingTestSuite) Test_Database_GetAll() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.boards["Read"].id

	dbVotings, votes, err := database.GetAll(boardId)

	assert.Nil(t, err)
	assert.Len(t, dbVotings, 2)
	assert.Len(t, votes, 18)
}

func (suite *DatabaseVotingTestSuite) Test_Database_GetOpenVoting() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.boards["Read"].id

	dbVoting, err := database.GetOpenVoting(boardId)

	assert.Nil(t, err)
	assert.Equal(t, suite.votings["ReadOpen"].ID, dbVoting.ID)
	assert.Equal(t, boardId, dbVoting.Board)
	assert.Equal(t, suite.votings["ReadOpen"].VoteLimit, dbVoting.VoteLimit)
	assert.Equal(t, suite.votings["ReadOpen"].AllowMultipleVotes, dbVoting.AllowMultipleVotes)
	assert.Equal(t, suite.votings["ReadOpen"].ShowVotesOfOthers, dbVoting.ShowVotesOfOthers)
	assert.Equal(t, suite.votings["ReadOpen"].IsAnonymous, dbVoting.IsAnonymous)
	assert.Equal(t, Open, dbVoting.Status)
	assert.NotNil(t, dbVoting.CreatedAt)
}

func (suite *DatabaseVotingTestSuite) Test_Database_AddVote() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.boards["Write"].id
	userId := suite.users["Santa"].id
	noteId := suite.notes["WriteAdd"].id

	dbVote, err := database.AddVote(boardId, userId, noteId)

	assert.Nil(t, err)
	assert.Equal(t, boardId, dbVote.Board)
	assert.Equal(t, noteId, dbVote.Note)
	assert.Equal(t, userId, dbVote.User)
	assert.Equal(t, suite.votings["Write"].ID, dbVote.Voting)
}

func (suite *DatabaseVotingTestSuite) Test_Database_AddVote_Closed() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.boards["WriteClosed"].id
	userId := suite.users["Santa"].id
	noteId := suite.notes["WriteClosed"].id

	dbVote, err := database.AddVote(boardId, userId, noteId)

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseVote{}, dbVote)
}

func (suite *DatabaseVotingTestSuite) Test_Database_AddVote_AboveLimit() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.boards["WriteLimit"].id
	userId := suite.users["Stan"].id
	noteId := suite.notes["WriteLimit"].id

	dbVote, err := database.AddVote(boardId, userId, noteId)

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseVote{}, dbVote)
}

func (suite *DatabaseVotingTestSuite) Test_Database_AddVote_MultipleNotAllowed() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.boards["WriteMultiple"].id
	userId := suite.users["Stan"].id
	noteId := suite.notes["WriteMultiple"].id

	dbVote, err := database.AddVote(boardId, userId, noteId)

	assert.NotNil(t, err)
	assert.Equal(t, sql.ErrNoRows, err)
	assert.Equal(t, DatabaseVote{}, dbVote)
}

func (suite *DatabaseVotingTestSuite) Test_Database_RemoveVote() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.boards["Write"].id
	userId := suite.users["Stan"].id
	noteId := suite.notes["Delete"].id

	err := database.RemoveVote(boardId, userId, noteId)

	assert.Nil(t, err)
}

func (suite *DatabaseVotingTestSuite) Test_Database_RemoveVote_Closed() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.boards["WriteClosed"].id
	userId := suite.users["Stan"].id
	noteId := suite.notes["WriteClosed"].id

	err := database.RemoveVote(boardId, userId, noteId)

	assert.Nil(t, err)
}

func (suite *DatabaseVotingTestSuite) Test_Database_GetVotes() {
	t := suite.T()
	database := NewVotingDatabase(suite.db)

	boardId := suite.boards["Read"].id

	dbVotes, err := database.GetVotes(filter.VoteFilter{Board: boardId})

	assert.Nil(t, err)
	assert.Len(t, dbVotes, 18)
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
	suite.boards = make(map[string]TestBoard, 7)
	// test boards for creating, updating and reading votings
	suite.boards["Create"] = TestBoard{id: uuid.New(), name: "Create Board"}
	suite.boards["CreateEmpty"] = TestBoard{id: uuid.New(), name: "Create Board"}
	suite.boards["Update"] = TestBoard{id: uuid.New(), name: "Update Board"}
	suite.boards["ClosedUpdate"] = TestBoard{id: uuid.New(), name: "Closed update Board"}
	suite.boards["Read"] = TestBoard{id: uuid.New(), name: "Read Board"}
	// test boards for adding and removing votes
	suite.boards["Write"] = TestBoard{id: uuid.New(), name: "Write Board"}
	suite.boards["WriteClosed"] = TestBoard{id: uuid.New(), name: "Write Board with closed voting"}
	suite.boards["WriteLimit"] = TestBoard{id: uuid.New(), name: "Write Board with low voting limit"}
	suite.boards["WriteMultiple"] = TestBoard{id: uuid.New(), name: "Write Board with multiple disabled"}

	// test columns
	suite.columns = make(map[string]TestColumn, 7)
	suite.columns["Create"] = TestColumn{id: uuid.New(), boardId: suite.boards["Create"].id, name: "Create Column", index: 0}
	suite.columns["CreateEmpty"] = TestColumn{id: uuid.New(), boardId: suite.boards["Create"].id, name: "Create Column", index: 0}
	suite.columns["Update"] = TestColumn{id: uuid.New(), boardId: suite.boards["Update"].id, name: "Update Column", index: 0}
	suite.columns["ClosedUpdate"] = TestColumn{id: uuid.New(), boardId: suite.boards["ClosedUpdate"].id, name: "Closed update Column", index: 0}
	suite.columns["Read"] = TestColumn{id: uuid.New(), boardId: suite.boards["Read"].id, name: "Read Column", index: 0}
	// test columns for adding and removing votes
	suite.columns["Write"] = TestColumn{id: uuid.New(), boardId: suite.boards["Write"].id, name: "Write Column", index: 0}
	suite.columns["WriteClosed"] = TestColumn{id: uuid.New(), boardId: suite.boards["WriteClosed"].id, name: "Write Column Closed", index: 0}
	suite.columns["WriteLimit"] = TestColumn{id: uuid.New(), boardId: suite.boards["WriteLimit"].id, name: "Write Column Limit", index: 0}
	suite.columns["WriteMultiple"] = TestColumn{id: uuid.New(), boardId: suite.boards["WriteMultiple"].id, name: "Write Column multiple", index: 0}

	// test notes
	suite.notes = make(map[string]TestNote, 9)
	// notes for creating, updating and reading votings
	suite.notes["Create"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["Create"].id, columnId: suite.columns["Create"].id, text: "Create voting note"}
	suite.notes["CreateEmpty"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["CreateEmpty"].id, columnId: suite.columns["CreateEmpty"].id, text: "Create voting note"}
	suite.notes["Update1"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["Update"].id, columnId: suite.columns["Update"].id, text: "Update voting note one"}
	suite.notes["Update2"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["Update"].id, columnId: suite.columns["Update"].id, text: "Update voting note two"}
	suite.notes["Update3"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["Update"].id, columnId: suite.columns["Update"].id, text: "Update voting note three"}
	suite.notes["ClosedUpdate"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["ClosedUpdate"].id, columnId: suite.columns["ClosedUpdate"].id, text: "Closed update voting note"}
	suite.notes["Read1"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["Read"].id, columnId: suite.columns["Read"].id, text: "Get votes note"}
	suite.notes["Read2"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["Read"].id, columnId: suite.columns["Read"].id, text: "Get votes note"}
	// notes for adding and removing votes
	suite.notes["WriteAdd"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["Write"].id, columnId: suite.columns["Write"].id, text: "Insert vote note"}
	suite.notes["WriteRemove"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["Write"].id, columnId: suite.columns["Write"].id, text: "Delete vote note"}
	suite.notes["WriteClosed"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["WriteClosed"].id, columnId: suite.columns["WriteClosed"].id, text: "Note for closed voting"}
	suite.notes["WriteLimit"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["WriteLimit"].id, columnId: suite.columns["WriteLimit"].id, text: "Note for vote limit"}
	suite.notes["WriteMultiple"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["WriteMultiple"].id, columnId: suite.columns["WriteMultiple"].id, text: "Note for multiple votes"}

	// test voting
	suite.votings = make(map[string]DatabaseVoting, 7)
	suite.votings["Update"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["Update"].id, VoteLimit: 7, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}
	suite.votings["ClosedUpdate"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["ClosedUpdate"].id, VoteLimit: 7, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Closed}
	suite.votings["ReadOpen"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["Read"].id, VoteLimit: 5, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}
	suite.votings["ReadClosed"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["Read"].id, VoteLimit: 5, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Closed}
	suite.votings["Write"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["Write"].id, VoteLimit: 5, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}
	suite.votings["WriteClosed"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["WriteClosed"].id, VoteLimit: 5, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Closed}
	suite.votings["WriteLimit"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["WriteLimit"].id, VoteLimit: 1, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}
	suite.votings["WriteMultiple"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["WriteMultiple"].id, VoteLimit: 5, AllowMultipleVotes: false, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}

	// test votes
	suite.votes = make(map[string]DatabaseVote, 26)
	// votes for the voting that is closed
	suite.votes["Update1"] = DatabaseVote{Board: suite.boards["Update"].id, Voting: suite.votings["Update"].ID, User: suite.users["Stan"].id, Note: suite.notes["Update3"].id}
	suite.votes["Update2"] = DatabaseVote{Board: suite.boards["Update"].id, Voting: suite.votings["Update"].ID, User: suite.users["Stan"].id, Note: suite.notes["Update3"].id}
	suite.votes["Update3"] = DatabaseVote{Board: suite.boards["Update"].id, Voting: suite.votings["Update"].ID, User: suite.users["Stan"].id, Note: suite.notes["Update3"].id}
	suite.votes["Update4"] = DatabaseVote{Board: suite.boards["Update"].id, Voting: suite.votings["Update"].ID, User: suite.users["Stan"].id, Note: suite.notes["Update1"].id}
	suite.votes["Update5"] = DatabaseVote{Board: suite.boards["Update"].id, Voting: suite.votings["Update"].ID, User: suite.users["Stan"].id, Note: suite.notes["Update1"].id}
	suite.votes["Update6"] = DatabaseVote{Board: suite.boards["Update"].id, Voting: suite.votings["Update"].ID, User: suite.users["Stan"].id, Note: suite.notes["Update2"].id}

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

	// votes for adding and removing votes
	suite.votes["Delete"] = DatabaseVote{Board: suite.boards["Write"].id, Voting: suite.votings["Write"].ID, User: suite.users["Stan"].id, Note: suite.notes["WriteRemove"].id}
	suite.votes["WriteLimit"] = DatabaseVote{Board: suite.boards["WriteLimit"].id, Voting: suite.votings["WriteLimit"].ID, User: suite.users["Stan"].id, Note: suite.notes["WriteLimit"].id}
	suite.votes["WriteClosed"] = DatabaseVote{Board: suite.boards["WriteClosed"].id, Voting: suite.votings["WriteClosed"].ID, User: suite.users["Stan"].id, Note: suite.notes["WriteClosed"].id}
	suite.votes["WriteMultiple"] = DatabaseVote{Board: suite.boards["WriteMultiple"].id, Voting: suite.votings["WriteMultiple"].ID, User: suite.users["Stan"].id, Note: suite.notes["WriteMultiple"].id}

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

	for _, voting := range suite.votings {
		err := initialize.InsertVoting(db, voting.ID, voting.Board, voting.VoteLimit, voting.AllowMultipleVotes, voting.ShowVotesOfOthers, string(voting.Status), voting.IsAnonymous)
		if err != nil {
			log.Fatalf("Failed to insert test user %s", err)
		}
	}

	for _, vote := range suite.votes {
		err := initialize.InsertVote(db, vote.Board, vote.Voting, vote.User, vote.Note)
		if err != nil {
			log.Fatalf("Failed to insert test user %s", err)
		}
	}
}
