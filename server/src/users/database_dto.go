package users

import (
	"scrumlr.io/server/auth"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

// User model of the application
type DatabaseUser struct {
	bun.BaseModel `bun:"table:users"`
	ID            uuid.UUID `bun:"type:uuid"`
	Avatar        *Avatar   `bun:"type:jsonb,nullzero"`
	Name          string
	AccountType   auth.AccountType
	KeyMigration  *time.Time
	CreatedAt     time.Time
}

// UserInsert the insert type for a new User
type DatabaseUserInsert struct {
	bun.BaseModel `bun:"table:users"`
	Name          string
	AccountType   auth.AccountType
}

type DatabaseUserUpdate struct {
	bun.BaseModel `bun:"table:users"`
	ID            uuid.UUID `bun:"type:uuid"`
	Name          string
	Avatar        *Avatar `bun:"type:jsonb,nullzero"`
}
