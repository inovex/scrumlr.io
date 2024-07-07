package dto

import (
	"github.com/google/uuid"
	"scrumlr.io/server/database"
	"scrumlr.io/server/database/types"
)

type BoardTemplate struct {
	// The board id
	ID uuid.UUID `json:"id"`

	// The board creator
	Creator uuid.UUID `json:"creator"`

	// The board name
	Name *string `json:"name,omitempty"`

	// Description of the board
	Description *string `json:"description"`

	// The access policy
	AccessPolicy types.AccessPolicy `json:"accessPolicy"`

	Passphrase *string `json:"-"`
	Salt       *string `json:"-"`

	// The template columns
	ColumnTemplates []*ColumnTemplate `json:"templateColumns"`
}

func (bt *BoardTemplate) From(board database.BoardTemplate) *BoardTemplate {
	bt.ID = board.ID
	bt.Creator = board.Creator
	bt.Name = board.Name
	bt.Description = board.Description
	bt.AccessPolicy = board.AccessPolicy
	bt.Passphrase = board.Passphrase
	bt.Salt = board.Salt

	return bt
}

// CreateBoardTemplateRequest represents the request to create a new board template.
type CreateBoardTemplateRequest struct {
	// The name of the board.
	Name *string `json:"name"`

	// The user who creates the template
	Creator uuid.UUID `json:"creator"`

	// Description of the board
	Description *string `json:"description"`

	AccessPolicy types.AccessPolicy `json:"accessPolicy"`

	// The passphrase must be set if access policy is defined as by passphrase.
	Passphrase *string `json:"passphrase"`

	// The columns to create for the board.
	Columns []ColumnTemplateRequest `json:"columns"`
}

type BoardTemplateUpdateRequest struct {
	// The board id
	ID uuid.UUID `json:"id"`

	// The board name
	Name *string `json:"name,omitempty"`

	// Description of the board
	Description *string `json:"description"`

	// The access policy
	AccessPolicy types.AccessPolicy `json:"accessPolicy"`

	// The passphrase must be set if access policy is defined as by passphrase.
	Passphrase *string `json:"-"`

	Salt *string `json:"-"`

	// The template columns
	ColumnTemplates []ColumnTemplate `json:"templateColumns"`
}
