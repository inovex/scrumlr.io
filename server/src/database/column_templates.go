package database

import (
	"context"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/database/types"
)

// Column the model for a column of a board
type ColumnTemplate struct {
	bun.BaseModel `bun:"table:column_templates"`
	ID            uuid.UUID
	BoardTemplate uuid.UUID
	Description   string
	Name          string
	Color         types.Color
	Visible       bool
	Index         int
}

// ColumnInsert the insert model for a new Column
type ColumnTemplateInsert struct {
	bun.BaseModel `bun:"table:column_templates"`
	BoardTemplate uuid.UUID
	Description   string
	Name          string
	Color         types.Color
	Visible       *bool
	Index         *int
}

type ColumnTemplateUpdate struct {
	bun.BaseModel `bun:"table:column_templates"`
	ID            uuid.UUID
	BoardTemplate uuid.UUID
	Description   string
	Name          string
	Color         types.Color
	Visible       bool
	Index         int
}

func (d *Database) GetTemplateColumns(tBoard uuid.UUID) ([]ColumnTemplate, error) {
	var tColumns []ColumnTemplate
	err := d.db.NewSelect().Model(&tColumns).Where("board_template = ?", tBoard).Order("index ASC").Scan(context.Background())
	return tColumns, err

}
