import {
  AVATAR_ACCESSORIES_TYPES,
  AVATAR_CLOTHE_COLORS,
  AVATAR_CLOTHE_TYPES,
  AVATAR_EYE_TYPES,
  AVATAR_EYEBROW_TYPES,
  AVATAR_FACIAL_HAIR_COLORS,
  AVATAR_FACIAL_HAIR_TYPES,
  AVATAR_GRAPHIC_TYPES,
  AVATAR_HAIR_COLORS,
  AVATAR_MOUTH_TYPES,
  AVATAR_SKIN_COLORS,
  AVATAR_TOP_TYPES,
  AvatarConfig,
} from "../components/Avatar/types";

export const AVATAR_CONFIG: AvatarConfig = {
  hair: [
    {values: AVATAR_TOP_TYPES, key: "topType"},
    {
      values: AVATAR_HAIR_COLORS,
      key: "hairColor",
      disabledOn: {topType: ["NoHair", "Eyepatch", "Hat", "Hijab", "Turban", "WinterHat1", "WinterHat2", "WinterHat3", "WinterHat4", "LongHairFrida", "LongHairShavedSides"]},
    },
    {values: AVATAR_FACIAL_HAIR_TYPES, key: "facialHairType", disabledOn: {topType: ["Hijab"]}},
    {values: AVATAR_FACIAL_HAIR_COLORS, key: "facialHairColor", disabledOn: {topType: ["Hijab"], facialHairType: ["Blank"]}},
  ],
  facialFeatures: [
    {values: AVATAR_SKIN_COLORS, key: "skinColor"},
    {values: AVATAR_EYEBROW_TYPES, key: "eyebrowType"},
    {values: AVATAR_EYE_TYPES, key: "eyeType"},
    {values: AVATAR_MOUTH_TYPES, key: "mouthType"},
  ],
  clothing: [
    {values: AVATAR_ACCESSORIES_TYPES, key: "accessoriesType", disabledOn: {topType: ["Eyepatch"]}},
    {values: AVATAR_CLOTHE_TYPES, key: "clotheType"},
    {values: AVATAR_CLOTHE_COLORS, key: "clotheColor", disabledOn: {clotheType: ["BlazerShirt", "BlazerSweater"]}},
    {
      values: AVATAR_GRAPHIC_TYPES,
      key: "graphicType",
      disabledOn: {clotheType: ["BlazerShirt", "BlazerSweater", "CollarSweater", "Hoodie", "Overall", "ShirtCrewNeck", "ShirtScoopNeck", "ShirtVNeck"]},
    },
  ],
};
