package api

import (
	"net/http"
	"net/http/httptest"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"strings"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/suite"
)

type JSONErrTestSuite struct {
	suite.Suite
}

func TestJSONErrTestSuite(t *testing.T) {
	suite.Run(t, new(JSONErrTestSuite))
}

func (suite *JSONErrTestSuite) TestJSONErrs() {

	tests := []struct {
		name    string
		handler func(s *Server) func(w http.ResponseWriter, r *http.Request)
	}{
		{
			name:    "votes.addVote",
			handler: func(s *Server) func(w http.ResponseWriter, r *http.Request) { return s.addVote },
		},
		{
			name:    "votes.removeVote",
			handler: func(s *Server) func(w http.ResponseWriter, r *http.Request) { return s.removeVote },
		},
		{
			name:    "votings.updateVoting",
			handler: func(s *Server) func(w http.ResponseWriter, r *http.Request) { return s.updateVoting },
		},
		{
			name:    "notes.createNote",
			handler: func(s *Server) func(w http.ResponseWriter, r *http.Request) { return s.createNote },
		},
		{
			name:    "notes.updateNote",
			handler: func(s *Server) func(w http.ResponseWriter, r *http.Request) { return s.updateNote },
		},
		{
			name:    "users.signInAnonymously",
			handler: func(s *Server) func(w http.ResponseWriter, r *http.Request) { return s.signInAnonymously },
		},
		{
			name:    "columns.createColumn",
			handler: func(s *Server) func(w http.ResponseWriter, r *http.Request) { return s.createColumn },
		},
		{
			name:    "columns.updateColumn",
			handler: func(s *Server) func(w http.ResponseWriter, r *http.Request) { return s.updateColumn },
		},
		{
			name:    "boards.createBoard",
			handler: func(s *Server) func(w http.ResponseWriter, r *http.Request) { return s.createBoard },
		},
		{
			name:    "boards.updateBoard",
			handler: func(s *Server) func(w http.ResponseWriter, r *http.Request) { return s.updateBoard },
		},
		{
			name:    "board_sessions.updateBoardSessions",
			handler: func(s *Server) func(w http.ResponseWriter, r *http.Request) { return s.updateBoardSessions },
		},
		{
			name:    "board_session_request.updateBoardSessionRequest",
			handler: func(s *Server) func(w http.ResponseWriter, r *http.Request) { return s.updateBoardSessionRequest },
		},
	}

	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)

			mockUUID := uuid.New()
			req := NewTestRequestBuilder("POST", "/", strings.NewReader(`{
				"id": %s
				}`))

			req.req = logger.InitTestLoggerRequest(req.Request())
			req.AddToContext(identifiers.BoardIdentifier, mockUUID).
				AddToContext(identifiers.UserIdentifier, mockUUID).
				AddToContext(identifiers.NoteIdentifier, mockUUID).
				AddToContext(identifiers.ColumnIdentifier, mockUUID).
				AddToContext(identifiers.VotingIdentifier, mockUUID)

			rr := httptest.NewRecorder()
			tt.handler(s)(rr, req.Request())
			suite.Equal(http.StatusBadRequest, rr.Code)
		})
	}

}
