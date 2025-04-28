package columns

import (
  "context"
  "fmt"
  "github.com/google/uuid"
  "github.com/uptrace/bun"
  "math"
  "scrumlr.io/server/common"
  "scrumlr.io/server/database"
  "scrumlr.io/server/identifiers"
)

type DB struct {
  db *bun.DB
}

// Column the model for a column of a board

// CreateColumn creates a new column. The index will be set to the highest available or the specified one. All other
// indices will be adopted (increased by 1) to the new index.
func (d *DB) Create(column ColumnInsertDB) (ColumnDB, error) {
  maxIndexSelect := d.db.NewSelect().Model((*ColumnDB)(nil)).ColumnExpr("COUNT(*) as index").Where("board = ?", column.Board)

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
    indexUpdate := d.db.NewUpdate().Model((*ColumnDB)(nil)).Set("index = index+1").Where("index >= ?", newIndex).Where("board = ?", column.Board)
    query = query.With("indexUpdate", indexUpdate)
  }

  var c ColumnDB
  _, err := query.
    With("maxIndexSelect", maxIndexSelect).
    Model(&column).
    Value("index", fmt.Sprintf("LEAST(coalesce((SELECT index FROM \"maxIndexSelect\"),0), %d)", newIndex)).
    Returning("*").
    Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardIdentifier, column.Board), &c)

  return c, err
}

// UpdateColumn updates the column and re-orders all indices of the columns if necessary.
func (d *DB) Update(column ColumnUpdateDB) (ColumnDB, error) {
  newIndex := column.Index
  if column.Index < 0 {
    newIndex = 0
  }

  selectPrevious := d.db.NewSelect().Model((*Column)(nil)).Column("board", "index").Where("id = ?", column.ID).Where("board = ?", column.Board)
  maxIndexSelect := d.db.NewSelect().Model((*Column)(nil)).Column("index").Where("board = ?", column.Board)
  updateOnSmallerIndex := d.db.NewUpdate().
    Model((*Column)(nil)).
    Column("index").
    Set("index = index+1").
    Where("index < (SELECT index FROM \"selectPrevious\")").
    Where("board = ?", column.Board).
    Where("(SELECT index FROM \"selectPrevious\") > ?", newIndex).
    Where("index >= ?", newIndex)
  updateOnGreaterIndex := d.db.NewUpdate().
    Model((*Column)(nil)).
    Column("index").
    Set("index = index-1").
    Where("index > (SELECT index FROM \"selectPrevious\")").
    Where("board = ?", column.Board).
    Where("(SELECT index FROM \"selectPrevious\") < ?", newIndex).
    Where("index <= ?", newIndex)

  var c ColumnDB
  _, err := d.db.NewUpdate().
    With("selectPrevious", selectPrevious).
    With("maxIndexSelect", maxIndexSelect).
    With("updateOnSmallerIndex", updateOnSmallerIndex).
    With("updateOnGreaterIndex", updateOnGreaterIndex).
    Model(&column).
    Value("index", fmt.Sprintf("LEAST((SELECT COUNT(*) FROM \"maxIndexSelect\")-1, %d)", newIndex)).
    Where("id = ?", column.ID).
    Returning("*").
    Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardIdentifier, column.Board), &c)

  return c, err
}

// DeleteColumn deletes a column and adapts all indices of the other columns.
func (d *DB) Delete(board, column, user uuid.UUID) error {
  var columns []ColumnDB
  selectPreviousIndex := d.db.NewSelect().Model((*ColumnDB)(nil)).Column("index", "board").Where("id = ?", column)
  indexUpdate := d.db.NewUpdate().
    With("selectPreviousIndex", selectPreviousIndex).
    Model((*ColumnDB)(nil)).Set("index = index-1").
    Where("board = (SELECT board from \"selectPreviousIndex\")").
    Where("index >= (SELECT index from \"selectPreviousIndex\")")
  boardUpdate := d.db.NewUpdate().
    Model((*database.Board)(nil)).
    Set("shared_note = null").
    Where("id = ? AND (SELECT \"column\" FROM notes WHERE id = (SELECT shared_note FROM boards WHERE id = ?)) = ?", board, board, column)
  _, err := d.db.NewDelete().
    With("boardUpdate", boardUpdate).
    With("indexUpdate", indexUpdate).
    Model((*ColumnDB)(nil)).
    Where("id = ?", column).
    Returning("*").
    Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardIdentifier, board, identifiers.ColumnIdentifier, column, identifiers.UserIdentifier, user, "Result", &columns), &columns)

  return err
}

// GetColumn returns the column for the specified id.
func (d *DB) Get(board, id uuid.UUID) (ColumnDB, error) {
  var column ColumnDB
  err := d.db.NewSelect().Model(&column).Where("board = ?", board).Where("id = ?", id).Scan(context.Background())
  return column, err
}

// GetColumns returns all columns for the specified board.
func (d *DB) GetAll(board uuid.UUID) ([]ColumnDB, error) {
  var columns []ColumnDB
  err := d.db.NewSelect().Model(&columns).Where("board = ?", board).Order("index ASC").Scan(context.Background())
  return columns, err
}

func NewColumnsDatabase(database *bun.DB) ColumnsDatabase {
  db := new(DB)
  db.db = database
  return db
}
