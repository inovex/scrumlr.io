package avatar

import (
	"encoding/json"

	"github.com/pkg/errors"
)

type AccessoriesType string

const (
	AccessoriesTypeBlank          AccessoriesType = "Blank"
	AccessoriesTypeKurt           AccessoriesType = "Kurt"
	AccessoriesTypePrescription01 AccessoriesType = "Prescription01"
	AccessoriesTypePrescription02 AccessoriesType = "Prescription02"
	AccessoriesTypeRound          AccessoriesType = "Round"
	AccessoriesTypeSunglasses     AccessoriesType = "Sunglasses"
	AccessoriesTypeWayfarers      AccessoriesType = "Wayfarers"
)

func (accessoriesType *AccessoriesType) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	unmarshalledAccessoriesType := AccessoriesType(s)
	switch unmarshalledAccessoriesType {
	case AccessoriesTypeBlank, AccessoriesTypeKurt, AccessoriesTypePrescription01, AccessoriesTypePrescription02, AccessoriesTypeRound, AccessoriesTypeSunglasses, AccessoriesTypeWayfarers:
		*accessoriesType = unmarshalledAccessoriesType
		return nil
	}
	return errors.New("invalid accessories type")
}
