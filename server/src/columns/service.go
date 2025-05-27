package columns

import (
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/database"
	"scrumlr.io/server/database/types"
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
	Color types.Color `json:"color"`

	// The column visibility.
	Visible bool `json:"visible"`

	// The column rank.
	Index int `json:"index"`
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

func (c *Column) From(column database.Column) *Column {
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

func Columns(columns []database.Column) []*Column {
	if columns == nil {
		return nil
	}

	return technical_helper.MapSlice[database.Column, *Column](columns, func(column database.Column) *Column {
		return new(Column).From(column)
	})
}
