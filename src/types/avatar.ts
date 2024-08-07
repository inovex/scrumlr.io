import {
  AvatarAccessoriesType,
  AvatarClotheColor,
  AvatarClotheType,
  AvatarEyebrowType,
  AvatarEyeType,
  AvatarFacialHairColor,
  AvatarFacialHairType,
  AvatarGraphicType,
  AvatarHairColor,
  AvatarMouthType,
  AvatarSkinColor,
  AvatarTopType,
} from "constants/avatar";

export interface AvataaarProps {
  // possibly look into separating accentColor from the other properties at some point
  // otherwise don't forget to omit when needed
  accentColorClass: string;
  skinColor: AvatarSkinColor;
  topType: AvatarTopType;
  clotheColor: AvatarClotheColor;
  graphicType: AvatarGraphicType;
  clotheType: AvatarClotheType;
  hairColor: AvatarHairColor;
  facialHairColor: AvatarFacialHairColor;
  facialHairType: AvatarFacialHairType;
  accessoriesType: AvatarAccessoriesType;
  eyeType: AvatarEyeType;
  eyebrowType: AvatarEyebrowType;
  mouthType: AvatarMouthType;
}

export type DisabledOnType = Partial<{[K in keyof AvataaarProps]: AvataaarProps[K][]}>;

export type AvatarGroup = {
  values: ReadonlyArray<string>;
  key: keyof Omit<AvataaarProps, "accentColorClass">;
  disabledOn?: DisabledOnType;
};

export type AvatarConfig = Record<string, ReadonlyArray<AvatarGroup>>;
