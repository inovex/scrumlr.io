package sessions

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
)

type DatabaseBoardSession struct {
	bun.BaseModel     `bun:"table:board_sessions"`
	Board             uuid.UUID
	User              uuid.UUID
	Avatar            *common.Avatar
	Name              string
	ShowHiddenColumns bool
	Connected         bool
	Ready             bool
	RaisedHand        bool
	Role              common.SessionRole
	Banned            bool
	AccountType       common.AccountType
	CreatedAt         time.Time
}

type DatabaseBoardSessionInsert struct {
	bun.BaseModel `bun:"table:board_sessions"`
	Board         uuid.UUID
	User          uuid.UUID
	Role          common.SessionRole
}

type DatabaseBoardSessionUpdate struct {
	bun.BaseModel     `bun:"table:board_sessions"`
	Board             uuid.UUID
	User              uuid.UUID
	Connected         *bool
	ShowHiddenColumns *bool
	Ready             *bool
	RaisedHand        *bool
	Role              *common.SessionRole
	Banned            *bool
}
