package votings

import (
	"context"
	"errors"
	"log"
	"testing"

	"github.com/stretchr/testify/require"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/nats"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/technical_helper"
)

type VotingServiceIntegrationTestSuite struct {
	suite.Suite
	natsContainer        *nats.NATSContainer
	natsConnectionString string
	votingService        VotingService
	broker               *realtime.Broker
}

type TestData struct {
	users   map[string]TestUser
	boards  map[string]TestBoard
	columns map[string]TestColumn
	notes   map[string]TestNote
	votings map[string]DatabaseVoting
	votes   map[string]DatabaseVote
}

const votingTestSeedHash = "v1"

var testData = createTestData()

func TestVotingServiceIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(VotingServiceIntegrationTestSuite))
}

func (suite *VotingServiceIntegrationTestSuite) SetupSuite() {
	natsContainer, connectionString := initialize.StartTestNats()

	suite.natsContainer = natsContainer
	suite.natsConnectionString = connectionString
}

func (suite *VotingServiceIntegrationTestSuite) SetupTest() {
	votingDB := NewVotingDatabase(initialize.NewSeededTestDB(suite.T(), seedDatabaseForVoting, votingTestSeedHash))
	broker, err := realtime.NewNats(suite.natsConnectionString)
	if err != nil {
		log.Fatalf("Faild to connect to nats server %s", err)
	}
	suite.broker = broker
	suite.votingService = NewVotingService(votingDB, broker)
}

func (suite *VotingServiceIntegrationTestSuite) TeardownSuite() {
	initialize.StopTestNats(suite.natsContainer)
}

func (suite *VotingServiceIntegrationTestSuite) Test_AddVote() {
	t := suite.T()
	ctx := context.Background()

	boardId := testData.boards["Write"].id
	userId := testData.users["Santa"].id
	noteId := testData.notes["WriteAdd"].id

	vote, err := suite.votingService.AddVote(ctx, VoteRequest{Board: boardId, Note: noteId, User: userId})

	require.NoError(t, err)
	assert.Equal(t, noteId, vote.Note)
	assert.Equal(t, userId, vote.User)
}

func (suite *VotingServiceIntegrationTestSuite) Test_AddVote_ClosedVoting() {
	t := suite.T()
	ctx := context.Background()

	boardId := testData.boards["WriteClosed"].id
	userId := testData.users["Santa"].id
	noteId := testData.notes["WriteClosed"].id

	vote, err := suite.votingService.AddVote(ctx, VoteRequest{Board: boardId, Note: noteId, User: userId})

	assert.Nil(t, vote)
	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("voting limit reached or no active voting session found")), err)
}

func (suite *VotingServiceIntegrationTestSuite) Test_RemoveVote() {
	t := suite.T()
	ctx := context.Background()

	boardId := testData.boards["Write"].id
	userId := testData.users["Stan"].id
	noteId := testData.notes["WriteRemove"].id

	err := suite.votingService.RemoveVote(ctx, VoteRequest{Board: boardId, Note: noteId, User: userId})

	require.NoError(t, err)
}

func (suite *VotingServiceIntegrationTestSuite) Test_RemoveVote_ClosedVoting() {
	t := suite.T()
	ctx := context.Background()

	boardId := testData.boards["WriteClosed"].id
	userId := testData.users["Stan"].id
	noteId := testData.notes["WriteClosed"].id

	err := suite.votingService.RemoveVote(ctx, VoteRequest{Board: boardId, Note: noteId, User: userId})

	require.NoError(t, err)
}

func (suite *VotingServiceIntegrationTestSuite) Test_GetVotes() {
	t := suite.T()
	ctx := context.Background()

	boardId := testData.boards["Read"].id

	votes, err := suite.votingService.GetVotes(ctx, boardId, VoteFilter{})

	require.NoError(t, err)
	assert.Len(t, votes, 18)
}

func (suite *VotingServiceIntegrationTestSuite) Test_CreateVoting() {
	t := suite.T()
	ctx := context.Background()

	boardId := testData.boards["Create"].id
	voteLimit := 10
	allowMultiple := true
	showOfOthers := false
	anonymous := false
	status := Open

	events := suite.broker.GetBoardChannel(ctx, boardId)

	voting, err := suite.votingService.Create(ctx, VotingCreateRequest{Board: boardId, VoteLimit: voteLimit, AllowMultipleVotes: allowMultiple, ShowVotesOfOthers: showOfOthers, IsAnonymous: anonymous})

	require.NoError(t, err)
	assert.Equal(t, status, voting.Status)
	assert.Equal(t, voteLimit, voting.VoteLimit)
	assert.Equal(t, allowMultiple, voting.AllowMultipleVotes)
	assert.Equal(t, showOfOthers, voting.ShowVotesOfOthers)
	assert.Equal(t, anonymous, voting.IsAnonymous)
	assert.Nil(t, voting.VotingResults)

	msg := <-events
	assert.Equal(t, realtime.BoardEventVotingCreated, msg.Type)
	votingData, err := technical_helper.Unmarshal[Voting](msg.Data)
	require.NoError(t, err)
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

	boardId := testData.boards["CreateDuplicate"].id
	voteLimit := 10
	allowMultiple := true
	showOfOthers := false
	anonymous := false

	voting, err := suite.votingService.Create(ctx, VotingCreateRequest{Board: boardId, VoteLimit: voteLimit, AllowMultipleVotes: allowMultiple, ShowVotesOfOthers: showOfOthers, IsAnonymous: anonymous})

	assert.Nil(t, voting)
	assert.NotNil(t, err)
	assert.Equal(t, common.BadRequestError(errors.New("only one open voting per session is allowed")), err)
}

func (suite *VotingServiceIntegrationTestSuite) Test_CloseVoting() {
	t := suite.T()
	ctx := context.Background()

	votingId := testData.votings["Update"].ID
	boardId := testData.boards["Update"].id

	events := suite.broker.GetBoardChannel(ctx, boardId)

	affectedNotes := []Note{
		{ID: testData.notes["Update1"].id, Author: testData.notes["Update1"].authorId, Text: testData.notes["Update1"].text, Position: NotePosition{Column: testData.notes["Update1"].columnId}},
		{ID: testData.notes["Update2"].id, Author: testData.notes["Update2"].authorId, Text: testData.notes["Update2"].text, Position: NotePosition{Column: testData.notes["Update2"].columnId}},
		{ID: testData.notes["Update3"].id, Author: testData.notes["Update3"].authorId, Text: testData.notes["Update3"].text, Position: NotePosition{Column: testData.notes["Update3"].columnId}},
	}
	voting, err := suite.votingService.Close(ctx, votingId, boardId, affectedNotes)

	require.NoError(t, err)
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
	require.NoError(t, err)
	assert.Equal(t, Closed, votingData.Voting.Status)
	assert.NotNil(t, votingData.Voting.VotingResults)
	assert.Equal(t, 6, votingData.Voting.VotingResults.Total)
}

func (suite *VotingServiceIntegrationTestSuite) Test_CloseVoting_Sorted_Cards() {
	t := suite.T()
	ctx := context.Background()

	votingId := testData.votings["SortedUpdate"].ID
	boardId := testData.boards["SortedUpdate"].id

	events := suite.broker.GetBoardChannel(ctx, boardId)

	affectedNotes := []Note{
		{ID: testData.notes["SortedUpdate1"].id, Author: testData.notes["SortedUpdate1"].authorId, Text: testData.notes["SortedUpdate1"].text, Position: NotePosition{Column: testData.notes["SortedUpdate1"].columnId}},
		{ID: testData.notes["SortedUpdate2"].id, Author: testData.notes["SortedUpdate2"].authorId, Text: testData.notes["SortedUpdate2"].text, Position: NotePosition{Column: testData.notes["SortedUpdate2"].columnId}},
		{ID: testData.notes["SortedUpdate3"].id, Author: testData.notes["SortedUpdate3"].authorId, Text: testData.notes["SortedUpdate3"].text, Position: NotePosition{Column: testData.notes["SortedUpdate3"].columnId}},
	}
	voting, err := suite.votingService.Close(ctx, votingId, boardId, affectedNotes)

	require.NoError(t, err)
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
	require.NoError(t, err)
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
		testData.notes["SortedUpdate3"].id,
		testData.notes["SortedUpdate1"].id,
		testData.notes["SortedUpdate2"].id,
	}
	assert.Equal(t, got, want, "notes should be ordered by vote count DESC")
}

func (suite *VotingServiceIntegrationTestSuite) Test_GetVoting_Open() {
	t := suite.T()
	ctx := context.Background()

	boardId := testData.boards["Read"].id
	votingId := testData.votings["ReadOpen"].ID

	voting, err := suite.votingService.Get(ctx, boardId, votingId)

	require.NoError(t, err)
	assert.Equal(t, votingId, voting.ID)
	assert.Equal(t, testData.votings["ReadOpen"].VoteLimit, voting.VoteLimit)
	assert.Equal(t, testData.votings["ReadOpen"].AllowMultipleVotes, voting.AllowMultipleVotes)
	assert.Equal(t, testData.votings["ReadOpen"].ShowVotesOfOthers, voting.ShowVotesOfOthers)
	assert.Equal(t, testData.votings["ReadOpen"].IsAnonymous, voting.IsAnonymous)
	assert.Equal(t, testData.votings["ReadOpen"].Status, voting.Status)
	assert.Nil(t, voting.VotingResults)
}

func (suite *VotingServiceIntegrationTestSuite) Test_GetVoting_Close() {
	t := suite.T()
	ctx := context.Background()

	boardId := testData.boards["Read"].id
	votingId := testData.votings["ReadClosed"].ID

	voting, err := suite.votingService.Get(ctx, boardId, votingId)

	require.NoError(t, err)
	assert.Equal(t, votingId, voting.ID)
	assert.Equal(t, testData.votings["ReadClosed"].VoteLimit, voting.VoteLimit)
	assert.Equal(t, testData.votings["ReadClosed"].AllowMultipleVotes, voting.AllowMultipleVotes)
	assert.Equal(t, testData.votings["ReadClosed"].ShowVotesOfOthers, voting.ShowVotesOfOthers)
	assert.Equal(t, testData.votings["ReadClosed"].IsAnonymous, voting.IsAnonymous)
	assert.Equal(t, testData.votings["ReadClosed"].Status, voting.Status)
	assert.NotNil(t, voting.VotingResults)
}

func (suite *VotingServiceIntegrationTestSuite) Test_GetAllVotings() {
	t := suite.T()
	ctx := context.Background()

	boardId := testData.boards["Read"].id

	votings, err := suite.votingService.GetAll(ctx, boardId)

	require.NoError(t, err)
	assert.Len(t, votings, 2)
}

func (suite *VotingServiceIntegrationTestSuite) Test_GetOpenVoting() {
	t := suite.T()
	ctx := context.Background()

	boardId := testData.boards["Read"].id

	voting, err := suite.votingService.GetOpen(ctx, boardId)

	require.NoError(t, err)
	assert.Equal(t, testData.votings["ReadOpen"].ID, voting.ID)
	assert.Equal(t, testData.votings["ReadOpen"].VoteLimit, voting.VoteLimit)
	assert.Equal(t, testData.votings["ReadOpen"].AllowMultipleVotes, voting.AllowMultipleVotes)
	assert.Equal(t, testData.votings["ReadOpen"].ShowVotesOfOthers, voting.ShowVotesOfOthers)
	assert.Equal(t, testData.votings["ReadOpen"].IsAnonymous, voting.IsAnonymous)
	assert.Equal(t, Open, voting.Status)
}

func createTestData() *TestData {
	data := &TestData{
		users:   make(map[string]TestUser, 2),
		boards:  make(map[string]TestBoard, 11),
		columns: make(map[string]TestColumn, 10),
		notes:   make(map[string]TestNote, 16),
		votings: make(map[string]DatabaseVoting, 10),
		votes:   make(map[string]DatabaseVote, 35),
	}

	data.users["Stan"] = TestUser{id: uuid.New(), name: "Stan", accountType: common.Google}
	data.users["Santa"] = TestUser{id: uuid.New(), name: "Santa", accountType: common.Anonymous}

	data.boards["Create"] = TestBoard{id: uuid.New(), name: "Create Board"}
	data.boards["CreateEmpty"] = TestBoard{id: uuid.New(), name: "Create Board"}
	data.boards["CreateDuplicate"] = TestBoard{id: uuid.New(), name: "Create Duplicate Board"}
	data.boards["Update"] = TestBoard{id: uuid.New(), name: "Update Board"}
	data.boards["ClosedUpdate"] = TestBoard{id: uuid.New(), name: "Closed update Board"}
	data.boards["Read"] = TestBoard{id: uuid.New(), name: "Read Board"}
	data.boards["SortedUpdate"] = TestBoard{id: uuid.New(), name: "Sorted Cards after update"}
	data.boards["Write"] = TestBoard{id: uuid.New(), name: "Write Board"}
	data.boards["WriteClosed"] = TestBoard{id: uuid.New(), name: "Write Board with closed voting"}
	data.boards["WriteLimit"] = TestBoard{id: uuid.New(), name: "Write Board with low voting limit"}
	data.boards["WriteMultiple"] = TestBoard{id: uuid.New(), name: "Write Board with multiple disabled"}

	data.columns["Create"] = TestColumn{id: uuid.New(), boardId: data.boards["Create"].id, name: "Create Column", index: 0}
	data.columns["CreateEmpty"] = TestColumn{id: uuid.New(), boardId: data.boards["Create"].id, name: "Create Column", index: 0}
	data.columns["Update"] = TestColumn{id: uuid.New(), boardId: data.boards["Update"].id, name: "Update Column", index: 0}
	data.columns["ClosedUpdate"] = TestColumn{id: uuid.New(), boardId: data.boards["ClosedUpdate"].id, name: "Closed update Column", index: 0}
	data.columns["Read"] = TestColumn{id: uuid.New(), boardId: data.boards["Read"].id, name: "Read Column", index: 0}
	data.columns["SortedUpdate"] = TestColumn{id: uuid.New(), boardId: data.boards["SortedUpdate"].id, name: "Update Column", index: 0}
	data.columns["Write"] = TestColumn{id: uuid.New(), boardId: data.boards["Write"].id, name: "Write Column", index: 0}
	data.columns["WriteClosed"] = TestColumn{id: uuid.New(), boardId: data.boards["WriteClosed"].id, name: "Write Column Closed", index: 0}
	data.columns["WriteLimit"] = TestColumn{id: uuid.New(), boardId: data.boards["WriteLimit"].id, name: "Write Column Limit", index: 0}
	data.columns["WriteMultiple"] = TestColumn{id: uuid.New(), boardId: data.boards["WriteMultiple"].id, name: "Write Column multiple", index: 0}

	data.notes["Create"] = TestNote{id: uuid.New(), authorId: data.users["Stan"].id, boardId: data.boards["Create"].id, columnId: data.columns["Create"].id, text: "Create voting note"}
	data.notes["CreateEmpty"] = TestNote{id: uuid.New(), authorId: data.users["Stan"].id, boardId: data.boards["CreateEmpty"].id, columnId: data.columns["CreateEmpty"].id, text: "Create voting note"}
	data.notes["Update1"] = TestNote{id: uuid.New(), authorId: data.users["Stan"].id, boardId: data.boards["Update"].id, columnId: data.columns["Update"].id, text: "Update voting note one"}
	data.notes["Update2"] = TestNote{id: uuid.New(), authorId: data.users["Stan"].id, boardId: data.boards["Update"].id, columnId: data.columns["Update"].id, text: "Update voting note two"}
	data.notes["Update3"] = TestNote{id: uuid.New(), authorId: data.users["Stan"].id, boardId: data.boards["Update"].id, columnId: data.columns["Update"].id, text: "Update voting note three"}
	data.notes["SortedUpdate1"] = TestNote{id: uuid.New(), authorId: data.users["Stan"].id, boardId: data.boards["SortedUpdate"].id, columnId: data.columns["SortedUpdate"].id, text: "Update voting note one"}
	data.notes["SortedUpdate2"] = TestNote{id: uuid.New(), authorId: data.users["Stan"].id, boardId: data.boards["SortedUpdate"].id, columnId: data.columns["SortedUpdate"].id, text: "Update voting note two"}
	data.notes["SortedUpdate3"] = TestNote{id: uuid.New(), authorId: data.users["Stan"].id, boardId: data.boards["SortedUpdate"].id, columnId: data.columns["SortedUpdate"].id, text: "Update voting note three"}
	data.notes["ClosedUpdate"] = TestNote{id: uuid.New(), authorId: data.users["Stan"].id, boardId: data.boards["ClosedUpdate"].id, columnId: data.columns["ClosedUpdate"].id, text: "Closed update voting note"}
	data.notes["Read1"] = TestNote{id: uuid.New(), authorId: data.users["Stan"].id, boardId: data.boards["Read"].id, columnId: data.columns["Read"].id, text: "Get votes note"}
	data.notes["Read2"] = TestNote{id: uuid.New(), authorId: data.users["Stan"].id, boardId: data.boards["Read"].id, columnId: data.columns["Read"].id, text: "Get votes note"}
	data.notes["WriteAdd"] = TestNote{id: uuid.New(), authorId: data.users["Stan"].id, boardId: data.boards["Write"].id, columnId: data.columns["Write"].id, text: "Insert vote note"}
	data.notes["WriteRemove"] = TestNote{id: uuid.New(), authorId: data.users["Stan"].id, boardId: data.boards["Write"].id, columnId: data.columns["Write"].id, text: "Delete vote note"}
	data.notes["WriteClosed"] = TestNote{id: uuid.New(), authorId: data.users["Stan"].id, boardId: data.boards["WriteClosed"].id, columnId: data.columns["WriteClosed"].id, text: "Note for closed voting"}
	data.notes["WriteLimit"] = TestNote{id: uuid.New(), authorId: data.users["Stan"].id, boardId: data.boards["WriteLimit"].id, columnId: data.columns["WriteLimit"].id, text: "Note for vote limit"}
	data.notes["WriteMultiple"] = TestNote{id: uuid.New(), authorId: data.users["Stan"].id, boardId: data.boards["WriteMultiple"].id, columnId: data.columns["WriteMultiple"].id, text: "Note for multiple votes"}

	data.votings["CreateDuplicate"] = DatabaseVoting{ID: uuid.New(), Board: data.boards["CreateDuplicate"].id, VoteLimit: 7, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}
	data.votings["Update"] = DatabaseVoting{ID: uuid.New(), Board: data.boards["Update"].id, VoteLimit: 7, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}
	data.votings["ClosedUpdate"] = DatabaseVoting{ID: uuid.New(), Board: data.boards["ClosedUpdate"].id, VoteLimit: 7, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Closed}
	data.votings["ReadOpen"] = DatabaseVoting{ID: uuid.New(), Board: data.boards["Read"].id, VoteLimit: 5, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}
	data.votings["ReadClosed"] = DatabaseVoting{ID: uuid.New(), Board: data.boards["Read"].id, VoteLimit: 5, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Closed}
	data.votings["Write"] = DatabaseVoting{ID: uuid.New(), Board: data.boards["Write"].id, VoteLimit: 5, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}
	data.votings["WriteClosed"] = DatabaseVoting{ID: uuid.New(), Board: data.boards["WriteClosed"].id, VoteLimit: 5, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Closed}
	data.votings["WriteLimit"] = DatabaseVoting{ID: uuid.New(), Board: data.boards["WriteLimit"].id, VoteLimit: 1, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}
	data.votings["WriteMultiple"] = DatabaseVoting{ID: uuid.New(), Board: data.boards["WriteMultiple"].id, VoteLimit: 5, AllowMultipleVotes: false, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}
	data.votings["SortedUpdate"] = DatabaseVoting{ID: uuid.New(), Board: data.boards["SortedUpdate"].id, VoteLimit: 7, AllowMultipleVotes: true, ShowVotesOfOthers: false, IsAnonymous: false, Status: Open}

	data.votes["Update1"] = DatabaseVote{Board: data.boards["Update"].id, Voting: data.votings["Update"].ID, User: data.users["Stan"].id, Note: data.notes["Update3"].id}
	data.votes["Update2"] = DatabaseVote{Board: data.boards["Update"].id, Voting: data.votings["Update"].ID, User: data.users["Stan"].id, Note: data.notes["Update3"].id}
	data.votes["Update3"] = DatabaseVote{Board: data.boards["Update"].id, Voting: data.votings["Update"].ID, User: data.users["Stan"].id, Note: data.notes["Update3"].id}
	data.votes["Update4"] = DatabaseVote{Board: data.boards["Update"].id, Voting: data.votings["Update"].ID, User: data.users["Stan"].id, Note: data.notes["Update1"].id}
	data.votes["Update5"] = DatabaseVote{Board: data.boards["Update"].id, Voting: data.votings["Update"].ID, User: data.users["Stan"].id, Note: data.notes["Update1"].id}
	data.votes["Update6"] = DatabaseVote{Board: data.boards["Update"].id, Voting: data.votings["Update"].ID, User: data.users["Stan"].id, Note: data.notes["Update2"].id}
	data.votes["Sorted1"] = DatabaseVote{Board: data.boards["SortedUpdate"].id, Voting: data.votings["SortedUpdate"].ID, User: data.users["Stan"].id, Note: data.notes["SortedUpdate3"].id}
	data.votes["Sorted2"] = DatabaseVote{Board: data.boards["SortedUpdate"].id, Voting: data.votings["SortedUpdate"].ID, User: data.users["Stan"].id, Note: data.notes["SortedUpdate3"].id}
	data.votes["Sorted3"] = DatabaseVote{Board: data.boards["SortedUpdate"].id, Voting: data.votings["SortedUpdate"].ID, User: data.users["Stan"].id, Note: data.notes["SortedUpdate3"].id}
	data.votes["Sorted4"] = DatabaseVote{Board: data.boards["SortedUpdate"].id, Voting: data.votings["SortedUpdate"].ID, User: data.users["Stan"].id, Note: data.notes["SortedUpdate1"].id}
	data.votes["Sorted5"] = DatabaseVote{Board: data.boards["SortedUpdate"].id, Voting: data.votings["SortedUpdate"].ID, User: data.users["Stan"].id, Note: data.notes["SortedUpdate1"].id}
	data.votes["Sorted6"] = DatabaseVote{Board: data.boards["SortedUpdate"].id, Voting: data.votings["SortedUpdate"].ID, User: data.users["Stan"].id, Note: data.notes["SortedUpdate2"].id}
	data.votes["Read1"] = DatabaseVote{Board: data.boards["Read"].id, Voting: data.votings["ReadOpen"].ID, User: data.users["Stan"].id, Note: data.notes["Read1"].id}
	data.votes["Read2"] = DatabaseVote{Board: data.boards["Read"].id, Voting: data.votings["ReadOpen"].ID, User: data.users["Stan"].id, Note: data.notes["Read1"].id}
	data.votes["Read3"] = DatabaseVote{Board: data.boards["Read"].id, Voting: data.votings["ReadOpen"].ID, User: data.users["Stan"].id, Note: data.notes["Read2"].id}
	data.votes["Read4"] = DatabaseVote{Board: data.boards["Read"].id, Voting: data.votings["ReadOpen"].ID, User: data.users["Stan"].id, Note: data.notes["Read2"].id}
	data.votes["Read5"] = DatabaseVote{Board: data.boards["Read"].id, Voting: data.votings["ReadOpen"].ID, User: data.users["Stan"].id, Note: data.notes["Read1"].id}
	data.votes["Read6"] = DatabaseVote{Board: data.boards["Read"].id, Voting: data.votings["ReadOpen"].ID, User: data.users["Santa"].id, Note: data.notes["Read1"].id}
	data.votes["Read7"] = DatabaseVote{Board: data.boards["Read"].id, Voting: data.votings["ReadOpen"].ID, User: data.users["Santa"].id, Note: data.notes["Read2"].id}
	data.votes["Read8"] = DatabaseVote{Board: data.boards["Read"].id, Voting: data.votings["ReadOpen"].ID, User: data.users["Santa"].id, Note: data.notes["Read1"].id}
	data.votes["Read9"] = DatabaseVote{Board: data.boards["Read"].id, Voting: data.votings["ReadOpen"].ID, User: data.users["Santa"].id, Note: data.notes["Read1"].id}
	data.votes["Read10"] = DatabaseVote{Board: data.boards["Read"].id, Voting: data.votings["ReadClosed"].ID, User: data.users["Stan"].id, Note: data.notes["Read1"].id}
	data.votes["Read11"] = DatabaseVote{Board: data.boards["Read"].id, Voting: data.votings["ReadClosed"].ID, User: data.users["Stan"].id, Note: data.notes["Read1"].id}
	data.votes["Read12"] = DatabaseVote{Board: data.boards["Read"].id, Voting: data.votings["ReadClosed"].ID, User: data.users["Stan"].id, Note: data.notes["Read2"].id}
	data.votes["Read13"] = DatabaseVote{Board: data.boards["Read"].id, Voting: data.votings["ReadClosed"].ID, User: data.users["Stan"].id, Note: data.notes["Read2"].id}
	data.votes["Read14"] = DatabaseVote{Board: data.boards["Read"].id, Voting: data.votings["ReadClosed"].ID, User: data.users["Stan"].id, Note: data.notes["Read1"].id}
	data.votes["Read15"] = DatabaseVote{Board: data.boards["Read"].id, Voting: data.votings["ReadClosed"].ID, User: data.users["Santa"].id, Note: data.notes["Read1"].id}
	data.votes["Read16"] = DatabaseVote{Board: data.boards["Read"].id, Voting: data.votings["ReadClosed"].ID, User: data.users["Santa"].id, Note: data.notes["Read2"].id}
	data.votes["Read17"] = DatabaseVote{Board: data.boards["Read"].id, Voting: data.votings["ReadClosed"].ID, User: data.users["Santa"].id, Note: data.notes["Read1"].id}
	data.votes["Read18"] = DatabaseVote{Board: data.boards["Read"].id, Voting: data.votings["ReadClosed"].ID, User: data.users["Santa"].id, Note: data.notes["Read1"].id}
	data.votes["Delete"] = DatabaseVote{Board: data.boards["Write"].id, Voting: data.votings["Write"].ID, User: data.users["Stan"].id, Note: data.notes["WriteRemove"].id}
	data.votes["WriteLimit"] = DatabaseVote{Board: data.boards["WriteLimit"].id, Voting: data.votings["WriteLimit"].ID, User: data.users["Stan"].id, Note: data.notes["WriteLimit"].id}
	data.votes["WriteClosed"] = DatabaseVote{Board: data.boards["WriteClosed"].id, Voting: data.votings["WriteClosed"].ID, User: data.users["Stan"].id, Note: data.notes["WriteClosed"].id}
	data.votes["WriteMultiple"] = DatabaseVote{Board: data.boards["WriteMultiple"].id, Voting: data.votings["WriteMultiple"].ID, User: data.users["Stan"].id, Note: data.notes["WriteMultiple"].id}

	return data
}

func seedDatabaseForVoting(db *bun.DB) {
	for _, user := range testData.users {
		if err := initialize.InsertUser(db, user.id, user.name, string(user.accountType)); err != nil {
			log.Fatalf("Failed to insert test user %s", err)
		}
	}

	for _, board := range testData.boards {
		if err := initialize.InsertBoard(db, board.id, board.name, "", nil, nil, "PUBLIC", true, true, true, true, false); err != nil {
			log.Fatalf("Failed to insert test board %s", err)
		}
	}

	for _, column := range testData.columns {
		if err := initialize.InsertColumn(db, column.id, column.boardId, column.name, "", "backlog-blue", true, column.index); err != nil {
			log.Fatalf("Failed to insert test column %s", err)
		}
	}

	for _, note := range testData.notes {
		if err := initialize.InsertNote(db, note.id, note.authorId, note.boardId, note.columnId, note.text, uuid.NullUUID{UUID: uuid.Nil, Valid: false}, 0); err != nil {
			log.Fatalf("Failed to insert test note %s", err)
		}
	}

	for _, voting := range testData.votings {
		if err := initialize.InsertVoting(db, voting.ID, voting.Board, voting.VoteLimit, voting.AllowMultipleVotes, voting.ShowVotesOfOthers, string(voting.Status), voting.IsAnonymous); err != nil {
			log.Fatalf("Failed to insert test voting %s", err)
		}
	}

	for _, vote := range testData.votes {
		if err := initialize.InsertVote(db, vote.Board, vote.Voting, vote.User, vote.Note); err != nil {
			log.Fatalf("Failed to insert test vote %s", err)
		}
	}
}
