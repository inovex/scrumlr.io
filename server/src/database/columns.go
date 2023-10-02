package database

import (
	"context"
	"database/sql"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
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
	Index         int
}

// ColumnInsert the insert model for a new Column
type ColumnInsert struct {
	bun.BaseModel `bun:"table:columns"`
	Board         uuid.UUID
	Name          string
	Color         types.Color
	Visible       sql.NullBool
	Index         sql.NullInt64
}

// ColumnUpdate the update model for a new Column
type ColumnUpdate struct {
	bun.BaseModel `bun:"table:columns"`
	ID            uuid.UUID
	Board         uuid.UUID
	Name          sql.NullString
	Color         types.Color
	Visible       sql.NullBool
	Index         sql.NullInt64
}

// CreateColumn creates a new column. The index will be set to the highest available or the specified one. All other
// indices will be adopted (increased by 1) to the new index.
func (d *Database) CreateColumn(column ColumnInsert) (Column, error) {

	// insert column
	insertColumn := d.db.NewInsert().
		Model(&column).
		Returning("*")
	if !column.Visible.Valid {
		insertColumn.ExcludeColumn("visible")
	}
	if !column.Index.Valid {
		insertColumn.ExcludeColumn("index")
	}

	var updateBoardColumns *bun.UpdateQuery
	if !column.Index.Valid {
		// insert column into the order
		updateBoardColumns = d.db.NewUpdate().
			Model((*BoardColumns)(nil)).
			ModelTableExpr("board_columns AS b").
			Set("columns=b.columns[:?]||(SELECT id FROM \"insertColumn\")||b.columns[?:]", column.Index.Int64, column.Index.Int64+1).
			Where("\"board\" = ?", column.Board).
			Returning("columns")
	} else {
		// append column at the end
		updateBoardColumns = d.db.NewUpdate().
			Model((*BoardColumns)(nil)).
			ModelTableExpr("board_columns AS b").
			Set("columns=array_append(b.columns, (SELECT id FROM \"insertColumn\"))").
			Where("\"board\" = ?", column.Board).
			Returning("columns")
	}

	// select the results of the insertion as return result
	selectColumn := d.db.NewSelect().
		Model((*Column)(nil)).
		Table("insertColumn").
		ColumnExpr("*")

	var c Column
	err := selectColumn.
		With("insertColumn", insertColumn).
		With("updateBoardColumns", updateBoardColumns).
		Scan(context.Background(), &c)

	// FIXME ORDER: check effect on realtime server

	return c, err
}

// UpdateColumn updates the column and re-orders all indices of the columns if necessary.
func (d *Database) UpdateColumn(column ColumnUpdate) (Column, error) {
	var c Column

	tx, err := d.db.Begin()
	if err != nil {
		return c, err
	}

	if column.Index.Valid {
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
			Set("columns=b.columns[:?]||?::uuid||b.columns[?:]", column.Index.Int64, column.ID, column.Index.Int64+1).
			Where("\"board\" = ?", column.Board).
			Exec(context.Background())
		if err != nil {
			return c, err
		}
	}

	updateColumn := tx.NewUpdate().
		Model(&column).
		Returning("*").
		Where("id = ?", column.ID)

	if !column.Visible.Valid {
		updateColumn.ExcludeColumn("visible")
	}
	if !column.Name.Valid {
		updateColumn.ExcludeColumn("name")
	}
	if !column.Index.Valid {
		updateColumn.ExcludeColumn("index")
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
func (d *Database) DeleteColumn(board, column, user uuid.UUID) error {

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
	err := d.db.NewSelect().Model(&column).Where("board = ?", board).Where("id = ?", id).Scan(context.Background())
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
