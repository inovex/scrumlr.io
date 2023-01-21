package avatar

import (
	"encoding/json"

	"github.com/pkg/errors"
)

type FacialHairColor string

const (
	FacialHairColorAuburn       FacialHairColor = "Auburn"
	FacialHairColorBlack        FacialHairColor = "Black"
	FacialHairColorBlonde       FacialHairColor = "Blonde"
	FacialHairColorBlondeGolden FacialHairColor = "BlondeGolden"
	FacialHairColorBrown        FacialHairColor = "Brown"
	FacialHairColorBrownDark    FacialHairColor = "BrownDark"
	FacialHairColorPlatinum     FacialHairColor = "Platinum"
	FacialHairColorRed          FacialHairColor = "Red"
)

func (facialHairColor *FacialHairColor) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	unmarshalledFacialHairColor := FacialHairColor(s)
	switch unmarshalledFacialHairColor {
	case FacialHairColorAuburn, FacialHairColorBlack, FacialHairColorBlonde, FacialHairColorBlondeGolden, FacialHairColorBrown, FacialHairColorBrownDark, FacialHairColorPlatinum, FacialHairColorRed:
		*facialHairColor = unmarshalledFacialHairColor
		return nil
	}
	return errors.New("invalid facial hair color")
}
