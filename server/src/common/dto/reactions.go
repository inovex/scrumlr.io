package dto

import (
	"github.com/google/uuid"
	"scrumlr.io/server/database"
	"scrumlr.io/server/database/types"
)

// Reaction is the response for all reaction requests
type Reaction struct {
	// The id of the reaction
	ID uuid.UUID `json:"id"`

	// The note the reaction corresponds to
	Note uuid.UUID `json:"note"`

	// The user who made the reaction
	User uuid.UUID `json:"user"`

	// The type of reaction
	ReactionType types.Reaction `json:"reactionType"`
}

// ReactionCreateRequest is the struct to use when creating a new reaction
type ReactionCreateRequest struct {
	// The board the reaction corresponds to (from context)
	Board uuid.UUID `json:"-"`

	// The note the reaction corresponds to
	Note uuid.UUID `json:"note"`

	// The user who made the reaction (from context)
	User uuid.UUID `json:"-"`

	// The type of reaction
	ReactionType types.Reaction `json:"reactionType"`
}

// ReactionUpdateTypeRequest is the struct to use when updating the type of the reaction (effectively replacing it)
type ReactionUpdateTypeRequest struct {
	ReactionType types.Reaction `json:"reactionType"`
}

func (r *Reaction) From(reaction database.Reaction) *Reaction {
	r.ID = reaction.ID
	r.Note = reaction.Note
	r.User = reaction.User
	r.ReactionType = reaction.ReactionType

	return r
}

func Reactions(reactions []database.Reaction) []*Reaction {
	if reactions == nil {
		return nil
	}

	list := make([]*Reaction, len(reactions))
	for index, reaction := range reactions {
		list[index] = new(Reaction).From(reaction)
	}

	return list
}
