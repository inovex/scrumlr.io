import {AvataarProps, Avatar} from "components/Avatar";
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
  AVATAR_ACCESSORIES_TYPES,
  AVATAR_CLOTHE_COLORS,
  AVATAR_CLOTHE_TYPES,
  AVATAR_EYEBROW_TYPES,
  AVATAR_EYE_TYPES,
  AVATAR_FACIAL_HAIR_COLORS,
  AVATAR_FACIAL_HAIR_TYPES,
  AVATAR_GRAPHIC_TYPES,
  AVATAR_HAIR_COLORS,
  AVATAR_MOUTH_TYPES,
  AVATAR_SKIN_COLORS,
  AVATAR_TOP_TYPES,
} from "components/Avatar/types";
import {FC, useState} from "react";
import {SettingsAccordion} from "./SettingsAccordion";
import {SettingsCarousel} from "./SettingsCarousel";

export interface AvatarSettingsProps {
  id?: string;
}

export const AvatarSettings: FC<AvatarSettingsProps> = ({id}) => {
  const [properties, setProperties] = useState<AvataarProps>({
    accessoriesType: "Blank",
    clotheColor: "Blue03",
    clotheType: "GraphicShirt",
    eyeType: "EyeRoll",
    eyebrowType: "Angry",
    facialHairColor: "Blonde",
    facialHairType: "BeardMajestic",
    graphicType: "Diamond",
    hairColor: "Red",
    mouthType: "Concerned",
    skinColor: "Tanned",
    topType: "Turban",
  });

  const updateAvatar = <PropertyKey extends keyof AvataarProps>(property: PropertyKey, value: AvataarProps[PropertyKey]) => {
    if (properties[property] !== value) setProperties({...properties, [property]: value});
  };

  return (
    <>
      <Avatar className="profile-settings__avatar-icon" seed={properties} />
      <div className="profile-settings__avatar-selection">
        <SettingsAccordion label="Hair">
          <SettingsCarousel carouselItems={AVATAR_HAIR_COLORS} onValueChange={(value) => updateAvatar("hairColor", value as AvatarHairColor)} />
          <SettingsCarousel carouselItems={AVATAR_EYEBROW_TYPES} onValueChange={(value) => updateAvatar("eyebrowType", value as AvatarEyebrowType)} />
          <SettingsCarousel carouselItems={AVATAR_FACIAL_HAIR_COLORS} onValueChange={(value) => updateAvatar("facialHairColor", value as AvatarFacialHairColor)} />
          <SettingsCarousel carouselItems={AVATAR_FACIAL_HAIR_TYPES} onValueChange={(value) => updateAvatar("facialHairType", value as AvatarFacialHairType)} />
        </SettingsAccordion>
        <SettingsAccordion label="Facial Features">
          <SettingsCarousel carouselItems={AVATAR_SKIN_COLORS} onValueChange={(value) => updateAvatar("skinColor", value as AvatarSkinColor)} />
          <SettingsCarousel carouselItems={AVATAR_EYE_TYPES} onValueChange={(value) => updateAvatar("eyeType", value as AvatarEyeType)} />
          <SettingsCarousel carouselItems={AVATAR_MOUTH_TYPES} onValueChange={(value) => updateAvatar("mouthType", value as AvatarMouthType)} />
        </SettingsAccordion>
        <SettingsAccordion label="Clothes">
          <SettingsCarousel carouselItems={AVATAR_TOP_TYPES} onValueChange={(value) => updateAvatar("topType", value as AvatarTopType)} />
          <SettingsCarousel carouselItems={AVATAR_ACCESSORIES_TYPES} onValueChange={(value) => updateAvatar("accessoriesType", value as AvatarAccessoriesType)} />
          <SettingsCarousel carouselItems={AVATAR_CLOTHE_COLORS} onValueChange={(value) => updateAvatar("clotheColor", value as AvatarClotheColor)} />
          <SettingsCarousel carouselItems={AVATAR_CLOTHE_TYPES} onValueChange={(value) => updateAvatar("clotheType", value as AvatarClotheType)} />
          <SettingsCarousel carouselItems={AVATAR_GRAPHIC_TYPES} onValueChange={(value) => updateAvatar("graphicType", value as AvatarGraphicType)} />
        </SettingsAccordion>
      </div>
    </>
  );
};
