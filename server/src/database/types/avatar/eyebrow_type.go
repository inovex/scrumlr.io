package avatar

import (
	"encoding/json"

	"github.com/pkg/errors"
)

type EyebrowType string

const (
	EyebrowTypeAngry                EyebrowType = "Angry"
	EyebrowTypeAngryNatural         EyebrowType = "AngryNatural"
	EyebrowTypeDefault              EyebrowType = "Default"
	EyebrowTypeDefaultNatural       EyebrowType = "DefaultNatural"
	EyebrowTypeFlatNatural          EyebrowType = "FlatNatural"
	EyebrowTypeFrownNatural         EyebrowType = "FrownNatural"
	EyebrowTypeRaisedExcited        EyebrowType = "RaisedExcited"
	EyebrowTypeRaisedExcitedNatural EyebrowType = "RaisedExcitedNatural"
	EyebrowTypeSadConcerned         EyebrowType = "SadConcerned"
	EyebrowTypeSadConcernedNatural  EyebrowType = "SadConcernedNatural"
	EyebrowTypeUnibrowNatural       EyebrowType = "UnibrowNatural"
	EyebrowTypeUpDown               EyebrowType = "UpDown"
	EyebrowTypeUpDownNatural        EyebrowType = "UpDownNatural"
)

func (eyebrowType *EyebrowType) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	unmarshalledEyebrowType := EyebrowType(s)
	switch unmarshalledEyebrowType {
	case EyebrowTypeAngry, EyebrowTypeAngryNatural, EyebrowTypeDefault, EyebrowTypeDefaultNatural, EyebrowTypeFlatNatural, EyebrowTypeFrownNatural, EyebrowTypeRaisedExcited, EyebrowTypeRaisedExcitedNatural, EyebrowTypeSadConcerned, EyebrowTypeSadConcernedNatural, EyebrowTypeUnibrowNatural, EyebrowTypeUpDown, EyebrowTypeUpDownNatural:
		*eyebrowType = unmarshalledEyebrowType
		return nil
	}
	return errors.New("invalid eyebrow type")
}
