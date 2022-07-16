import Avataar from "avataaars";
import React from "react";
import _ from "underscore";
import "./Avatar.scss";
import classNames from "classnames";
import {getColorClassName, getColorForIndex} from "../../constants/colors";
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
} from "./types";

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

export type AvatarProps = {
  seed: string;
  className?: string;
  avatar?: AvataaarProps;
};

/**
 * Generates a fixed hash number for any given string.
 *
 * @param s the string to hash
 * @returns the hash code
 */
const hashCode = (s: string) => {
  let hash = 0;
  const stringLength = s.length;
  let i = 0;
  if (stringLength > 0) {
    while (i < stringLength) {
      // eslint-disable-next-line no-bitwise
      hash = ((hash << 5) - hash + s.charCodeAt(i++)) | 0;
    }
  }
  return Math.abs(hash);
};

/**
 * Generates a set of properties by the specified seed.
 *
 * @param seed the seed will be hashed by the `hashCode` function and define the outcome
 * @returns a set of properties for the `<Avatar />` component
 */
export const generateRandomProps = (seed: string) => {
  const hash = hashCode(seed);

  const hasFacialHair = hash % 4 === 1 || hash % 4 === 2;
  const hasAccessories = hash % 4 === 2 || hash % 4 === 3;

  return {
    accentColorClass: getColorClassName(getColorForIndex(hash)),
    skinColor: AVATAR_SKIN_COLORS[hash % AVATAR_SKIN_COLORS.length],
    topType: AVATAR_TOP_TYPES[hash % AVATAR_TOP_TYPES.length],
    clotheColor: AVATAR_CLOTHE_COLORS[hash % AVATAR_CLOTHE_COLORS.length],
    graphicType: AVATAR_GRAPHIC_TYPES[hash % AVATAR_GRAPHIC_TYPES.length],
    clotheType: AVATAR_CLOTHE_TYPES[hash % AVATAR_CLOTHE_TYPES.length],
    hairColor: AVATAR_HAIR_COLORS[hash % AVATAR_HAIR_COLORS.length],
    facialHairColor: AVATAR_FACIAL_HAIR_COLORS[hash % AVATAR_FACIAL_HAIR_COLORS.length],
    facialHairType: !hasFacialHair ? "Blank" : AVATAR_FACIAL_HAIR_TYPES[hash % AVATAR_FACIAL_HAIR_TYPES.length],
    accessoriesType: !hasAccessories ? "Blank" : AVATAR_ACCESSORIES_TYPES[hash % AVATAR_ACCESSORIES_TYPES.length],
    eyeType: AVATAR_EYE_TYPES[hash % AVATAR_EYE_TYPES.length],
    eyebrowType: AVATAR_EYEBROW_TYPES[hash % AVATAR_EYEBROW_TYPES.length],
    mouthType: AVATAR_MOUTH_TYPES[hash % AVATAR_MOUTH_TYPES.length],
  } as AvataaarProps;
};

/**
 * This component renders an avatar of a person. If the prop `seed` is set the
 * properties for the look will be generated.
 *
 * @param seed The seed will define the set of properties if define.
 * @param className Additional CSS classes
 * @param skinColor the skin color
 * @param topType the style for the top of the head (e.g. a hat or hair)
 * @param clotheColor the clothe color
 * @param graphicType the graphic if the cloth is a graphic shirt
 * @param clotheType the clothe type
 * @param hairColor the hair color
 * @param facialHairColor the facial hair color
 * @param facialHairType the facial hair type
 * @param accessoriesType optional accessories the avatars can have
 * @param eyebrowType the eyebrow type
 * @param eyeType the eye type
 * @param mouthType the mouth type
 */
export const Avatar = React.memo(
  ({className, seed, avatar}: AvatarProps) => {
    if (!avatar) {
      const {accentColorClass, ...avatarProps} = generateRandomProps(seed);
      return <Avataar className={classNames("avatar", className, accentColorClass)} avatarStyle="Circle" {...avatarProps} />;
    }

    return (
      <Avataar
        className={classNames("avatar", className, avatar.accentColorClass)}
        avatarStyle="Circle"
        topType={avatar.topType}
        accessoriesType={avatar.accessoriesType}
        hairColor={avatar.hairColor}
        facialHairType={avatar.facialHairType}
        facialHairColor={avatar.facialHairColor}
        clotheType={avatar.clotheType}
        clotheColor={avatar.clotheColor}
        graphicType={avatar.graphicType}
        eyeType={avatar.eyeType}
        eyebrowType={avatar.eyebrowType}
        mouthType={avatar.mouthType}
        skinColor={avatar.skinColor}
      />
    );
  },
  (prev, next) => prev.seed === next.seed && _.isEqual(prev.avatar, next.avatar)
);
