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

type DisabledOnType = Partial<Record<keyof AvataaarProps, string[]>>;

type AvatarGroup = {
  values: ReadonlyArray<string>;
  key: keyof AvataaarProps;
  disabledOn?: DisabledOnType;
};

export type AvatarConfig = Record<string, ReadonlyArray<AvatarGroup>>;
