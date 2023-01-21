package avatar

import (
	"encoding/json"

	"github.com/pkg/errors"
)

type HairColor string

const (
	HairColorAuburn       HairColor = "Auburn"
	HairColorBlack        HairColor = "Black"
	HairColorBlonde       HairColor = "Blonde"
	HairColorBlondeGolden HairColor = "BlondeGolden"
	HairColorBrown        HairColor = "Brown"
	HairColorBrownDark    HairColor = "BrownDark"
	HairColorPastelPink   HairColor = "PastelPink"
	HairColorBlue         HairColor = "Blue"
	HairColorPlatinum     HairColor = "Platinum"
	HairColorRed          HairColor = "Red"
	HairColorSilverGray   HairColor = "SilverGray"
)

func (hairColor *HairColor) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	unmarshalledHairColor := HairColor(s)
	switch unmarshalledHairColor {
	case HairColorAuburn, HairColorBlack, HairColorBlonde, HairColorBlondeGolden, HairColorBrown, HairColorBrownDark, HairColorPastelPink, HairColorBlue, HairColorPlatinum, HairColorRed, HairColorSilverGray:
		*hairColor = unmarshalledHairColor
		return nil
	}
	return errors.New("invalid hair color")
}
