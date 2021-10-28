export const AVATAR_SKIN_COLORS = ["Tanned", "Yellow", "Pale", "Light", "Brown", "DarkBrown", "Black"] as const;
export type AvatarSkinColor = typeof AVATAR_SKIN_COLORS[number];

export const AVATAR_TOP_TYPES = [
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
export type AvatarTopType = typeof AVATAR_TOP_TYPES[number];

export const AVATAR_CLOTHE_COLORS = [
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
export type AvatarClotheColor = typeof AVATAR_CLOTHE_COLORS[number];

export const AVATAR_GRAPHIC_TYPES = ["Bat", "Cumbia", "Deer", "Diamond", "Hola", "Pizza", "Resist", "Selena", "Bear", "SkullOutline", "Skull"] as const;
export type AvatarGraphicType = typeof AVATAR_GRAPHIC_TYPES[number];

export const AVATAR_CLOTHE_TYPES = ["BlazerShirt", "BlazerSweater", "CollarSweater", "GraphicShirt", "Hoodie", "Overall", "ShirtCrewNeck", "ShirtScoopNeck", "ShirtVNeck"] as const;
export type AvatarClotheType = typeof AVATAR_CLOTHE_TYPES[number];

export const AVATAR_HAIR_COLORS = ["Auburn", "Black", "Blonde", "BlondeGolden", "Brown", "BrownDark", "PastelPink", "Blue", "Platinum", "Red", "SilverGray"] as const;
export type AvatarHairColor = typeof AVATAR_HAIR_COLORS[number];

export const AVATAR_FACIAL_HAIR_COLORS = ["Auburn", "Black", "Blonde", "BlondeGolden", "Brown", "BrownDark", "Platinum", "Red"] as const;
export type AvatarFacialHairColor = typeof AVATAR_FACIAL_HAIR_COLORS[number];

export const AVATAR_FACIAL_HAIR_TYPES = ["Blank", "BeardMedium", "BeardLight", "BeardMajestic", "MoustacheFancy", "MoustacheMagnum"] as const;
export type AvatarFacialHairType = typeof AVATAR_FACIAL_HAIR_TYPES[number];

export const AVATAR_ACCESSORIES_TYPES = ["Blank", "Kurt", "Prescription01", "Prescription02", "Round", "Sunglasses", "Wayfarers"] as const;
export type AvatarAccessoriesType = typeof AVATAR_ACCESSORIES_TYPES[number];

export const AVATAR_EYE_TYPES = ["Close", "Cry", "Default", "Dizzy", "EyeRoll", "Happy", "Hearts", "Side", "Squint", "Surprised", "Wink", "WinkWacky"] as const;
export type AvatarEyeType = typeof AVATAR_EYE_TYPES[number];

export const AVATAR_EYEBROW_TYPES = [
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
export type AvatarEyebrowType = typeof AVATAR_EYEBROW_TYPES[number];

export const AVATAR_MOUTH_TYPES = ["Concerned", "Default", "Disbelief", "Eating", "Grimace", "Sad", "ScreamOpen", "Serious", "Smile", "Tongue", "Twinkle", "Vomit"] as const;
export type AvatarMouthType = typeof AVATAR_MOUTH_TYPES[number];
