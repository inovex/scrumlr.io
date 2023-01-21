package avatar

import (
	"encoding/json"

	"github.com/pkg/errors"
)

type FacialHairType string

const (
	FacialHairTypeBlank           FacialHairType = "Blank"
	FacialHairTypeBeardMedium     FacialHairType = "BeardMedium"
	FacialHairTypeBeardLight      FacialHairType = "BeardLight"
	FacialHairTypeBeardMajestic   FacialHairType = "BeardMajestic"
	FacialHairTypeMoustacheFancy  FacialHairType = "MoustacheFancy"
	FacialHairTypeMoustacheMagnum FacialHairType = "MoustacheMagnum"
)

func (facialHairType *FacialHairType) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	unmarshalledFacialHairType := FacialHairType(s)
	switch unmarshalledFacialHairType {
	case FacialHairTypeBlank, FacialHairTypeBeardMedium, FacialHairTypeBeardLight, FacialHairTypeBeardMajestic, FacialHairTypeMoustacheFancy, FacialHairTypeMoustacheMagnum:
		*facialHairType = unmarshalledFacialHairType
		return nil
	}
	return errors.New("invalid facial hair type")
}
