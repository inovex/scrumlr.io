package database

import (
	"context"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/database/types"
)

// Column the model for a column of a board
type Column struct {
	bun.BaseModel `bun:"table:columns"`
	ID            uuid.UUID
	Board         uuid.UUID
	Name          string
	Color         types.Color
	Visible       bool
	ColumnsOrder  []uuid.UUID `bun:",array"`
}

// ColumnInsert the insert model for a new Column
type ColumnInsert struct {
	bun.BaseModel `bun:"table:columns"`
	Board         uuid.UUID
	Name          string
	Color         types.Color
	Visible       *bool
}

// ColumnUpdate the update model for a new Column
type ColumnUpdate struct {
	bun.BaseModel `bun:"table:columns"`
	ID            uuid.UUID
	Board         uuid.UUID
	Name          *string
	Color         *types.Color
	Visible       *bool
}

// CreateColumn creates a new column. The index will be set to the highest available or the specified one. All other
// indices will be adopted (increased by 1) to the new index.
func (d *Database) CreateColumn(column ColumnInsert, index *int) (Column, error) {

	// insert column
	insertColumn := d.db.NewInsert().Model(&column).Returning("*")
	if column.Visible == nil {
		insertColumn.ExcludeColumn("visible")
	}

	// append or set index, depending on the specified parameter
	updateBoardColumns := d.db.NewUpdate().Model((*BoardColumns)(nil)).ModelTableExpr("board_columns AS b")
	if index == nil {
		updateBoardColumns.Set("columns=array_append(b.columns, (SELECT id FROM \"insertColumn\"))")
	} else {
		updateBoardColumns.Set("columns=b.columns[:?]||(SELECT id FROM \"insertColumn\")||b.columns[?:]", *index, *index+1)
	}
	updateBoardColumns.Where("\"board\" = ?", column.Board).Returning("columns")

	// select the results of the insertion as return result
	selectColumn := d.db.NewSelect().Model((*Column)(nil)).ModelTableExpr("\"insertColumn\" AS c").
		ColumnExpr("c.*, (SELECT columns FROM \"updateBoardColumns\") AS columns_order")

	var c Column
	err := selectColumn.
		With("insertColumn", insertColumn).
		With("updateBoardColumns", updateBoardColumns).
		Scan(common.ContextWithValues(context.Background(), "Insert", true), &c)

	return c, err
}

// UpdateColumn updates the column and re-orders all indices of the columns if necessary.
func (d *Database) UpdateColumn(column ColumnUpdate, index *int) (Column, error) {
	var c Column

	tx, err := d.db.Begin()
	if err != nil {
		return c, err
	}

	if index != nil {
		_, err = tx.NewUpdate().
			Model((*BoardColumns)(nil)).
			ModelTableExpr("board_columns AS b").
			Set("columns=array_remove(b.columns, ?)", column.ID).
			Where("board = ?", column.Board).
			Exec(context.Background())
		if err != nil {
			return c, err
		}

		_, err = tx.NewUpdate().
			Model((*BoardColumns)(nil)).
			ModelTableExpr("board_columns AS b").
			Set("columns=b.columns[:?]||?::uuid||b.columns[?:]", *index, column.ID, *index+1).
			Where("\"board\" = ?", column.Board).
			Exec(context.Background())
		if err != nil {
			return c, err
		}
	}

	updateColumn := tx.NewUpdate().
		Model(&column).
		ModelTableExpr("columns AS c").
		Returning("c.*, (SELECT columns FROM board_columns WHERE board = ?) AS columns_order", column.Board).
		Where("c.id = ?", column.ID)

	if column.Visible == nil {
		updateColumn.ExcludeColumn("visible")
	}
	if column.Name == nil {
		updateColumn.ExcludeColumn("name")
	}

	_, err = updateColumn.Exec(context.Background(), &c)
	if err != nil {
		return c, err
	}

	err = tx.Commit()

	// FIXME ORDER: check effect on realtime server
	// FIXME ORDER: return of err doesn't log

	return c, err
}

// DeleteColumn deletes a column and adapts all indices of the other columns.
func (d *Database) DeleteColumn(board, column uuid.UUID) error {

	deleteColumn := d.db.NewDelete().
		Model((*Column)(nil)).
		Where("id = ?", column).
		Where("board = ?", board)

	updateColumnOrder := d.db.NewUpdate().
		Model((*BoardColumns)(nil)).
		ModelTableExpr("board_columns AS c").
		Set("columns=array_remove(c.columns, ?)", column).
		Where("board = ?", board)

	_, err := updateColumnOrder.
		With("deleteColumn", deleteColumn).
		Exec(context.Background())

	// FIXME ORDER: check effect on realtime server

	return err
}

// GetColumn returns the column for the specified id.
func (d *Database) GetColumn(board, id uuid.UUID) (Column, error) {
	var column Column
	err := d.db.NewSelect().
		Model(&column).
		ModelTableExpr("columns AS c").
		ColumnExpr("c.*, (SELECT columns FROM board_columns WHERE board = ?) AS columns_order", board).
		Where("c.board = ?", board).
		Where("c.id = ?", id).
		Scan(context.Background())
	return column, err
}

// GetColumns returns all columns for the specified board.
func (d *Database) GetColumns(board uuid.UUID) ([]Column, error) {
	var columns []Column
	err := d.db.NewSelect().
		Model(&columns).
		ModelTableExpr("columns AS c").
		Column("c.*").
		Join("JOIN board_columns AS b ON b.board=c.board").
		Where("c.board = ?", board).
		OrderExpr("array_position(b.columns, c.id)").
		Scan(context.Background())
	return columns, err
}
