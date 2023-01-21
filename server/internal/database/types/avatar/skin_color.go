package avatar

import (
	"encoding/json"

	"github.com/pkg/errors"
)

type SkinColor string

const (
	SkinColorTanned    SkinColor = "Tanned"
	SkinColorYellow    SkinColor = "Yellow"
	SkinColorPale      SkinColor = "Pale"
	SkinColorLight     SkinColor = "Light"
	SkinColorBrown     SkinColor = "Brown"
	SkinColorDarkBrown SkinColor = "DarkBrown"
	SkinColorBlack     SkinColor = "Black"
)

func (skinColor *SkinColor) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	unmarshalledSkinColor := SkinColor(s)
	switch unmarshalledSkinColor {
	case SkinColorTanned, SkinColorYellow, SkinColorPale, SkinColorLight, SkinColorBrown, SkinColorDarkBrown, SkinColorBlack:
		*skinColor = unmarshalledSkinColor
		return nil
	}
	return errors.New("invalid skin color")
}
