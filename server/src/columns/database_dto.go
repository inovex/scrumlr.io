package columns

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/database/types"
)

// Column the model for a column of a board
type DatabaseColumn struct {
	bun.BaseModel `bun:"table:columns"`
	ID            uuid.UUID
	Board         uuid.UUID
	Name          string
	Description   string
	Color         types.Color
	Visible       bool
	Index         int
}

// ColumnInsert the insert model for a new Column
type DatabaseColumnInsert struct {
	bun.BaseModel `bun:"table:columns"`
	Board         uuid.UUID
	Name          string
	Description   string
	Color         types.Color
	Visible       *bool
	Index         *int
}

// ColumnUpdate the update model for a new Column
type DatabaseColumnUpdate struct {
	bun.BaseModel `bun:"table:columns"`
	ID            uuid.UUID
	Board         uuid.UUID
	Name          string
	Description   string
	Color         types.Color
	Visible       bool
	Index         int
}
