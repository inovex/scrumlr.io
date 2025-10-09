package votings

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

type VotingServiceIntegrationTestSuite struct {
	suite.Suite
	dbContainer          *postgres.PostgresContainer
	natsContainer        *nats.NATSContainer
	db                   *bun.DB
	natsConnectionString string
	users                map[string]TestUser
	boards               map[string]TestBoard
	columns              map[string]TestColumn
	notes                map[string]TestNote
	votings              map[string]DatabaseVoting
	votes                map[string]DatabaseVote
}

func TestVotingServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(VotingServiceIntegrationTestSuite))
}

func (suite *VotingServiceIntegrationTestSuite) SetupSuite() {
	dbContainer, bun := initialize.StartTestDatabase()
	suite.SeedDatabase(bun)
	natsContainer, connectionString := initialize.StartTestNats()

	suite.dbContainer = dbContainer
	suite.natsContainer = natsContainer
	suite.db = bun
	suite.natsConnectionString = connectionString
}

func (suite *VotingServiceIntegrationTestSuite) TeardownSuite() {
	initialize.StopTestDatabase(suite.dbContainer)
	initialize.StopTestNats(suite.natsContainer)
}

func (suite *VotingServiceIntegrationTestSuite) Test_AddVote() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].id
	userId := suite.users["Santa"].id
	noteId := suite.notes["WriteAdd"].id

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	database := NewVotingDatabase(suite.db)
	service := NewVotingService(database, broker)

	vote, err := service.AddVote(ctx, VoteRequest{Board: boardId, Note: noteId, User: userId})

	assert.Nil(t, err)
	assert.Equal(t, noteId, vote.Note)
	assert.Equal(t, userId, vote.User)
}

func (suite *VotingServiceIntegrationTestSuite) Test_AddVote_ClosedVoting() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["WriteClosed"].id
	userId := suite.users["Santa"].id
	noteId := suite.notes["WriteClosed"].id

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	database := NewVotingDatabase(suite.db)
	service := NewVotingService(database, broker)

	vote, err := service.AddVote(ctx, VoteRequest{Board: boardId, Note: noteId, User: userId})

	assert.Nil(t, vote)
	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("voting limit reached or no active voting session found")), err)
}

func (suite *VotingServiceIntegrationTestSuite) Test_RemoveVote() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Write"].id
	userId := suite.users["Stan"].id
	noteId := suite.notes["Delete"].id

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	database := NewVotingDatabase(suite.db)
	service := NewVotingService(database, broker)

	err = service.RemoveVote(ctx, VoteRequest{Board: boardId, Note: noteId, User: userId})

	assert.Nil(t, err)
}

func (suite *VotingServiceIntegrationTestSuite) Test_RemoveVote_ClosedVoting() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["WriteClosed"].id
	userId := suite.users["Stan"].id
	noteId := suite.notes["WriteClosed"].id

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	database := NewVotingDatabase(suite.db)
	service := NewVotingService(database, broker)

	err = service.RemoveVote(ctx, VoteRequest{Board: boardId, Note: noteId, User: userId})

	assert.Nil(t, err)
}

func (suite *VotingServiceIntegrationTestSuite) Test_GetVotes() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].id

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	database := NewVotingDatabase(suite.db)
	service := NewVotingService(database, broker)

	votes, err := service.GetVotes(ctx, boardId, VoteFilter{})

	assert.Nil(t, err)
	assert.Len(t, votes, 18)
}

func (suite *VotingServiceIntegrationTestSuite) Test_CreateVoting() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Create"].id
	voteLimit := 10
	allowMultiple := true
	showOfOthers := false
	anonymous := false
	status := Open

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	database := NewVotingDatabase(suite.db)
	service := NewVotingService(database, broker)

	voting, err := service.Create(ctx, VotingCreateRequest{Board: boardId, VoteLimit: voteLimit, AllowMultipleVotes: allowMultiple, ShowVotesOfOthers: showOfOthers, IsAnonymous: anonymous})

	assert.Nil(t, err)
	assert.Equal(t, status, voting.Status)
	assert.Equal(t, voteLimit, voting.VoteLimit)
	assert.Equal(t, allowMultiple, voting.AllowMultipleVotes)
	assert.Equal(t, showOfOthers, voting.ShowVotesOfOthers)
	assert.Equal(t, anonymous, voting.IsAnonymous)
	assert.Nil(t, voting.VotingResults)

	msg := <-events
	assert.Equal(t, realtime.BoardEventVotingCreated, msg.Type)
	votingData, err := technical_helper.Unmarshal[Voting](msg.Data)
	assert.Nil(t, err)
	assert.Equal(t, status, votingData.Status)
	assert.Equal(t, voteLimit, votingData.VoteLimit)
	assert.Equal(t, allowMultiple, votingData.AllowMultipleVotes)
	assert.Equal(t, showOfOthers, votingData.ShowVotesOfOthers)
	assert.Equal(t, anonymous, votingData.IsAnonymous)
	assert.Nil(t, voting.VotingResults)
}

func (suite *VotingServiceIntegrationTestSuite) Test_CreateVoting_Duplicate() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["CreateDuplicate"].id
	voteLimit := 10
	allowMultiple := true
	showOfOthers := false
	anonymous := false

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	database := NewVotingDatabase(suite.db)
	service := NewVotingService(database, broker)

	voting, err := service.Create(ctx, VotingCreateRequest{Board: boardId, VoteLimit: voteLimit, AllowMultipleVotes: allowMultiple, ShowVotesOfOthers: showOfOthers, IsAnonymous: anonymous})

	assert.Nil(t, voting)
	assert.NotNil(t, err)
	assert.Equal(t, common.BadRequestError(errors.New("only one open voting per session is allowed")), err)
}

func (suite *VotingServiceIntegrationTestSuite) Test_CloseVoting() {
	t := suite.T()
	ctx := context.Background()

	votingId := suite.votings["Update"].ID
	boardId := suite.boards["Update"].id

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	database := NewVotingDatabase(suite.db)
	service := NewVotingService(database, broker)

	affectedNotes := []Note{
		{ID: suite.notes["Update1"].id, Author: suite.notes["Update1"].authorId, Text: suite.notes["Update1"].text, Position: NotePosition{Column: suite.notes["Update1"].columnId}},
		{ID: suite.notes["Update2"].id, Author: suite.notes["Update2"].authorId, Text: suite.notes["Update2"].text, Position: NotePosition{Column: suite.notes["Update2"].columnId}},
		{ID: suite.notes["Update3"].id, Author: suite.notes["Update3"].authorId, Text: suite.notes["Update3"].text, Position: NotePosition{Column: suite.notes["Update3"].columnId}},
	}
	voting, err := service.Close(ctx, votingId, boardId, affectedNotes)

	assert.Nil(t, err)
	assert.Equal(t, votingId, voting.ID)
	assert.Equal(t, Closed, voting.Status)
	assert.NotNil(t, voting.VotingResults)
	assert.Equal(t, 6, voting.VotingResults.Total)

	msg := <-events
	assert.Equal(t, realtime.BoardEventVotingUpdated, msg.Type)
	type UpdateVoting struct {
		Voting *Voting
		Notes  []Note
	}
	votingData, err := technical_helper.Unmarshal[UpdateVoting](msg.Data)
	assert.Nil(t, err)
	assert.Equal(t, Closed, votingData.Voting.Status)
	assert.NotNil(t, votingData.Voting.VotingResults)
	assert.Equal(t, 6, votingData.Voting.VotingResults.Total)

}

func (suite *VotingServiceIntegrationTestSuite) Test_CloseVoting_Sorted_Cards() {
	t := suite.T()
	ctx := context.Background()

	votingId := suite.votings["SortedUpdate"].ID
	boardId := suite.boards["SortedUpdate"].id

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	events := broker.GetBoardChannel(ctx, boardId)

	database := NewVotingDatabase(suite.db)
	service := NewVotingService(database, broker)

	affectedNotes := []Note{
		{ID: suite.notes["SortedUpdate1"].id, Author: suite.notes["SortedUpdate1"].authorId, Text: suite.notes["SortedUpdate1"].text, Position: NotePosition{Column: suite.notes["SortedUpdate1"].columnId}},
		{ID: suite.notes["SortedUpdate2"].id, Author: suite.notes["SortedUpdate2"].authorId, Text: suite.notes["SortedUpdate2"].text, Position: NotePosition{Column: suite.notes["SortedUpdate2"].columnId}},
		{ID: suite.notes["SortedUpdate3"].id, Author: suite.notes["SortedUpdate3"].authorId, Text: suite.notes["SortedUpdate3"].text, Position: NotePosition{Column: suite.notes["SortedUpdate3"].columnId}},
	}
	voting, err := service.Close(ctx, votingId, boardId, affectedNotes)

	assert.Nil(t, err)
	assert.Equal(t, votingId, voting.ID)
	assert.Equal(t, Closed, voting.Status)
	assert.NotNil(t, voting.VotingResults)
	assert.Equal(t, 6, voting.VotingResults.Total)

	msg := <-events
	assert.Equal(t, realtime.BoardEventVotingUpdated, msg.Type)
	type UpdateVoting struct {
		Voting *Voting
		Notes  []Note
	}
	votingData, err := technical_helper.Unmarshal[UpdateVoting](msg.Data)
	assert.Nil(t, err)
	assert.Equal(t, Closed, votingData.Voting.Status)
	assert.NotNil(t, votingData.Voting.VotingResults)
	assert.Equal(t, 6, votingData.Voting.VotingResults.Total)
	assert.Len(t, votingData.Notes, 3)

	got := []uuid.UUID{
		votingData.Notes[0].ID,
		votingData.Notes[1].ID,
		votingData.Notes[2].ID,
	}
	want := []uuid.UUID{
		suite.notes["SortedUpdate3"].id, // 3 votes
		suite.notes["SortedUpdate1"].id, // 2 votes
		suite.notes["SortedUpdate2"].id, // 1 vote
	}
	assert.Equal(t, got, want, "notes should be ordered by vote count DESC")
}

func (suite *VotingServiceIntegrationTestSuite) Test_GetVoting_Open() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].id
	votingId := suite.votings["ReadOpen"].ID

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	database := NewVotingDatabase(suite.db)
	service := NewVotingService(database, broker)

	voting, err := service.Get(ctx, boardId, votingId)

	assert.Nil(t, err)
	assert.Equal(t, votingId, voting.ID)
	assert.Equal(t, suite.votings["ReadOpen"].VoteLimit, voting.VoteLimit)
	assert.Equal(t, suite.votings["ReadOpen"].AllowMultipleVotes, voting.AllowMultipleVotes)
	assert.Equal(t, suite.votings["ReadOpen"].ShowVotesOfOthers, voting.ShowVotesOfOthers)
	assert.Equal(t, suite.votings["ReadOpen"].IsAnonymous, voting.IsAnonymous)
	assert.Equal(t, suite.votings["ReadOpen"].Status, voting.Status)
	assert.Nil(t, voting.VotingResults)
}

func (suite *VotingServiceIntegrationTestSuite) Test_GetVoting_Close() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].id
	votingId := suite.votings["ReadClosed"].ID

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	database := NewVotingDatabase(suite.db)
	service := NewVotingService(database, broker)

	voting, err := service.Get(ctx, boardId, votingId)

	assert.Nil(t, err)
	assert.Equal(t, votingId, voting.ID)
	assert.Equal(t, suite.votings["ReadClosed"].VoteLimit, voting.VoteLimit)
	assert.Equal(t, suite.votings["ReadClosed"].AllowMultipleVotes, voting.AllowMultipleVotes)
	assert.Equal(t, suite.votings["ReadClosed"].ShowVotesOfOthers, voting.ShowVotesOfOthers)
	assert.Equal(t, suite.votings["ReadClosed"].IsAnonymous, voting.IsAnonymous)
	assert.Equal(t, suite.votings["ReadClosed"].Status, voting.Status)
	assert.NotNil(t, voting.VotingResults)
}

func (suite *VotingServiceIntegrationTestSuite) Test_GetAllVotings() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].id

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	database := NewVotingDatabase(suite.db)
	service := NewVotingService(database, broker)

	votings, err := service.GetAll(ctx, boardId)

	assert.Nil(t, err)
	assert.Len(t, votings, 2)
}

func (suite *VotingServiceIntegrationTestSuite) Test_GetOpenVoting() {
	t := suite.T()
	ctx := context.Background()

	boardId := suite.boards["Read"].id

	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}

	database := NewVotingDatabase(suite.db)
	service := NewVotingService(database, broker)

	voting, err := service.GetOpen(ctx, boardId)

	assert.Nil(t, err)
	assert.Equal(t, suite.votings["ReadOpen"].ID, voting.ID)
	assert.Equal(t, suite.votings["ReadOpen"].VoteLimit, voting.VoteLimit)
	assert.Equal(t, suite.votings["ReadOpen"].AllowMultipleVotes, voting.AllowMultipleVotes)
	assert.Equal(t, suite.votings["ReadOpen"].ShowVotesOfOthers, voting.ShowVotesOfOthers)
	assert.Equal(t, suite.votings["ReadOpen"].IsAnonymous, voting.IsAnonymous)
	assert.Equal(t, Open, voting.Status)
}

func (suite *VotingServiceIntegrationTestSuite) SeedDatabase(db *bun.DB) {
	// tests users
	suite.users = make(map[string]TestUser, 2)
	suite.users["Stan"] = TestUser{id: uuid.New(), name: "Stan", accountType: common.Google}
	suite.users["Santa"] = TestUser{id: uuid.New(), name: "Santa", accountType: common.Anonymous}

	// test board
	suite.boards = make(map[string]TestBoard, 8)
	// test boards for creating, updating and reading votings
	suite.boards["Create"] = TestBoard{id: uuid.New(), name: "Create Board"}
	suite.boards["CreateEmpty"] = TestBoard{id: uuid.New(), name: "Create Board"}
	suite.boards["CreateDuplicate"] = TestBoard{id: uuid.New(), name: "Create Duplicate Board"}
	suite.boards["Update"] = TestBoard{id: uuid.New(), name: "Update Board"}
	suite.boards["ClosedUpdate"] = TestBoard{id: uuid.New(), name: "Closed update Board"}
	suite.boards["Read"] = TestBoard{id: uuid.New(), name: "Read Board"}
	suite.boards["SortedUpdate"] = TestBoard{id: uuid.New(), name: "Sorted Cards after update"}
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
	suite.columns["SortedUpdate"] = TestColumn{id: uuid.New(), boardId: suite.boards["SortedUpdate"].id, name: "Update Column", index: 0}

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
	suite.notes["SortedUpdate1"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["SortedUpdate"].id, columnId: suite.columns["SortedUpdate"].id, text: "Update voting note one"}
	suite.notes["SortedUpdate2"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["SortedUpdate"].id, columnId: suite.columns["SortedUpdate"].id, text: "Update voting note two"}
	suite.notes["SortedUpdate3"] = TestNote{id: uuid.New(), authorId: suite.users["Stan"].id, boardId: suite.boards["SortedUpdate"].id, columnId: suite.columns["SortedUpdate"].id, text: "Update voting note three"}
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
	suite.votings = make(map[string]DatabaseVoting, 10)
	suite.votings["CreateDuplicate"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["CreateDuplicate"].id, VoteLimit: 7, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}
	suite.votings["Update"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["Update"].id, VoteLimit: 7, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}
	suite.votings["ClosedUpdate"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["ClosedUpdate"].id, VoteLimit: 7, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Closed}
	suite.votings["ReadOpen"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["Read"].id, VoteLimit: 5, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}
	suite.votings["ReadClosed"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["Read"].id, VoteLimit: 5, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Closed}
	suite.votings["Write"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["Write"].id, VoteLimit: 5, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}
	suite.votings["WriteClosed"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["WriteClosed"].id, VoteLimit: 5, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Closed}
	suite.votings["WriteLimit"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["WriteLimit"].id, VoteLimit: 1, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}
	suite.votings["WriteMultiple"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["WriteMultiple"].id, VoteLimit: 5, AllowMultipleVotes: false, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}
	suite.votings["SortedUpdate"] = DatabaseVoting{ID: uuid.New(), Board: suite.boards["SortedUpdate"].id, VoteLimit: 7, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}

	// test votes
	suite.votes = make(map[string]DatabaseVote, 26)
	// votes for the voting that is closed
	suite.votes["Update1"] = DatabaseVote{Board: suite.boards["Update"].id, Voting: suite.votings["Update"].ID, User: suite.users["Stan"].id, Note: suite.notes["Update3"].id}
	suite.votes["Update2"] = DatabaseVote{Board: suite.boards["Update"].id, Voting: suite.votings["Update"].ID, User: suite.users["Stan"].id, Note: suite.notes["Update3"].id}
	suite.votes["Update3"] = DatabaseVote{Board: suite.boards["Update"].id, Voting: suite.votings["Update"].ID, User: suite.users["Stan"].id, Note: suite.notes["Update3"].id}
	suite.votes["Update4"] = DatabaseVote{Board: suite.boards["Update"].id, Voting: suite.votings["Update"].ID, User: suite.users["Stan"].id, Note: suite.notes["Update1"].id}
	suite.votes["Update5"] = DatabaseVote{Board: suite.boards["Update"].id, Voting: suite.votings["Update"].ID, User: suite.users["Stan"].id, Note: suite.notes["Update1"].id}
	suite.votes["Update6"] = DatabaseVote{Board: suite.boards["Update"].id, Voting: suite.votings["Update"].ID, User: suite.users["Stan"].id, Note: suite.notes["Update2"].id}
	suite.votes["Sorted1"] = DatabaseVote{Board: suite.boards["SortedUpdate"].id, Voting: suite.votings["SortedUpdate"].ID, User: suite.users["Stan"].id, Note: suite.notes["SortedUpdate3"].id}
	suite.votes["Sorted2"] = DatabaseVote{Board: suite.boards["SortedUpdate"].id, Voting: suite.votings["SortedUpdate"].ID, User: suite.users["Stan"].id, Note: suite.notes["SortedUpdate3"].id}
	suite.votes["Sorted3"] = DatabaseVote{Board: suite.boards["SortedUpdate"].id, Voting: suite.votings["SortedUpdate"].ID, User: suite.users["Stan"].id, Note: suite.notes["SortedUpdate3"].id}

	suite.votes["Sorted4"] = DatabaseVote{Board: suite.boards["SortedUpdate"].id, Voting: suite.votings["SortedUpdate"].ID, User: suite.users["Stan"].id, Note: suite.notes["SortedUpdate1"].id}
	suite.votes["Sorted5"] = DatabaseVote{Board: suite.boards["SortedUpdate"].id, Voting: suite.votings["SortedUpdate"].ID, User: suite.users["Stan"].id, Note: suite.notes["SortedUpdate1"].id}

	suite.votes["Sorted6"] = DatabaseVote{Board: suite.boards["SortedUpdate"].id, Voting: suite.votings["SortedUpdate"].ID, User: suite.users["Stan"].id, Note: suite.notes["SortedUpdate2"].id}

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
			log.Fatalf("Failed to insert test column %s", err)
		}
	}

	for _, note := range suite.notes {
		err := initialize.InsertNote(db, note.id, note.authorId, note.boardId, note.columnId, note.text, uuid.NullUUID{UUID: uuid.Nil, Valid: false}, 0)
		if err != nil {
			log.Fatalf("Failed to insert test note %s", err)
		}
	}

	for _, voting := range suite.votings {
		err := initialize.InsertVoting(db, voting.ID, voting.Board, voting.VoteLimit, voting.AllowMultipleVotes, voting.ShowVotesOfOthers, string(voting.Status), voting.IsAnonymous)
		if err != nil {
			log.Fatalf("Failed to insert test voting %s", err)
		}
	}

	for _, vote := range suite.votes {
		err := initialize.InsertVote(db, vote.Board, vote.Voting, vote.User, vote.Note)
		if err != nil {
			log.Fatalf("Failed to insert test vote %s", err)
		}
	}
}
