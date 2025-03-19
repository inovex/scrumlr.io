package users

import (
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/database/types"
)

// User model of the application
type DatabaseUser struct {
	bun.BaseModel `bun:"table:users"`
	ID            uuid.UUID     `bun:"type:uuid"`
	Avatar        *types.Avatar `bun:"type:jsonb,nullzero"`
	Name          string
	AccountType   types.AccountType
	KeyMigration  *time.Time
	CreatedAt     time.Time
}

// UserInsert the insert type for a new User
type DatabaseUserInsert struct {
	bun.BaseModel `bun:"table:users"`
	Name          string
	AccountType   types.AccountType
}

type DatabaseUserUpdate struct {
	bun.BaseModel `bun:"table:users"`
	ID            uuid.UUID `bun:"type:uuid"`
	Name          string
	Avatar        *types.Avatar `bun:"type:jsonb,nullzero"`
}
