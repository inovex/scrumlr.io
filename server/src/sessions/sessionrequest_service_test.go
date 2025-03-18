package sessions

import (
	"context"
	"errors"
	"fmt"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/uptrace/bun"
	brokerMock "scrumlr.io/server/mocks/realtime"
	"scrumlr.io/server/realtime"
)

func TestGetSessionRequest(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().GetBoardSessionRequest(boardId, userId).Return(DatabaseBoardSessionRequest{Board: boardId, User: userId}, nil)

	mockSessionService := NewMockSessionService(t)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)

	sessionRequest, err := service.GetSessionRequest(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.NotNil(t, sessionRequest)
}

func TestGetSessionRequest_Notfound(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	dbError := "Not found"

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().GetBoardSessionRequest(boardId, userId).Return(DatabaseBoardSessionRequest{}, errors.New(dbError))

	mockSessionService := NewMockSessionService(t)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)

	sessionRequest, err := service.GetSessionRequest(context.Background(), boardId, userId)

	assert.Nil(t, sessionRequest)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Sprintf("failed to load board session request: %s", dbError), err.Error())
}

func TestListSessionRequests_WithoutQuery(t *testing.T) {
	boardId := uuid.New()
	query := ""

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().GetBoardSessionRequests(boardId).
		Return([]DatabaseBoardSessionRequest{
			{bun.BaseModel{}, boardId, uuid.New(), "Test1", BoardSessionRequestStatusAccepted, time.Now()},
			{bun.BaseModel{}, boardId, uuid.New(), "Test2", BoardSessionRequestStatusPending, time.Now()},
		}, nil)

	mockSessionService := NewMockSessionService(t)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
	sessionRequests, err := service.ListSessionRequest(context.Background(), boardId, query)

	assert.Nil(t, err)
	assert.NotNil(t, sessionRequests)
}

func TestListSessionRequests_WithoutQuery_NotFound(t *testing.T) {
	boardId := uuid.New()
	dbError := "Not found"
	query := ""

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().GetBoardSessionRequests(boardId).
		Return([]DatabaseBoardSessionRequest{}, errors.New(dbError))

	mockSessionService := NewMockSessionService(t)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
	sessionRequest, err := service.ListSessionRequest(context.Background(), boardId, query)

	assert.Nil(t, sessionRequest)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Sprintf("failed to load board session requests: %s", dbError), err.Error())
}

func TestListSessionRequests_WithQuery(t *testing.T) {
	boardId := uuid.New()
	query := "PENDING"

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().GetBoardSessionRequests(boardId, BoardSessionRequestStatusPending).
		Return([]DatabaseBoardSessionRequest{
			{bun.BaseModel{}, boardId, uuid.New(), "Test1", BoardSessionRequestStatusPending, time.Now()},
			{bun.BaseModel{}, boardId, uuid.New(), "Test2", BoardSessionRequestStatusPending, time.Now()},
		}, nil)

	mockSessionService := NewMockSessionService(t)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
	sessionRequests, err := service.ListSessionRequest(context.Background(), boardId, query)

	assert.Nil(t, err)
	assert.NotNil(t, sessionRequests)
}

func TestListSessionRequests_WithQuery_NotFound(t *testing.T) {
	boardId := uuid.New()
	dbError := "Not found"
	query := "ACCEPTED"

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().GetBoardSessionRequests(boardId, BoardSessionRequestStatusAccepted).
		Return([]DatabaseBoardSessionRequest{}, errors.New(dbError))

	mockSessionService := NewMockSessionService(t)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
	sessionRequests, err := service.ListSessionRequest(context.Background(), boardId, query)

	assert.Nil(t, sessionRequests)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Sprintf("failed to load board session requests: %s", dbError), err.Error())
}

func TestListSessionRequests_InvalideQuery(t *testing.T) {
	boardId := uuid.New()
	query := "INVALIDE"

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionService := NewMockSessionService(t)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
	sessionRequests, err := service.ListSessionRequest(context.Background(), boardId, query)

	assert.Nil(t, sessionRequests)
	mockSessionRequestDb.AssertNotCalled(t, "GetBoardSessionRequests")
	assert.NotNil(t, err)
	assert.Equal(t, "invalid status filter", err.Error())
}

func TestSessionRequestExists(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().BoardSessionRequestExists(boardId, userId).Return(true, nil)
	mockSessionService := NewMockSessionService(t)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
	exists, err := service.SessionRequestExists(context.Background(), boardId, userId)

	assert.Nil(t, err)
	assert.True(t, exists)
}

func TestSessionRequestExists_DbError(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	dbError := "database error"

	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
	mockSessionRequestDb.EXPECT().BoardSessionRequestExists(boardId, userId).Return(false, errors.New(dbError))
	mockSessionService := NewMockSessionService(t)

	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockWebSocket := NewMockWebsocket(t)

	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
	exists, err := service.SessionRequestExists(context.Background(), boardId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, "database error", err.Error())
	assert.False(t, exists)
}

//func TestSessionOpenBoardSessionRequestSocket(t *testing.T) {
//	mockSessionRequestDb := NewMockSessionRequestDatabase(t)
//	mockSessionService := NewMockSessionService(t)
//
//	mockBroker := brokerMock.NewMockClient(t)
//	broker := new(realtime.Broker)
//	broker.Con = mockBroker
//
//	mockWebSocket := NewMockWebsocket(t)
//	mockResponseWriter := httpMock.NewMockResponseWriter(t)
//	mockRequest := new(http.Request)
//	mockWebSocket.EXPECT().OpenBoardSessionRequestSocket(mock.Anything, mock.Anything)
//
//	service := NewSessionRequestService(mockSessionRequestDb, broker, mockWebSocket, mockSessionService)
//	service.OpenBoardSessionRequestSocket(mockResponseWriter, mockRequest)
//
//	mockWebSocket.AssertCalled(t, "OpenBoardSessionRequestSocket", mockResponseWriter, mockRequest)
//}
