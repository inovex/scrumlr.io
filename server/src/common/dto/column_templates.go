package dto

import (
	"net/http"

	"github.com/google/uuid"
	"scrumlr.io/server/database"
	"scrumlr.io/server/database/types"
)

// Column is the response for all column template requests.
type ColumnTemplate struct {

	// The column id.
	ID uuid.UUID `json:"id"`

	// The borad template id, that the column is bound to
	BoardTemplate uuid.UUID `json:"board_template"`

	Description string `json:"description"`

	// The column name.
	Name string `json:"name"`

	// The column color.
	Color types.Color `json:"color"`

	// The column visibility.
	Visible bool `json:"visible"`

	// The column rank.
	Index int `json:"index"`
}

func (ct *ColumnTemplate) From(column database.ColumnTemplate) *ColumnTemplate {
	ct.ID = column.ID
	ct.Name = column.Name
	ct.BoardTemplate = column.BoardTemplate
	ct.Description = column.Description
	ct.Color = column.Color
	ct.Visible = column.Visible
	ct.Index = column.Index
	return ct
}

func (*ColumnTemplate) Render(_ http.ResponseWriter, _ *http.Request) error {
	return nil
}

// ColumnRequest represents the request to create a new column.
type ColumnTemplateRequest struct {

	// The column name to set.
	Name string `json:"name"`

	Description string `json:"description"`

	// The column color to set.
	Color types.Color `json:"color"`

	// Sets whether this column should be visible to regular participants.
	//
	// The default value on creation is 'false'.
	Visible *bool `json:"visible"`

	// Sets the index of this column in the sort order.
	Index *int `json:"index"`

	Board uuid.UUID `json:"-"`
	User  uuid.UUID `json:"-"`
}

func ColumnTemplates(columns []database.ColumnTemplate) []*ColumnTemplate {
	if columns == nil {
		return nil
	}

	list := make([]*ColumnTemplate, len(columns))
	for index, column := range columns {
		list[index] = new(ColumnTemplate).From(column)
	}
	return list
}
