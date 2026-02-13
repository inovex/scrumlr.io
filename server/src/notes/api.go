package notes

import (
	"context"
	"encoding/json"

	"github.com/google/uuid"
)

// WebSocketConnection interface for testability
type WebSocketConnection interface {
	WriteJSON(ctx context.Context, v interface{}) error
}

type NotesService interface {
	Create(ctx context.Context, body NoteCreateRequest) (*Note, error)
	Import(ctx context.Context, body NoteImportRequest) (*Note, error)
	Get(ctx context.Context, id uuid.UUID) (*Note, error)
	Update(ctx context.Context, user uuid.UUID, body NoteUpdateRequest) (*Note, error)
	GetAll(ctx context.Context, id uuid.UUID, columns ...uuid.UUID) ([]*Note, error)
	Delete(ctx context.Context, user uuid.UUID, body NoteDeleteRequest) error
	GetStack(ctx context.Context, note uuid.UUID) ([]*Note, error)

	AcquireLock(ctx context.Context, noteID, userID, boardID uuid.UUID) bool
	ReleaseLock(ctx context.Context, noteID, userID, boardID uuid.UUID) bool
	GetLock(ctx context.Context, noteID uuid.UUID) (*DragLock, error)
	IsLocked(ctx context.Context, noteID uuid.UUID) bool

	HandleWebSocketMessage(ctx context.Context, boardID, userID uuid.UUID, conn WebSocketConnection, data json.RawMessage)
}
