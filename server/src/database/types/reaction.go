package types

import (
	"encoding/json"
	"errors"
)

type Reaction string

const (
	ReactionThinking    Reaction = "thinking"
	ReactionHeart       Reaction = "heart"
	ReactionLike        Reaction = "like"
	ReactionDislike     Reaction = "dislike"
	ReactionJoy         Reaction = "joy"
	ReactionCelebration Reaction = "celebration"
	ReactionPoop        Reaction = "poop"
)

func (reaction *Reaction) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	unmarshalledReaction := Reaction(s)
	switch unmarshalledReaction {
	case ReactionThinking, ReactionHeart, ReactionLike, ReactionDislike, ReactionJoy, ReactionCelebration, ReactionPoop:
		*reaction = unmarshalledReaction
		return nil
	}
	return errors.New("invalid reaction")
}
