package avatar

import (
	"encoding/json"

	"github.com/pkg/errors"
)

type GraphicType string

const (
	GraphicTypeBat          GraphicType = "Bat"
	GraphicTypeCumbia       GraphicType = "Cumbia"
	GraphicTypeDeer         GraphicType = "Deer"
	GraphicTypeDiamond      GraphicType = "Diamond"
	GraphicTypeHola         GraphicType = "Hola"
	GraphicTypePizza        GraphicType = "Pizza"
	GraphicTypeResist       GraphicType = "Resist"
	GraphicTypeSelena       GraphicType = "Selena"
	GraphicTypeBear         GraphicType = "Bear"
	GraphicTypeSkullOutline GraphicType = "SkullOutline"
	GraphicTypeSkull        GraphicType = "Skull"
)

func (graphicType *GraphicType) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	unmarshalledGraphicType := GraphicType(s)
	switch unmarshalledGraphicType {
	case GraphicTypeBat, GraphicTypeCumbia, GraphicTypeDeer, GraphicTypeDiamond, GraphicTypeHola, GraphicTypePizza, GraphicTypeResist, GraphicTypeSelena, GraphicTypeBear, GraphicTypeSkullOutline, GraphicTypeSkull:
		*graphicType = unmarshalledGraphicType
		return nil
	}
	return errors.New("invalid graphic type")
}
