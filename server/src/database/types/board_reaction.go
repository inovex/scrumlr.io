package types

import (
	"encoding/json"
	"errors"
)

type BoardReaction string

const (
	BoardReactionTada     BoardReaction = "tada"
	BoardReactionApplause BoardReaction = "applause"
	BoardReactionHeart    BoardReaction = "heart"
	BoardReactionLike     BoardReaction = "like"
	BoardReactionDislike  BoardReaction = "dislike"
	BoardReactionStan     BoardReaction = "stan"
)

func (reaction *BoardReaction) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	unmarshalledReaction := BoardReaction(s)
	switch unmarshalledReaction {
	case BoardReactionTada, BoardReactionApplause, BoardReactionHeart, BoardReactionLike, BoardReactionDislike, BoardReactionStan:
		*reaction = unmarshalledReaction
		return nil
	}
	return errors.New("invalid board reaction")
}
