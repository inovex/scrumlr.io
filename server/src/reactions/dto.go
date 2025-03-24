package reactions

import (
	"encoding/json"
	"errors"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
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

type ReactionType string

type DatabaseReaction struct {
	bun.BaseModel `bun:"table:reactions,alias:reaction"`
	ID            uuid.UUID
	Note          uuid.UUID
	User          uuid.UUID
	ReactionType  ReactionType
}

type DatabaseReactionInsert struct {
	bun.BaseModel `bun:"table:reactions,alias:reaction"`
	Note          uuid.UUID
	User          uuid.UUID
	ReactionType  ReactionType
}

type DatabaseReactionUpdate struct {
	bun.BaseModel `bun:"table:reactions,alias:reaction"`
	ReactionType  ReactionType
}

const (
	ReactionThinking    ReactionType = "thinking"
	ReactionHeart       ReactionType = "heart"
	ReactionLike        ReactionType = "like"
	ReactionDislike     ReactionType = "dislike"
	ReactionJoy         ReactionType = "joy"
	ReactionCelebration ReactionType = "celebration"
	ReactionPoop        ReactionType = "poop"
)

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

func (reaction *ReactionType) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	unmarshalledReaction := ReactionType(s)
	switch unmarshalledReaction {
	case ReactionThinking, ReactionHeart, ReactionLike, ReactionDislike, ReactionJoy, ReactionCelebration, ReactionPoop:
		*reaction = unmarshalledReaction
		return nil
	}
	return errors.New("invalid reaction")
}
