package dto

import (
	"github.com/google/uuid"
)

// BoardReaction is the response for all board reaction requests
type BoardReaction struct {
	// The id of the reaction
	ID uuid.UUID `json:"id"`

	// The user who made the reaction
	User uuid.UUID `json:"user"`

	// The type of reaction
	ReactionType string `json:"reactionType"`
}

// BoardReactionCreateRequest is the struct when creating a new board reaction
type BoardReactionCreateRequest struct {

	// The user who made the reaction (from context)
	User uuid.UUID `json:"-"`

	// The type of reaction
	ReactionType string `json:"reactionType"`
}
