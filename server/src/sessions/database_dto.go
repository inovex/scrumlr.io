package sessions

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/role"
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
	Role              role.Role
	Banned            bool
	AccountType       common.AccountType
	CreatedAt         time.Time
}

type DatabaseBoardSessionInsert struct {
	bun.BaseModel `bun:"table:board_sessions"`
	Board         uuid.UUID
	User          uuid.UUID
	Role          role.Role
}

type DatabaseBoardSessionUpdate struct {
	bun.BaseModel     `bun:"table:board_sessions"`
	Board             uuid.UUID
	User              uuid.UUID
	Connected         *bool
	ShowHiddenColumns *bool
	Ready             *bool
	RaisedHand        *bool
	Role              *role.Role
	Banned            *bool
}
