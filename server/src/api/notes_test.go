package api

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"scrumlr.io/server/sessions"
	"scrumlr.io/server/technical_helper"

	"scrumlr.io/server/boards"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/votings"
)

type NotesTestSuite struct {
	suite.Suite
}

func TestNotesTestSuite(t *testing.T) {
	suite.Run(t, new(NotesTestSuite))
}

func (suite *NotesTestSuite) TestCreateNote() {

	testParameterBundles := *TestParameterBundles{}.
		Append("all ok", http.StatusCreated, nil, false, false, nil).
		Append("api err", http.StatusConflict, &common.APIError{
			Err:        errors.New("test"),
			StatusCode: http.StatusConflict,
			StatusText: "no",
			ErrorText:  "way",
		}, false, false, nil).
		Append("unexpected err", http.StatusInternalServerError, errors.New("oops"), false, false, nil)

	for _, tt := range testParameterBundles {
		suite.Run(tt.name, func() {
			s := new(Server)
			noteMock := notes.NewMockNotesService(suite.T())
			testText := "asdf"

			boardId, _ := uuid.NewRandom()
			userId, _ := uuid.NewRandom()
			colId, _ := uuid.NewRandom()

			s.notes = noteMock

			req := technical_helper.NewTestRequestBuilder("POST", "/", strings.NewReader(fmt.Sprintf(`{
				"column": "%s",
				"text" : "%s"
				}`, colId.String(), testText)))
			req.Req = logger.InitTestLoggerRequest(req.Request())
			req.AddToContext(identifiers.BoardIdentifier, boardId).
				AddToContext(identifiers.UserIdentifier, userId)

			noteMock.EXPECT().Create(mock.Anything, notes.NoteCreateRequest{
				Board:  boardId,
				User:   userId,
				Text:   testText,
				Column: colId,
			}).Return(&notes.Note{
				Text: testText,
			}, tt.err)

			rr := httptest.NewRecorder()

			s.createNote(rr, req.Request())
			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			noteMock.AssertExpectations(suite.T())
		})
	}

}
func (suite *NotesTestSuite) TestGetNote() {

	testParameterBundles := *TestParameterBundles{}.
		Append("all ok", http.StatusOK, nil, false, false, nil).
		Append("api err", http.StatusConflict, &common.APIError{
			Err:        errors.New("test"),
			StatusCode: http.StatusConflict,
			StatusText: "no",
			ErrorText:  "way",
		}, false, false, nil).
		Append("unexpected err", http.StatusInternalServerError, errors.New("oops"), false, false, nil)

	for _, tt := range testParameterBundles {
		suite.Run(tt.name, func() {
			s := new(Server)
			noteMock := notes.NewMockNotesService(suite.T())
			s.notes = noteMock

			noteID, _ := uuid.NewRandom()

			req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
				AddToContext(identifiers.NoteIdentifier, noteID)

			noteMock.EXPECT().Get(mock.Anything, noteID).Return(&notes.Note{
				ID: noteID,
			}, tt.err)

			rr := httptest.NewRecorder()

			s.getNote(rr, req.Request())
			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			noteMock.AssertExpectations(suite.T())
		})
	}
}
func (suite *NotesTestSuite) TestDeleteNote() {

	tests := []struct {
		name         string
		expectedCode int
		err          error
		isLocked     bool
	}{
		{
			name:         "Delete Note when board is unlocked",
			expectedCode: http.StatusNoContent,
			isLocked:     true,
		},
		{
			name:         "Delete Note when board is locked",
			expectedCode: http.StatusBadRequest,
			err: &common.APIError{
				Err:        errors.New("not allowed to edit a locked board"),
				StatusCode: http.StatusBadRequest,
				StatusText: "Bad request",
				ErrorText:  "something",
			},
			isLocked: false,
		},
	}
	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := new(Server)

			noteMock := notes.NewMockNotesService(suite.T())
			boardMock := boards.NewMockBoardService(suite.T())
			sessionMock := sessions.NewMockSessionService(suite.T())
			votingMock := votings.NewMockVotingService(suite.T())
			s.notes = noteMock
			s.boards = boardMock
			s.sessions = sessionMock
			s.votings = votingMock

			boardID, _ := uuid.NewRandom()
			userID, _ := uuid.NewRandom()
			noteID, _ := uuid.NewRandom()

			r := chi.NewRouter()
			s.initNoteResources(r)

			req := technical_helper.NewTestRequestBuilder("DELETE", fmt.Sprintf("/notes/%s", noteID.String()), strings.NewReader(`{"deleteStack": false}`))
			req.Req = logger.InitTestLoggerRequest(req.Request())
			rctx := chi.NewRouteContext()
			rctx.URLParams.Add("id", boardID.String())
			req.AddToContext(chi.RouteCtxKey, rctx)
			req.AddToContext(identifiers.UserIdentifier, userID)

			boardMock.EXPECT().Get(mock.Anything, boardID).Return(&boards.Board{
				ID:       boardID,
				IsLocked: tt.isLocked,
			}, nil)

			// Mock the SessionExists method
			sessionMock.EXPECT().Exists(mock.Anything, boardID, userID).Return(true, nil)

			// Mock the ModeratorSessionExists method
			sessionMock.EXPECT().ModeratorSessionExists(mock.Anything, boardID, userID).Return(true, nil)

			// Mock the ParticipantBanned method
			sessionMock.EXPECT().IsParticipantBanned(mock.Anything, boardID, userID).Return(false, nil)

			if tt.isLocked {
				noteMock.EXPECT().Delete(mock.Anything, userID, notes.NoteDeleteRequest{ID: noteID, Board: boardID, DeleteStack: false}).
					Return(nil)
			} else {
				noteMock.EXPECT().Delete(mock.Anything, userID, notes.NoteDeleteRequest{ID: noteID, Board: boardID, DeleteStack: false}).
					Return(tt.err)
			}

			rr := httptest.NewRecorder()
			r.ServeHTTP(rr, req.Request())

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			noteMock.AssertExpectations(suite.T())
			boardMock.AssertExpectations(suite.T())
			sessionMock.AssertExpectations(suite.T())
		})
	}
}

func (suite *NotesTestSuite) TestEditNote() {
	testParameterBundles := *TestParameterBundles{}.
		Append("all ok", http.StatusOK, nil, false, false, nil).
		Append("api err", http.StatusForbidden, &common.APIError{
			Err:        errors.New("test"),
			StatusCode: http.StatusForbidden,
			StatusText: "no",
			ErrorText:  "way",
		}, false, false, nil)

	for _, tt := range testParameterBundles {
		suite.Run(tt.name, func() {
			s := new(Server)
			noteMock := notes.NewMockNotesService(suite.T())
			updatedText := "This note has been edited"

			boardId, _ := uuid.NewRandom()
			noteId, _ := uuid.NewRandom()
			userId, _ := uuid.NewRandom()

			s.notes = noteMock

			req := technical_helper.NewTestRequestBuilder("PUT", fmt.Sprintf("/notes/%s", noteId.String()), strings.NewReader(fmt.Sprintf(`{
				"text": "%s"}`, updatedText)))
			req.Req = logger.InitTestLoggerRequest(req.Request())
			req.AddToContext(identifiers.BoardIdentifier, boardId).
				AddToContext(identifiers.NoteIdentifier, noteId).
				AddToContext(identifiers.UserIdentifier, userId)

			noteMock.EXPECT().Update(mock.Anything, userId, notes.NoteUpdateRequest{
				Text:     &updatedText,
				Position: nil,
				Edited:   false,
				ID:       noteId,
				Board:    boardId,
			}).Return(&notes.Note{
				Text: updatedText,
			}, tt.err)

			rr := httptest.NewRecorder()

			s.updateNote(rr, req.Request())

			// parse response to Note
			buf := new(bytes.Buffer)
			_, err := buf.ReadFrom(rr.Result().Body)
			if err != nil {
				suite.Fail("could not read response body")
			}
			note := new(notes.Note)
			err = json.Unmarshal(buf.Bytes(), &note)
			if err != nil {
				suite.Fail("could not unmarshal response body")
			}

			suite.Equal(tt.expectedCode, rr.Result().StatusCode)
			if tt.err == nil {
				suite.Equal(updatedText, note.Text)
			}
			noteMock.AssertExpectations(suite.T())

		})
	}
}
