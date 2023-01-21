package avatar

import (
	"encoding/json"

	"github.com/pkg/errors"
)

type MouthType string

const (
	MouthTypeConcerned  MouthType = "Concerned"
	MouthTypeDefault    MouthType = "Default"
	MouthTypeDisbelief  MouthType = "Disbelief"
	MouthTypeEating     MouthType = "Eating"
	MouthTypeGrimace    MouthType = "Grimace"
	MouthTypeSad        MouthType = "Sad"
	MouthTypeScreamOpen MouthType = "ScreamOpen"
	MouthTypeSerious    MouthType = "Serious"
	MouthTypeSmile      MouthType = "Smile"
	MouthTypeTongue     MouthType = "Tongue"
	MouthTypeTwinkle    MouthType = "Twinkle"
	MouthTypeVomit      MouthType = "Vomit"
)

func (mouthType *MouthType) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	MouthType := MouthType(s)
	switch MouthType {
	case MouthTypeConcerned, MouthTypeDefault, MouthTypeDisbelief, MouthTypeEating, MouthTypeGrimace, MouthTypeSad, MouthTypeScreamOpen, MouthTypeSerious, MouthTypeSmile, MouthTypeTongue, MouthTypeTwinkle, MouthTypeVomit:
		*mouthType = MouthType
		return nil
	}
	return errors.New("invalid mouth type")
}
