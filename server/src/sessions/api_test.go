package sessions

import (
  "bytes"
  "encoding/json"
  "errors"
  "net/http"
  "net/http/httptest"
  "strings"
  "testing"

  "github.com/go-chi/chi/v5"
  "github.com/google/uuid"
  "github.com/stretchr/testify/assert"
  "github.com/stretchr/testify/mock"
  "scrumlr.io/server/common"
  "scrumlr.io/server/identifiers"
  "scrumlr.io/server/technical_helper"
)

func TestGetBoardSessions_api(t *testing.T) {
  boardID := uuid.New()
  mockFilter := BoardSessionFilter{Ready: nil}
  mockSessions := []*BoardSession{
    {UserID: uuid.New(), Board: boardID, Role: "PARTICIPANT"},
  }

  mockService := NewMockSessionService(t)
  api := NewSessionApi(mockService)

  mockService.EXPECT().BoardSessionFilterTypeFromQueryString(mock.Anything).Return(mockFilter)
  mockService.EXPECT().GetAll(mock.Anything, boardID, mockFilter).Return(mockSessions, nil)

  rr := httptest.NewRecorder()
  req := technical_helper.NewTestRequestBuilder("GET", "/", nil).AddToContext(identifiers.BoardIdentifier, boardID) // Query-String ist nur für den Test

  api.GetBoardSessions(rr, req.Request())

  assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
  var sessions []*BoardSession
  err := json.Unmarshal(rr.Body.Bytes(), &sessions)
  assert.NoError(t, err)
  assert.Len(t, sessions, 1)
}

func TestGetBoardSessions_api_ServiceError(t *testing.T) {
  boardID := uuid.New()
  mockFilter := BoardSessionFilter{}

  mockService := NewMockSessionService(t)
  api := NewSessionApi(mockService)

  mockService.EXPECT().BoardSessionFilterTypeFromQueryString(mock.Anything).Return(mockFilter)
  mockService.EXPECT().GetAll(mock.Anything, boardID, mockFilter).Return(nil, errors.New("db error"))

  rr := httptest.NewRecorder()
  req := technical_helper.NewTestRequestBuilder("GET", "/", nil).AddToContext(identifiers.BoardIdentifier, boardID)

  api.GetBoardSessions(rr, req.Request())

  assert.Equal(t, http.StatusInternalServerError, rr.Result().StatusCode)

}

func TestGetBoardSession_api(t *testing.T) {
  boardID := uuid.New()
  userID := uuid.New()
  mockSession := &BoardSession{Board: uuid.New(), UserID: userID, Role: "PARTICIPANT"}

  mockService := NewMockSessionService(t)
  api := NewSessionApi(mockService)

  mockService.EXPECT().Get(mock.Anything, boardID, userID).Return(mockSession, nil)

  rr := httptest.NewRecorder()
  req := technical_helper.NewTestRequestBuilder("GET", "/sessions/"+userID.String(), nil).AddToContext(identifiers.BoardIdentifier, boardID)

  api.GetBoardSession(rr, req.Request())

  assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
  var session BoardSession
  err := json.Unmarshal(rr.Body.Bytes(), &session)
  assert.NoError(t, err)
  assert.Equal(t, userID, session.UserID)
}

func TestGetBoardSession_api_InvalidUUID(t *testing.T) {

  mockService := NewMockSessionService(t)
  api := NewSessionApi(mockService)
  // Keine Mocks, da der Aufruf fehlschlagen sollte, bevor der Service erreicht wird

  rr := httptest.NewRecorder()
  req := technical_helper.NewTestRequestBuilder("GET", "/sessions/not-a-uuid", nil).AddToContext(identifiers.BoardIdentifier, uuid.Nil)

  api.GetBoardSession(rr, req.Request())

  assert.Equal(t, http.StatusInternalServerError, rr.Result().StatusCode)

}

func TestUpdateBoardSession_api(t *testing.T) {
  boardID := uuid.New()
  callerID := uuid.New()
  targetUserID := uuid.New()

  ready := true

  body := BoardSessionUpdateRequest{Ready: &ready}

  serviceArg := BoardSessionUpdateRequest{
    Board:  boardID,
    Caller: callerID,
    User:   targetUserID,
    Ready:  &ready,
  }
  mockResponse := &BoardSession{Board: boardID, UserID: targetUserID, Role: common.ParticipantRole, Ready: ready}

  mockService := NewMockSessionService(t)
  api := NewSessionApi(mockService)

  mockService.EXPECT().Update(mock.Anything, serviceArg).Return(mockResponse, nil)

  rr := httptest.NewRecorder()
  bodyBytes, _ := json.Marshal(body)
  req := technical_helper.NewTestRequestBuilder("PUT", "/sessions/"+targetUserID.String(), bytes.NewReader(bodyBytes)).AddToContext(identifiers.BoardIdentifier, boardID).AddToContext(identifiers.UserIdentifier, callerID)
  rctx := chi.NewRouteContext()
  rctx.URLParams.Add("session", targetUserID.String())
  req.AddToContext(chi.RouteCtxKey, rctx)

  api.UpdateBoardSession(rr, req.Request())

  assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
  var session BoardSession
  err := json.Unmarshal(rr.Body.Bytes(), &session)
  assert.NoError(t, err)
  assert.Equal(t, targetUserID, session.UserID)
  assert.Equal(t, ready, session.Ready)
}

func TestUpdateBoardSession_api_BadBody(t *testing.T) {
  mockService := NewMockSessionService(t)
  api := NewSessionApi(mockService)

  rr := httptest.NewRecorder()
  req := technical_helper.NewTestRequestBuilder("PUT", "/sessions/"+uuid.NewString(), strings.NewReader("{invalid")).AddToContext(identifiers.BoardIdentifier, uuid.New()).AddToContext(identifiers.UserIdentifier, uuid.New())

  api.UpdateBoardSession(rr, req.Request())
  assert.Equal(t, http.StatusBadRequest, rr.Result().StatusCode)
}

func TestUpdateBoardSessions_api(t *testing.T) {
  boardID := uuid.New()
  body := BoardSessionsUpdateRequest{
    Board: boardID,
  }
  serviceArg := BoardSessionsUpdateRequest{Board: boardID}
  mockResponse := []*BoardSession{
    {UserID: uuid.New(), Role: common.ParticipantRole},
  }

  mockService := NewMockSessionService(t)
  api := NewSessionApi(mockService)

  mockService.EXPECT().UpdateAll(mock.Anything, serviceArg).Return(mockResponse, nil)

  rr := httptest.NewRecorder()
  bodyBytes, _ := json.Marshal(body)
  req := technical_helper.NewTestRequestBuilder("PUT", "/", bytes.NewReader(bodyBytes)).AddToContext(identifiers.BoardIdentifier, boardID)

  api.UpdateBoardSessions(rr, req.Request())

  assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
  var sessions []*BoardSession
  err := json.Unmarshal(rr.Body.Bytes(), &sessions)
  assert.NoError(t, err)
  assert.Len(t, sessions, 1)
}
