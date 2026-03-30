import {AccessoriesType, ClotheType, EyebrowType, EyeType, FacialHairType, GraphicType, HairColorName, MouthType, SkinColor, TopType} from "@gamepark/avataaars";
import FacialHairColorName from "@gamepark/avataaars/src/avatar/top/facialHair/FacialHairColorName";
import ClotheColorName from "@gamepark/avataaars/src/avatar/clothes/ClotheColorName";
import {Color} from "constants/colors";

export interface AvataaarProps {
  // possibly look into separating accentColor from the other properties at some point
  // otherwise don't forget to omit when needed
  backgroundColor: Color;
  skinColor: SkinColor;
  topType: TopType;
  clotheColor: ClotheColorName;
  graphicType: GraphicType;
  clotheType: ClotheType;
  hairColor: HairColorName;
  facialHairColor: FacialHairColorName;
  facialHairType: FacialHairType;
  accessoriesType: AccessoriesType;
  eyeType: EyeType;
  eyebrowType: EyebrowType;
  mouthType: MouthType;
}

export type DisabledOnType = Partial<{[K in keyof AvataaarProps]: AvataaarProps[K][]}>;

export type AvatarGroup = {
  values: ReadonlyArray<string>;
  key: keyof AvataaarProps;
  disabledOn?: DisabledOnType;
};

export type AvatarConfig = Record<string, ReadonlyArray<AvatarGroup>>;
