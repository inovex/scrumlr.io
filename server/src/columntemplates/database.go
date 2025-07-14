package columntemplates

import (
	"context"
	"fmt"
	"math"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
)

type DB struct {
	db *bun.DB
}

func NewColumnTemplateDatabase(database *bun.DB) ColumnTemplateDatabase {
	db := new(DB)
	db.db = database

	return db
}

// CreateColumnTemplate creates a new column template. The index will be set to the highest available or the specified one. All other
// indices will be adopted (increased by 1) to the new index.
func (db *DB) Create(column DatabaseColumnTemplateInsert) (DatabaseColumnTemplate, error) {
	maxIndexSelect := db.db.NewSelect().
		Model((*DatabaseColumnTemplate)(nil)).
		ColumnExpr("COUNT(*) as index").
		Where("board_template = ?", column.BoardTemplate)

	newIndex := math.MaxInt
	if column.Index != nil {
		if *column.Index < 0 {
			newIndex = 0
		} else {
			newIndex = *column.Index
		}
	}

	query := db.db.NewInsert()
	if column.Index != nil {
		indexUpdate := db.db.NewUpdate().
			Model((*DatabaseColumnTemplate)(nil)).
			Set("index = index+1").
			Where("index >= ?", newIndex).
			Where("board_template = ?", column.BoardTemplate)
		query = query.With("indexUpdate", indexUpdate)
	}

	var c DatabaseColumnTemplate
	_, err := query.
		With("maxIndexSelect", maxIndexSelect).
		Model(&column).
		Value("index", fmt.Sprintf("LEAST(coalesce((SELECT index FROM \"maxIndexSelect\"),0), %d)", newIndex)).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", db, identifiers.BoardTemplateIdentifier, column.BoardTemplate), &c)

	return c, err
}

// GetColumnTemplate returns the column template for the specified id.
func (db *DB) Get(board, id uuid.UUID) (DatabaseColumnTemplate, error) {
	var column DatabaseColumnTemplate
	err := db.db.NewSelect().
		Model(&column).
		Where("board_template = ?", board).
		Where("id = ?", id).
		Scan(context.Background())

	return column, err
}

func (db *DB) GetAll(board uuid.UUID) ([]DatabaseColumnTemplate, error) {
	var columns []DatabaseColumnTemplate
	err := db.db.NewSelect().
		Model(&columns).
		Where("board_template = ?", board).
		Order("index ASC").
		Scan(context.Background())

	return columns, err
}

// UpdateColumnTemplate updates the column template  and re-orders all indices of the column templates if necessary.
func (db *DB) Update(column DatabaseColumnTemplateUpdate) (DatabaseColumnTemplate, error) {
	newIndex := column.Index
	if column.Index < 0 {
		newIndex = 0
	}

	selectPrevious := db.db.NewSelect().
		Model((*DatabaseColumnTemplate)(nil)).
		Column("board_template", "index").
		Where("id = ?", column.ID).
		Where("board_template = ?", column.BoardTemplate)

	maxIndexSelect := db.db.NewSelect().
		Model((*DatabaseColumnTemplate)(nil)).
		Column("index").
		Where("board_template = ?", column.BoardTemplate)

	updateOnSmallerIndex := db.db.NewUpdate().
		Model((*DatabaseColumnTemplate)(nil)).
		Column("index").
		Set("index = index+1").
		Where("index < (SELECT index FROM \"selectPrevious\")").
		Where("board_template = ?", column.BoardTemplate).
		Where("(SELECT index FROM \"selectPrevious\") > ?", newIndex).
		Where("index >= ?", newIndex)

	updateOnGreaterIndex := db.db.NewUpdate().
		Model((*DatabaseColumnTemplate)(nil)).
		Column("index").
		Set("index = index-1").
		Where("index > (SELECT index FROM \"selectPrevious\")").
		Where("board_template = ?", column.BoardTemplate).
		Where("(SELECT index FROM \"selectPrevious\") < ?", newIndex).
		Where("index <= ?", newIndex)

	var c DatabaseColumnTemplate
	_, err := db.db.NewUpdate().
		With("selectPrevious", selectPrevious).
		With("maxIndexSelect", maxIndexSelect).
		With("updateOnSmallerIndex", updateOnSmallerIndex).
		With("updateOnGreaterIndex", updateOnGreaterIndex).
		Model(&column).
		Value("index", fmt.Sprintf("LEAST((SELECT COUNT(*) FROM \"maxIndexSelect\")-1, %d)", newIndex)).
		Where("id = ?", column.ID).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", db, identifiers.BoardTemplateIdentifier, column.BoardTemplate), &c)

	return c, err
}

// DeleteColumnTemplate  deletes a column template  and adapts all indices of the other columns.
func (db *DB) Delete(board, column uuid.UUID) error {
	var columns []DatabaseColumnTemplate
	selectPreviousIndex := db.db.NewSelect().
		Model((*DatabaseColumnTemplate)(nil)).
		Column("index", "board_template").
		Where("id = ?", column)

	indexUpdate := db.db.NewUpdate().
		With("selectPreviousIndex", selectPreviousIndex).
		Model((*DatabaseColumnTemplate)(nil)).Set("index = index-1").
		Where("board_template = (SELECT board_template from \"selectPreviousIndex\")").
		Where("index >= (SELECT index from \"selectPreviousIndex\")")

	_, err := db.db.NewDelete().
		With("indexUpdate", indexUpdate).
		Model((*DatabaseColumnTemplate)(nil)).
		Where("id = ?", column).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", db, identifiers.BoardTemplateIdentifier, board, identifiers.ColumnTemplateIdentifier, column, "Result", &columns), &columns)

	return err
}
