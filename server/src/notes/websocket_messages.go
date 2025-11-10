package notes

import (
	"encoding/json"

	"github.com/google/uuid"
)

// WebSocket message types
const (
	WebSocketMessageTypeDragLock = "DRAG_LOCK_MESSAGE"
)

// Drag lock actions
const (
	DragLockActionAcquire = "ACQUIRE"
	DragLockActionRelease = "RELEASE"
)

// WebSocketMessage represents the top-level WebSocket message structure
type WebSocketMessage struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}

// DragLockMessage represents a drag lock WebSocket message
type DragLockMessage struct {
	Action string    `json:"action"`
	NoteID uuid.UUID `json:"noteId"`
}

// DragLockResponse represents a response to a drag lock operation
type DragLockResponse struct {
	Type    string    `json:"type"`
	Action  string    `json:"action"`
	NoteID  uuid.UUID `json:"noteId"`
	Success bool      `json:"success"`
	Error   string    `json:"error,omitempty"`
}
