package reactions

import (
	"encoding/json"
	"errors"
)

type ReactionType string

const (
	Thinking    ReactionType = "thinking"
	Heart       ReactionType = "heart"
	Like        ReactionType = "like"
	Dislike     ReactionType = "dislike"
	Joy         ReactionType = "joy"
	Celebration ReactionType = "celebration"
	Poop        ReactionType = "poop"
)

func (reaction *ReactionType) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	unmarshalledReaction := ReactionType(s)
	switch unmarshalledReaction {
	case Thinking, Heart, Like, Dislike, Joy, Celebration, Poop:
		*reaction = unmarshalledReaction
		return nil
	}
	return errors.New("invalid reaction")
}
