import Avataar from "avataaars";
import {FC} from "react";
import "./Avatar.scss";
import classNames from "classnames";

const SKIN_COLORS = ["Tanned", "Yellow", "Pale", "Light", "Brown", "DarkBrown", "Black"] as const;
export type AvatarSkinColor = typeof SKIN_COLORS[number];

const TOP_TYPES = [
  "Eyepatch",
  "Hat",
  "Hijab",
  "LongHairBigHair",
  "LongHairBob",
  "LongHairBun",
  "LongHairCurly",
  "LongHairCurvy",
  "LongHairDreads",
  "LongHairFrida",
  "LongHairFro",
  "LongHairFroBand",
  "LongHairMiaWallace",
  "LongHairNotTooLong",
  "LongHairShavedSides",
  "LongHairStraight",
  "LongHairStraight2",
  "LongHairStraightStrand",
  "NoHair",
  "ShortHairDreads01",
  "ShortHairDreads02",
  "ShortHairFrizzle",
  "ShortHairShaggyMullet",
  "ShortHairShortCurly",
  "ShortHairShortFlat",
  "ShortHairShortRound",
  "ShortHairShortWaved",
  "ShortHairSides",
  "ShortHairTheCaesar",
  "ShortHairTheCaesarSidePart",
  "Turban",
  "WinterHat1",
  "WinterHat2",
  "WinterHat3",
  "WinterHat4",
] as const;
export type AvatarTopType = typeof TOP_TYPES[number];

const CLOTHE_COLORS = [
  "Black",
  "Blue01",
  "Blue02",
  "Blue03",
  "Gray01",
  "Gray02",
  "Heather",
  "PastelBlue",
  "PastelGreen",
  "PastelOrange",
  "PastelRed",
  "PastelYellow",
  "Pink",
  "Red",
  "White",
];
export type AvatarClotheColor = typeof CLOTHE_COLORS[number];

const GRAPHIC_TYPES = ["Bat", "Cumbia", "Deer", "Diamond", "Hola", "Pizza", "Resist", "Selena", "Bear", "SkullOutline", "Skull"] as const;
export type AvatarGraphicType = typeof GRAPHIC_TYPES[number];

const CLOTHE_TYPES = ["BlazerShirt", "BlazerSweater", "CollarSweater", "GraphicShirt", "Hoodie", "Overall", "ShirtCrewNeck", "ShirtScoopNeck", "ShirtVNeck"] as const;
export type AvatarClotheType = typeof CLOTHE_TYPES[number];

const HAIR_COLORS = ["Auburn", "Black", "Blonde", "BlondeGolden", "Brown", "BrownDark", "PastelPink", "Blue", "Platinum", "Red", "SilverGray"] as const;
export type AvatarHairColor = typeof HAIR_COLORS[number];

const FACIAL_HAIR_COLORS = ["Auburn", "Black", "Blonde", "BlondeGolden", "Brown", "BrownDark", "Platinum", "Red"] as const;
export type AvatarFacialHairColor = typeof FACIAL_HAIR_COLORS[number];

const FACIAL_HAIR_TYPES = ["Blank", "BeardMedium", "BeardLight", "BeardMajestic", "MoustacheFancy", "MoustacheMagnum"] as const;
export type AvatarFacialHairType = typeof FACIAL_HAIR_TYPES[number];

const ACCESSORIES_TYPES = ["Blank", "Kurt", "Prescription01", "Prescription02", "Round", "Sunglasses", "Wayfarers"] as const;
export type AvatarAccessoriesType = typeof ACCESSORIES_TYPES[number];

const EYE_TYPES = ["Close", "Cry", "Default", "Dizzy", "EyeRoll", "Happy", "Hearts", "Side", "Squint", "Surprised", "Wink", "WinkWacky"] as const;
export type AvatarEyeType = typeof EYE_TYPES[number];

const EYEBROW_TYPES = [
  "Angry",
  "AngryNatural",
  "Default",
  "DefaultNatural",
  "FlatNatural",
  "FrownNatural",
  "RaisedExcited",
  "RaisedExcitedNatural",
  "SadConcerned",
  "SadConcernedNatural",
  "UnibrowNatural",
  "UpDown",
  "UpDownNatural",
] as const;
export type AvatarEyebrowType = typeof EYEBROW_TYPES[number];

const MOUTH_TYPES = ["Concerned", "Default", "Disbelief", "Eating", "Grimace", "Sad", "ScreamOpen", "Serious", "Smile", "Tongue", "Twinkle", "Vomit"] as const;
export type AvatarMouthType = typeof MOUTH_TYPES[number];

const hashCode = function (s: string) {
  let h = 0;
  const l = s.length;
  let i = 0;
  if (l > 0) {
    while (i < l) {
      h = ((h << 5) - h + s.charCodeAt(i++)) | 0;
    }
  }
  return h;
};

const generateRandomProps = (seed: string) => {
  const hash = hashCode(seed);

  const skinColor = SKIN_COLORS[hash % SKIN_COLORS.length];
  const topType = TOP_TYPES[hash % TOP_TYPES.length];
  const clotheType = CLOTHE_TYPES[hash % CLOTHE_TYPES.length];
  const clotheColor = CLOTHE_COLORS[hash % CLOTHE_COLORS.length];
  const graphicType = GRAPHIC_TYPES[hash % GRAPHIC_TYPES.length];
  const hairColor = HAIR_COLORS[hash % HAIR_COLORS.length];
  const facialHairColor = FACIAL_HAIR_COLORS[hash % FACIAL_HAIR_COLORS.length];
  const facialHairType = FACIAL_HAIR_COLORS[hash % FACIAL_HAIR_COLORS.length];
  const accessoriesType = ACCESSORIES_TYPES[hash % ACCESSORIES_TYPES.length];
  const eyebrowType = EYEBROW_TYPES[hash % EYEBROW_TYPES.length];
  const eyeType = EYE_TYPES[hash % EYE_TYPES.length];
  const mouthType = MOUTH_TYPES[hash % MOUTH_TYPES.length];

  return {
    skinColor,
    topType,
    clotheType,
    clotheColor,
    graphicType,
    hairColor,
    facialHairType,
    facialHairColor,
    accessoriesType,
    eyebrowType,
    eyeType,
    mouthType,
  };
};

export interface AvatarProps {
  seed?: string;
  className?: string;
  skinColor?: AvatarSkinColor;
  topType?: AvatarTopType;
  clotheColor?: AvatarClotheColor;
  graphicType?: AvatarGraphicType;
  clotheType?: AvatarClotheType;
  hairColor?: AvatarHairColor;
  facialHairColor?: AvatarFacialHairColor;
  facialHairType?: AvatarFacialHairType;
  accessoriesType?: AvatarAccessoriesType;
  eyeType?: AvatarEyeType;
  eyebrowType?: AvatarEyebrowType;
  mouthType?: AvatarMouthType;
}

export const Avatar: FC<AvatarProps> = ({
  seed,
  className,
  skinColor,
  topType,
  clotheColor,
  graphicType,
  clotheType,
  hairColor,
  facialHairColor,
  facialHairType,
  accessoriesType,
  eyebrowType,
  eyeType,
  mouthType,
}) => {
  if (seed) {
    return <Avataar className={classNames("avatar", className)} avatarStyle="Circle" {...generateRandomProps(seed)} />;
  }

  return (
    <Avataar
      className={classNames("avatar", className)}
      avatarStyle="Circle"
      topType={topType}
      accessoriesType={accessoriesType}
      hairColor={hairColor}
      facialHairType={facialHairType}
      facialHairColor={facialHairColor}
      clotheType={clotheType}
      clotheColor={clotheColor}
      graphicType={graphicType}
      eyeType={eyeType}
      eyebrowType={eyebrowType}
      mouthType={mouthType}
      skinColor={skinColor}
    />
  );
};
