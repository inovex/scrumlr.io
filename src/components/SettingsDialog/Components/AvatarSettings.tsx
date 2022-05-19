import {useTranslation} from "react-i18next";
import {Avatar, generateRandomProps, AvataaarProps} from "components/Avatar";
import {
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
import {FC, useEffect, useState} from "react";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import {SettingsAccordion} from "./SettingsAccordion";
import {SettingsCarousel} from "./SettingsCarousel";
import "./AvatarSettings.scss";

export interface AvatarSettingsProps {
  id?: string;
}

export const AvatarSettings: FC<AvatarSettingsProps> = ({id}) => {
  const {t} = useTranslation();
  const state = useAppSelector((applicationState) => ({
    participant: applicationState.participants!.self,
  }));

  let initialState = state.participant.user.avatar;
  if (initialState === null || initialState === undefined) {
    initialState = generateRandomProps(id ?? "");
  }

  const [properties, setProperties] = useState<AvataaarProps>(initialState!);

  const updateAvatar = <PropertyKey extends keyof AvataaarProps>(key: PropertyKey, value: AvataaarProps[PropertyKey]) => {
    if (properties && properties[key] !== value) {
      setProperties({...properties, [key]: value});
    }
  };

  useEffect(() => {
    store.dispatch(Actions.editSelf({...state.participant.user, avatar: properties}));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties]);

  const settingGroups: {[key: string]: {values: readonly string[]; key: keyof AvataaarProps}[]} = {
    hair: [
      {values: AVATAR_TOP_TYPES, key: "topType"},
      {values: AVATAR_HAIR_COLORS, key: "hairColor"},
      {values: AVATAR_FACIAL_HAIR_TYPES, key: "facialHairType"},
      {values: AVATAR_FACIAL_HAIR_COLORS, key: "facialHairColor"},
    ],
    facialFeatures: [
      {values: AVATAR_SKIN_COLORS, key: "skinColor"},
      {values: AVATAR_EYEBROW_TYPES, key: "eyebrowType"},
      {values: AVATAR_EYE_TYPES, key: "eyeType"},
      {values: AVATAR_MOUTH_TYPES, key: "mouthType"},
    ],
    clothing: [
      {values: AVATAR_ACCESSORIES_TYPES, key: "accessoriesType"},
      {values: AVATAR_CLOTHE_TYPES, key: "clotheType"},
      {values: AVATAR_CLOTHE_COLORS, key: "clotheColor"},
      {values: AVATAR_GRAPHIC_TYPES, key: "graphicType"},
    ],
  };

  return (
    <>
      <Avatar seed={id ?? ""} avatar={properties} className="avatar-settings__avatar-icon" />
      <div className="avatar-settings__settings">
        {Object.entries(settingGroups).map(([label, props], groupIndex, array) => (
          <>
            <SettingsAccordion label={t(`Avatar.groups.${label}`)} key={label} headerClassName="avatar-settings__settings-group-header">
              <hr className="avatar-settings__settings-group-seperator" />
              <div className="avatar-settings__settings-group">
                {props.map((element, index) => (
                  <>
                    <SettingsCarousel
                      carouselItems={element.values}
                      initialValue={properties[element.key]}
                      onValueChange={(value) => updateAvatar(element.key, value as typeof element.values[number])}
                      key={element.key}
                      localizationPath={`Avatar.${element.key}.`}
                      label={t(`Avatar.${element.key}.label`)}
                      className="avatar-settings__settings-group-item"
                    />
                    {index < props.length - 1 && <hr className="avatar-settings__settings-group-item-seperator" />}
                  </>
                ))}
              </div>
            </SettingsAccordion>
            {groupIndex < array.length - 1 && <hr className="avatar-settings__settings-group-seperator" />}
          </>
        ))}
      </div>
    </>
  );
};
