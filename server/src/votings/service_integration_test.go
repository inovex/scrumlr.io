package votings

import (
  "context"
  "errors"
  "github.com/uptrace/bun"
  "log"
  "scrumlr.io/server/initialize"
  "scrumlr.io/server/initialize/testDbTemplates"
  "testing"

  "github.com/stretchr/testify/require"

  "github.com/google/uuid"
  "github.com/stretchr/testify/assert"
  "github.com/stretchr/testify/suite"
  "github.com/testcontainers/testcontainers-go/modules/nats"
  "scrumlr.io/server/common"
  "scrumlr.io/server/realtime"
  "scrumlr.io/server/technical_helper"
)

type VotingServiceIntegrationTestSuite struct {
  suite.Suite
  natsContainer        *nats.NATSContainer
  natsConnectionString string
  votingService        VotingService
  broker               *realtime.Broker
  baseData             testDbTemplates.DbBaseIDs
}

func TestVotingServiceIntegrationTestSuite(t *testing.T) {
  suite.Run(t, new(VotingServiceIntegrationTestSuite))
}

func (suite *VotingServiceIntegrationTestSuite) SetupSuite() {
  natsContainer, connectionString := initialize.StartTestNats()

  suite.natsContainer = natsContainer
  suite.natsConnectionString = connectionString
}

func (suite *VotingServiceIntegrationTestSuite) SetupTest() {
  suite.baseData = testDbTemplates.GetBaseIDs()
  db := testDbTemplates.NewBaseTestDB(
    suite.T(),
    testDbTemplates.AdditionalSeed{
      Name: "voting_votes",
      Func: suite.seedVotingVotes,
    },
  )

  votingDB := NewVotingDatabase(db)
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

  boardId := suite.baseData.Boards["Write"].ID
  userId := suite.baseData.Users["Santa"].ID
  noteId := suite.baseData.Notes["WriteAdd"].ID

  vote, err := suite.votingService.AddVote(ctx, VoteRequest{Board: boardId, Note: noteId, User: userId})

  require.NoError(t, err)
  assert.Equal(t, noteId, vote.Note)
  assert.Equal(t, userId, vote.User)
}

func (suite *VotingServiceIntegrationTestSuite) Test_AddVote_ClosedVoting() {
  t := suite.T()
  ctx := context.Background()

  boardId := suite.baseData.Boards["WriteClosed"].ID
  userId := suite.baseData.Users["Santa"].ID
  noteId := suite.baseData.Notes["WriteClosed"].ID

  vote, err := suite.votingService.AddVote(ctx, VoteRequest{Board: boardId, Note: noteId, User: userId})

  assert.Nil(t, vote)
  assert.NotNil(t, err)
  assert.Equal(t, common.ForbiddenError(errors.New("voting limit reached or no active voting session found")), err)
}

func (suite *VotingServiceIntegrationTestSuite) Test_RemoveVote() {
  t := suite.T()
  ctx := context.Background()

  boardId := suite.baseData.Boards["Write"].ID
  userId := suite.baseData.Users["Stan"].ID
  noteId := suite.baseData.Notes["WriteRemove"].ID

  err := suite.votingService.RemoveVote(ctx, VoteRequest{Board: boardId, Note: noteId, User: userId})

  require.NoError(t, err)
}

func (suite *VotingServiceIntegrationTestSuite) Test_RemoveVote_ClosedVoting() {
  t := suite.T()
  ctx := context.Background()

  boardId := suite.baseData.Boards["WriteClosed"].ID
  userId := suite.baseData.Users["Stan"].ID
  noteId := suite.baseData.Notes["WriteClosed"].ID

  err := suite.votingService.RemoveVote(ctx, VoteRequest{Board: boardId, Note: noteId, User: userId})

  require.NoError(t, err)
}

func (suite *VotingServiceIntegrationTestSuite) Test_GetVotes() {
  t := suite.T()
  ctx := context.Background()

  boardId := suite.baseData.Boards["Read"].ID

  votes, err := suite.votingService.GetVotes(ctx, boardId, VoteFilter{})

  require.NoError(t, err)
  assert.Len(t, votes, 18)
}

func (suite *VotingServiceIntegrationTestSuite) Test_CreateVoting() {
  t := suite.T()
  ctx := context.Background()

  boardId := suite.baseData.Boards["Create"].ID
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

  boardId := suite.baseData.Boards["CreateDuplicate"].ID
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

  votingId := suite.baseData.Votings["Update"].ID
  boardId := suite.baseData.Boards["Update"].ID

  events := suite.broker.GetBoardChannel(ctx, boardId)

  affectedNotes := []Note{
    {ID: suite.baseData.Notes["Update1"].ID, Author: suite.baseData.Notes["Update1"].AuthorID, Text: suite.baseData.Notes["Update1"].Text, Position: NotePosition{Column: suite.baseData.Notes["Update1"].ColumnID}},
    {ID: suite.baseData.Notes["Update2"].ID, Author: suite.baseData.Notes["Update2"].AuthorID, Text: suite.baseData.Notes["Update2"].Text, Position: NotePosition{Column: suite.baseData.Notes["Update2"].ColumnID}},
    {ID: suite.baseData.Notes["Update3"].ID, Author: suite.baseData.Notes["Update3"].AuthorID, Text: suite.baseData.Notes["Update3"].Text, Position: NotePosition{Column: suite.baseData.Notes["Update3"].ColumnID}},
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

  votingId := suite.baseData.Votings["SortedUpdate"].ID
  boardId := suite.baseData.Boards["SortedUpdate"].ID

  events := suite.broker.GetBoardChannel(ctx, boardId)

  affectedNotes := []Note{
    {ID: suite.baseData.Notes["SortedUpdate1"].ID, Author: suite.baseData.Notes["SortedUpdate1"].AuthorID, Text: suite.baseData.Notes["SortedUpdate1"].Text, Position: NotePosition{Column: suite.baseData.Notes["SortedUpdate1"].ColumnID}},
    {ID: suite.baseData.Notes["SortedUpdate2"].ID, Author: suite.baseData.Notes["SortedUpdate2"].AuthorID, Text: suite.baseData.Notes["SortedUpdate2"].Text, Position: NotePosition{Column: suite.baseData.Notes["SortedUpdate2"].ColumnID}},
    {ID: suite.baseData.Notes["SortedUpdate3"].ID, Author: suite.baseData.Notes["SortedUpdate3"].AuthorID, Text: suite.baseData.Notes["SortedUpdate3"].Text, Position: NotePosition{Column: suite.baseData.Notes["SortedUpdate3"].ColumnID}},
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
    suite.baseData.Notes["SortedUpdate3"].ID,
    suite.baseData.Notes["SortedUpdate1"].ID,
    suite.baseData.Notes["SortedUpdate2"].ID,
  }
  assert.Equal(t, got, want, "notes should be ordered by vote count DESC")
}

func (suite *VotingServiceIntegrationTestSuite) Test_GetVoting_Open() {
  t := suite.T()
  ctx := context.Background()

  boardId := suite.baseData.Boards["Read"].ID
  votingId := suite.baseData.Votings["ReadOpen"].ID

  voting, err := suite.votingService.Get(ctx, boardId, votingId)

  require.NoError(t, err)
  assert.Equal(t, votingId, voting.ID)
  assert.Equal(t, 5, voting.VoteLimit)
  assert.Equal(t, true, voting.AllowMultipleVotes)
  assert.Equal(t, false, voting.ShowVotesOfOthers)
  assert.Equal(t, false, voting.IsAnonymous)
  assert.Equal(t, Open, voting.Status)
  assert.Nil(t, voting.VotingResults)
}

func (suite *VotingServiceIntegrationTestSuite) Test_GetVoting_Close() {
  t := suite.T()
  ctx := context.Background()

  boardId := suite.baseData.Boards["Read"].ID
  votingId := suite.baseData.Votings["ReadClosed"].ID

  voting, err := suite.votingService.Get(ctx, boardId, votingId)

  require.NoError(t, err)
  assert.Equal(t, votingId, voting.ID)
  assert.Equal(t, 5, voting.VoteLimit)
  assert.Equal(t, true, voting.AllowMultipleVotes)
  assert.Equal(t, false, voting.ShowVotesOfOthers)
  assert.Equal(t, false, voting.IsAnonymous)
  assert.Equal(t, Closed, voting.Status)
  assert.NotNil(t, voting.VotingResults)
}

func (suite *VotingServiceIntegrationTestSuite) Test_GetAllVotings() {
  t := suite.T()
  ctx := context.Background()

  boardId := suite.baseData.Boards["Read"].ID

  votings, err := suite.votingService.GetAll(ctx, boardId)

  require.NoError(t, err)
  assert.Len(t, votings, 2)
}

func (suite *VotingServiceIntegrationTestSuite) Test_GetOpenVoting() {
  t := suite.T()
  ctx := context.Background()

  boardId := suite.baseData.Boards["Read"].ID

  voting, err := suite.votingService.GetOpen(ctx, boardId)

  require.NoError(t, err)
  assert.Equal(t, suite.baseData.Votings["ReadOpen"].ID, voting.ID)
  assert.Equal(t, 5, voting.VoteLimit)
  assert.Equal(t, true, voting.AllowMultipleVotes)
  assert.Equal(t, false, voting.ShowVotesOfOthers)
  assert.Equal(t, false, voting.IsAnonymous)
  assert.Equal(t, Open, voting.Status)
}

func (suite *VotingServiceIntegrationTestSuite) seedVotingVotes(db *bun.DB) {
  log.Println("Seeding voting votes data")
  initialize.InsertVote(db, suite.baseData.Boards["Update"].ID, suite.baseData.Votings["Update"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["Update3"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Update"].ID, suite.baseData.Votings["Update"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["Update3"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Update"].ID, suite.baseData.Votings["Update"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["Update3"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Update"].ID, suite.baseData.Votings["Update"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["Update1"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Update"].ID, suite.baseData.Votings["Update"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["Update1"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Update"].ID, suite.baseData.Votings["Update"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["Update2"].ID)

  initialize.InsertVote(db, suite.baseData.Boards["SortedUpdate"].ID, suite.baseData.Votings["SortedUpdate"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["SortedUpdate3"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["SortedUpdate"].ID, suite.baseData.Votings["SortedUpdate"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["SortedUpdate3"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["SortedUpdate"].ID, suite.baseData.Votings["SortedUpdate"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["SortedUpdate3"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["SortedUpdate"].ID, suite.baseData.Votings["SortedUpdate"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["SortedUpdate1"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["SortedUpdate"].ID, suite.baseData.Votings["SortedUpdate"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["SortedUpdate1"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["SortedUpdate"].ID, suite.baseData.Votings["SortedUpdate"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["SortedUpdate2"].ID)

  initialize.InsertVote(db, suite.baseData.Boards["Read"].ID, suite.baseData.Votings["ReadOpen"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["Read1"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Read"].ID, suite.baseData.Votings["ReadOpen"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["Read1"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Read"].ID, suite.baseData.Votings["ReadOpen"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["Read2"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Read"].ID, suite.baseData.Votings["ReadOpen"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["Read2"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Read"].ID, suite.baseData.Votings["ReadOpen"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["Read1"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Read"].ID, suite.baseData.Votings["ReadOpen"].ID, suite.baseData.Users["Santa"].ID, suite.baseData.Notes["Read1"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Read"].ID, suite.baseData.Votings["ReadOpen"].ID, suite.baseData.Users["Santa"].ID, suite.baseData.Notes["Read2"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Read"].ID, suite.baseData.Votings["ReadOpen"].ID, suite.baseData.Users["Santa"].ID, suite.baseData.Notes["Read1"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Read"].ID, suite.baseData.Votings["ReadOpen"].ID, suite.baseData.Users["Santa"].ID, suite.baseData.Notes["Read1"].ID)

  initialize.InsertVote(db, suite.baseData.Boards["Read"].ID, suite.baseData.Votings["ReadClosed"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["Read1"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Read"].ID, suite.baseData.Votings["ReadClosed"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["Read1"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Read"].ID, suite.baseData.Votings["ReadClosed"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["Read2"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Read"].ID, suite.baseData.Votings["ReadClosed"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["Read2"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Read"].ID, suite.baseData.Votings["ReadClosed"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["Read1"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Read"].ID, suite.baseData.Votings["ReadClosed"].ID, suite.baseData.Users["Santa"].ID, suite.baseData.Notes["Read1"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Read"].ID, suite.baseData.Votings["ReadClosed"].ID, suite.baseData.Users["Santa"].ID, suite.baseData.Notes["Read2"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Read"].ID, suite.baseData.Votings["ReadClosed"].ID, suite.baseData.Users["Santa"].ID, suite.baseData.Notes["Read1"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["Read"].ID, suite.baseData.Votings["ReadClosed"].ID, suite.baseData.Users["Santa"].ID, suite.baseData.Notes["Read1"].ID)

  initialize.InsertVote(db, suite.baseData.Boards["Write"].ID, suite.baseData.Votings["Write"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["WriteRemove"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["WriteLimit"].ID, suite.baseData.Votings["WriteLimit"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["WriteLimit"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["WriteClosed"].ID, suite.baseData.Votings["WriteClosed"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["WriteClosed"].ID)
  initialize.InsertVote(db, suite.baseData.Boards["WriteMultiple"].ID, suite.baseData.Votings["WriteMultiple"].ID, suite.baseData.Users["Stan"].ID, suite.baseData.Notes["WriteMultiple"].ID)
}
