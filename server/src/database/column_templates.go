package database

import (
	"context"
	"fmt"
	"math"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/identifiers"
)

// ColumnTemplate the model for a column template of a board template
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

// ColumnTemplateInsert the insert model for a new column template
type ColumnTemplateInsert struct {
	bun.BaseModel `bun:"table:column_templates"`
	BoardTemplate uuid.UUID
	Description   string
	Name          string
	Color         types.Color
	Visible       *bool
	Index         *int
}

// ColumnTemplateUpdated the update model for a new column template
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

// CreateColumnTemplate creates a new column template. The index will be set to the highest available or the specified one. All other
// indices will be adopted (increased by 1) to the new index.
func (d *Database) CreateColumnTemplate(column ColumnTemplateInsert) (ColumnTemplate, error) {
	maxIndexSelect := d.db.NewSelect().Model((*ColumnTemplate)(nil)).ColumnExpr("COUNT(*) as index").Where("board_template = ?", column.BoardTemplate)

	newIndex := math.MaxInt
	if column.Index != nil {
		if *column.Index < 0 {
			newIndex = 0
		} else {
			newIndex = *column.Index
		}
	}

	query := d.db.NewInsert()
	if column.Index != nil {
		indexUpdate := d.db.NewUpdate().Model((*ColumnTemplate)(nil)).Set("index = index+1").Where("index >= ?", newIndex).Where("board = ?", column.BoardTemplate)
		query = query.With("indexUpdate", indexUpdate)
	}

	var c ColumnTemplate
	_, err := query.
		With("maxIndexSelect", maxIndexSelect).
		Model(&column).
		Value("index", fmt.Sprintf("LEAST(coalesce((SELECT index FROM \"maxIndexSelect\"),0), %d)", newIndex)).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardIdentifier, column.BoardTemplate), &c)

	return c, err
}

// GetColumnTemplate returns the column template for the specified id.
func (d *Database) GetColumnTemplate(board, id uuid.UUID) (ColumnTemplate, error) {
	var column ColumnTemplate
	err := d.db.NewSelect().Model(&column).Where("board_template = ?", board).Where("id = ?", id).Scan(context.Background())
	return column, err
}

func (d *Database) ListColumnTemplates(tBoard uuid.UUID) ([]ColumnTemplate, error) {
	var tColumns []ColumnTemplate
	err := d.db.NewSelect().Model(&tColumns).Where("board_template = ?", tBoard).Order("index ASC").Scan(context.Background())
	return tColumns, err
}

// UpdateColumnTemplate updates the column template  and re-orders all indices of the column templates if necessary.
func (d *Database) UpdateColumnTemplate(column ColumnTemplateUpdate) (ColumnTemplate, error) {
	newIndex := column.Index
	if column.Index < 0 {
		newIndex = 0
	}

	selectPrevious := d.db.NewSelect().Model((*ColumnTemplate)(nil)).Column("board_template", "index").Where("id = ?", column.ID).Where("board_template = ?", column.BoardTemplate)
	maxIndexSelect := d.db.NewSelect().Model((*ColumnTemplate)(nil)).Column("index").Where("board_template = ?", column.BoardTemplate)
	updateOnSmallerIndex := d.db.NewUpdate().
		Model((*ColumnTemplate)(nil)).
		Column("index").
		Set("index = index+1").
		Where("index < (SELECT index FROM \"selectPrevious\")").
		Where("board_template = ?", column.BoardTemplate).
		Where("(SELECT index FROM \"selectPrevious\") > ?", newIndex).
		Where("index >= ?", newIndex)
	updateOnGreaterIndex := d.db.NewUpdate().
		Model((*ColumnTemplate)(nil)).
		Column("index").
		Set("index = index-1").
		Where("index > (SELECT index FROM \"selectPrevious\")").
		Where("board_template = ?", column.BoardTemplate).
		Where("(SELECT index FROM \"selectPrevious\") < ?", newIndex).
		Where("index <= ?", newIndex)

	var c ColumnTemplate
	_, err := d.db.NewUpdate().
		With("selectPrevious", selectPrevious).
		With("maxIndexSelect", maxIndexSelect).
		With("updateOnSmallerIndex", updateOnSmallerIndex).
		With("updateOnGreaterIndex", updateOnGreaterIndex).
		Model(&column).
		Value("index", fmt.Sprintf("LEAST((SELECT COUNT(*) FROM \"maxIndexSelect\")-1, %d)", newIndex)).
		Where("id = ?", column.ID).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardIdentifier, column.BoardTemplate), &c)

	return c, err
}

// DeleteColumnTemplate  deletes a column template  and adapts all indices of the other columns.
func (d *Database) DeleteColumnTemplate(board, column, user uuid.UUID) error {
	var columns []ColumnTemplate
	selectPreviousIndex := d.db.NewSelect().Model((*ColumnTemplate)(nil)).Column("index", "board_template").Where("id = ?", column)
	indexUpdate := d.db.NewUpdate().
		With("selectPreviousIndex", selectPreviousIndex).
		Model((*ColumnTemplate)(nil)).Set("index = index-1").
		Where("board_template = (SELECT board_template from \"selectPreviousIndex\")").
		Where("index >= (SELECT index from \"selectPreviousIndex\")")
	_, err := d.db.NewDelete().
		With("indexUpdate", indexUpdate).
		Model((*ColumnTemplate)(nil)).
		Where("id = ?", column).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardIdentifier, board, identifiers.ColumnIdentifier, column, identifiers.UserIdentifier, user, "Result", &columns), &columns)

	return err
}
