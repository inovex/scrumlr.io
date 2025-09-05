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
	
	// Basic validation: non-empty, max 50 characters
	if len(s) == 0 || len(s) > 50 {
		return errors.New("invalid reaction: must be 1-50 characters")
	}
	
	*reaction = ReactionType(s)
	return nil
}
