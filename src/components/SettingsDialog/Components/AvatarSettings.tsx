import {ReactComponent as IconShuffle} from "assets/icon-shuffle.svg";
import {ReactComponent as IconEdit} from "assets/icon-edit.svg";
import {ReactComponent as IconDone} from "assets/icon-done.svg";
import {ReactComponent as IconClose} from "assets/icon-close.svg";
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
import {FC, Fragment, useMemo, useState} from "react";
import {useTranslation} from "react-i18next";
import store, {useAppSelector} from "store";
import {Actions} from "store/action";
import "./AvatarSettings.scss";
import {isEqual} from "underscore";
import {useBlocker} from "react-router";
import {ConfirmationDialog} from "components/ConfirmationDialog";
import {SettingsAccordion} from "./SettingsAccordion";
import {SettingsCarousel} from "./SettingsCarousel";

export interface AvatarSettingsProps {
  id?: string;
}

export const AvatarSettings: FC<AvatarSettingsProps> = ({id}) => {
  const {t} = useTranslation();
  const participantSelf = useAppSelector((applicationState) => applicationState.participants!.self);

  const [currentProperties, setCurrentProperties] = useState<AvataaarProps>(participantSelf.user.avatar ?? generateRandomProps(id ?? ""));
  const [newProperties, setNewProperties] = useState<AvataaarProps>(currentProperties);
  const havePropertiesChanged = useMemo(() => !isEqual(currentProperties, newProperties), [currentProperties, newProperties]);

  const [openAccordionIndex, setOpenAccordionIndex] = useState(-1);

  const updateAvatar = <PropertyKey extends keyof AvataaarProps>(key: PropertyKey, value: AvataaarProps[PropertyKey]) => {
    if (newProperties && newProperties[key] !== value) {
      setNewProperties({...newProperties, [key]: value});
    }
  };

  const handleAccordionOpen = (index: number) => {
    if (openAccordionIndex === index) setOpenAccordionIndex(-1);
    else setOpenAccordionIndex(index);
  };

  const updateAvatarInStore = () => {
    setCurrentProperties(newProperties);
    store.dispatch(Actions.editSelf({...participantSelf.user, avatar: newProperties}));
  };

  const blocker = useBlocker(({currentLocation, nextLocation}) => havePropertiesChanged && currentLocation.pathname !== nextLocation.pathname);

  const settingGroups: {[key: string]: {values: readonly string[]; key: keyof AvataaarProps; disabledOn?: {[key in keyof Partial<AvataaarProps>]: AvataaarProps[key][]}}[]} = {
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
        <Avatar seed={id ?? ""} avatar={newProperties} className="avatar-settings__avatar-icon" />
        <button
          className="avatar-settings__avatar-shuffle"
          onClick={() => setNewProperties(generateRandomProps(Math.random().toString(36).slice(2)))}
          aria-label={t("Avatar.random")}
        >
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
                        .map(([key, value]) => Object.hasOwnProperty.call(newProperties, key) && value.some((val) => newProperties[key].indexOf(val) >= 0))
                        .some((val) => val);

                    return (
                      <Fragment key={element.key}>
                        <SettingsCarousel
                          carouselItems={element.values}
                          currentValue={newProperties[element.key]}
                          onValueChange={(value) => updateAvatar(element.key, value as (typeof element.values)[number])}
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
        <div className={`avatar-settings__changed ${havePropertiesChanged ? "" : "avatar-settings__changed--hidden"}`}>
          <div className="avatar-settings__changed-icon">
            <IconEdit />
          </div>
          <p>Änderungen speichern</p>
          <button className="avatar-settings__changed-button" aria-label="Discard" onClick={() => setNewProperties(currentProperties)}>
            <IconClose />
          </button>
          <button className="avatar-settings__changed-button avatar-settings__changed-button--accept" aria-label="Accept" onClick={updateAvatarInStore}>
            <IconDone />
          </button>
        </div>
        {blocker.state === "blocked" && (
          <ConfirmationDialog
            title="Dein Avatar hat ungespeicherte Änderungen!"
            onAcceptLabel="Speichern"
            onAccept={() => {
              updateAvatarInStore();
              blocker.proceed();
            }}
            onDeclineLabel="Zurück"
            onDecline={() => blocker.reset()}
            onExtraOptionLabel="Verwerfen"
            onExtraOption={() => {
              setNewProperties(currentProperties);
              blocker.proceed();
            }}
          />
        )}
      </div>
    </>
  );
};
