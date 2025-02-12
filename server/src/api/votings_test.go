package api

import (
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/services"
	"scrumlr.io/server/votes"
	"strings"
	"testing"

	"github.com/google/uuid"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/database/types"
)

type VotingMock struct {
	services.Votings
	mock.Mock
}

func (m *VotingMock) AddVote(ctx context.Context, req dto.VoteRequest) (*dto.Vote, error) {
	args := m.Called(req)
	return args.Get(0).(*dto.Vote), args.Error(1)
}

func (m *VotingMock) RemoveVote(ctx context.Context, req dto.VoteRequest) error {
	args := m.Called(req)
	return args.Error(0)
}

func (m *VotingMock) GetVotes(ctx context.Context, f filter.VoteFilter) ([]*dto.Vote, error) {
	args := m.Called(f.Board, f.Voting)
	return args.Get(0).([]*dto.Vote), args.Error(1)
}
func (m *VotingMock) Get(ctx context.Context, boardID, id uuid.UUID) (*votes.Voting, error) {
	args := m.Called(boardID, id)
	return args.Get(0).(*votes.Voting), args.Error(1)
}

func (m *VotingMock) Update(ctx context.Context, body votes.VotingUpdateRequest) (*votes.Voting, error) {
	args := m.Called(body)
	return args.Get(0).(*votes.Voting), args.Error(1)
}

func (m *VotingMock) Create(ctx context.Context, body votes.VotingCreateRequest) (*votes.Voting, error) {
	args := m.Called(body)
	return args.Get(0).(*votes.Voting), args.Error(1)
}

type VotingTestSuite struct {
	suite.Suite
}

func TestVotingTestSuite(t *testing.T) {
	suite.Run(t, new(VotingTestSuite))
}

func (suite *VotingTestSuite) TestCreateVoting() {

	tests := []struct {
		name         string
		expectedCode int
		err          error
	}{
		{
			name:         "all ok",
			expectedCode: http.StatusCreated,
		},
		{
			name:         "api error",
			expectedCode: http.StatusBadRequest,
			err:          common.BadRequestError(errors.New("foo")),
		},
		{
			name:         "unhandled error",
			expectedCode: http.StatusInternalServerError,
			err:          errors.New("that was unexpected"),
		},
	}
	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			mock := new(VotingMock)

			boardId, _ := uuid.NewRandom()
			mock.On("Create", votes.VotingCreateRequest{
				VoteLimit:          4,
				AllowMultipleVotes: false,
				ShowVotesOfOthers:  false,
				Board:              boardId,
			}).Return(&votes.Voting{
				AllowMultipleVotes: false,
				ShowVotesOfOthers:  false,
			}, tt.err)

			s.votings = mock

			req := NewTestRequestBuilder("POST", "/", strings.NewReader(`{
				"voteLimit": 4,
				"allowMultipleVotes": false,
				"showVotesOfOthers": false
				}`))
			req.req = logger.InitTestLoggerRequest(req.Request())
			req.AddToContext(identifiers.BoardIdentifier, boardId)

			rr := httptest.NewRecorder()
			s.createVoting(rr, req.Request())
			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			mock.AssertExpectations(suite.T())
			mock.AssertNumberOfCalls(suite.T(), "Create", 1)
		})
	}

}

func (suite *VotingTestSuite) TestUpdateVoting() {

	tests := []struct {
		name         string
		status       types.VotingStatus
		expectedCode int
		err          error
	}{
		{
			name:         "all ok",
			expectedCode: http.StatusOK,
		},
		{
			name:         "unexpected error",
			expectedCode: http.StatusInternalServerError,
			err:          errors.New("oops"),
		},
	}
	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			mock := new(VotingMock)
			boardId, _ := uuid.NewRandom()
			votingId, _ := uuid.NewRandom()

			mock.On("Update", votes.VotingUpdateRequest{
				Board:  boardId,
				ID:     votingId,
				Status: types.VotingStatusClosed,
			}).Return(&votes.Voting{
				Status: types.VotingStatusClosed,
			}, tt.err)

			s.votings = mock

			req := NewTestRequestBuilder("PUT", "/", strings.NewReader(`{
				"status": "CLOSED"
				}`))
			req.req = logger.InitTestLoggerRequest(req.Request())
			req.AddToContext(identifiers.BoardIdentifier, boardId).
				AddToContext(identifiers.VotingIdentifier, votingId)
			rr := httptest.NewRecorder()

			s.updateVoting(rr, req.Request())
			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			mock.AssertExpectations(suite.T())
			mock.AssertNumberOfCalls(suite.T(), "Update", 1)
		})
	}

}

func (suite *VotingTestSuite) TestGetVoting() {
	s := new(Server)
	mock := new(VotingMock)
	s.votings = mock
	boardId, _ := uuid.NewRandom()
	votingId, _ := uuid.NewRandom()

	mock.On("Get", boardId, votingId).Return(&votes.Voting{
		ID:     votingId,
		Status: types.VotingStatusClosed,
	}, nil)

	req := NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.BoardIdentifier, boardId).
		AddToContext(identifiers.VotingIdentifier, votingId)
	rr := httptest.NewRecorder()

	s.getVoting(rr, req.Request())
	mock.AssertExpectations(suite.T())

}
