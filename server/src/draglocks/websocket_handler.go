package draglocks

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/logger"
)

// WebSocketConnection interface for testability
type WebSocketConnection interface {
	WriteJSON(ctx context.Context, v interface{}) error
}

type DragLockService interface {
	AcquireLock(ctx context.Context, noteID, userID, boardID uuid.UUID) bool
	ReleaseLock(ctx context.Context, noteID, userID, boardID uuid.UUID) bool
	GetLock(ctx context.Context, noteID uuid.UUID) (*DragLock, error)
	IsLocked(ctx context.Context, noteID uuid.UUID) bool
}

type DragLockMessageHandler struct {
	service DragLockService
}

func NewDragLockMessageHandler(draglockService DragLockService) *DragLockMessageHandler {
	handler := new(DragLockMessageHandler)
	handler.service = draglockService

	return handler
}

// HandleWebSocketMessage processes a drag lock WebSocket message
func (handler *DragLockMessageHandler) HandleWebSocketMessage(ctx context.Context, boardID, userID uuid.UUID, conn WebSocketConnection, data json.RawMessage) {
	ctx, span := tracer.Start(ctx, "scrumlr.draglock.handler.acquire")
	defer span.End()
	log := logger.FromContext(ctx)

	var message DragLockMessage
	if err := json.Unmarshal(data, &message); err != nil {
		span.SetStatus(codes.Error, "failed to unmarschal lock message")
		span.RecordError(err)
		log.Errorw("failed to unmarshal drag lock message", "error", err, "data", string(data))
		response := DragLockResponse{
			Type:    WebSocketMessageTypeDragLock,
			Action:  "ERROR",
			Success: false,
			Error:   "Invalid message format",
		}
		if err := conn.WriteJSON(ctx, response); err != nil {
			log.Errorw("failed to send drag lock response", "error", err, "response", response)
		}
		return
	}

	switch message.Action {
	case DragLockActionAcquire:
		handler.handleAcquire(ctx, message.NoteID, boardID, userID, conn)
	case DragLockActionRelease:
		handler.handleRelease(ctx, message.NoteID, boardID, userID, conn)
	default:
		log.Warnw("unknown drag lock action", "action", message.Action, "userId", userID)
		response := DragLockResponse{
			Type:    WebSocketMessageTypeDragLock,
			Action:  message.Action,
			NoteID:  message.NoteID,
			Success: false,
			Error:   "Unknown action",
		}
		if err := conn.WriteJSON(ctx, response); err != nil {
			log.Errorw("failed to send drag lock response", "error", err, "response", response)
		}
	}
}

// handleAcquire processes a drag lock acquisition request
func (handler *DragLockMessageHandler) handleAcquire(ctx context.Context, noteID, boardID, userID uuid.UUID, conn WebSocketConnection) {
	ctx, span := tracer.Start(ctx, "scrumlr.draglock.handler.acquire")
	defer span.End()
	log := logger.FromContext(ctx)

	success := handler.service.AcquireLock(ctx, noteID, userID, boardID)

	response := DragLockResponse{
		Type:    WebSocketMessageTypeDragLock,
		Action:  DragLockActionAcquire,
		NoteID:  noteID,
		Success: success,
	}

	if !success {
		response.Error = "Note is currently being dragged by another user"
	}

	if err := conn.WriteJSON(ctx, response); err != nil {
		log.Errorw("failed to send drag lock response", "error", err, "response", response)
	}
}

// handleRelease processes a drag lock release request
func (handler *DragLockMessageHandler) handleRelease(ctx context.Context, noteID, boardID, userID uuid.UUID, conn WebSocketConnection) {
	ctx, span := tracer.Start(ctx, "scrumlr.draglock.handler.release")
	defer span.End()
	log := logger.FromContext(ctx)

	success := handler.service.ReleaseLock(ctx, noteID, userID, boardID)

	response := DragLockResponse{
		Type:    WebSocketMessageTypeDragLock,
		Action:  DragLockActionRelease,
		NoteID:  noteID,
		Success: success,
	}

	if !success {
		response.Error = "Lock not owned by user or already released"
	}

	if err := conn.WriteJSON(ctx, response); err != nil {
		log.Errorw("failed to send drag lock response", "error", err, "response", response)
	}
}
