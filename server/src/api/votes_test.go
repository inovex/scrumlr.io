package api

import (
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/mocks/services"
	"scrumlr.io/server/votings"

	"github.com/google/uuid"

	"github.com/stretchr/testify/suite"
)

type VoteTestSuite struct {
	suite.Suite
}

func TestVoteTestSuite(t *testing.T) {
	suite.Run(t, new(VoteTestSuite))
}

func (suite *VoteTestSuite) TestAddVote() {

	testParameterBundles := *TestParameterBundles{}.
		Append("all ok", http.StatusCreated, nil, false, false, nil).
		Append("specific error", http.StatusTeapot, &common.APIError{
			Err:        errors.New("check"),
			StatusCode: http.StatusTeapot,
			StatusText: "teapot",
			ErrorText:  "Error",
		}, false, false, nil).
		Append("unexpected error", http.StatusInternalServerError, errors.New("teapot?"), false, false, nil)

	for _, tt := range testParameterBundles {
		suite.Run(tt.name, func() {
			s := new(Server)
			votingMock := services.NewMockVotings(suite.T())

			boardId, _ := uuid.NewRandom()
			userId, _ := uuid.NewRandom()
			noteId, _ := uuid.NewRandom()

			s.votings = votingMock

			req := NewTestRequestBuilder("POST", "/", strings.NewReader(fmt.Sprintf(`{
				"note": "%s"
				}`, noteId.String())))
			req.req = logger.InitTestLoggerRequest(req.Request())
			req.AddToContext(identifiers.BoardIdentifier, boardId).
				AddToContext(identifiers.UserIdentifier, userId)

			votingMock.EXPECT().AddVote(req.req.Context(), votings.VoteRequest{
				Board: boardId,
				User:  userId,
				Note:  noteId,
			}).Return(&votings.Vote{
				Note: noteId,
			}, tt.err)

			rr := httptest.NewRecorder()
			s.addVote(rr, req.Request())
			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			votingMock.AssertExpectations(suite.T())
		})
	}

}
