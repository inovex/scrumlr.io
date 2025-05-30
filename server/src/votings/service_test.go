package votings

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/common/filter"
	brokerMock "scrumlr.io/server/mocks/realtime"

	"scrumlr.io/server/realtime"
)

type VotingServiceTestSuite struct {
	suite.Suite
}

func TestVotingServiceTestSuite(t *testing.T) {
	suite.Run(t, new(VotingServiceTestSuite))
}

func (suite *VotingServiceTestSuite) TestCreateVoting() {
	votingId := uuid.New()
	boardId := uuid.New()
	votingLimit := 10
	allowMultiple := false
	showVotes := false

	mockDb := NewMockVotingDatabase(suite.T())
	mockDb.EXPECT().Create(VotingInsert{Board: boardId, VoteLimit: votingLimit, AllowMultipleVotes: allowMultiple, ShowVotesOfOthers: showVotes, Status: Open}).
		Return(VotingDB{ID: votingId, Board: boardId, VoteLimit: votingLimit, AllowMultipleVotes: allowMultiple, ShowVotesOfOthers: showVotes, Status: Open}, nil)
	mockDb.EXPECT().Get(boardId, votingId).
		Return(VotingDB{ID: votingId, Board: boardId, VoteLimit: votingLimit, AllowMultipleVotes: allowMultiple, ShowVotesOfOthers: showVotes, Status: Open}, []VoteDB{}, nil)

	mockBroker := brokerMock.NewMockClient(suite.T())
	mockBroker.On("Publish", mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	create, err := service.Create(context.Background(), VotingCreateRequest{
		Board:              boardId,
		VoteLimit:          votingLimit,
		AllowMultipleVotes: allowMultiple,
		ShowVotesOfOthers:  showVotes,
	})

	assert.NotNil(suite.T(), create)
	assert.NoError(suite.T(), err)
	mockDb.AssertExpectations(suite.T())
	mockBroker.AssertExpectations(suite.T())
}

func (suite *VotingServiceTestSuite) TestUpdateVotingOpen() {
	boardId := uuid.New()
	votingID := uuid.New()
	status := Open

	mockDb := NewMockVotingDatabase(suite.T())

	mockBroker := brokerMock.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	voting, err := service.Update(context.Background(), VotingUpdateRequest{ID: votingID, Board: boardId, Status: status}, nil)

	assert.Nil(suite.T(), voting)
	assert.Error(suite.T(), err)
	mockDb.AssertExpectations(suite.T())
	mockBroker.AssertExpectations(suite.T())
}

func (suite *VotingServiceTestSuite) TestUpdateVotingClose() {
	boardId := uuid.New()
	votingID := uuid.New()
	status := Closed

	mockDb := NewMockVotingDatabase(suite.T())
	mockDb.EXPECT().Update(VotingUpdate{ID: votingID, Board: boardId, Status: status}).
		Return(VotingDB{ID: votingID, Board: boardId, Status: status}, nil)
	mockDb.EXPECT().Get(boardId, votingID).
		Return(VotingDB{ID: votingID, Board: boardId, Status: status}, []VoteDB{}, nil)
	mockDb.EXPECT().GetVotes(filter.VoteFilter{Board: boardId, Voting: &votingID}).
		Return([]VoteDB{}, nil)

	mockBroker := brokerMock.NewMockClient(suite.T())
	mockBroker.On("Publish", mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)
	voting, err := service.Update(context.Background(), VotingUpdateRequest{ID: votingID, Board: boardId, Status: status}, nil)

	assert.NoError(suite.T(), err)
	assert.NotNil(suite.T(), voting)
	assert.Equal(suite.T(), status, voting.Status)
	mockDb.AssertExpectations(suite.T())
	mockBroker.AssertExpectations(suite.T())
}

func (suite *VotingServiceTestSuite) TestAddVotes() {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()
	votingID := uuid.New()
	expectedVote := VoteDB{
		Board:  boardID,
		Voting: votingID,
		User:   userID,
		Note:   noteID,
	}

	mockDb := NewMockVotingDatabase(suite.T())
	mockDb.EXPECT().AddVote(boardID, userID, noteID).Return(expectedVote, nil)

	mockBroker := brokerMock.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)

	result, err := service.AddVote(context.Background(), VoteRequest{
		Board: boardID,
		User:  userID,
		Note:  noteID,
	})

	require.NoError(suite.T(), err)
	require.NotNil(suite.T(), result)
	assert.Equal(suite.T(), &Vote{
		Voting: votingID,
		Note:   noteID,
		User:   userID,
	}, result)
}
