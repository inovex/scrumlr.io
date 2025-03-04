package api

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/mocks/services"
	"scrumlr.io/server/votes"
	"strings"
	"testing"

	"github.com/google/uuid"

	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/database/types"
)

type VotingTestSuite struct {
	suite.Suite
}

func TestVotingTestSuite(t *testing.T) {
	suite.Run(t, new(VotingTestSuite))
}

func (suite *VotingTestSuite) TestCreateVoting() {

	testParameterBundles := *TestParameterBundles{}.
		Append("all ok", http.StatusCreated, nil, false, false, nil).
		Append("api error", http.StatusBadRequest, common.BadRequestError(errors.New("foo")), false, false, nil).
		Append("unhandled error", http.StatusInternalServerError, errors.New("that was unexpected"), false, false, nil)

	for _, tt := range testParameterBundles {
		suite.Run(tt.name, func() {
			s := new(Server)
			votingMock := services.NewMockVotings(suite.T())

			boardId, _ := uuid.NewRandom()
			s.votings = votingMock

			req := NewTestRequestBuilder("POST", "/", strings.NewReader(`{
				"voteLimit": 4,
				"allowMultipleVotes": false
				}`))
			req.req = logger.InitTestLoggerRequest(req.Request())
			req.AddToContext(identifiers.BoardIdentifier, boardId)

			votingMock.EXPECT().Create(req.req.Context(), votes.VotingCreateRequest{
				VoteLimit:          4,
				AllowMultipleVotes: false,
				//ShowVotesOfOthers:  false,
				Board: boardId,
			}).Return(&votes.Voting{
				AllowMultipleVotes: false,
				//ShowVotesOfOthers:  false,
			}, tt.err)

			rr := httptest.NewRecorder()
			s.createVoting(rr, req.Request())
			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			votingMock.AssertExpectations(suite.T())
			votingMock.AssertNumberOfCalls(suite.T(), "Create", 1)
		})
	}

}

func (suite *VotingTestSuite) TestUpdateVoting() {

	testParameterBundles := *TestParameterBundles{}.
		Append("all ok", http.StatusOK, nil, false, false, nil).
		Append("unexpected error", http.StatusInternalServerError, errors.New("oops"), false, false, nil)

	for _, tt := range testParameterBundles {
		suite.Run(tt.name, func() {
			s := new(Server)
			votingMock := services.NewMockVotings(suite.T())
			boardId, _ := uuid.NewRandom()
			votingId, _ := uuid.NewRandom()

			s.votings = votingMock

			req := NewTestRequestBuilder("PUT", "/", strings.NewReader(`{
				"status": "CLOSED"
				}`))
			req.req = logger.InitTestLoggerRequest(req.Request())
			req.AddToContext(identifiers.BoardIdentifier, boardId).
				AddToContext(identifiers.VotingIdentifier, votingId)
			rr := httptest.NewRecorder()

			votingMock.EXPECT().Update(req.req.Context(), votes.VotingUpdateRequest{
				Board:  boardId,
				ID:     votingId,
				Status: types.VotingStatusClosed,
			}).Return(&votes.Voting{
				Status: types.VotingStatusClosed,
			}, tt.err)

			s.updateVoting(rr, req.Request())
			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			votingMock.AssertExpectations(suite.T())
			votingMock.AssertNumberOfCalls(suite.T(), "Update", 1)
		})
	}

}

func (suite *VotingTestSuite) TestGetVoting() {
	s := new(Server)
	votingMock := services.NewMockVotings(suite.T())
	s.votings = votingMock
	boardId, _ := uuid.NewRandom()
	votingId, _ := uuid.NewRandom()

	req := NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.BoardIdentifier, boardId).
		AddToContext(identifiers.VotingIdentifier, votingId)
	rr := httptest.NewRecorder()

	votingMock.EXPECT().Get(req.req.Context(), boardId, votingId).Return(&votes.Voting{
		ID:     votingId,
		Status: types.VotingStatusClosed,
	}, nil)

	s.getVoting(rr, req.Request())
	votingMock.AssertExpectations(suite.T())
}
