package database

import (
	"context"
	"database/sql"
	"github.com/emvi/null"
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
	ColumnsOrder  []uuid.UUID
}

// ColumnWithSortOrder the model for a column and the sort order
type ColumnWithSortOrder struct {
	Column
	ColumnsOrder []uuid.UUID
}

// ColumnInsert the insert model for a new Column
type ColumnInsert struct {
	bun.BaseModel `bun:"table:columns"`
	Board         uuid.UUID
	Name          string
	Color         types.Color
	Visible       sql.NullBool
}

// ColumnUpdate the update model for a new Column
type ColumnUpdate struct {
	bun.BaseModel `bun:"table:columns"`
	ID            uuid.UUID
	Board         uuid.UUID
	Name          sql.NullString
	Color         types.Color
	Visible       sql.NullBool
}

// CreateColumn creates a new column. If index is left out, the column will be added to the end of the list, otherwise
// it will be used to set the position accordingly.
func (d *Database) CreateColumn(board uuid.UUID, name string, color types.Color, visible null.Bool, index null.Int32) (Column, []uuid.UUID, error) {
	column := ColumnInsert{
		Board:   board,
		Name:    name,
		Color:   color,
		Visible: visible.NullBool,
	}

	// insert column first ...
	insertColumnQuery := d.db.NewInsert().Model(&column).Returning("*")
	if !visible.Valid {
		insertColumnQuery.ExcludeColumn("visible")
	}

	// ... then update the columns sort order in the related board
	var c ColumnWithSortOrder
	updateColumnsQuery := d.db.NewUpdate().With("insert_column", insertColumnQuery).Table("boards AS b")
	if index.Valid {
		updateColumnsQuery.Set("columns_order=b.columns_order[:?]||(SELECT id FROM insert_column)||b.columns_order[?:]", index.Int32+1, index.Int32+2)
	} else {
		updateColumnsQuery.Set("columns_order=array_append(b.columns_order, (SELECT id FROM insert_column))")
	}
	_, err := updateColumnsQuery.Returning(
		"(SELECT id FROM insert_column) AS id, "+
			"(SELECT board FROM insert_column) AS board, "+
			"(SELECT name FROM insert_column) AS name, "+
			"(SELECT color FROM insert_column) AS color, "+
			"(SELECT visible FROM insert_column) AS visible, "+
			"columns_order").
		Where("board = ?", column.Board).Exec(common.ContextWithValues(context.Background(), "Database", d, "Board", column.Board), &c)

	return c.Column, c.ColumnsOrder, err
}

// UpdateColumn updates the column and re-orders all indices of the columns if necessary.
func (d *Database) UpdateColumn(board uuid.UUID, id uuid.UUID, name null.String, color types.Color, visible null.Bool, index null.Int32) (Column, []uuid.UUID, error) {
	column := ColumnUpdate{
		ID:      id,
		Board:   board,
		Name:    name.NullString,
		Color:   color,
		Visible: visible.NullBool,
	}

	var c ColumnWithSortOrder
	if index.Valid {
		selectColumnsOrder := d.db.NewSelect().Model(Board{}).Where("board = ?", board).Column("columns_order")
		_, err := d.db.NewUpdate().OmitZero().With("select_columns_order", selectColumnsOrder).Model(&column).Where("id = ?", id).
			Returning("(SELECT columns_order FROM select_columns_order) AS columns_order, *").
			Exec(common.ContextWithValues(context.Background(), "Database", d, "Board", board), &c)

		return c.Column, c.ColumnsOrder, err
	} else {
		// columns order update has to run in a transaction and will otherwise fail
		tx, err := d.db.BeginTx(common.ContextWithValues(context.Background()), &sql.TxOptions{})
		if err != nil {
			return c.Column, c.ColumnsOrder, err
		}
		_, err = tx.NewUpdate().Model(Board{}).Set("columns_order=array_remove(boards.columns_order, ?)", id).Where("board = ?", board).Exec(common.ContextWithValues(context.Background()))
		if err != nil {
			return c.Column, c.ColumnsOrder, err
		}

		selectColumnsOrder := tx.NewUpdate().Table("boards AS b").
			Set("columns_order=b.columns_order[:?]||?::uuid||b.columns_order[?:]", index.Int32+1, id, index.Int32+2).
			Where("b.id = ?", board).Returning("columns_order")

		_, err = tx.NewUpdate().OmitZero().With("select_columns_order", selectColumnsOrder).Model(&column).
			Where("id = ?", id).
			Returning("(SELECT columns_order FROM select_columns_order) AS columns_order, *").
			Exec(common.ContextWithValues(context.Background(), "Database", d, "Board", board), &c)
		return c.Column, c.ColumnsOrder, err
	}
}

// DeleteColumn deletes a column and adapts all indices of the other columns.
func (d *Database) DeleteColumn(board, column uuid.UUID) error {
	deleteColumn := d.db.NewDelete().Where("board = ?", board).Where("column = ?", column).Returning("id, board")
	_, err := d.db.NewUpdate().With("delete_column", deleteColumn).Model(Board{}).
		Set("columns_order=array_remove(boards.columns_order, (SELECT id FROM delete_column)) WHERE id=(SELECT board FROM delete_column)").
		Exec(context.Background(), "Database", d, "Board", board, "Column", column)

	return err
}

// GetColumn returns the column for the specified id.
func (d *Database) GetColumn(board, id uuid.UUID) (Column, []uuid.UUID, error) {
	var column Column
	var columnsOrder []uuid.UUID

	tx, err := d.db.Begin()
	if err != nil {
		return column, columnsOrder, err
	}
	err = tx.NewSelect().Table("boards").Model(columnsOrder).Column("columns_order").Where("board = ?", board).Scan(context.Background())
	if err != nil {
		return column, columnsOrder, err
	}
	err = tx.NewSelect().Model(&column).Where("board = ?", board).Where("id = ?", id).Scan(context.Background())
	if err != nil {
		return column, columnsOrder, err
	}
	err = tx.Commit()

	return column, columnsOrder, err
}

// GetColumns returns all columns for the specified board.
func (d *Database) GetColumns(board uuid.UUID) ([]Column, []uuid.UUID, error) {
	var columns []Column
	var columnsOrder []uuid.UUID

	tx, err := d.db.Begin()
	if err != nil {
		return columns, columnsOrder, err
	}
	err = tx.NewSelect().Table("boards").Model(columnsOrder).Column("columns_order").Where("board = ?", board).Scan(context.Background())
	if err != nil {
		return columns, columnsOrder, err
	}
	err = tx.NewSelect().Model(&columns).Table("columns AS c").Where("board = ?", board).Column("c.*").Join("JOIN boards b ON b.id = c.board").Order("array_position(b.columns_order, c.id)").Scan(context.Background())
	if err != nil {
		return columns, columnsOrder, err
	}
	err = tx.Commit()

	return columns, columnsOrder, err
}
