package types

import "scrumlr.io/server/internal/database/types/avatar"

type Avatar struct {
	AccentColorClass string                 `json:"accentColorClass,omitempty"`
	AccessoriesType  avatar.AccessoriesType `json:"accessoriesType,omitempty"`
	ClotheColor      avatar.ClotheColor     `json:"clotheColor,omitempty"`
	ClotheType       avatar.ClotheType      `json:"clotheType,omitempty"`
	EyeType          avatar.EyeType         `json:"eyeType,omitempty"`
	EyebrowType      avatar.EyebrowType     `json:"eyebrowType,omitempty"`
	FacialHairColor  avatar.FacialHairColor `json:"facialHairColor,omitempty"`
	FacialHairType   avatar.FacialHairType  `json:"facialHairType,omitempty"`
	GraphicType      avatar.GraphicType     `json:"graphicType,omitempty"`
	HairColor        avatar.HairColor       `json:"hairColor,omitempty"`
	MouthType        avatar.MouthType       `json:"mouthType,omitempty"`
	SkinColor        avatar.SkinColor       `json:"skinColor,omitempty"`
	TopType          avatar.TopType         `json:"topType,omitempty"`
}
