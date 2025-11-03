package draglocks

import (
	"context"
	"encoding/json"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
)

// MockWebSocketConn captures messages for testing
type MockWebSocketConn struct {
	messages []interface{}
}

func (m *MockWebSocketConn) WriteJSON(_ context.Context, v interface{}) error {
	m.messages = append(m.messages, v)
	return nil
}

func (m *MockWebSocketConn) GetMessages() []interface{} {
	return m.messages
}

func TestHandleAcquireMessage(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()
	mockConn := &MockWebSocketConn{}

	mockLockService := NewMockDragLockService(t)
	mockLockService.EXPECT().AcquireLock(mock.Anything, noteID, userID, boardID).
		Return(true)

	lockmessageHandler := NewDragLockMessageHandler(mockLockService)

	message := DragLockMessage{
		Action: DragLockActionAcquire,
		NoteID: noteID,
	}
	data, err := json.Marshal(message)
	assert.Nil(t, err)

	lockmessageHandler.HandleWebSocketMessage(context.Background(), boardID, userID, mockConn, data)

	assert.Len(t, mockConn.messages, 1)
	response := mockConn.messages[0].(DragLockResponse)
	assert.Equal(t, WebSocketMessageTypeDragLock, response.Type)
	assert.Equal(t, DragLockActionAcquire, response.Action)
	assert.Equal(t, noteID, response.NoteID)
	assert.True(t, response.Success)
	assert.Empty(t, response.Error)
}

func TestHandleFailedAcquireMessage(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()
	mockConn := &MockWebSocketConn{}

	mockLockService := NewMockDragLockService(t)
	mockLockService.EXPECT().AcquireLock(mock.Anything, noteID, userID, boardID).
		Return(false)

	lockmessageHandler := NewDragLockMessageHandler(mockLockService)

	message := DragLockMessage{
		Action: DragLockActionAcquire,
		NoteID: noteID,
	}
	data, err := json.Marshal(message)
	assert.Nil(t, err)

	lockmessageHandler.HandleWebSocketMessage(context.Background(), boardID, userID, mockConn, data)

	// Verify response was sent with error
	assert.Len(t, mockConn.messages, 1)
	response := mockConn.messages[0].(DragLockResponse)
	assert.Equal(t, WebSocketMessageTypeDragLock, response.Type)
	assert.Equal(t, DragLockActionAcquire, response.Action)
	assert.Equal(t, noteID, response.NoteID)
	assert.False(t, response.Success)
	assert.Equal(t, "Note is currently being dragged by another user", response.Error)
}

func TestHandleReleaseMessage(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()
	mockConn := &MockWebSocketConn{}

	mockLockService := NewMockDragLockService(t)
	mockLockService.EXPECT().ReleaseLock(mock.Anything, noteID, userID, boardID).
		Return(true)

	lockmessageHandler := NewDragLockMessageHandler(mockLockService)

	message := DragLockMessage{
		Action: DragLockActionRelease,
		NoteID: noteID,
	}
	data, err := json.Marshal(message)
	assert.Nil(t, err)

	lockmessageHandler.HandleWebSocketMessage(context.Background(), boardID, userID, mockConn, data)

	// Verify response was sent
	assert.Len(t, mockConn.messages, 1)
	response := mockConn.messages[0].(DragLockResponse)
	assert.Equal(t, WebSocketMessageTypeDragLock, response.Type)
	assert.Equal(t, DragLockActionRelease, response.Action)
	assert.Equal(t, noteID, response.NoteID)
	assert.True(t, response.Success)
	assert.Empty(t, response.Error)
}

func TestHandleFailedReleaseMessage(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()
	mockConn := &MockWebSocketConn{}

	mockLockService := NewMockDragLockService(t)
	mockLockService.EXPECT().ReleaseLock(mock.Anything, noteID, userID, boardID).
		Return(false)

	lockmessageHandler := NewDragLockMessageHandler(mockLockService)

	message := DragLockMessage{
		Action: DragLockActionRelease,
		NoteID: noteID,
	}
	data, err := json.Marshal(message)
	assert.Nil(t, err)

	lockmessageHandler.HandleWebSocketMessage(context.Background(), boardID, userID, mockConn, data)

	// Verify response was sent with error
	assert.Len(t, mockConn.messages, 1)
	response := mockConn.messages[0].(DragLockResponse)
	assert.Equal(t, WebSocketMessageTypeDragLock, response.Type)
	assert.Equal(t, DragLockActionRelease, response.Action)
	assert.Equal(t, noteID, response.NoteID)
	assert.False(t, response.Success)
	assert.Equal(t, "Lock not owned by user or already released", response.Error)
}

func TestHandleInvalidJSON(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	mockConn := &MockWebSocketConn{}

	invalidJSON := []byte(`{"action": "ACQUIRE", "noteId": "invalid-uuid"}`)

	mockLockService := NewMockDragLockService(t)
	lockmessageHandler := NewDragLockMessageHandler(mockLockService)

	lockmessageHandler.HandleWebSocketMessage(context.Background(), boardID, userID, mockConn, invalidJSON)

	// Verify error response was sent
	assert.Len(t, mockConn.messages, 1)
	response := mockConn.messages[0].(DragLockResponse)
	assert.Equal(t, WebSocketMessageTypeDragLock, response.Type)
	assert.Equal(t, "ERROR", response.Action)
	assert.False(t, response.Success)
	assert.Equal(t, "Invalid message format", response.Error)
}

func TestHandleUnknownAction(t *testing.T) {
	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()
	mockConn := &MockWebSocketConn{}

	mockLockService := NewMockDragLockService(t)
	lockmessageHandler := NewDragLockMessageHandler(mockLockService)

	message := DragLockMessage{
		Action: "UNKNOWN_ACTION",
		NoteID: noteID,
	}
	data, err := json.Marshal(message)
	assert.Nil(t, err)

	lockmessageHandler.HandleWebSocketMessage(context.Background(), boardID, userID, mockConn, data)

	// Verify error response was sent
	assert.Len(t, mockConn.messages, 1)
	response := mockConn.messages[0].(DragLockResponse)
	assert.Equal(t, WebSocketMessageTypeDragLock, response.Type)
	assert.Equal(t, "UNKNOWN_ACTION", response.Action)
	assert.Equal(t, noteID, response.NoteID)
	assert.False(t, response.Success)
	assert.Equal(t, "Unknown action", response.Error)
}
