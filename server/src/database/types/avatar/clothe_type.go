package avatar

import (
	"encoding/json"

	"github.com/pkg/errors"
)

type ClotheType string

const (
	ClotheTypeBlazerShirt    ClotheType = "BlazerShirt"
	ClotheTypeBlazerSweater  ClotheType = "BlazerSweater"
	ClotheTypeCollarSweater  ClotheType = "CollarSweater"
	ClotheTypeGraphicShirt   ClotheType = "GraphicShirt"
	ClotheTypeHoodie         ClotheType = "Hoodie"
	ClotheTypeOverall        ClotheType = "Overall"
	ClotheTypeShirtCrewNeck  ClotheType = "ShirtCrewNeck"
	ClotheTypeShirtScoopNeck ClotheType = "ShirtScoopNeck"
	ClotheTypeShirtVNeck     ClotheType = "ShirtVNeck"
)

func (clotheType *ClotheType) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	unmarshalledClotheType := ClotheType(s)
	switch unmarshalledClotheType {
	case ClotheTypeBlazerShirt, ClotheTypeBlazerSweater, ClotheTypeCollarSweater, ClotheTypeGraphicShirt, ClotheTypeHoodie, ClotheTypeOverall, ClotheTypeShirtCrewNeck, ClotheTypeShirtScoopNeck, ClotheTypeShirtVNeck:
		*clotheType = unmarshalledClotheType
		return nil
	}
	return errors.New("invalid clothe type")
}
