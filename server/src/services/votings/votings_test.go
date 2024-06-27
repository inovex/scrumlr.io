package votings

import (
	"context"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/database"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/realtime"
)

type votingServiceTestSuite struct {
	suite.Suite
}

type mockRtClient struct {
	mock.Mock
}

func (mc *mockRtClient) Publish(subject string, event interface{}) error {
	args := mc.Called(subject, event)
	return args.Error(0)
}

func (mc *mockRtClient) SubscribeToBoardSessionEvents(subject string) (chan *realtime.BoardSessionRequestEventType, error) {
	args := mc.Called(subject)
	return args.Get(0).(chan *realtime.BoardSessionRequestEventType), args.Error(1)
}

func (mc *mockRtClient) SubscribeToBoardEvents(subject string) (chan *realtime.BoardEvent, error) {
	args := mc.Called(subject)
	return args.Get(0).(chan *realtime.BoardEvent), args.Error(1)
}

type DBMock struct {
	DB
	mock.Mock
}

func (m *DBMock) CreateVoting(insert database.VotingInsert) (database.Voting, error) {
	args := m.Called(insert)
	return args.Get(0).(database.Voting), args.Error(1)
}

func (m *DBMock) UpdateVoting(update database.VotingUpdate) (database.Voting, error) {
	args := m.Called(update)
	return args.Get(0).(database.Voting), args.Error(1)
}

func (m *DBMock) GetVoting(board, id uuid.UUID) (database.Voting, []database.Vote, error) {
	args := m.Called(board, id)
	return args.Get(0).(database.Voting), args.Get(1).([]database.Vote), args.Error(2)
}

func (m *DBMock) GetVotings(board uuid.UUID) ([]database.Voting, []database.Vote, error) {
	args := m.Called(board)
	return args.Get(0).([]database.Voting), args.Get(1).([]database.Vote), args.Error(2)
}

func (m *DBMock) GetNotes(board uuid.UUID, columns ...uuid.UUID) ([]database.Note, error) {
	args := m.Called(board, columns)
	return args.Get(0).([]database.Note), args.Error(1)
}

func (m *DBMock) GetVotes(f filter.VoteFilter) ([]database.Vote, error) {
	args := m.Called(f)
	return args.Get(0).([]database.Vote), args.Error(1)
}

func (m *DBMock) AddVote(board, user, note uuid.UUID) (database.Vote, error) {
	args := m.Called(board, user, note)
	return args.Get(0).(database.Vote), args.Error(1)
}

func (m *DBMock) RemoveVote(board, user, note uuid.UUID) error {
	args := m.Called(board, user, note)
	return args.Error(0)
}

func TestVotingServiceTestSuite(t *testing.T) {
	suite.Run(t, new(votingServiceTestSuite))
}

func (suite *votingServiceTestSuite) TestCreate() {
	s := new(VotingService)
	mock := new(DBMock)
	s.database = mock

	rtClientMock := &mockRtClient{}
	rtMock := &realtime.Broker{
		Con: rtClientMock,
	}
	s.realtime = rtMock

	var votingId uuid.UUID
	var boardId uuid.UUID
	votingRequest := dto.VotingCreateRequest{
		Board:              boardId, // boardId is nulled
		VoteLimit:          0,
		AllowMultipleVotes: false,
		ShowVotesOfOthers:  false,
	}

	// Mocks for realtime
	publishSubject := "board." + boardId.String()
	publishEvent := realtime.BoardEvent{
		Type: realtime.BoardEventVotingCreated,
		Data: &dto.Voting{},
	}

	mock.On("CreateVoting", database.VotingInsert{
		Status: types.VotingStatusOpen,
	}).Return(database.Voting{}, nil)
	mock.On("GetVoting", boardId, votingId).Return(database.Voting{}, []database.Vote{}, nil)
	rtClientMock.On("Publish", publishSubject, publishEvent).Return(nil)

	create, err := s.Create(context.Background(), votingRequest)

	assert.NotNil(suite.T(), create)
	assert.NoError(suite.T(), err)
	mock.AssertExpectations(suite.T())
	rtClientMock.AssertExpectations(suite.T())
}
