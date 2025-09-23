package draglocks

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"

	"scrumlr.io/server/realtime"
)

// MockWebSocketConn captures messages for testing
type MockWebSocketConn struct {
	messages []interface{}
}

func (m *MockWebSocketConn) WriteJSON(v interface{}) error {
	m.messages = append(m.messages, v)
	return nil
}

func (m *MockWebSocketConn) GetMessages() []interface{} {
	return m.messages
}

type WebSocketHandlerTestSuite struct {
	suite.Suite
	mockService  *MockDragLockService
	mockRealtime *realtime.Broker
}

func TestWebSocketHandlerTestSuite(t *testing.T) {
	suite.Run(t, new(WebSocketHandlerTestSuite))
}

func (suite *WebSocketHandlerTestSuite) SetupTest() {
	suite.mockService = &MockDragLockService{}

	mockClient := realtime.NewMockClient(suite.T())
	mockClient.On("Publish", mock.Anything, mock.Anything, mock.Anything).Return(nil).Maybe()
	suite.mockRealtime = &realtime.Broker{Con: mockClient}
}

func (suite *WebSocketHandlerTestSuite) TestHandleAcquireMessage() {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()
	mockConn := &MockWebSocketConn{}

	suite.mockService.On("AcquireLock", noteID, userID, boardID).Return(true)

	message := DragLockMessage{
		Action: DragLockActionAcquire,
		NoteID: noteID,
	}
	data, err := json.Marshal(message)
	suite.Require().NoError(err)

	HandleWebSocketMessage(context.Background(), suite.mockService, suite.mockRealtime, boardID, userID, mockConn, data)

	// Verify response was sent
	suite.Len(mockConn.messages, 1)
	response := mockConn.messages[0].(DragLockResponse)
	suite.Equal(WebSocketMessageTypeDragLock, response.Type)
	suite.Equal(DragLockActionAcquire, response.Action)
	suite.Equal(noteID, response.NoteID)
	suite.True(response.Success)
	suite.Empty(response.Error)

	suite.mockService.AssertExpectations(suite.T())
}

func (suite *WebSocketHandlerTestSuite) TestHandleFailedAcquireMessage() {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()
	mockConn := &MockWebSocketConn{}

	suite.mockService.On("AcquireLock", noteID, userID, boardID).Return(false)

	message := DragLockMessage{
		Action: DragLockActionAcquire,
		NoteID: noteID,
	}
	data, err := json.Marshal(message)
	suite.Require().NoError(err)

	HandleWebSocketMessage(context.Background(), suite.mockService, suite.mockRealtime, boardID, userID, mockConn, data)

	// Verify response was sent with error
	suite.Len(mockConn.messages, 1)
	response := mockConn.messages[0].(DragLockResponse)
	suite.Equal(WebSocketMessageTypeDragLock, response.Type)
	suite.Equal(DragLockActionAcquire, response.Action)
	suite.Equal(noteID, response.NoteID)
	suite.False(response.Success)
	suite.Equal("Note is currently being dragged by another user", response.Error)

	suite.mockService.AssertExpectations(suite.T())
}

func (suite *WebSocketHandlerTestSuite) TestHandleReleaseMessage() {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()
	mockConn := &MockWebSocketConn{}

	suite.mockService.On("ReleaseLock", noteID, userID).Return(true)

	message := DragLockMessage{
		Action: DragLockActionRelease,
		NoteID: noteID,
	}
	data, err := json.Marshal(message)
	suite.Require().NoError(err)

	HandleWebSocketMessage(context.Background(), suite.mockService, suite.mockRealtime, boardID, userID, mockConn, data)

	// Verify response was sent
	suite.Len(mockConn.messages, 1)
	response := mockConn.messages[0].(DragLockResponse)
	suite.Equal(WebSocketMessageTypeDragLock, response.Type)
	suite.Equal(DragLockActionRelease, response.Action)
	suite.Equal(noteID, response.NoteID)
	suite.True(response.Success)
	suite.Empty(response.Error)

	suite.mockService.AssertExpectations(suite.T())
}

func (suite *WebSocketHandlerTestSuite) TestHandleFailedReleaseMessage() {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()
	mockConn := &MockWebSocketConn{}

	suite.mockService.On("ReleaseLock", noteID, userID).Return(false)

	message := DragLockMessage{
		Action: DragLockActionRelease,
		NoteID: noteID,
	}
	data, err := json.Marshal(message)
	suite.Require().NoError(err)

	HandleWebSocketMessage(context.Background(), suite.mockService, suite.mockRealtime, boardID, userID, mockConn, data)

	// Verify response was sent with error
	suite.Len(mockConn.messages, 1)
	response := mockConn.messages[0].(DragLockResponse)
	suite.Equal(WebSocketMessageTypeDragLock, response.Type)
	suite.Equal(DragLockActionRelease, response.Action)
	suite.Equal(noteID, response.NoteID)
	suite.False(response.Success)
	suite.Equal("Lock not owned by user or already released", response.Error)

	suite.mockService.AssertExpectations(suite.T())
}

func (suite *WebSocketHandlerTestSuite) TestHandleInvalidJSON() {
	boardID := uuid.New()
	userID := uuid.New()
	mockConn := &MockWebSocketConn{}

	invalidJSON := []byte(`{"action": "ACQUIRE", "noteId": "invalid-uuid"}`)

	HandleWebSocketMessage(context.Background(), suite.mockService, suite.mockRealtime, boardID, userID, mockConn, invalidJSON)

	// Verify error response was sent
	suite.Len(mockConn.messages, 1)
	response := mockConn.messages[0].(DragLockResponse)
	suite.Equal(WebSocketMessageTypeDragLock, response.Type)
	suite.Equal("ERROR", response.Action)
	suite.False(response.Success)
	suite.Equal("Invalid message format", response.Error)
}

func (suite *WebSocketHandlerTestSuite) TestHandleUnknownAction() {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()
	mockConn := &MockWebSocketConn{}

	message := DragLockMessage{
		Action: "UNKNOWN_ACTION",
		NoteID: noteID,
	}
	data, err := json.Marshal(message)
	suite.Require().NoError(err)

	HandleWebSocketMessage(context.Background(), suite.mockService, suite.mockRealtime, boardID, userID, mockConn, data)

	// Verify error response was sent
	suite.Len(mockConn.messages, 1)
	response := mockConn.messages[0].(DragLockResponse)
	suite.Equal(WebSocketMessageTypeDragLock, response.Type)
	suite.Equal("UNKNOWN_ACTION", response.Action)
	suite.Equal(noteID, response.NoteID)
	suite.False(response.Success)
	suite.Equal("Unknown action", response.Error)
}

func (suite *WebSocketHandlerTestSuite) TestReleaseUserLocks() {
	boardID := uuid.New()
	userID1 := uuid.New()
	userID2 := uuid.New()
	noteID1 := uuid.New()
	noteID2 := uuid.New()
	noteID3 := uuid.New()

	// Setup mock locks
	locks := []*DragLock{
		{NoteID: noteID1, UserID: userID1, BoardID: boardID},
		{NoteID: noteID2, UserID: userID2, BoardID: boardID}, // Different user
		{NoteID: noteID3, UserID: userID1, BoardID: boardID},
	}

	suite.mockService.On("GetLocksForBoard", boardID).Return(locks)
	suite.mockService.On("ReleaseLock", noteID1, userID1).Return(true)
	suite.mockService.On("ReleaseLock", noteID3, userID1).Return(true)

	ReleaseUserLocks(context.Background(), suite.mockService, suite.mockRealtime, boardID, userID1)

	// Verify only the correct user's locks were released
	suite.mockService.AssertExpectations(suite.T())

	// Verify ReleaseLock was not called for userID2's lock
	suite.mockService.AssertNotCalled(suite.T(), "ReleaseLock", noteID2, userID2)
}

func (suite *WebSocketHandlerTestSuite) TestReleaseUserLocksEmptyList() {
	boardID := uuid.New()
	userID := uuid.New()

	suite.mockService.On("GetLocksForBoard", boardID).Return([]*DragLock{})

	ReleaseUserLocks(context.Background(), suite.mockService, suite.mockRealtime, boardID, userID)

	suite.mockService.AssertExpectations(suite.T())
}

func (suite *WebSocketHandlerTestSuite) TestReleaseUserLocksFailedRelease() {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()

	locks := []*DragLock{
		{NoteID: noteID, UserID: userID, BoardID: boardID},
	}

	suite.mockService.On("GetLocksForBoard", boardID).Return(locks)
	suite.mockService.On("ReleaseLock", noteID, userID).Return(false)

	ReleaseUserLocks(context.Background(), suite.mockService, suite.mockRealtime, boardID, userID)

	suite.mockService.AssertExpectations(suite.T())
}
