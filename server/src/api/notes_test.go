package api

import (
  "bytes"
  "encoding/json"
  "errors"
  "fmt"
  "github.com/go-chi/chi/v5"
  "github.com/google/uuid"
  "github.com/stretchr/testify/mock"
  "github.com/stretchr/testify/suite"
  "net/http"
  "net/http/httptest"
  "scrumlr.io/server/common"
  "scrumlr.io/server/common/dto"
  "scrumlr.io/server/identifiers"
  "scrumlr.io/server/logger"
  "scrumlr.io/server/mocks/services"
  "scrumlr.io/server/notes"
  "strings"
  "testing"
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
      noteMock := services.NewMockNotes(suite.T())
      testText := "asdf"

      boardId, _ := uuid.NewRandom()
      userId, _ := uuid.NewRandom()
      colId, _ := uuid.NewRandom()

      s.notes = noteMock

      req := NewTestRequestBuilder("POST", "/", strings.NewReader(fmt.Sprintf(`{
				"column": "%s",
				"text" : "%s"
				}`, colId.String(), testText)))
      req.req = logger.InitTestLoggerRequest(req.Request())
      req.AddToContext(identifiers.BoardIdentifier, boardId).
        AddToContext(identifiers.UserIdentifier, userId)

      noteMock.EXPECT().Create(req.req.Context(), dto.NoteCreateRequest{
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
      noteMock := services.NewMockNotes(suite.T())
      s.notes = noteMock

      noteID, _ := uuid.NewRandom()

      req := NewTestRequestBuilder("GET", "/", nil).
        AddToContext(identifiers.NoteIdentifier, noteID)

      noteMock.EXPECT().Get(req.req.Context(), noteID).Return(&notes.Note{
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

      noteMock := services.NewMockNotes(suite.T())
      boardMock := services.NewMockBoards(suite.T())
      sessionMock := services.NewMockBoardSessions(suite.T())

      s.notes = noteMock
      s.boards = boardMock
      s.sessions = sessionMock

      boardID, _ := uuid.NewRandom()
      userID, _ := uuid.NewRandom()
      noteID, _ := uuid.NewRandom()

      r := chi.NewRouter()
      s.initNoteResources(r)

      req := NewTestRequestBuilder("DELETE", fmt.Sprintf("/notes/%s", noteID.String()), strings.NewReader(`{"deleteStack": false}`))
      req.req = logger.InitTestLoggerRequest(req.Request())
      rctx := chi.NewRouteContext()
      rctx.URLParams.Add("id", boardID.String())
      req.AddToContext(chi.RouteCtxKey, rctx)
      req.AddToContext(identifiers.UserIdentifier, userID)

      boardMock.EXPECT().Get(mock.Anything, boardID).Return(&dto.Board{
        ID:       boardID,
        IsLocked: tt.isLocked,
      }, nil)

      // Mock the SessionExists method
      sessionMock.EXPECT().SessionExists(req.req.Context(), boardID, userID).Return(true, nil)

      // Mock the ModeratorSessionExists method
      sessionMock.EXPECT().ModeratorSessionExists(mock.Anything, boardID, userID).Return(true, nil)

      // Mock the ParticipantBanned method
      sessionMock.EXPECT().ParticipantBanned(req.req.Context(), boardID, userID).Return(false, nil)

      if tt.isLocked {
        noteMock.EXPECT().Delete(mock.Anything, dto.NoteDeleteRequest{DeleteStack: false}, noteID).Return(nil)
      } else {
        noteMock.EXPECT().Delete(mock.Anything, dto.NoteDeleteRequest{DeleteStack: false}, noteID).Return(tt.err)
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
      noteMock := services.NewMockNotes(suite.T())
      updatedText := "This note has been edited"

      boardId, _ := uuid.NewRandom()
      noteId, _ := uuid.NewRandom()

      s.notes = noteMock

      req := NewTestRequestBuilder("PUT", fmt.Sprintf("/notes/%s", noteId.String()), strings.NewReader(fmt.Sprintf(`{
				"text": "%s"}`, updatedText)))
      req.req = logger.InitTestLoggerRequest(req.Request())
      req.AddToContext(identifiers.BoardIdentifier, boardId).
        AddToContext(identifiers.NoteIdentifier, noteId)

      noteMock.EXPECT().Update(req.req.Context(), dto.NoteUpdateRequest{
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
        return
      }
      note := new(notes.Note)
      err = json.Unmarshal(buf.Bytes(), &note)
      if err != nil {
        return
      }

      suite.Equal(tt.expectedCode, rr.Result().StatusCode)
      if tt.err == nil {
        suite.Equal(updatedText, note.Text)
      }
      noteMock.AssertExpectations(suite.T())

    })
  }
}
