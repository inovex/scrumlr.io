package sessions

import (
	"bytes"
	"encoding/json"
	"errors"
	"io"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/technical_helper"
)

type APISessionTestSuite struct {
	suite.Suite
	boardID     uuid.UUID
	userID      uuid.UUID
	mockService *MockSessionService
	api         SessionApi
	rr          *httptest.ResponseRecorder
	nextOK      http.Handler
}

func TestAPISessionTestSuite(t *testing.T) {
	suite.Run(t, new(APISessionTestSuite))
}

func (suite *APISessionTestSuite) SetupTest() {
	suite.boardID = uuid.New()
	suite.userID = uuid.New()
	suite.mockService = NewMockSessionService(suite.T())
	suite.api = NewSessionApi(suite.mockService)
	suite.rr = httptest.NewRecorder()
	suite.nextOK = http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusOK)
	})
}

func (suite *APISessionTestSuite) newRequest(method string, target string, body io.Reader) *technical_helper.TestRequestBuilder {
	return technical_helper.NewTestRequestBuilder(method, target, body)
}

func (suite *APISessionTestSuite) withRouteParam(req *technical_helper.TestRequestBuilder, key string, value string) *technical_helper.TestRequestBuilder {
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add(key, value)
	return req.AddToContext(chi.RouteCtxKey, rctx)
}

func (suite *APISessionTestSuite) assertStatus(expected int) {
	suite.Equal(expected, suite.rr.Result().StatusCode)
}

func (suite *APISessionTestSuite) Test_GetBoardSessions_api() {
	mockFilter := BoardSessionFilter{Ready: nil}
	mockSessions := []*BoardSession{
		{UserID: uuid.New(), Board: suite.boardID, Role: "PARTICIPANT"},
	}

	suite.mockService.EXPECT().BoardSessionFilterTypeFromQueryString(mock.Anything).Return(mockFilter)
	suite.mockService.EXPECT().GetAll(mock.Anything, suite.boardID, mockFilter).Return(mockSessions, nil)

	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).AddToContext(identifiers.BoardIdentifier, suite.boardID)

	suite.api.GetBoardSessions(suite.rr, req.Request())

	suite.Equal(http.StatusOK, suite.rr.Result().StatusCode)
	var sessions []*BoardSession
	err := json.Unmarshal(suite.rr.Body.Bytes(), &sessions)
	suite.NoError(err)
	suite.Len(sessions, 1)
}

func (suite *APISessionTestSuite) Test_GetBoardSessions_ServiceError() {

	mockFilter := BoardSessionFilter{}

	suite.mockService.EXPECT().BoardSessionFilterTypeFromQueryString(mock.Anything).Return(mockFilter)
	suite.mockService.EXPECT().GetAll(mock.Anything, suite.boardID, mockFilter).Return(nil, errors.New("db error"))

	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).AddToContext(identifiers.BoardIdentifier, suite.boardID)

	suite.api.GetBoardSessions(suite.rr, req.Request())

	suite.Equal(http.StatusInternalServerError, suite.rr.Result().StatusCode)

}

func (suite *APISessionTestSuite) Test_GetBoardSession_api() {
	userID := uuid.New()
	mockSession := &BoardSession{Board: uuid.New(), UserID: userID, Role: "PARTICIPANT"}
	suite.mockService.EXPECT().Get(mock.Anything, suite.boardID, userID).Return(mockSession, nil)

	req := technical_helper.NewTestRequestBuilder("GET", "/boards/"+suite.boardID.String()+"/participants/"+userID.String(), nil).AddToContext(identifiers.BoardIdentifier, suite.boardID)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("session", userID.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	suite.api.GetBoardSession(suite.rr, req.Request())

	suite.Equal(http.StatusOK, suite.rr.Result().StatusCode)
	var session BoardSession
	err := json.Unmarshal(suite.rr.Body.Bytes(), &session)
	suite.NoError(err)
	suite.Equal(userID, session.UserID)
}

func (suite *APISessionTestSuite) Test_GetBoardSession_ServiceError() {
	userID := uuid.New()
	suite.mockService.EXPECT().Get(mock.Anything, suite.boardID, userID).Return(nil, errors.New("db error"))

	req := technical_helper.NewTestRequestBuilder("GET", "/", nil).AddToContext(identifiers.BoardIdentifier, suite.boardID)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("session", userID.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	suite.api.GetBoardSession(suite.rr, req.Request())

	suite.Equal(http.StatusInternalServerError, suite.rr.Result().StatusCode)
}

func (suite *APISessionTestSuite) Test_GetBoardSession_InvalidUUID() {
	// Keine Mocks, da der Aufruf fehlschlagen sollte, bevor der Service erreicht wird
	req := technical_helper.NewTestRequestBuilder("GET", "/sessions/not-a-uuid", nil).AddToContext(identifiers.BoardIdentifier, uuid.Nil)

	suite.api.GetBoardSession(suite.rr, req.Request())

	suite.Equal(http.StatusInternalServerError, suite.rr.Result().StatusCode)
}

func (suite *APISessionTestSuite) Test_UpdateBoardSession_api() {
	callerID := uuid.New()
	targetUserID := uuid.New()
	ready := true
	body := BoardSessionUpdateRequest{Ready: &ready}

	serviceArg := BoardSessionUpdateRequest{
		Board:  suite.boardID,
		Caller: callerID,
		User:   targetUserID,
		Ready:  &ready,
	}
	mockResponse := &BoardSession{Board: suite.boardID, UserID: targetUserID, Role: common.ParticipantRole, Ready: ready}

	suite.mockService.EXPECT().Update(mock.Anything, serviceArg).Return(mockResponse, nil)

	bodyBytes, _ := json.Marshal(body)
	req := technical_helper.NewTestRequestBuilder("PUT", "/sessions/"+targetUserID.String(), bytes.NewReader(bodyBytes)).AddToContext(identifiers.BoardIdentifier, suite.boardID).AddToContext(identifiers.UserIdentifier, callerID)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("session", targetUserID.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	suite.api.UpdateBoardSession(suite.rr, req.Request())

	suite.Equal(http.StatusOK, suite.rr.Result().StatusCode)
	var session BoardSession
	err := json.Unmarshal(suite.rr.Body.Bytes(), &session)
	suite.NoError(err)
	suite.Equal(targetUserID, session.UserID)
	suite.Equal(ready, session.Ready)
}

func (suite *APISessionTestSuite) Test_UpdateBoardSession_NoUUID() {
	req := technical_helper.NewTestRequestBuilder("PUT", "/sessions/"+uuid.NewString(), strings.NewReader("{invalid")).AddToContext(identifiers.BoardIdentifier, uuid.New()).AddToContext(identifiers.UserIdentifier, uuid.New())

	suite.api.UpdateBoardSession(suite.rr, req.Request())
	suite.Equal(http.StatusBadRequest, suite.rr.Result().StatusCode)
}

func (suite *APISessionTestSuite) Test_UpdateBoardSession_BadBody() {
	req := technical_helper.NewTestRequestBuilder("PUT", "/sessions/"+uuid.NewString(), strings.NewReader("{invalid")).AddToContext(identifiers.BoardIdentifier, uuid.New()).AddToContext(identifiers.UserIdentifier, uuid.New())

	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("session", uuid.NewString())
	req.AddToContext(chi.RouteCtxKey, rctx)

	suite.api.UpdateBoardSession(suite.rr, req.Request())
	suite.Equal(http.StatusBadRequest, suite.rr.Result().StatusCode)
}

func (suite *APISessionTestSuite) Test_UpdateBoardSession_ServiceError() {
	callerID := uuid.New()
	targetUserID := uuid.New()
	ready := true
	body := BoardSessionUpdateRequest{Ready: &ready}

	serviceArg := BoardSessionUpdateRequest{
		Board:  suite.boardID,
		Caller: callerID,
		User:   targetUserID,
		Ready:  &ready,
	}

	suite.mockService.EXPECT().Update(mock.Anything, serviceArg).Return(nil, errors.New("db error"))

	bodyBytes, _ := json.Marshal(body)
	req := technical_helper.NewTestRequestBuilder("PUT", "/", bytes.NewReader(bodyBytes)).AddToContext(identifiers.BoardIdentifier, suite.boardID).AddToContext(identifiers.UserIdentifier, callerID)
	rctx := chi.NewRouteContext()
	rctx.URLParams.Add("session", targetUserID.String())
	req.AddToContext(chi.RouteCtxKey, rctx)

	suite.api.UpdateBoardSession(suite.rr, req.Request())

	suite.Equal(http.StatusInternalServerError, suite.rr.Result().StatusCode)
}

func (suite *APISessionTestSuite) Test_UpdateBoardSessions_api() {
	body := BoardSessionsUpdateRequest{
		Board: suite.boardID,
	}
	serviceArg := BoardSessionsUpdateRequest{Board: suite.boardID}
	mockResponse := []*BoardSession{
		{UserID: uuid.New(), Role: common.ParticipantRole},
	}

	suite.mockService.EXPECT().UpdateAll(mock.Anything, serviceArg).Return(mockResponse, nil)

	bodyBytes, _ := json.Marshal(body)
	req := technical_helper.NewTestRequestBuilder("PUT", "/", bytes.NewReader(bodyBytes)).AddToContext(identifiers.BoardIdentifier, suite.boardID)

	suite.api.UpdateBoardSessions(suite.rr, req.Request())

	suite.Equal(http.StatusOK, suite.rr.Result().StatusCode)
	var sessions []*BoardSession
	err := json.Unmarshal(suite.rr.Body.Bytes(), &sessions)
	suite.NoError(err)
	suite.Len(sessions, 1)
}

func (suite *APISessionTestSuite) Test_UpdateBoardSessions_ServiceError() {
	body := BoardSessionsUpdateRequest{
		Board: suite.boardID,
	}
	serviceArg := BoardSessionsUpdateRequest{Board: suite.boardID}

	suite.mockService.EXPECT().UpdateAll(mock.Anything, serviceArg).Return(nil, errors.New("db error"))

	bodyBytes, _ := json.Marshal(body)
	req := technical_helper.NewTestRequestBuilder("PUT", "/", bytes.NewReader(bodyBytes)).AddToContext(identifiers.BoardIdentifier, suite.boardID)

	suite.api.UpdateBoardSessions(suite.rr, req.Request())

	suite.Equal(http.StatusInternalServerError, suite.rr.Result().StatusCode)
}

func (suite *APISessionTestSuite) Test_BoardParticipantContext() {
	req := suite.withRouteParam(
		suite.newRequest("GET", "/", nil).AddToContext(identifiers.UserIdentifier, suite.userID),
		"id",
		suite.boardID.String(),
	)

	suite.mockService.EXPECT().Exists(mock.Anything, suite.boardID, suite.userID).Return(true, nil)
	suite.mockService.EXPECT().IsParticipantBanned(mock.Anything, suite.boardID, suite.userID).Return(false, nil)

	suite.api.BoardParticipantContext(suite.nextOK).ServeHTTP(suite.rr, req.Request())

	suite.assertStatus(http.StatusOK)
}

func (suite *APISessionTestSuite) Test_BoardParticipantContext_NoParticipant() {
	req := suite.withRouteParam(
		suite.newRequest("GET", "/", nil).AddToContext(identifiers.UserIdentifier, suite.userID),
		"id",
		suite.boardID.String(),
	)

	suite.mockService.EXPECT().Exists(mock.Anything, suite.boardID, suite.userID).Return(false, nil)

	suite.api.BoardParticipantContext(suite.nextOK).ServeHTTP(suite.rr, req.Request())

	suite.assertStatus(http.StatusForbidden)
}

func (suite *APISessionTestSuite) Test_BoardParticipantContext_ParticipantBanned() {
	req := suite.withRouteParam(
		suite.newRequest("GET", "/", nil).AddToContext(identifiers.UserIdentifier, suite.userID),
		"id",
		suite.boardID.String(),
	)

	suite.mockService.EXPECT().Exists(mock.Anything, suite.boardID, suite.userID).Return(true, nil)
	suite.mockService.EXPECT().IsParticipantBanned(mock.Anything, suite.boardID, suite.userID).Return(true, nil)

	suite.api.BoardParticipantContext(suite.nextOK).ServeHTTP(suite.rr, req.Request())

	suite.assertStatus(http.StatusForbidden)
	suite.Error(common.ForbiddenError(errors.New("participant is currently banned from this session")))
}

func (suite *APISessionTestSuite) Test_BoardModeratorContext_Exists() {
	req := suite.withRouteParam(
		suite.newRequest("GET", "/", nil).AddToContext(identifiers.UserIdentifier, suite.userID),
		"id",
		suite.boardID.String(),
	)

	suite.mockService.EXPECT().ModeratorSessionExists(mock.Anything, suite.boardID, suite.userID).Return(true, nil)

	suite.api.BoardModeratorContext(suite.nextOK).ServeHTTP(suite.rr, req.Request())

	suite.assertStatus(http.StatusOK)
}

func (suite *APISessionTestSuite) Test_BoardModeratorContext_DoesNotExists() {
	req := suite.withRouteParam(
		suite.newRequest("GET", "/", nil).AddToContext(identifiers.UserIdentifier, suite.userID),
		"id",
		suite.boardID.String(),
	)

	suite.mockService.EXPECT().ModeratorSessionExists(mock.Anything, suite.boardID, suite.userID).Return(false, nil)

	suite.api.BoardModeratorContext(suite.nextOK).ServeHTTP(suite.rr, req.Request())

	suite.assertStatus(http.StatusNotFound)
}
