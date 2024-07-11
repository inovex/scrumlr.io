package dto

import (
	"github.com/google/uuid"
	"scrumlr.io/server/database"
	"scrumlr.io/server/database/types"
)

type BoardTemplate struct {
	// The board template id
	ID uuid.UUID `json:"id"`

	// The board template creator id
	Creator uuid.UUID `json:"creator"`

	// The board template name
	Name *string `json:"name,omitempty"`

	// Description of the board template
	Description *string `json:"description"`

	// The access policy
	AccessPolicy types.AccessPolicy `json:"accessPolicy"`

	// The template columns
	ColumnTemplates []*ColumnTemplate `json:"templateColumns"`
}

func (bt *BoardTemplate) From(board database.BoardTemplate) *BoardTemplate {
	bt.ID = board.ID
	bt.Creator = board.Creator
	bt.Name = board.Name
	bt.Description = board.Description
	bt.AccessPolicy = board.AccessPolicy

	return bt
}

// CreateBoardTemplateRequest represents the request to create a new board template.
type CreateBoardTemplateRequest struct {
	// The name of the board template.
	Name *string `json:"name"`

	// The user who creates the template
	Creator uuid.UUID `json:"creator"`

	// Description of the board template
	Description *string `json:"description"`

	// Access policy of the board template
	AccessPolicy types.AccessPolicy `json:"accessPolicy"`

	// The column templates to create for the board template.
	Columns []ColumnTemplateRequest `json:"columns"`
}

type BoardTemplateUpdateRequest struct {
	// The board template id
	ID uuid.UUID `json:"id"`

	// The board template name
	Name *string `json:"name,omitempty"`

	// Description of the board template
	Description *string `json:"description"`

	// The access policy
	AccessPolicy *types.AccessPolicy `json:"accessPolicy"`

	// The template columns
	ColumnTemplates []ColumnTemplate `json:"templateColumns"`
}
