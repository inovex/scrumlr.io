package columns

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
)

type DB struct {
	db *bun.DB
}

func NewColumnsDatabase(database *bun.DB) ColumnDatabase {
	db := new(DB)
	db.db = database

	return db
}

// Create creates a new column. The index will be set to the highest available or the specified one. All other
// indices will be adopted (increased by 1) to the new index.
func (db *DB) Create(ctx context.Context, column DatabaseColumnInsert) (DatabaseColumn, error) {
	indexUpdate := db.db.NewUpdate().
		Model((*DatabaseColumn)(nil)).
		Set("index = index+1").
		Where("index >= ?", column.Index).
		Where("board = ?", column.Board)

	var c DatabaseColumn
	_, err := db.db.NewInsert().
		Model(&column).
		With("indexUpdate", indexUpdate).
		Returning("*").
		Exec(common.ContextWithValues(ctx, "Database", db, identifiers.BoardIdentifier, column.Board), &c)

	return c, err
}

// Update updates the column and re-orders all indices of the columns if necessary.
func (db *DB) Update(ctx context.Context, column DatabaseColumnUpdate) (DatabaseColumn, error) {
	selectPrevious := db.db.NewSelect().
		Model((*DatabaseColumn)(nil)).
		Column("board", "index").
		Where("id = ?", column.ID).
		Where("board = ?", column.Board)

	maxIndexSelect := db.db.NewSelect().
		Model((*DatabaseColumn)(nil)).
		Column("index").
		Where("board = ?", column.Board)

	updateOnSmallerIndex := db.db.NewUpdate().
		Model((*DatabaseColumn)(nil)).
		Column("index").
		Set("index = index+1").
		Where("index < (SELECT index FROM \"selectPrevious\")").
		Where("board = ?", column.Board).
		Where("(SELECT index FROM \"selectPrevious\") > ?", column.Index).
		Where("index >= ?", column.Index)

	updateOnGreaterIndex := db.db.NewUpdate().
		Model((*DatabaseColumn)(nil)).
		Column("index").
		Set("index = index-1").
		Where("index > (SELECT index FROM \"selectPrevious\")").
		Where("board = ?", column.Board).
		Where("(SELECT index FROM \"selectPrevious\") < ?", column.Index).
		Where("index <= ?", column.Index)

	var c DatabaseColumn
	_, err := db.db.NewUpdate().
		With("selectPrevious", selectPrevious).
		With("maxIndexSelect", maxIndexSelect).
		With("updateOnSmallerIndex", updateOnSmallerIndex).
		With("updateOnGreaterIndex", updateOnGreaterIndex).
		Model(&column).
		Value("index", fmt.Sprintf("LEAST((SELECT COUNT(*) FROM \"maxIndexSelect\")-1, %d)", column.Index)).
		Where("id = ?", column.ID).
		Returning("*").
		Exec(common.ContextWithValues(ctx, "Database", db, identifiers.BoardIdentifier, column.Board), &c)

	return c, err
}

// Delete deletes a column and adapts all indices of the other columns.
func (db *DB) Delete(ctx context.Context, affectedBoard, column uuid.UUID) error {
	var columns []DatabaseColumn
	selectPreviousIndex := db.db.NewSelect().
		Model((*DatabaseColumn)(nil)).
		Column("index", "board").
		Where("id = ?", column)

	indexUpdate := db.db.NewUpdate().
		With("selectPreviousIndex", selectPreviousIndex).
		Model((*DatabaseColumn)(nil)).Set("index = index-1").
		Where("board = (SELECT board from \"selectPreviousIndex\")").
		Where("index >= (SELECT index from \"selectPreviousIndex\")")

	boardUpdate := db.db.NewUpdate().
		Model((*common.DatabaseBoard)(nil)).
		Set("shared_note = null").
		Where("id = ? AND (SELECT \"column\" FROM notes WHERE id = (SELECT shared_note FROM boards WHERE id = ?)) = ?", affectedBoard, affectedBoard, column)

	_, err := db.db.NewDelete().
		With("boardUpdate", boardUpdate).
		With("indexUpdate", indexUpdate).
		Model((*DatabaseColumn)(nil)).
		Where("id = ?", column).
		Returning("*").
		Exec(common.ContextWithValues(ctx, "Database", db, identifiers.BoardIdentifier, affectedBoard, identifiers.ColumnIdentifier, column, "Result", &columns), &columns)

	return err
}

// Get returns the column for the specified id.
func (db *DB) Get(ctx context.Context, board, id uuid.UUID) (DatabaseColumn, error) {
	var column DatabaseColumn
	err := db.db.NewSelect().
		Model(&column).
		Where("board = ?", board).
		Where("id = ?", id).
		Scan(ctx)

	return column, err
}

// GetAll returns all columns for the specified board.
func (db *DB) GetAll(ctx context.Context, board uuid.UUID) ([]DatabaseColumn, error) {
	var columns []DatabaseColumn
	err := db.db.NewSelect().
		Model(&columns).
		Where("board = ?", board).
		Order("index ASC").
		Scan(ctx)

	return columns, err
}

func (db *DB) GetIndex(ctx context.Context, board uuid.UUID) (int, error) {
	return db.db.NewSelect().
		Model((*DatabaseColumn)(nil)).
		Where("board = ?", board).
		Count(ctx)
}
