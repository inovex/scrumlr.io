package avatar

import (
	"encoding/json"

	"github.com/pkg/errors"
)

type ClotheColor string

const (
	ClotheColorBlack        ClotheColor = "Black"
	ClotheColorBlue01       ClotheColor = "Blue01"
	ClotheColorBlue02       ClotheColor = "Blue02"
	ClotheColorBlue03       ClotheColor = "Blue03"
	ClotheColorGray01       ClotheColor = "Gray01"
	ClotheColorGray02       ClotheColor = "Gray02"
	ClotheColorHeather      ClotheColor = "Heather"
	ClotheColorPastelBlue   ClotheColor = "PastelBlue"
	ClotheColorPastelGreen  ClotheColor = "PastelGreen"
	ClotheColorPastelOrange ClotheColor = "PastelOrange"
	ClotheColorPastelRed    ClotheColor = "PastelRed"
	ClotheColorPastelYellow ClotheColor = "PastelYellow"
	ClotheColorPink         ClotheColor = "Pink"
	ClotheColorRed          ClotheColor = "Red"
	ClotheColorWhite        ClotheColor = "White"
)

func (clotheColor *ClotheColor) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	unmarshalledClotheColor := ClotheColor(s)
	switch unmarshalledClotheColor {
	case ClotheColorBlack, ClotheColorBlue01, ClotheColorBlue02, ClotheColorBlue03, ClotheColorGray01, ClotheColorGray02, ClotheColorHeather, ClotheColorPastelBlue, ClotheColorPastelGreen, ClotheColorPastelOrange, ClotheColorPastelRed, ClotheColorPastelYellow, ClotheColorPink, ClotheColorRed, ClotheColorWhite:
		*clotheColor = unmarshalledClotheColor
		return nil
	}
	return errors.New("invalid clothe color")
}
