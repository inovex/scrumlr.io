package dto

import (
	"github.com/google/uuid"
	"scrumlr.io/server/database/types"
)

// ColumnRequest represents the request to create a new column.
type ColumnRequest struct {

	// The column name to set.
	Name string `json:"name"`

	// The column description to set.
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

// ColumnUpdateRequest represents the request to update a column.
type ColumnUpdateRequest struct {

	// The column name to set.
	Name string `json:"name"`

	// The column description to set.
	Description string `json:"description"`

	// The column color to set.
	Color types.Color `json:"color"`

	// Sets whether this column should be visible to regular participants.
	Visible bool `json:"visible"`

	// Sets the index of this column in the sort order.
	Index int `json:"index"`

	ID    uuid.UUID `json:"-"`
	Board uuid.UUID `json:"-"`
}
