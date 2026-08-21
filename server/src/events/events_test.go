package events

import (
	"context"
	"encoding/json"
	"errors"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/websocket"
)

func TestOpenBoardSocket(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	ctx = context.WithValue(ctx, identifiers.BoardIdentifier, boardId)
	ctx = context.WithValue(ctx, identifiers.UserIdentifier, userId)

	request := httptest.NewRequestWithContext(ctx, "GET", "/boards", nil)
	recorder := httptest.NewRecorder()

	connection := websocket.NewMockConnection(t)
	connection.EXPECT().WriteJSON(mock.Anything, &realtime.BoardEvent{Type: realtime.BoardEventInit, Data: boardId}).
		Return(nil)
	connection.EXPECT().Read(mock.Anything).
		Return(1, []byte("{\"Type\": \"DRAG_LOCK_MESSAGE\", \"Data\": {}}"), nil).Once()
	connection.EXPECT().Read(mock.Anything).
		Return(1, []byte(""), errors.New("close websocket"))
	connection.EXPECT().Close("normal close").
		Return(nil)

	ws := websocket.NewMockUpgrader(t)
	ws.EXPECT().Accept(mock.Anything, mock.Anything, false).
		Return(connection, nil)
	ws.EXPECT().IsNormalClose(mock.Anything).
		Return(true)

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Disconnect(mock.IsType(ctx), boardId, userId).
		Return(nil)

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().HandleWebSocketMessage(mock.Anything, boardId, userId, connection, mock.Anything).
		Return(nil)

	mockBoardConnection := NewMockBoardConnectionManager(t)
	mockBoardConnection.EXPECT().Register(mock.Anything, connection, boardId, userId).
		Return(nil)
	mockBoardConnection.EXPECT().Unregister(mock.Anything, boardId, userId)

	mockSessionRequestConnection := NewMockSessionRequestConnectionManager(t)

	eventListener := NewEventListener(ws, false, mockBoardConnection, mockSessionRequestConnection, mockSessionService, mockNoteService)

	eventListener.OpenBoardSocket(recorder, request)
}

func TestOpenBoardSocketFailedToOpenSocket(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	ctx = context.WithValue(ctx, identifiers.BoardIdentifier, boardId)
	ctx = context.WithValue(ctx, identifiers.UserIdentifier, userId)

	request := httptest.NewRequestWithContext(ctx, "GET", "/boards", nil)
	recorder := httptest.NewRecorder()

	connection := websocket.NewMockConnection(t)

	ws := websocket.NewMockUpgrader(t)
	ws.EXPECT().Accept(mock.Anything, mock.Anything, false).
		Return(connection, errors.New("failed to open socket"))

	mockSessionService := sessions.NewMockSessionService(t)
	mockNoteService := notes.NewMockNotesService(t)

	mockBoardConnection := NewMockBoardConnectionManager(t)
	mockSessionRequestConnection := NewMockSessionRequestConnectionManager(t)

	eventListener := NewEventListener(ws, false, mockBoardConnection, mockSessionRequestConnection, mockSessionService, mockNoteService)

	eventListener.OpenBoardSocket(recorder, request)
}

func TestOpenBoardSocketFailedToRegister(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	ctx = context.WithValue(ctx, identifiers.BoardIdentifier, boardId)
	ctx = context.WithValue(ctx, identifiers.UserIdentifier, userId)

	request := httptest.NewRequestWithContext(ctx, "GET", "/boards", nil)
	recorder := httptest.NewRecorder()

	connection := websocket.NewMockConnection(t)
	connection.EXPECT().Close("normal close").
		Return(nil)

	ws := websocket.NewMockUpgrader(t)
	ws.EXPECT().Accept(mock.Anything, mock.Anything, false).
		Return(connection, nil)

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Disconnect(mock.IsType(ctx), boardId, userId).
		Return(nil)

	mockNoteService := notes.NewMockNotesService(t)

	mockBoardConnection := NewMockBoardConnectionManager(t)
	mockBoardConnection.EXPECT().Register(mock.IsType(ctx), connection, boardId, userId).
		Return(errors.New("failed to register client"))
	mockBoardConnection.EXPECT().Unregister(mock.IsType(ctx), boardId, userId)

	mockSessionRequestConnection := NewMockSessionRequestConnectionManager(t)

	eventListener := NewEventListener(ws, false, mockBoardConnection, mockSessionRequestConnection, mockSessionService, mockNoteService)

	eventListener.OpenBoardSocket(recorder, request)
}

func TestOpenBoardSocketFailedToSendInitEvent(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	ctx = context.WithValue(ctx, identifiers.BoardIdentifier, boardId)
	ctx = context.WithValue(ctx, identifiers.UserIdentifier, userId)

	request := httptest.NewRequestWithContext(ctx, "GET", "/boards", nil)
	recorder := httptest.NewRecorder()

	connection := websocket.NewMockConnection(t)
	connection.EXPECT().WriteJSON(mock.IsType(ctx), &realtime.BoardEvent{Type: realtime.BoardEventInit, Data: boardId}).
		Return(errors.New("failed to send init event"))
	connection.EXPECT().Close("failed to send init message").
		Return(nil).Once()
	connection.EXPECT().Close("normal close").
		Return(nil).Once()

	ws := websocket.NewMockUpgrader(t)
	ws.EXPECT().Accept(mock.Anything, mock.Anything, false).
		Return(connection, nil)

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Disconnect(mock.IsType(ctx), boardId, userId).
		Return(nil)

	mockNoteService := notes.NewMockNotesService(t)

	mockBoardConnection := NewMockBoardConnectionManager(t)
	mockBoardConnection.EXPECT().Register(mock.IsType(ctx), connection, boardId, userId).
		Return(nil)
	mockBoardConnection.EXPECT().Unregister(mock.IsType(ctx), boardId, userId)

	mockSessionRequestConnection := NewMockSessionRequestConnectionManager(t)

	eventListener := NewEventListener(ws, false, mockBoardConnection, mockSessionRequestConnection, mockSessionService, mockNoteService)

	eventListener.OpenBoardSocket(recorder, request)
}

func TestOpenSessionRequestSocket(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	ctx = context.WithValue(ctx, identifiers.BoardIdentifier, boardId)
	ctx = context.WithValue(ctx, identifiers.UserIdentifier, userId)

	request := httptest.NewRequestWithContext(ctx, "GET", "/session-requests", nil)
	recorder := httptest.NewRecorder()

	connection := websocket.NewMockConnection(t)
	connection.EXPECT().Close("").
		Return(nil)

	closeErr := errors.New("connection closed")
	connection.EXPECT().Read(mock.IsType(ctx)).
		Return(0, nil, closeErr).Once()

	ws := websocket.NewMockUpgrader(t)
	ws.EXPECT().Accept(mock.Anything, mock.Anything, false).
		Return(connection, nil)
	ws.EXPECT().IsNormalClose(closeErr).
		Return(true)

	mockSessionService := sessions.NewMockSessionService(t)
	mockNoteService := notes.NewMockNotesService(t)

	mockBoardConnection := NewMockBoardConnectionManager(t)

	mockSessionRequestConnection := NewMockSessionRequestConnectionManager(t)
	mockSessionRequestConnection.EXPECT().Register(mock.IsType(ctx), connection, boardId, userId).
		Return(nil)
	mockSessionRequestConnection.EXPECT().Unregister(mock.IsType(ctx), boardId, userId)

	eventListener := NewEventListener(ws, false, mockBoardConnection, mockSessionRequestConnection, mockSessionService, mockNoteService)

	eventListener.OpenSessionRequestSocket(recorder, request)
}

func TestOpenSessionRequestSocketOpenSocketFailed(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	ctx = context.WithValue(ctx, identifiers.BoardIdentifier, boardId)
	ctx = context.WithValue(ctx, identifiers.UserIdentifier, userId)

	request := httptest.NewRequestWithContext(ctx, "GET", "/session-requests", nil)
	recorder := httptest.NewRecorder()

	ws := websocket.NewMockUpgrader(t)
	ws.EXPECT().Accept(mock.Anything, mock.Anything, false).
		Return(nil, errors.New("failed to upgrade connection"))

	mockSessionService := sessions.NewMockSessionService(t)
	mockNoteService := notes.NewMockNotesService(t)

	mockBoardConnection := NewMockBoardConnectionManager(t)

	mockSessionRequestConnection := NewMockSessionRequestConnectionManager(t)

	eventListener := NewEventListener(ws, false, mockBoardConnection, mockSessionRequestConnection, mockSessionService, mockNoteService)

	eventListener.OpenSessionRequestSocket(recorder, request)
}

func TestOpenSessionRequestSocketFailedToRegister(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	ctx = context.WithValue(ctx, identifiers.BoardIdentifier, boardId)
	ctx = context.WithValue(ctx, identifiers.UserIdentifier, userId)

	request := httptest.NewRequestWithContext(ctx, "GET", "/session-requests", nil)
	recorder := httptest.NewRecorder()

	connection := websocket.NewMockConnection(t)
	connection.EXPECT().Close("").
		Return(nil)

	ws := websocket.NewMockUpgrader(t)
	ws.EXPECT().Accept(mock.Anything, mock.Anything, false).
		Return(connection, nil)

	mockSessionService := sessions.NewMockSessionService(t)
	mockNoteService := notes.NewMockNotesService(t)

	mockBoardConnection := NewMockBoardConnectionManager(t)

	mockSessionRequestConnection := NewMockSessionRequestConnectionManager(t)
	mockSessionRequestConnection.EXPECT().Register(mock.IsType(ctx), connection, boardId, userId).
		Return(errors.New("failed to register client"))
	mockSessionRequestConnection.EXPECT().Unregister(mock.IsType(ctx), boardId, userId)

	eventListener := NewEventListener(ws, false, mockBoardConnection, mockSessionRequestConnection, mockSessionService, mockNoteService)

	eventListener.OpenSessionRequestSocket(recorder, request)
}

func TestOpenSocket(t *testing.T) {
	ctx := t.Context()

	mockWebsocket := websocket.NewMockUpgrader(t)
	mockWebsocket.EXPECT().Accept(mock.Anything, mock.Anything, false).
		Return(websocket.NewMockConnection(t), nil)

	request := httptest.NewRequest("GET", "/boards", nil)
	recorder := httptest.NewRecorder()

	eventListener := new(eventListener)
	eventListener.websocket = mockWebsocket
	eventListener.checkOrigin = false

	connection, err := eventListener.openSocket(ctx, recorder, request)

	assert.NoError(t, err)
	assert.NotNil(t, connection)
}

func TestOpenSocketFailed(t *testing.T) {
	ctx := t.Context()
	websocketError := errors.New("websocket error")

	mockWebsocket := websocket.NewMockUpgrader(t)
	mockWebsocket.EXPECT().Accept(mock.Anything, mock.Anything, false).
		Return(websocket.NewMockConnection(t), websocketError)

	request := httptest.NewRequest("GET", "/boards", nil)
	recorder := httptest.NewRecorder()

	eventListener := new(eventListener)
	eventListener.websocket = mockWebsocket
	eventListener.checkOrigin = false

	connection, err := eventListener.openSocket(ctx, recorder, request)

	assert.Nil(t, connection)
	assert.Error(t, err)
	assert.Equal(t, websocketError, err)
}

func TestCloseSocket(t *testing.T) {
	ctx := t.Context()

	reason := "normal close"

	mockWebsocketConnection := websocket.NewMockConnection(t)
	mockWebsocketConnection.EXPECT().Close(reason).
		Return(nil)

	mockSessionService := sessions.NewMockSessionService(t)

	eventListener := new(eventListener)
	eventListener.sessionService = mockSessionService

	eventListener.closeSocket(ctx, mockWebsocketConnection, reason, nil, nil, false)

	mockSessionService.AssertNotCalled(t, "Disconnect")
}

func TestCloseSocketFailed(t *testing.T) {
	ctx := t.Context()
	websocketError := errors.New("websocket error")

	reason := "failed to send init message"

	mockWebsocketConnection := websocket.NewMockConnection(t)
	mockWebsocketConnection.EXPECT().Close(reason).
		Return(websocketError)

	mockSessionService := sessions.NewMockSessionService(t)

	eventListener := new(eventListener)
	eventListener.sessionService = mockSessionService

	eventListener.closeSocket(ctx, mockWebsocketConnection, reason, nil, nil, false)

	mockSessionService.AssertNotCalled(t, "Disconnect")
}

func TestCloseSocketDisconnect(t *testing.T) {
	ctx := t.Context()

	reason := "normal close"
	boardId := uuid.New()
	userId := uuid.New()

	mockWebsocketConnection := websocket.NewMockConnection(t)
	mockWebsocketConnection.EXPECT().Close(reason).
		Return(nil)

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Disconnect(mock.Anything, boardId, userId).
		Return(nil)

	eventListener := new(eventListener)
	eventListener.sessionService = mockSessionService

	eventListener.closeSocket(ctx, mockWebsocketConnection, reason, &boardId, &userId, true)
}

func TestCloseSocketdisconnectFailed(t *testing.T) {
	ctx := t.Context()

	reason := "normal close"
	boardId := uuid.New()
	userId := uuid.New()

	mockWebsocketConnection := websocket.NewMockConnection(t)
	mockWebsocketConnection.EXPECT().Close(reason).
		Return(nil)

	mockSessionService := sessions.NewMockSessionService(t)
	mockSessionService.EXPECT().Disconnect(mock.Anything, boardId, userId).
		Return(errors.New("failed to disconnect session"))

	eventListener := new(eventListener)
	eventListener.sessionService = mockSessionService

	eventListener.closeSocket(ctx, mockWebsocketConnection, reason, &boardId, &userId, true)
}

func TestHandleWebsocketMessage(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	noteLock, err := json.Marshal(notes.DragLockMessage{})
	assert.NoError(t, err)

	message := WebsocketMessage{
		Type: NoteDragLock,
		Data: noteLock,
	}

	rawMessage, err := json.Marshal(message)
	assert.NoError(t, err)

	mockWebSocketConnection := websocket.NewMockConnection(t)

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().HandleWebSocketMessage(mock.Anything, boardId, userId, mockWebSocketConnection, mock.Anything).
		Return(nil)

	eventListener := new(eventListener)
	eventListener.noteService = mockNoteService

	err = eventListener.handleWebsocketMessage(ctx, mockWebSocketConnection, boardId, userId, rawMessage)

	assert.NoError(t, err)
}

func TestHandleWebsocketMessageFailedToUnmarshal(t *testing.T) {
	ctx := t.Context()

	boardId := uuid.New()
	userId := uuid.New()

	message := []byte("invalid json")

	mockWebSocketConnection := websocket.NewMockConnection(t)

	eventListener := new(eventListener)

	err := eventListener.handleWebsocketMessage(ctx, mockWebSocketConnection, boardId, userId, message)

	assert.Error(t, err)
}
