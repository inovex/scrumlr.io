package columns

import (
	"net/http"

	"github.com/google/uuid"
	"scrumlr.io/server/technical_helper"
)

type ColumnSlice []*Column

// Column is the response for all column requests.
type Column struct {

	// The column id.
	ID uuid.UUID `json:"id"`

	// The column name.
	Name string `json:"name"`

	// The column description.
	Description string `json:"description"`

	// The column color.
	Color Color `json:"color"`

	// The column visibility.
	Visible bool `json:"visible"`

	// The column rank.
	Index int `json:"index"`
}

// ColumnRequest represents the request to create a new column.
type ColumnRequest struct {

	// The column name to set.
	Name string `json:"name"`

	// The column description to set.
	Description string `json:"description"`

	// The column color to set.
	Color Color `json:"color"`

	// Sets whether this column should be visible to regular participants.
	//
	// The default value on creation is 'false'.
	Visible *bool `json:"visible"`

	// Sets the index of this column in the sort order.
	Index *int `json:"index"`

	Board uuid.UUID `json:"-"`
	User  uuid.UUID `json:"-"`
}

// ColumnUpdateRequest represents the request to update a column.
type ColumnUpdateRequest struct {

	// The column name to set.
	Name string `json:"name"`

	// The column description to set.
	Description string `json:"description"`

	// The column color to set.
	Color Color `json:"color"`

	// Sets whether this column should be visible to regular participants.
	Visible bool `json:"visible"`

	// Sets the index of this column in the sort order.
	Index int `json:"index"`

	ID    uuid.UUID `json:"-"`
	Board uuid.UUID `json:"-"`
}

func (c ColumnSlice) FilterVisibleColumns() []*Column {
	return technical_helper.Filter[*Column](c, func(column *Column) bool {
		return column.Visible
	})
}

func UnmarshallColumnData(data interface{}) (ColumnSlice, error) {
	columns, err := technical_helper.UnmarshalSlice[Column](data)

	if err != nil {
		return nil, err
	}

	return columns, nil
}

func (c *Column) From(column DatabaseColumn) *Column {
	c.ID = column.ID
	c.Name = column.Name
	c.Description = column.Description
	c.Color = column.Color
	c.Visible = column.Visible
	c.Index = column.Index
	return c
}

func (*Column) Render(_ http.ResponseWriter, _ *http.Request) error {
	return nil
}

func Columns(columns []DatabaseColumn) []*Column {
	if columns == nil {
		return nil
	}

	return technical_helper.MapSlice[DatabaseColumn, *Column](columns, func(column DatabaseColumn) *Column {
		return new(Column).From(column)
	})
}
