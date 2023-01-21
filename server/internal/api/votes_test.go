package api

import (
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"scrumlr.io/server/internal/common"
	"scrumlr.io/server/internal/common/dto"
	"strings"
	"testing"

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
			name:         "specific error",
			expectedCode: http.StatusTeapot,
			err: &common.APIError{
				Err:        errors.New("check"),
				StatusCode: http.StatusTeapot,
				StatusText: "teapot",
				ErrorText:  "Error",
			},
		},
		{
			name:         "unexpected error",
			expectedCode: http.StatusInternalServerError,
			err:          errors.New("teapot?"),
		},
	}
	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)
			mock := new(VotingMock)

			boardId, _ := uuid.NewRandom()
			userId, _ := uuid.NewRandom()
			noteId, _ := uuid.NewRandom()
			mock.On("AddVote", dto.VoteRequest{
				Board: boardId,
				User:  userId,
				Note:  noteId,
			}).Return(&dto.Vote{
				Note: noteId,
			}, tt.err)

			s.votings = mock

			req := NewTestRequestBuilder("POST", "/", strings.NewReader(fmt.Sprintf(`{
				"note": "%s"
				}`, noteId.String()))).
				AddToContext("Board", boardId).
				AddToContext("User", userId)

			rr := httptest.NewRecorder()
			s.addVote(rr, req.Request())
			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			mock.AssertExpectations(suite.T())
		})
	}

}
