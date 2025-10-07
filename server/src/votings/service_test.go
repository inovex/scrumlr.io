package votings

import (
	"context"
	"database/sql"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/common"

	"scrumlr.io/server/realtime"
)

func TestAddVote(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()
	votingID := uuid.New()

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().AddVote(mock.Anything, boardID, userID, noteID).
		Return(DatabaseVote{Board: boardID, Voting: votingID, User: userID, Note: noteID}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	vote, err := service.AddVote(context.Background(), VoteRequest{Board: boardID, User: userID, Note: noteID})

	assert.Nil(t, err)
	assert.Equal(t, votingID, vote.Voting)
	assert.Equal(t, noteID, vote.Note)
	assert.Equal(t, userID, vote.User)
}

func TestAddVote_VoteLimit(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().AddVote(mock.Anything, boardID, userID, noteID).
		Return(DatabaseVote{}, sql.ErrNoRows)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	vote, err := service.AddVote(context.Background(), VoteRequest{Board: boardID, User: userID, Note: noteID})

	assert.Nil(t, vote)
	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("voting limit reached or no active voting session found")), err)
}

func TestAddVote_Failed(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()
	dbError := "Failed to add vote"

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().AddVote(mock.Anything, boardID, userID, noteID).
		Return(DatabaseVote{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	vote, err := service.AddVote(context.Background(), VoteRequest{Board: boardID, User: userID, Note: noteID})

	assert.Nil(t, vote)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestRemoveVote(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	noteId := uuid.New()

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().RemoveVote(mock.Anything, boardId, userId, noteId).Return(nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	err := service.RemoveVote(context.Background(), VoteRequest{Board: boardId, User: userId, Note: noteId})

	assert.Nil(t, err)
}

func TestRemoveVote_Failed(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	noteId := uuid.New()
	dbError := "failed to remove vote"

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().RemoveVote(mock.Anything, boardId, userId, noteId).Return(errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	err := service.RemoveVote(context.Background(), VoteRequest{Board: boardId, User: userId, Note: noteId})

	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestGetVotes(t *testing.T) {
	boardId := uuid.New()

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().GetVotes(mock.Anything, boardId, VoteFilter{}).
		Return([]DatabaseVote{
			{Board: boardId, Voting: uuid.New(), User: uuid.New(), Note: uuid.New()},
			{Board: boardId, Voting: uuid.New(), User: uuid.New(), Note: uuid.New()},
			{Board: boardId, Voting: uuid.New(), User: uuid.New(), Note: uuid.New()},
		}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	votes, err := service.GetVotes(context.Background(), boardId, VoteFilter{})

	assert.Nil(t, err)
	assert.Len(t, votes, 3)
}

func TestGetVotes_Failed(t *testing.T) {
	boardId := uuid.New()
	dbError := "cannot create voting"

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().GetVotes(mock.Anything, boardId, VoteFilter{}).
		Return([]DatabaseVote{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	votes, err := service.GetVotes(context.Background(), boardId, VoteFilter{})

	assert.Nil(t, votes)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestCreateVoting(t *testing.T) {
	votingId := uuid.New()
	boardId := uuid.New()
	votingLimit := 10
	allowMultiple := false
	showVotes := false

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().Create(mock.Anything, DatabaseVotingInsert{Board: boardId, VoteLimit: votingLimit, AllowMultipleVotes: allowMultiple, ShowVotesOfOthers: showVotes, Status: Open}).
		Return(DatabaseVoting{ID: votingId, Board: boardId, VoteLimit: votingLimit, AllowMultipleVotes: allowMultiple, ShowVotesOfOthers: showVotes, Status: Open}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	voting, err := service.Create(context.Background(), VotingCreateRequest{
		Board:              boardId,
		VoteLimit:          votingLimit,
		AllowMultipleVotes: allowMultiple,
		ShowVotesOfOthers:  showVotes,
	})

	assert.Nil(t, err)
	assert.Equal(t, votingId, voting.ID)
	assert.Equal(t, votingLimit, voting.VoteLimit)
	assert.False(t, voting.AllowMultipleVotes)
	assert.False(t, voting.ShowVotesOfOthers)
	assert.False(t, voting.IsAnonymous)
}

func TestCreateVoting_SecondVoting(t *testing.T) {
	boardId := uuid.New()
	votingLimit := 10
	allowMultiple := false
	showVotes := false

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().Create(mock.Anything, DatabaseVotingInsert{Board: boardId, VoteLimit: votingLimit, AllowMultipleVotes: allowMultiple, ShowVotesOfOthers: showVotes, Status: Open}).
		Return(DatabaseVoting{}, sql.ErrNoRows)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	voting, err := service.Create(context.Background(), VotingCreateRequest{
		Board:              boardId,
		VoteLimit:          votingLimit,
		AllowMultipleVotes: allowMultiple,
		ShowVotesOfOthers:  showVotes,
	})

	assert.Nil(t, voting)
	assert.NotNil(t, err)
	assert.Equal(t, common.BadRequestError(errors.New("only one open voting session is allowed")), err)
}

func TestCreateVoting_Failed(t *testing.T) {
	boardId := uuid.New()
	votingLimit := 10
	allowMultiple := false
	showVotes := false
	dbError := "cannot create voting"

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().Create(mock.Anything, DatabaseVotingInsert{Board: boardId, VoteLimit: votingLimit, AllowMultipleVotes: allowMultiple, ShowVotesOfOthers: showVotes, Status: Open}).
		Return(DatabaseVoting{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	voting, err := service.Create(context.Background(), VotingCreateRequest{
		Board:              boardId,
		VoteLimit:          votingLimit,
		AllowMultipleVotes: allowMultiple,
		ShowVotesOfOthers:  showVotes,
	})

	assert.Nil(t, voting)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func TestCloseVoting(t *testing.T) {
	boardId := uuid.New()
	votingID := uuid.New()

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().Close(mock.Anything, DatabaseVotingUpdate{ID: votingID, Board: boardId, Status: Closed}).
		Return(DatabaseVoting{ID: votingID, Board: boardId, Status: Closed}, nil)
	mockDb.EXPECT().GetVotes(mock.Anything, boardId, VoteFilter{Voting: &votingID}).
		Return([]DatabaseVote{}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	voting, err := service.Close(context.Background(), votingID, boardId, nil)

	assert.NoError(t, err)
	assert.NotNil(t, voting)
	assert.Equal(t, Closed, voting.Status)
}

func TestCloseVoting_NotFound(t *testing.T) {
	boardId := uuid.New()
	votingID := uuid.New()

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().Close(mock.Anything, DatabaseVotingUpdate{ID: votingID, Board: boardId, Status: Closed}).
		Return(DatabaseVoting{}, sql.ErrNoRows)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	voting, err := service.Close(context.Background(), votingID, boardId, nil)

	assert.Nil(t, voting)
	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func TestCloseVoting_Failed(t *testing.T) {
	boardId := uuid.New()
	votingID := uuid.New()
	dbError := "failed to close"

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().Close(mock.Anything, DatabaseVotingUpdate{ID: votingID, Board: boardId, Status: Closed}).
		Return(DatabaseVoting{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	voting, err := service.Close(context.Background(), votingID, boardId, nil)

	assert.Nil(t, voting)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func TestCloseVoting_FailedToGetVotes(t *testing.T) {
	boardId := uuid.New()
	votingID := uuid.New()
	status := Closed
	dbError := "failed to get votes"

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().Close(mock.Anything, DatabaseVotingUpdate{ID: votingID, Board: boardId, Status: status}).
		Return(DatabaseVoting{ID: votingID, Board: boardId, Status: status}, nil)
	mockDb.EXPECT().GetVotes(mock.Anything, boardId, VoteFilter{Voting: &votingID}).
		Return([]DatabaseVote{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	voting, err := service.Close(context.Background(), votingID, boardId, nil)

	assert.Nil(t, voting)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestGetVoting_Open(t *testing.T) {
	boardId := uuid.New()
	votingId := uuid.New()
	votingLimit := 10
	allowMultiple := false
	showVotes := false
	status := Open

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().Get(mock.Anything, boardId, votingId).
		Return(DatabaseVoting{ID: votingId, Board: boardId, VoteLimit: votingLimit, AllowMultipleVotes: allowMultiple, ShowVotesOfOthers: showVotes, Status: status}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	voting, err := service.Get(context.Background(), boardId, votingId)

	assert.Nil(t, err)
	assert.Equal(t, votingId, voting.ID)
	assert.Equal(t, votingLimit, voting.VoteLimit)
	assert.Equal(t, status, voting.Status)
	assert.False(t, voting.AllowMultipleVotes)
	assert.False(t, voting.ShowVotesOfOthers)
	assert.False(t, voting.IsAnonymous)
	assert.Nil(t, voting.VotingResults)
}

func TestGetVoting_Open_NotFound(t *testing.T) {
	boardId := uuid.New()
	votingId := uuid.New()

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().Get(mock.Anything, boardId, votingId).
		Return(DatabaseVoting{}, sql.ErrNoRows)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	voting, err := service.Get(context.Background(), boardId, votingId)

	assert.Nil(t, voting)
	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func TestGetVoting_Open_FailedToGetVoting(t *testing.T) {
	boardId := uuid.New()
	votingId := uuid.New()
	dbError := "failed to get voting"

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().Get(mock.Anything, boardId, votingId).
		Return(DatabaseVoting{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	voting, err := service.Get(context.Background(), boardId, votingId)

	assert.Nil(t, voting)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func TestGetVoting_Closed(t *testing.T) {
	boardId := uuid.New()
	votingId := uuid.New()
	votingLimit := 10
	allowMultiple := false
	showVotes := false
	status := Closed

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().Get(mock.Anything, boardId, votingId).
		Return(DatabaseVoting{ID: votingId, Board: boardId, VoteLimit: votingLimit, AllowMultipleVotes: allowMultiple, ShowVotesOfOthers: showVotes, Status: status}, nil)
	mockDb.EXPECT().GetVotes(mock.Anything, boardId, VoteFilter{Voting: &votingId}).
		Return([]DatabaseVote{
			{Board: boardId, Voting: votingId, User: uuid.New(), Note: uuid.New()},
			{Board: boardId, Voting: votingId, User: uuid.New(), Note: uuid.New()},
			{Board: boardId, Voting: votingId, User: uuid.New(), Note: uuid.New()},
		}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	voting, err := service.Get(context.Background(), boardId, votingId)

	assert.Nil(t, err)
	assert.Equal(t, votingId, voting.ID)
	assert.Equal(t, votingLimit, voting.VoteLimit)
	assert.Equal(t, status, voting.Status)
	assert.False(t, voting.AllowMultipleVotes)
	assert.False(t, voting.ShowVotesOfOthers)
	assert.False(t, voting.IsAnonymous)
	assert.NotNil(t, voting.VotingResults)
	assert.Equal(t, 3, voting.VotingResults.Total)
}

func TestGetVoting_Closed_FailedToGetVotes(t *testing.T) {
	boardId := uuid.New()
	votingId := uuid.New()
	votingLimit := 10
	allowMultiple := false
	showVotes := false
	status := Closed
	dbError := "Failed to get votes"

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().Get(mock.Anything, boardId, votingId).
		Return(DatabaseVoting{ID: votingId, Board: boardId, VoteLimit: votingLimit, AllowMultipleVotes: allowMultiple, ShowVotesOfOthers: showVotes, Status: status}, nil)
	mockDb.EXPECT().GetVotes(mock.Anything, boardId, VoteFilter{Voting: &votingId}).
		Return([]DatabaseVote{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	voting, err := service.Get(context.Background(), boardId, votingId)

	assert.Nil(t, voting)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestGetAllVotings(t *testing.T) {
	boardId := uuid.New()
	firstVotingId := uuid.New()
	secondVotingId := uuid.New()

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseVoting{
			{ID: firstVotingId, Board: boardId, Status: Open},
			{ID: secondVotingId, Board: boardId, Status: Closed},
		}, nil)
	mockDb.EXPECT().GetVotes(mock.Anything, boardId, VoteFilter{}).
		Return([]DatabaseVote{
			{Voting: firstVotingId, Board: boardId, User: uuid.New(), Note: uuid.New()},
			{Voting: firstVotingId, Board: boardId, User: uuid.New(), Note: uuid.New()},
			{Voting: secondVotingId, Board: boardId, User: uuid.New(), Note: uuid.New()},
			{Voting: secondVotingId, Board: boardId, User: uuid.New(), Note: uuid.New()},
		}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	votings, err := service.GetAll(context.Background(), boardId)

	assert.Nil(t, err)
	assert.Len(t, votings, 2)

	assert.Equal(t, firstVotingId, votings[0].ID)
	assert.Equal(t, Open, votings[0].Status)
	assert.Nil(t, votings[0].VotingResults)

	assert.Equal(t, secondVotingId, votings[1].ID)
	assert.Equal(t, Closed, votings[1].Status)
	assert.NotNil(t, votings[1].VotingResults)
	assert.Equal(t, 2, votings[1].VotingResults.Total)
}

func TestGetAllVotings_FailedToGetVotings(t *testing.T) {
	boardId := uuid.New()
	firstVotingId := uuid.New()
	secondVotingId := uuid.New()
	dbError := "Failed to get votes"

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseVoting{
			{ID: firstVotingId, Board: boardId, Status: Open},
			{ID: secondVotingId, Board: boardId, Status: Closed},
		}, nil)
	mockDb.EXPECT().GetVotes(mock.Anything, boardId, VoteFilter{}).
		Return([]DatabaseVote{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	votings, err := service.GetAll(context.Background(), boardId)

	assert.Nil(t, votings)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestGetAllVotings_FailedToGetVotes(t *testing.T) {
	boardId := uuid.New()
	dbError := "Failed to get votings"

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().GetAll(mock.Anything, boardId).Return([]DatabaseVoting{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	votings, err := service.GetAll(context.Background(), boardId)

	assert.Nil(t, votings)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestGetOpenVoting(t *testing.T) {
	boardId := uuid.New()
	votingId := uuid.New()
	votingLimit := 10
	allowMultiple := false
	showVotes := false
	status := Open

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().GetOpenVoting(mock.Anything, boardId).
		Return(DatabaseVoting{ID: votingId, Board: boardId, VoteLimit: votingLimit, AllowMultipleVotes: allowMultiple, ShowVotesOfOthers: showVotes, Status: status}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	voting, err := service.GetOpen(context.Background(), boardId)

	assert.Nil(t, err)
	assert.Equal(t, votingId, voting.ID)
	assert.Equal(t, votingLimit, voting.VoteLimit)
	assert.Equal(t, status, voting.Status)
	assert.False(t, voting.AllowMultipleVotes)
	assert.False(t, voting.ShowVotesOfOthers)
	assert.False(t, voting.IsAnonymous)
	assert.Nil(t, voting.VotingResults)
}

func TestGetOpenVoting_FailedToGetVoting(t *testing.T) {
	boardId := uuid.New()
	dbError := "Failed to get open voting"

	mockDb := NewMockVotingDatabase(t)
	mockDb.EXPECT().GetOpenVoting(mock.Anything, boardId).
		Return(DatabaseVoting{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	voting, err := service.GetOpen(context.Background(), boardId)

	assert.Nil(t, voting)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}
