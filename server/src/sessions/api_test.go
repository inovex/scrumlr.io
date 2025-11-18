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

func Test_GetBoardSessions_api(t *testing.T) {
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
  req := technical_helper.NewTestRequestBuilder("GET", "/", nil).AddToContext(identifiers.BoardIdentifier, boardID)

  api.GetBoardSessions(rr, req.Request())

  assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
  var sessions []*BoardSession
  err := json.Unmarshal(rr.Body.Bytes(), &sessions)
  assert.NoError(t, err)
  assert.Len(t, sessions, 1)
}

func Test_GetBoardSessions_ServiceError(t *testing.T) {
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

func Test_GetBoardSession_api(t *testing.T) {
  boardID := uuid.New()
  userID := uuid.New()
  mockSession := &BoardSession{Board: uuid.New(), UserID: userID, Role: "PARTICIPANT"}

  mockService := NewMockSessionService(t)
  api := NewSessionApi(mockService)

  mockService.EXPECT().Get(mock.Anything, boardID, userID).Return(mockSession, nil)

  rr := httptest.NewRecorder()

  req := technical_helper.NewTestRequestBuilder("GET", "/boards/"+boardID.String()+"/participants/"+userID.String(), nil).AddToContext(identifiers.BoardIdentifier, boardID)
  rctx := chi.NewRouteContext()
  rctx.URLParams.Add("session", userID.String())
  req.AddToContext(chi.RouteCtxKey, rctx)

  api.GetBoardSession(rr, req.Request())

  assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
  var session BoardSession
  err := json.Unmarshal(rr.Body.Bytes(), &session)
  assert.NoError(t, err)
  assert.Equal(t, userID, session.UserID)
}

func Test_GetBoardSession_ServiceError(t *testing.T) {
  boardID := uuid.New()
  userID := uuid.New()

  mockService := NewMockSessionService(t)
  api := NewSessionApi(mockService)

  mockService.EXPECT().Get(mock.Anything, boardID, userID).Return(nil, errors.New("db error"))

  rr := httptest.NewRecorder()

  req := technical_helper.NewTestRequestBuilder("GET", "/", nil).AddToContext(identifiers.BoardIdentifier, boardID)
  rctx := chi.NewRouteContext()
  rctx.URLParams.Add("session", userID.String())
  req.AddToContext(chi.RouteCtxKey, rctx)

  api.GetBoardSession(rr, req.Request())

  assert.Equal(t, http.StatusInternalServerError, rr.Result().StatusCode)
}

func Test_GetBoardSession_InvalidUUID(t *testing.T) {

  mockService := NewMockSessionService(t)
  api := NewSessionApi(mockService)
  // Keine Mocks, da der Aufruf fehlschlagen sollte, bevor der Service erreicht wird

  rr := httptest.NewRecorder()
  req := technical_helper.NewTestRequestBuilder("GET", "/sessions/not-a-uuid", nil).AddToContext(identifiers.BoardIdentifier, uuid.Nil)

  api.GetBoardSession(rr, req.Request())

  assert.Equal(t, http.StatusInternalServerError, rr.Result().StatusCode)

}

func Test_UpdateBoardSession_api(t *testing.T) {
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

func Test_UpdateBoardSession_NoUUID(t *testing.T) {
  mockService := NewMockSessionService(t)
  api := NewSessionApi(mockService)

  rr := httptest.NewRecorder()
  req := technical_helper.NewTestRequestBuilder("PUT", "/sessions/"+uuid.NewString(), strings.NewReader("{invalid")).AddToContext(identifiers.BoardIdentifier, uuid.New()).AddToContext(identifiers.UserIdentifier, uuid.New())

  api.UpdateBoardSession(rr, req.Request())
  assert.Equal(t, http.StatusBadRequest, rr.Result().StatusCode)
}

func Test_UpdateBoardSession_BadBody(t *testing.T) {
  mockService := NewMockSessionService(t)
  api := NewSessionApi(mockService)

  rr := httptest.NewRecorder()
  req := technical_helper.NewTestRequestBuilder("PUT", "/sessions/"+uuid.NewString(), strings.NewReader("{invalid")).AddToContext(identifiers.BoardIdentifier, uuid.New()).AddToContext(identifiers.UserIdentifier, uuid.New())

  rctx := chi.NewRouteContext()
  rctx.URLParams.Add("session", uuid.NewString())
  req.AddToContext(chi.RouteCtxKey, rctx)

  api.UpdateBoardSession(rr, req.Request())
  assert.Equal(t, http.StatusBadRequest, rr.Result().StatusCode)
}

func Test_UpdateBoardSession_ServiceError(t *testing.T) {
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

  mockService := NewMockSessionService(t)
  api := NewSessionApi(mockService)

  mockService.EXPECT().Update(mock.Anything, serviceArg).Return(nil, errors.New("db error"))

  rr := httptest.NewRecorder()
  bodyBytes, _ := json.Marshal(body)
  req := technical_helper.NewTestRequestBuilder("PUT", "/", bytes.NewReader(bodyBytes)).AddToContext(identifiers.BoardIdentifier, boardID).AddToContext(identifiers.UserIdentifier, callerID)
  rctx := chi.NewRouteContext()
  rctx.URLParams.Add("session", targetUserID.String())
  req.AddToContext(chi.RouteCtxKey, rctx)

  api.UpdateBoardSession(rr, req.Request())

  assert.Equal(t, http.StatusInternalServerError, rr.Result().StatusCode)
}

func Test_UpdateBoardSessions_api(t *testing.T) {
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

func Test_UpdateBoardSessions_ServiceError(t *testing.T) {
  boardID := uuid.New()
  body := BoardSessionsUpdateRequest{
    Board: boardID,
  }
  serviceArg := BoardSessionsUpdateRequest{Board: boardID}

  mockService := NewMockSessionService(t)
  api := NewSessionApi(mockService)

  mockService.EXPECT().UpdateAll(mock.Anything, serviceArg).Return(nil, errors.New("db error"))

  rr := httptest.NewRecorder()
  bodyBytes, _ := json.Marshal(body)
  req := technical_helper.NewTestRequestBuilder("PUT", "/", bytes.NewReader(bodyBytes)).AddToContext(identifiers.BoardIdentifier, boardID)

  api.UpdateBoardSessions(rr, req.Request())

  assert.Equal(t, http.StatusInternalServerError, rr.Result().StatusCode)
}

func Test_BoardParticipantContext(t *testing.T) {
  boardID := uuid.New()
  userID := uuid.New()

  sessionServiceMock := NewMockSessionService(t)
  sessionApi := NewSessionApi(sessionServiceMock)
  req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
    AddToContext(identifiers.UserIdentifier, userID)

  rctx := chi.NewRouteContext()
  rctx.URLParams.Add("id", boardID.String())
  req.AddToContext(chi.RouteCtxKey, rctx)

  rr := httptest.NewRecorder()

  next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
  })
  sessionServiceMock.EXPECT().Exists(mock.Anything, boardID, userID).Return(true, nil)
  sessionServiceMock.EXPECT().IsParticipantBanned(mock.Anything, boardID, userID).Return(false, nil)

  sessionApi.BoardParticipantContext(next).ServeHTTP(rr, req.Request())

  assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
}

func Test_BoardParticipantContext_NoParticipant(t *testing.T) {
  boardID := uuid.New()
  userID := uuid.New()

  sessionServiceMock := NewMockSessionService(t)
  sessionApi := NewSessionApi(sessionServiceMock)
  req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
    AddToContext(identifiers.UserIdentifier, userID)

  rctx := chi.NewRouteContext()
  rctx.URLParams.Add("id", boardID.String())
  req.AddToContext(chi.RouteCtxKey, rctx)

  rr := httptest.NewRecorder()

  next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
  })
  sessionServiceMock.EXPECT().Exists(mock.Anything, boardID, userID).Return(false, nil)

  sessionApi.BoardParticipantContext(next).ServeHTTP(rr, req.Request())

  assert.Equal(t, http.StatusForbidden, rr.Result().StatusCode)
}

func Test_BoardParticipantContext_ParticipantBanned(t *testing.T) {
  boardID := uuid.New()
  userID := uuid.New()

  sessionServiceMock := NewMockSessionService(t)
  sessionApi := NewSessionApi(sessionServiceMock)
  req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
    AddToContext(identifiers.UserIdentifier, userID)

  rctx := chi.NewRouteContext()
  rctx.URLParams.Add("id", boardID.String())
  req.AddToContext(chi.RouteCtxKey, rctx)

  rr := httptest.NewRecorder()

  next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
  })
  sessionServiceMock.EXPECT().Exists(mock.Anything, boardID, userID).Return(true, nil)
  sessionServiceMock.EXPECT().IsParticipantBanned(mock.Anything, boardID, userID).Return(true, nil)

  sessionApi.BoardParticipantContext(next).ServeHTTP(rr, req.Request())

  assert.Equal(t, http.StatusForbidden, rr.Result().StatusCode)
  assert.Error(t, common.ForbiddenError(errors.New("participant is currently banned from this session")))
}

func Test_BoardModeratorContext_Exists(t *testing.T) {
  boardID := uuid.New()
  userID := uuid.New()
  sessionServiceMock := NewMockSessionService(t)
  sessionApi := NewSessionApi(sessionServiceMock)
  req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
    AddToContext(identifiers.UserIdentifier, userID)

  rctx := chi.NewRouteContext()
  rctx.URLParams.Add("id", boardID.String())
  req.AddToContext(chi.RouteCtxKey, rctx)

  rr := httptest.NewRecorder()

  next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
  })

  sessionServiceMock.EXPECT().ModeratorSessionExists(mock.Anything, boardID, userID).Return(true, nil)

  sessionApi.BoardModeratorContext(next).ServeHTTP(rr, req.Request())

  assert.Equal(t, http.StatusOK, rr.Result().StatusCode)
}

func Test_BoardModeratorContext_DoesNotExists(t *testing.T) {
  boardID := uuid.New()
  userID := uuid.New()
  sessionServiceMock := NewMockSessionService(t)
  sessionApi := NewSessionApi(sessionServiceMock)
  req := technical_helper.NewTestRequestBuilder("GET", "/", nil).
    AddToContext(identifiers.UserIdentifier, userID)

  rctx := chi.NewRouteContext()
  rctx.URLParams.Add("id", boardID.String())
  req.AddToContext(chi.RouteCtxKey, rctx)

  rr := httptest.NewRecorder()

  next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
    w.WriteHeader(http.StatusOK)
  })

  sessionServiceMock.EXPECT().ModeratorSessionExists(mock.Anything, boardID, userID).Return(false, nil)

  sessionApi.BoardModeratorContext(next).ServeHTTP(rr, req.Request())

  assert.Equal(t, http.StatusNotFound, rr.Result().StatusCode)
}
