package types

import (
	"encoding/json"
	"errors"
)

type Color string

const (
	ColorBacklogBlue   Color = "backlog-blue"
	ColorGroomingGreen Color = "grooming-green"
	ColorLeanLilac     Color = "lean-lilac"
	ColorOnlineOrange  Color = "online-orange"
	ColorPlanningPink  Color = "planning-pink"
	ColorPokerPurple   Color = "poker-purple"
	ColorRetroRed      Color = "retro-red"
)

func (color *Color) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	unmarshalledColor := Color(s)
	switch unmarshalledColor {
	case ColorBacklogBlue, ColorGroomingGreen, ColorLeanLilac, ColorOnlineOrange, ColorPlanningPink, ColorPokerPurple, ColorRetroRed:
		*color = unmarshalledColor
		return nil
	}
	return errors.New("invalid color")
}
