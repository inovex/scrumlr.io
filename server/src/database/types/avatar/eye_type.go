package avatar

import (
	"encoding/json"

	"github.com/pkg/errors"
)

type EyeType string

const (
	EyeTypeClose     EyeType = "Close"
	EyeTypeCry       EyeType = "Cry"
	EyeTypeDefault   EyeType = "Default"
	EyeTypeDizzy     EyeType = "Dizzy"
	EyeTypeEyeRoll   EyeType = "EyeRoll"
	EyeTypeHappy     EyeType = "Happy"
	EyeTypeHearts    EyeType = "Hearts"
	EyeTypeSide      EyeType = "Side"
	EyeTypeSquint    EyeType = "Squint"
	EyeTypeSurprised EyeType = "Surprised"
	EyeTypeWink      EyeType = "Wink"
	EyeTypeWinkWacky EyeType = "WinkWacky"
)

func (eyeType *EyeType) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	unmarshalledEyeType := EyeType(s)
	switch unmarshalledEyeType {
	case EyeTypeClose, EyeTypeCry, EyeTypeDefault, EyeTypeDizzy, EyeTypeEyeRoll, EyeTypeHappy, EyeTypeHearts, EyeTypeSide, EyeTypeSquint, EyeTypeSurprised, EyeTypeWink, EyeTypeWinkWacky:
		*eyeType = unmarshalledEyeType
		return nil
	}
	return errors.New("invalid eye type")
}
