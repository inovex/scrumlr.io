package database

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Vote struct {
	bun.BaseModel `bun:"table:votes"`
	Board         uuid.UUID
	Voting        uuid.UUID
	User          uuid.UUID
	Note          uuid.UUID
}
