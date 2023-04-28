import {ReactComponent as IconShuffle} from "assets/icon-shuffle.svg";
import classNames from "classnames";
import {AvataaarProps, Avatar, generateRandomProps} from "components/Avatar";
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
import {FC, Fragment, useContext, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import _ from "underscore";
import {SettingsAccordion} from "./SettingsAccordion";
import {SettingsCarousel} from "./SettingsCarousel";
import {SettingsContext} from "../settingsContext";
import "./AvatarSettings.scss";

export interface AvatarSettingsProps {
  id?: string;
  canceled: boolean;
  saved: boolean;
  setCanceled: (value: boolean) => void;
  setSaved: (value: boolean) => void;
}

export const AvatarSettings: FC<AvatarSettingsProps> = ({id, saved, setSaved, canceled, setCanceled}) => {
  const {settings, updateSettings} = useContext(SettingsContext);
  const {t} = useTranslation();
  const state = useAppSelector((applicationState) => ({
    participant: applicationState.participants!.self,
  }));
  let initialState = state.participant.user.avatar;
  if (initialState === null || initialState === undefined) {
    initialState = generateRandomProps(id ?? "");
  }
  const unsavedAvatar = settings?.profile?.unsavedAvatarChanges;
  const [properties, setProperties] = useState<AvataaarProps>(unsavedAvatar || initialState!);
  const [openAccordionIndex, setOpenAccordionIndex] = useState(-1);

  const changeAvatarSettings = <PropertyKey extends keyof AvataaarProps>(key: PropertyKey, value: AvataaarProps[PropertyKey]) => {
    if (properties && properties[key] !== value) {
      setProperties({...properties, [key]: value});
    }
  };

  const updateAvatar = () => {
    store.dispatch(Actions.editSelf({...state.participant.user, avatar: properties}));
    updateSettings({...settings, profile: {unsavedAvatarChanges: undefined}});
  };

  const handleAccordionOpen = (index: number) => {
    if (openAccordionIndex === index) setOpenAccordionIndex(-1);
    else setOpenAccordionIndex(index);
  };

  useEffect(() => {
    if (!_.isEqual(properties, initialState)) {
      updateSettings({...settings, profile: {unsavedAvatarChanges: properties}});
    }
    if (settings?.profile?.unsavedAvatarChanges && _.isEqual(properties, initialState)) {
      updateSettings({...settings, profile: {unsavedAvatarChanges: undefined}});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties]);

  useEffect(() => {
    if (saved) {
      updateAvatar();
      setSaved(false);
    }
    if (canceled) {
      updateSettings({...settings, profile: {unsavedAvatarChanges: undefined}});
      setProperties(initialState!);
      setCanceled(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saved, canceled]);

  const settingGroups: {[key: string]: {values: readonly string[]; key: keyof AvataaarProps; disabledOn?: {[key in keyof Partial<AvataaarProps>]: string[]}}[]} = {
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

  return (
    <>
      <div className="avatar-settings__avatar">
        <Avatar seed={id ?? ""} avatar={properties} className="avatar-settings__avatar-icon" />
        <button className="avatar-settings__avatar-shuffle" onClick={() => setProperties(generateRandomProps(Math.random().toString(36).slice(2)))}>
          <IconShuffle />
        </button>
      </div>
      <div className="avatar-settings__settings-wrapper">
        <div className="avatar-settings__settings">
          {Object.entries(settingGroups).map(([label, props], groupIndex, array) => (
            <Fragment key={label}>
              <SettingsAccordion
                label={t(`Avatar.groups.${label}`)}
                isOpen={groupIndex === openAccordionIndex}
                onClick={() => handleAccordionOpen(groupIndex)}
                headerClassName="avatar-settings__settings-group-header"
              >
                <hr className="avatar-settings__settings-group-seperator" />
                <div className="avatar-settings__settings-group">
                  {props.map((element, index) => {
                    const isDisabled =
                      element.disabledOn &&
                      Object.entries(element.disabledOn)
                        .map(([key, value]) => Object.hasOwnProperty.call(properties, key) && value.some((val) => properties[key].indexOf(val) >= 0))
                        .some((val) => val);

                    return (
                      <Fragment key={element.key}>
                        <SettingsCarousel
                          carouselItems={element.values}
                          currentValue={properties[element.key]}
                          onValueChange={(value) => changeAvatarSettings(element.key, value as (typeof element.values)[number])}
                          disabled={isDisabled}
                          localizationPath={`Avatar.${element.key}.`}
                          label={t(`Avatar.${element.key}.label`)}
                          className={classNames("avatar-settings__settings-group-item", {disabled: isDisabled})}
                        />
                        {index < props.length - 1 && <hr className="avatar-settings__settings-group-item-seperator" />}
                      </Fragment>
                    );
                  })}
                </div>
              </SettingsAccordion>
              {groupIndex < array.length - 1 && <hr className="avatar-settings__settings-group-seperator" />}
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );
};
