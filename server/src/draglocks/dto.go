package draglocks

import "github.com/google/uuid"

type DragLock struct {
	NoteID  uuid.UUID
	UserID  uuid.UUID
	BoardID uuid.UUID
}
