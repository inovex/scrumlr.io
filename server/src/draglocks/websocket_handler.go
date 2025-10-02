package draglocks

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

// WebSocketConnection interface for testability
type WebSocketConnection interface {
	WriteJSON(v interface{}) error
}

// HandleWebSocketMessage processes a drag lock WebSocket message
func HandleWebSocketMessage(ctx context.Context, service DragLockService, realtime *realtime.Broker, boardID, userID uuid.UUID, conn WebSocketConnection, data json.RawMessage) {
	var message DragLockMessage
	if err := json.Unmarshal(data, &message); err != nil {
		logger.Get().Errorw("failed to unmarshal drag lock message", "error", err, "data", string(data))
		sendResponse(conn, DragLockResponse{
			Type:    WebSocketMessageTypeDragLock,
			Action:  "ERROR",
			Success: false,
			Error:   "Invalid message format",
		})
		return
	}

	switch message.Action {
	case DragLockActionAcquire:
		handleAcquire(ctx, service, realtime, boardID, userID, conn, message.NoteID)
	case DragLockActionRelease:
		handleRelease(ctx, service, realtime, boardID, userID, conn, message.NoteID)
	default:
		logger.Get().Warnw("unknown drag lock action", "action", message.Action, "userId", userID)
		sendResponse(conn, DragLockResponse{
			Type:    WebSocketMessageTypeDragLock,
			Action:  message.Action,
			NoteID:  message.NoteID,
			Success: false,
			Error:   "Unknown action",
		})
	}
}

// handleAcquire processes a drag lock acquisition request
func handleAcquire(ctx context.Context, service DragLockService, rt *realtime.Broker, boardID, userID uuid.UUID, conn WebSocketConnection, noteID uuid.UUID) {
	success := service.AcquireLock(noteID, userID, boardID)

	response := DragLockResponse{
		Type:    WebSocketMessageTypeDragLock,
		Action:  DragLockActionAcquire,
		NoteID:  noteID,
		Success: success,
	}

	if !success {
		response.Error = "Note is currently being dragged by another user"
	}

	// Send response to requesting client
	sendResponse(conn, response)

	// If successful, broadcast to all other clients on the board
	if success {
		broadcastLockEvent(rt, boardID, realtime.BoardEventNoteDragStart, noteID, userID)
	}
}

// handleRelease processes a drag lock release request
func handleRelease(ctx context.Context, service DragLockService, rt *realtime.Broker, boardID, userID uuid.UUID, conn WebSocketConnection, noteID uuid.UUID) {
	success := service.ReleaseLock(noteID, userID)

	response := DragLockResponse{
		Type:    WebSocketMessageTypeDragLock,
		Action:  DragLockActionRelease,
		NoteID:  noteID,
		Success: success,
	}

	if !success {
		response.Error = "Lock not owned by user or already released"
	}

	// Send response to requesting client
	sendResponse(conn, response)

	// If successful, broadcast to all other clients on the board
	if success {
		broadcastLockEvent(rt, boardID, realtime.BoardEventNoteDragEnd, noteID, userID)
	}
}

// ReleaseUserLocks releases all locks held by a user (called on disconnect)
func ReleaseUserLocks(ctx context.Context, service DragLockService, rt *realtime.Broker, boardID, userID uuid.UUID) {
	// Get all locks for the board to find user's locks
	locks := service.GetLocksForBoard(boardID)

	for _, lock := range locks {
		if lock.UserID == userID {
			success := service.ReleaseLock(lock.NoteID, userID)
			if success {
				// Broadcast release to all clients
				broadcastLockEvent(rt, boardID, realtime.BoardEventNoteDragEnd, lock.NoteID, userID)
			}
		}
	}
}

// sendResponse sends a response message to a WebSocket connection
func sendResponse(conn WebSocketConnection, response DragLockResponse) {
	if err := conn.WriteJSON(response); err != nil {
		logger.Get().Errorw("failed to send drag lock response", "error", err, "response", response)
	}
}

// broadcastLockEvent broadcasts lock events via NATS
func broadcastLockEvent(rt *realtime.Broker, boardID uuid.UUID, eventType realtime.BoardEventType, noteID, userID uuid.UUID) {
	ctx := context.Background()
	event := realtime.BoardEvent{
		Type: eventType,
		Data: map[string]string{
			"noteId": noteID.String(),
			"userId": userID.String(),
		},
	}

	err := rt.BroadcastToBoard(ctx, boardID, event)
	if err != nil {
		logger.Get().Errorw("failed to broadcast lock event", "eventType", eventType, "noteId", noteID, "error", err)
	}
}
