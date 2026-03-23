import {AccessoriesType, ClotheType, EyebrowType, EyeType, FacialHairType, GraphicType, HairColorName, MouthType, SkinColor, TopType} from "@gamepark/avataaars";
import {AvatarConfig} from "types/avatar";
import ClotheColorName from "@gamepark/avataaars/src/avatar/clothes/ClotheColorName";
import FacialHairColorName from "@gamepark/avataaars/src/avatar/top/facialHair/FacialHairColorName";

const EXCLUDED_TOP_TYPES = [TopType.PrinceCut]; // prince cut skews the whole avatar for some reason

export const AVATAR_SKIN_COLORS = Object.values(SkinColor);
export const AVATAR_TOP_TYPES = Object.values(TopType).filter((type) => !EXCLUDED_TOP_TYPES.includes(type));
export const AVATAR_CLOTHE_COLORS = Object.values(ClotheColorName);
export const AVATAR_GRAPHIC_TYPES = Object.values(GraphicType);
export const AVATAR_CLOTHE_TYPES = Object.values(ClotheType);
export const AVATAR_HAIR_COLORS = Object.values(HairColorName);
export const AVATAR_FACIAL_HAIR_COLORS = Object.values(FacialHairColorName);
export const AVATAR_FACIAL_HAIR_TYPES = Object.values(FacialHairType);
export const AVATAR_ACCESSORIES_TYPES = Object.values(AccessoriesType);
export const AVATAR_EYE_TYPES = Object.values(EyeType);
export const AVATAR_EYEBROW_TYPES = Object.values(EyebrowType);
export const AVATAR_MOUTH_TYPES = Object.values(MouthType);

export const AVATAR_CONFIG: AvatarConfig = {
  hair: [
    {values: AVATAR_TOP_TYPES, key: "topType"},
    {
      values: AVATAR_HAIR_COLORS,
      key: "hairColor",
      disabledOn: {
        topType: [
          TopType.NoHair,
          TopType.Eyepatch,
          TopType.Hat,
          TopType.Hijab,
          TopType.Turban,
          TopType.WinterHat1,
          TopType.WinterHat2,
          TopType.WinterHat3,
          TopType.WinterHat4,
          TopType.LongHairFrida,
          TopType.LongHairShavedSides,
        ],
      },
    },
    {values: AVATAR_FACIAL_HAIR_TYPES, key: "facialHairType", disabledOn: {topType: [TopType.Hijab]}},
    {values: AVATAR_FACIAL_HAIR_COLORS, key: "facialHairColor", disabledOn: {topType: [TopType.Hijab], facialHairType: [FacialHairType.Blank]}},
  ],
  facialFeatures: [
    {values: AVATAR_SKIN_COLORS, key: "skinColor"},
    {values: AVATAR_EYEBROW_TYPES, key: "eyebrowType"},
    {values: AVATAR_EYE_TYPES, key: "eyeType"},
    {values: AVATAR_MOUTH_TYPES, key: "mouthType"},
  ],
  clothing: [
    {values: AVATAR_ACCESSORIES_TYPES, key: "accessoriesType", disabledOn: {topType: [TopType.Eyepatch]}},
    {values: AVATAR_CLOTHE_TYPES, key: "clotheType"},
    {values: AVATAR_CLOTHE_COLORS, key: "clotheColor", disabledOn: {clotheType: [ClotheType.BlazerShirt, ClotheType.BlazerSweater]}},
    {
      values: AVATAR_GRAPHIC_TYPES,
      key: "graphicType",
      disabledOn: {
        clotheType: [
          ClotheType.BlazerShirt,
          ClotheType.BlazerSweater,
          ClotheType.CollarSweater,
          ClotheType.Hoodie,
          ClotheType.Overall,
          ClotheType.ShirtCrewNeck,
          ClotheType.ShirtScoopNeck,
          ClotheType.ShirtVNeck,
        ],
      },
    },
  ],
};
