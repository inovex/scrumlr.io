package sessions

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

// BoardSessionRequest is the model for a board session request
type DatabaseBoardSessionRequest struct {
	bun.BaseModel `bun:"table:board_session_requests"`
	Board         uuid.UUID
	User          uuid.UUID
	Name          string
	Status        BoardSessionRequestStatus
	CreatedAt     time.Time
}

// BoardSessionRequestInsert is the model for board session requests inserts
type DatabaseBoardSessionRequestInsert struct {
	bun.BaseModel `bun:"table:board_session_requests"`
	Board         uuid.UUID
	User          uuid.UUID
}

// BoardSessionRequestUpdate is the model for a board session request update
type DatabaseBoardSessionRequestUpdate struct {
	bun.BaseModel `bun:"table:board_session_requests"`
	Board         uuid.UUID
	User          uuid.UUID
	Status        BoardSessionRequestStatus
}
