package types

import (
	"encoding/json"
	"errors"
)

type Color string

const (
	ColorBacklogBlue    Color = "backlog-blue"
	ColorGoalGreen      Color = "goal-green"
	ColorValueViolet    Color = "value-violet"
	ColorOnlineOrange   Color = "online-orange"
	ColorPlanningPink   Color = "planning-pink"
	ColorPokerPurple    Color = "poker-purple"
	ColorYieldingYellow Color = "yielding-yellow"
)

func (color *Color) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	unmarshalledColor := Color(s)
	switch unmarshalledColor {
	case ColorBacklogBlue, ColorGoalGreen, ColorValueViolet, ColorOnlineOrange, ColorPlanningPink, ColorPokerPurple, ColorYieldingYellow:
		*color = unmarshalledColor
		return nil
	}
	return errors.New("invalid color")
}
