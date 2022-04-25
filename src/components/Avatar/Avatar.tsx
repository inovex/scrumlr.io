import Avataar from "avataaars";
import React from "react";
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

export interface AvataarProps {
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

export interface AvatarProps {
  seed: string | AvataarProps;
  className?: string;
}

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
const generateRandomProps = (seed: string) => {
  const hash = hashCode(seed);
  const avataarProps: AvataarProps = {};
  const props: AvatarProps = {
    seed: {},
  };

  avataarProps.skinColor = AVATAR_SKIN_COLORS[hash % AVATAR_SKIN_COLORS.length];
  avataarProps.topType = AVATAR_TOP_TYPES[hash % AVATAR_TOP_TYPES.length];
  avataarProps.clotheType = AVATAR_CLOTHE_TYPES[hash % AVATAR_CLOTHE_TYPES.length];
  avataarProps.clotheColor = AVATAR_CLOTHE_COLORS[hash % AVATAR_CLOTHE_COLORS.length];
  avataarProps.graphicType = AVATAR_GRAPHIC_TYPES[hash % AVATAR_GRAPHIC_TYPES.length];
  avataarProps.hairColor = AVATAR_HAIR_COLORS[hash % AVATAR_HAIR_COLORS.length];

  const hasFacialHair = hash % 4 === 1 || hash % 4 === 2;
  if (hasFacialHair) {
    avataarProps.facialHairColor = AVATAR_FACIAL_HAIR_COLORS[hash % AVATAR_FACIAL_HAIR_COLORS.length];
    avataarProps.facialHairType = AVATAR_FACIAL_HAIR_TYPES[hash % AVATAR_FACIAL_HAIR_TYPES.length];
  }

  const hasAccessories = hash % 4 === 2 || hash % 4 === 3;
  if (hasAccessories) {
    avataarProps.accessoriesType = AVATAR_ACCESSORIES_TYPES[hash % AVATAR_ACCESSORIES_TYPES.length];
  }

  avataarProps.eyebrowType = AVATAR_EYEBROW_TYPES[hash % AVATAR_EYEBROW_TYPES.length];
  avataarProps.eyeType = AVATAR_EYE_TYPES[hash % AVATAR_EYE_TYPES.length];
  avataarProps.mouthType = AVATAR_MOUTH_TYPES[hash % AVATAR_MOUTH_TYPES.length];

  props.className = getColorClassName(getColorForIndex(hash));
  props.seed = avataarProps;

  return props;
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
  ({seed, className}: AvatarProps) => {
    if (typeof seed === "string") {
      const {className: accentColorClass, ...avatarProps} = generateRandomProps(seed);
      return <Avataar className={classNames("avatar", className, accentColorClass)} avatarStyle="Circle" {...avatarProps.seed} />;
    }

    return (
      <Avataar
        className={classNames("avatar", className)}
        avatarStyle="Circle"
        topType={seed.topType}
        accessoriesType={seed.accessoriesType}
        hairColor={seed.hairColor}
        facialHairType={seed.facialHairType}
        facialHairColor={seed.facialHairColor}
        clotheType={seed.clotheType}
        clotheColor={seed.clotheColor}
        graphicType={seed.graphicType}
        eyeType={seed.eyeType}
        eyebrowType={seed.eyebrowType}
        mouthType={seed.mouthType}
        skinColor={seed.skinColor}
      />
    );
  },
  (prev, next) => prev.seed === next.seed
);
