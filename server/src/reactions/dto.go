package reactions

import (
	"github.com/google/uuid"
)

// Reaction is the response for all reaction requests
type Reaction struct {
	ID           uuid.UUID    `json:"id"`
	Note         uuid.UUID    `json:"note"`
	User         uuid.UUID    `json:"user"`
	ReactionType ReactionType `json:"reactionType"`
}

// ReactionCreateRequest is the struct to use when creating a new reaction
type ReactionCreateRequest struct {
	Board        uuid.UUID    `json:"-"`
	Note         uuid.UUID    `json:"note"`
	User         uuid.UUID    `json:"-"`
	ReactionType ReactionType `json:"reactionType"`
}

// ReactionUpdateTypeRequest is the struct to use when updating the type of the reaction (effectively replacing it)
type ReactionUpdateTypeRequest struct {
	ReactionType ReactionType `json:"reactionType"`
}

func (r *Reaction) From(reaction DatabaseReaction) *Reaction {
	r.ID = reaction.ID
	r.Note = reaction.Note
	r.User = reaction.User
	r.ReactionType = reaction.ReactionType

	return r
}

func Reactions(reactions []DatabaseReaction) []*Reaction {
	if reactions == nil {
		return nil
	}

	list := make([]*Reaction, len(reactions))
	for index, reaction := range reactions {
		list[index] = new(Reaction).From(reaction)
	}

	return list
}
