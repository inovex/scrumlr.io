package sessions

import (
	"scrumlr.io/server/auth"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/users"
)

type DatabaseBoardSession struct {
	bun.BaseModel     `bun:"table:board_sessions"`
	Board             uuid.UUID
	User              uuid.UUID
	Avatar            *users.Avatar
	Name              string
	ShowHiddenColumns bool
	Connected         bool
	Ready             bool
	RaisedHand        bool
	Role              SessionRole
	Banned            bool
	AccountType       auth.AccountType
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
