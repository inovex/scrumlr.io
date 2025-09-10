package sessions

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
)

// User model of the application
type DatabaseUser struct {
	bun.BaseModel `bun:"table:users"`
	ID            uuid.UUID      `bun:"type:uuid"`
	Avatar        *common.Avatar `bun:"type:jsonb,nullzero"`
	Name          string
	AccountType   common.AccountType
	KeyMigration  *time.Time
	CreatedAt     time.Time
}

// UserInsert the insert type for a new User
type DatabaseUserInsert struct {
	bun.BaseModel `bun:"table:users"`
	Name          string
	AccountType   common.AccountType
}

type DatabaseUserUpdate struct {
	bun.BaseModel `bun:"table:users"`
	ID            uuid.UUID `bun:"type:uuid"`
	Name          string
	Avatar        *common.Avatar `bun:"type:jsonb,nullzero"`
}
