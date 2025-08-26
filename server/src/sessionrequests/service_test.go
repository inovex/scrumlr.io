package sessionrequests

import (
	"context"
	"errors"
	"fmt"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"scrumlr.io/server/sessions"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	mock "github.com/stretchr/testify/mock"
	"github.com/uptrace/bun"
	httpMock "scrumlr.io/server/mocks/net/http"
	"scrumlr.io/server/realtime"
)

func TestGetSessionRequest(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().Get(mock.Anything, boardId, userId).Return(DatabaseBoardSessionRequest{Board: boardId, User: userId, Status: RequestAccepted}, nil)

	mockSessionService := sessions.NewMockSessionService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)

	sessionRequest, err := service.Get(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.NotNil(t, sessionRequest)
	assert.Equal(t, userId, sessionRequest.User.ID)
	assert.Equal(t, RequestAccepted, sessionRequest.Status)
}

func TestGetSessionRequest_NotFound(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	dbError := "Not found"

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().Get(mock.Anything, boardId, userId).Return(DatabaseBoardSessionRequest{}, errors.New(dbError))

	mockSessionService := sessions.NewMockSessionService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)

	sessionRequest, err := service.Get(context.Background(), boardId, userId)

	assert.Nil(t, sessionRequest)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Sprintf("failed to load board session request: %s", dbError), err.Error())
}

func TestGetSessionRequests_WithoutQuery(t *testing.T) {
	boardId := uuid.New()
	firstUserId := uuid.New()
	secondUserId := uuid.New()
	query := ""

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseBoardSessionRequest{
			{bun.BaseModel{}, boardId, firstUserId, "Test1", RequestAccepted, time.Now()},
			{bun.BaseModel{}, boardId, secondUserId, "Test2", RequestPending, time.Now()},
		}, nil)

	mockSessionService := sessions.NewMockSessionService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
	sessionRequests, err := service.GetAll(context.Background(), boardId, query)

	assert.Nil(t, err)
	assert.NotNil(t, sessionRequests)
	assert.Len(t, sessionRequests, 2)

	assert.Equal(t, firstUserId, sessionRequests[0].User.ID)
	assert.Equal(t, RequestAccepted, sessionRequests[0].Status)

	assert.Equal(t, secondUserId, sessionRequests[1].User.ID)
	assert.Equal(t, RequestPending, sessionRequests[1].Status)
}

func TestListSessionRequests_WithoutQuery_NotFound(t *testing.T) {
	boardId := uuid.New()
	dbError := "Not found"
	query := ""

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseBoardSessionRequest{}, errors.New(dbError))

	mockSessionService := sessions.NewMockSessionService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
	sessionRequest, err := service.GetAll(context.Background(), boardId, query)

	assert.Nil(t, sessionRequest)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Sprintf("failed to load board session requests: %s", dbError), err.Error())
}

func TestListSessionRequests_WithQuery(t *testing.T) {
	boardId := uuid.New()
	firstUserId := uuid.New()
	secondUserId := uuid.New()
	query := "PENDING"

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().GetAll(mock.Anything, boardId, []RequestStatus{RequestPending}).
		Return([]DatabaseBoardSessionRequest{
			{Board: boardId, User: firstUserId, Name: "Test1", Status: RequestPending, CreatedAt: time.Now()},
			{Board: boardId, User: secondUserId, Name: "Test2", Status: RequestPending, CreatedAt: time.Now()},
		}, nil)

	mockSessionService := sessions.NewMockSessionService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
	sessionRequests, err := service.GetAll(context.Background(), boardId, query)

	assert.Nil(t, err)
	assert.NotNil(t, sessionRequests)
	assert.Len(t, sessionRequests, 2)

	assert.Equal(t, firstUserId, sessionRequests[0].User.ID)
	assert.Equal(t, RequestPending, sessionRequests[0].Status)

	assert.Equal(t, secondUserId, sessionRequests[1].User.ID)
	assert.Equal(t, RequestPending, sessionRequests[1].Status)
}

func TestListSessionRequests_WithQuery_NotFound(t *testing.T) {
	boardId := uuid.New()
	dbError := "Not found"
	query := "ACCEPTED"

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().GetAll(mock.Anything, boardId, []RequestStatus{RequestAccepted}).
		Return([]DatabaseBoardSessionRequest{}, errors.New(dbError))

	mockSessionService := sessions.NewMockSessionService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
	sessionRequests, err := service.GetAll(context.Background(), boardId, query)

	assert.Nil(t, sessionRequests)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Sprintf("failed to load board session requests: %s", dbError), err.Error())
}

func TestListSessionRequests_InvalideQuery(t *testing.T) {
	boardId := uuid.New()
	query := "INVALIDE"

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionService := sessions.NewMockSessionService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
	sessionRequests, err := service.GetAll(context.Background(), boardId, query)

	assert.Nil(t, sessionRequests)
	mockSessionRequestDb.AssertNotCalled(t, "GetBoardSessionRequests")
	assert.NotNil(t, err)
	assert.Equal(t, "invalid status filter", err.Error())
}

func TestCreateSessionRequest(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().Create(mock.Anything, DatabaseBoardSessionRequestInsert{Board: boardId, User: userId}).
		Return(DatabaseBoardSessionRequest{Board: boardId, User: userId}, nil)

	mockSessionService := sessions.NewMockSessionService(t)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
	request, err := service.Create(context.Background(), boardId, userId)

	assert.NotNil(t, request)
	assert.Nil(t, err)
	assert.Equal(t, userId, request.User.ID)
}

func TestCreateSessionRequest_DBError(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	dbError := "Failed to execute"

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().Create(mock.Anything, DatabaseBoardSessionRequestInsert{Board: boardId, User: userId}).
		Return(DatabaseBoardSessionRequest{}, errors.New(dbError))

	mockSessionService := sessions.NewMockSessionService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
	request, err := service.Create(context.Background(), boardId, userId)

	assert.Nil(t, request)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestUpdatesessionRequest(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()

	user := sessions.User{
		ID: userId,
	}
	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().Update(mock.Anything, DatabaseBoardSessionRequestUpdate{Board: boardId, User: userId, Status: RequestAccepted}).
		Return(DatabaseBoardSessionRequest{Board: boardId, User: userId, Status: RequestAccepted}, nil)

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Create(mock.Anything, boardId, userId).
		Return(&sessions.BoardSession{Board: boardId, User: user}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
	request, err := service.Update(context.Background(), BoardSessionRequestUpdate{Board: boardId, User: userId, Status: RequestAccepted})

	assert.NotNil(t, request)
	assert.Nil(t, err)
	assert.Equal(t, userId, request.User.ID)
}

func TestUpdatesessionRequest_DBError(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	dbError := "Failed to execute"

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().Update(mock.Anything, DatabaseBoardSessionRequestUpdate{Board: boardId, User: userId, Status: RequestAccepted}).
		Return(DatabaseBoardSessionRequest{}, errors.New(dbError))

	mockSessionService := sessions.NewMockSessionService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
	request, err := service.Update(context.Background(), BoardSessionRequestUpdate{Board: boardId, User: userId, Status: RequestAccepted})

	assert.Nil(t, request)
	assert.NotNil(t, err)
	assert.Equal(t, errors.New(dbError), err)
}

func TestSessionRequestExists(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().Exists(mock.Anything, boardId, userId).Return(true, nil)
	mockSessionService := sessions.NewMockSessionService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
	exists, err := service.Exists(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func TestSessionRequestExists_DbError(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	dbError := "database error"

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().Exists(mock.Anything, boardId, userId).Return(false, errors.New(dbError))
	mockSessionService := sessions.NewMockSessionService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
	exists, err := service.Exists(context.Background(), boardId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, "database error", err.Error())
	assert.False(t, exists)
}

func TestSessionOpenBoardSessionRequestSocket(t *testing.T) {
	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionService := sessions.NewMockSessionService(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)
	mockResponseWriter := httpMock.NewMockResponseWriter(t)
	mockRequest := httptest.NewRequest(http.MethodGet, "/test", nil)
	mockWebSocket.EXPECT().OpenSocket(mock.Anything, mock.Anything)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
	service.OpenSocket(context.Background(), mockResponseWriter, mockRequest)

	mockWebSocket.AssertCalled(t, "OpenSocket", mockResponseWriter, mockRequest)
}
