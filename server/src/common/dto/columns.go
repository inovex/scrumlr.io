package dto

import (
	"github.com/google/uuid"
	"gopkg.in/guregu/null.v4"
	"net/http"
	"scrumlr.io/server/database"
	"scrumlr.io/server/database/types"
)

// Column is the response for all column requests.
type Column struct {
	// The column id.
	ID uuid.UUID `json:"id"`

	// The column name.
	Name string `json:"name"`

	// The column color.
	Color types.Color `json:"color"`

	// The column visibility.
	Visible bool `json:"visible"`
}

type WrappedColumn struct {
	Column       Column      `json:"column"`
	ColumnsOrder []uuid.UUID `json:"columns_order"`
}

type WrappedColumns struct {
	Column       []*Column   `json:"columns"`
	ColumnsOrder []uuid.UUID `json:"columns_order"`
}

func (c *WrappedColumn) From(column database.Column) *WrappedColumn {
	c.Column.ID = column.ID
	c.Column.Name = column.Name
	c.Column.Color = column.Color
	c.Column.Visible = column.Visible
	c.ColumnsOrder = column.ColumnsOrder
	return c
}

func (c *Column) From(column database.Column) *Column {
	c.ID = column.ID
	c.Name = column.Name
	c.Color = column.Color
	c.Visible = column.Visible
	return c
}

func (*Column) Render(_ http.ResponseWriter, _ *http.Request) error {
	return nil
}

func Columns(columns []database.Column) []*Column {
	if columns == nil {
		return nil
	}

	list := make([]*Column, len(columns))
	for index, column := range columns {
		list[index] = new(Column).From(column)
	}
	return list
}

func WrapColumns(columns []database.Column) *WrappedColumns {
	if columns == nil {
		return &WrappedColumns{}
	}

	dtoColumns := make([]*Column, len(columns))
	dtoOrder := make([]uuid.UUID, len(columns))
	for index, column := range columns {
		dtoColumns[index] = new(Column).From(column)
		dtoOrder[index] = column.ID
	}

	return &WrappedColumns{Column: dtoColumns, ColumnsOrder: dtoOrder}
}

// ColumnRequest represents the request to create a new column.
type ColumnRequest struct {

	// The column name to set.
	Name string `json:"name"`

	// The column color to set.
	Color types.Color `json:"color"`

	// Sets whether this column should be visible to regular participants.
	//
	// The default value on creation is 'false'.
	Visible null.Bool `json:"visible"`

	// Sets the index of this column in the sort order.
	Index null.Int `json:"index"`

	Board uuid.UUID `json:"-"`
	User  uuid.UUID `json:"-"`
}

// ColumnUpdateRequest represents the request to update a column.
type ColumnUpdateRequest struct {

	// The column name to set.
	Name null.String `json:"name"`

	// The column color to set.
	Color types.Color `json:"color"`

	// Sets whether this column should be visible to regular participants.
	Visible null.Bool `json:"visible"`

	// Sets the index of this column in the sort order.
	Index null.Int `json:"index"`

	ID    uuid.UUID `json:"-"`
	Board uuid.UUID `json:"-"`
}
