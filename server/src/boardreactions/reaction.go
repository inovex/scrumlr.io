package boardreactions

import (
	"encoding/json"
	"errors"
)

type Reaction string

const (
	Tada     Reaction = "tada"
	Applause Reaction = "applause"
	Heart    Reaction = "heart"
	Like     Reaction = "like"
	Dislike  Reaction = "dislike"
)

func (reaction *Reaction) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}

	unmarshalledReaction := Reaction(s)
	switch unmarshalledReaction {
	case Tada, Applause, Heart, Like, Dislike:
		*reaction = unmarshalledReaction
		return nil
	}

	return errors.New("invalid board reaction")
}
