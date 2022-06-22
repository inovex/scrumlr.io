package avatar

import (
	"encoding/json"

	"github.com/pkg/errors"
)

type TopType string

const (
	TopTypeEyepatch                   TopType = "Eyepatch"
	TopTypeHat                        TopType = "Hat"
	TopTypeHijab                      TopType = "Hijab"
	TopTypeLongHairBigHair            TopType = "LongHairBigHair"
	TopTypeLongHairBob                TopType = "LongHairBob"
	TopTypeLongHairBun                TopType = "LongHairBun"
	TopTypeLongHairCurly              TopType = "LongHairCurly"
	TopTypeLongHairCurvy              TopType = "LongHairCurvy"
	TopTypeLongHairDreads             TopType = "LongHairDreads"
	TopTypeLongHairFrida              TopType = "LongHairFrida"
	TopTypeLongHairFro                TopType = "LongHairFro"
	TopTypeLongHairFroBand            TopType = "LongHairFroBand"
	TopTypeLongHairMiaWallace         TopType = "LongHairMiaWallace"
	TopTypeLongHairNotTooLong         TopType = "LongHairNotTooLong"
	TopTypeLongHairShavedSides        TopType = "LongHairShavedSides"
	TopTypeLongHairStraight           TopType = "LongHairStraight"
	TopTypeLongHairStraight2          TopType = "LongHairStraight2"
	TopTypeLongHairStraightStrand     TopType = "LongHairStraightStrand"
	TopTypeNoHair                     TopType = "NoHair"
	TopTypeShortHairDreads01          TopType = "ShortHairDreads01"
	TopTypeShortHairDreads02          TopType = "ShortHairDreads02"
	TopTypeShortHairFrizzle           TopType = "ShortHairFrizzle"
	TopTypeShortHairShaggyMullet      TopType = "ShortHairShaggyMullet"
	TopTypeShortHairShortCurly        TopType = "ShortHairShortCurly"
	TopTypeShortHairShortFlat         TopType = "ShortHairShortFlat"
	TopTypeShortHairShortRound        TopType = "ShortHairShortRound"
	TopTypeShortHairShortWaved        TopType = "ShortHairShortWaved"
	TopTypeShortHairSides             TopType = "ShortHairSides"
	TopTypeShortHairTheCaesar         TopType = "ShortHairTheCaesar"
	TopTypeShortHairTheCaesarSidePart TopType = "ShortHairTheCaesarSidePart"
	TopTypeTurban                     TopType = "Turban"
	TopTypeWinterHat1                 TopType = "WinterHat1"
	TopTypeWinterHat2                 TopType = "WinterHat2"
	TopTypeWinterHat3                 TopType = "WinterHat3"
	TopTypeWinterHat4                 TopType = "WinterHat4"
)

func (topType *TopType) UnmarshalJSON(b []byte) error {
	var s string
	err := json.Unmarshal(b, &s)
	if err != nil {
		return err
	}
	TopType := TopType(s)
	switch TopType {
	case TopTypeEyepatch, TopTypeHat, TopTypeHijab, TopTypeLongHairBigHair, TopTypeLongHairBob, TopTypeLongHairBun, TopTypeLongHairCurly, TopTypeLongHairCurvy, TopTypeLongHairDreads, TopTypeLongHairFrida, TopTypeLongHairFro, TopTypeLongHairFroBand, TopTypeLongHairMiaWallace, TopTypeLongHairNotTooLong, TopTypeLongHairShavedSides, TopTypeLongHairStraight, TopTypeLongHairStraight2, TopTypeLongHairStraightStrand, TopTypeNoHair, TopTypeShortHairDreads01, TopTypeShortHairDreads02, TopTypeShortHairFrizzle, TopTypeShortHairShaggyMullet, TopTypeShortHairShortCurly, TopTypeShortHairShortFlat, TopTypeShortHairShortRound, TopTypeShortHairShortWaved, TopTypeShortHairSides, TopTypeShortHairTheCaesar, TopTypeShortHairTheCaesarSidePart, TopTypeTurban, TopTypeWinterHat1, TopTypeWinterHat2, TopTypeWinterHat3, TopTypeWinterHat4:
		*topType = TopType
		return nil
	}
	return errors.New("invalid top type")
}
