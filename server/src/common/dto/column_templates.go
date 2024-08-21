package dto

import (
	"net/http"

	"github.com/google/uuid"
	"scrumlr.io/server/database"
	"scrumlr.io/server/database/types"
)

// ColumnTemplate is the response for all column template requests.
type ColumnTemplate struct {
	// The column template id.
	ID uuid.UUID `json:"id"`

	// The board template id, that this column template is bound to.
	BoardTemplate uuid.UUID `json:"board_template"`

	// The column template name.
	Name string `json:"name"`

	// The description of a board template column.
	Description string `json:"description"`

	// The column template color.
	Color types.Color `json:"color"`

	// The column template visibility.
	Visible bool `json:"visible"`

	// The column template rank.
	Index int `json:"index"`
}

func (ct *ColumnTemplate) From(column database.ColumnTemplate) *ColumnTemplate {
	ct.ID = column.ID
	ct.BoardTemplate = column.BoardTemplate
	ct.Name = column.Name
	ct.Description = column.Description
	ct.Color = column.Color
	ct.Visible = column.Visible
	ct.Index = column.Index
	return ct
}

func (*ColumnTemplate) Render(_ http.ResponseWriter, _ *http.Request) error {
	return nil
}

// ColumnTemplateRequest represents the request to create a new column template.
type ColumnTemplateRequest struct {
	// The column template name to set.
	Name string `json:"name"`

	// The columnTemplate description to set.
	Description string `json:"description"`

	// The column template color to set.
	Color types.Color `json:"color"`

	// Sets whether this column template should be visible to regular participants.
	// The default value on creation is 'false'.
	Visible *bool `json:"visible"`

	// Sets the index of this column template in the sort order.
	Index *int `json:"index"`

	BoardTemplate uuid.UUID `json:"-"`
	User          uuid.UUID `json:"-"`
}

// ColumnTemplateUpdateRequest represents the request to update a column template.
type ColumnTemplateUpdateRequest struct {
	// The column template name to set.
	Name string `json:"name"`

	// The columnTemplate description to set.
	Description string `json:"description"`

	// The column template color to set.
	Color types.Color `json:"color"`

	// Sets whether this column template should be visible to regular participants.
	Visible bool `json:"visible"`

	// Sets the index of this column template in the sort order.
	Index int `json:"index"`

	ID            uuid.UUID `json:"-"`
	BoardTemplate uuid.UUID `json:"-"`
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
