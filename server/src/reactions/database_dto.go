package reactions

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type DatabaseReaction struct {
	bun.BaseModel `bun:"table:reactions,alias:reaction"`
	ID            uuid.UUID
	Note          uuid.UUID
	User          uuid.UUID
	ReactionType  ReactionType
}

type DatabaseReactionInsert struct {
	bun.BaseModel `bun:"table:reactions,alias:reaction"`
	Note          uuid.UUID
	User          uuid.UUID
	ReactionType  ReactionType
}

type DatabaseReactionUpdate struct {
	bun.BaseModel `bun:"table:reactions,alias:reaction"`
	ReactionType  ReactionType
}
