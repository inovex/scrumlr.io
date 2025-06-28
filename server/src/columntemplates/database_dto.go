package columntemplates

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/columns"
)

// ColumnTemplate the model for a column template of a board template
type DatabaseColumnTemplate struct {
	bun.BaseModel `bun:"table:column_templates"`
	ID            uuid.UUID
	BoardTemplate uuid.UUID
	Description   string
	Name          string
	Color         columns.Color
	Visible       bool
	Index         int
}

// ColumnTemplateInsert the insert model for a new column template
type DatabaseColumnTemplateInsert struct {
	bun.BaseModel `bun:"table:column_templates"`
	BoardTemplate uuid.UUID
	Description   string
	Name          string
	Color         columns.Color
	Visible       *bool
	Index         *int
}

// ColumnTemplateUpdated the update model for a new column template
type DatabaseColumnTemplateUpdate struct {
	bun.BaseModel `bun:"table:column_templates"`
	ID            uuid.UUID
	BoardTemplate uuid.UUID
	Description   string
	Name          string
	Color         columns.Color
	Visible       bool
	Index         int
}
