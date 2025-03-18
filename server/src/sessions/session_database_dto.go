package sessions

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/database/types"
)

type DatabaseBoardSession struct {
	bun.BaseModel     `bun:"table:board_sessions"`
	Board             uuid.UUID
	User              uuid.UUID
	Avatar            *types.Avatar
	Name              string
	ShowHiddenColumns bool
	Connected         bool
	Ready             bool
	RaisedHand        bool
	Role              SessionRole
	Banned            bool
	AccountType       types.AccountType
	CreatedAt         time.Time
}

type DatabaseBoardSessionInsert struct {
	bun.BaseModel `bun:"table:board_sessions"`
	Board         uuid.UUID
	User          uuid.UUID
	Role          SessionRole
}

type DatabaseBoardSessionUpdate struct {
	bun.BaseModel     `bun:"table:board_sessions"`
	Board             uuid.UUID
	User              uuid.UUID
	Connected         *bool
	ShowHiddenColumns *bool
	Ready             *bool
	RaisedHand        *bool
	Role              *SessionRole
	Banned            *bool
}
