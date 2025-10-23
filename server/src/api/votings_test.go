package api

import (
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"scrumlr.io/server/notes"

	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/votings"

	"github.com/google/uuid"

	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
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
			votingMock := votings.NewMockVotingService(suite.T())

			boardId, _ := uuid.NewRandom()
			s.votings = votingMock

			req := NewTestRequestBuilder("POST", "/", strings.NewReader(`{
				"voteLimit": 4,
				"allowMultipleVotes": false
				}`))
			req.req = logger.InitTestLoggerRequest(req.Request())
			req.AddToContext(identifiers.BoardIdentifier, boardId)

			votingMock.EXPECT().Create(mock.Anything, votings.VotingCreateRequest{
				VoteLimit:          4,
				AllowMultipleVotes: false,
				ShowVotesOfOthers:  false,
				Board:              boardId,
			}).Return(&votings.Voting{
				AllowMultipleVotes: false,
				ShowVotesOfOthers:  false,
			}, tt.err)

			rr := httptest.NewRecorder()
			s.createVoting(rr, req.Request())
			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			votingMock.AssertExpectations(suite.T())
			votingMock.AssertNumberOfCalls(suite.T(), "Create", 1)
		})
	}

}

func (suite *VotingTestSuite) TestCloseVoting() {

	testParameterBundles := *TestParameterBundles{}.
		Append("all ok", http.StatusOK, nil, false, false, nil).
		Append("unexpected error", http.StatusInternalServerError, errors.New("oops"), false, false, nil)

	for _, tt := range testParameterBundles {
		suite.Run(tt.name, func() {
			s := new(Server)
			votingMock := votings.NewMockVotingService(suite.T())
			notesMock := notes.NewMockNotesService(suite.T())
			boardId, _ := uuid.NewRandom()
			votingId, _ := uuid.NewRandom()

			s.votings = votingMock
			s.notes = notesMock

			req := NewTestRequestBuilder("PUT", "/", nil)
			req.req = logger.InitTestLoggerRequest(req.Request())
			req.AddToContext(identifiers.BoardIdentifier, boardId).
				AddToContext(identifiers.VotingIdentifier, votingId)
			rr := httptest.NewRecorder()

			notesMock.EXPECT().GetAll(mock.Anything, boardId).Return([]*notes.Note{}, nil)

			votingMock.EXPECT().Close(mock.Anything, votingId, boardId, []votings.Note(nil)).
				Return(&votings.Voting{Status: votings.Closed}, tt.err)

			s.updateVoting(rr, req.Request())
			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			votingMock.AssertExpectations(suite.T())
			votingMock.AssertNumberOfCalls(suite.T(), "Close", 1)
		})
	}

}

func (suite *VotingTestSuite) TestGetVoting() {
	s := new(Server)
	votingMock := votings.NewMockVotingService(suite.T())
	s.votings = votingMock
	boardId, _ := uuid.NewRandom()
	votingId, _ := uuid.NewRandom()

	req := NewTestRequestBuilder("GET", "/", nil).
		AddToContext(identifiers.BoardIdentifier, boardId).
		AddToContext(identifiers.VotingIdentifier, votingId)
	rr := httptest.NewRecorder()

	votingMock.EXPECT().Get(mock.Anything, boardId, votingId).Return(&votings.Voting{
		ID:     votingId,
		Status: votings.Closed,
	}, nil)

	s.getVoting(rr, req.Request())
	votingMock.AssertExpectations(suite.T())
}
