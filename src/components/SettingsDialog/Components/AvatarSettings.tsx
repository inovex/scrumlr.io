import {Shuffle} from "components/Icon";
import classNames from "classnames";
import {Avatar, generateRandomProps} from "components/Avatar";
import {Fragment, useEffect, useState} from "react";
import {useTranslation} from "react-i18next";
import {useAppDispatch, useAppSelector} from "store";
import {AVATAR_CONFIG} from "constants/avatar";
import {AvataaarProps, AvatarGroup} from "types/avatar";
import {editSelf} from "store/features";
import {SettingsAccordion} from "./SettingsAccordion";
import {SettingsCarousel} from "./SettingsCarousel";
import "./AvatarSettings.scss";

export interface AvatarSettingsProps {
  id?: string;
}

export const AvatarSettings = (props: AvatarSettingsProps) => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const self = useAppSelector((state) => state.auth.user!);

  let initialState = self.avatar;
  if (initialState === null || initialState === undefined) {
    initialState = generateRandomProps(props.id ?? "");
  }

  const [properties, setProperties] = useState<AvataaarProps>(initialState!);
  const [openAccordionIndex, setOpenAccordionIndex] = useState(-1);

  const updateAvatar = (key: keyof AvataaarProps, value: AvataaarProps[keyof AvataaarProps]) => {
    if (properties && properties[key] !== value) {
      setProperties({...properties, [key]: value});
    }
  };

  const handleAccordionOpen = (index: number) => {
    if (openAccordionIndex === index) setOpenAccordionIndex(-1);
    else setOpenAccordionIndex(index);
  };

  useEffect(() => {
    dispatch(
      editSelf({
        auth: {...self, avatar: properties},
        applyOptimistically: true,
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [properties]);

  // a group is disabled if any property (stored in properties) is found within the disabledOn array of the group.
  const checkDisabled = (group: AvatarGroup): boolean =>
    (group.disabledOn &&
      Object.entries(group.disabledOn)
        .map(([key, value]) => {
          const typedKey = key as keyof AvataaarProps;
          const typedValue = value as AvataaarProps[keyof AvataaarProps][];
          return Object.hasOwnProperty.call(properties, typedKey) && typedValue.some((val) => properties[typedKey] === val);
        })
        .some((val) => val)) ??
    false;

  const renderAvatarGroup = (group: AvatarGroup) => {
    const isDisabled = checkDisabled(group);

    return (
      <Fragment key={group.key}>
        <SettingsCarousel
          carouselItems={group.values}
          currentValue={properties[group.key]}
          onValueChange={(value) => updateAvatar(group.key, value)}
          disabled={isDisabled}
          localizationPath={`Avatar.${group.key}.`}
          label={t(`Avatar.${group.key}.label`)}
          className={classNames("avatar-settings__settings-group-item", {disabled: isDisabled})}
        />
      </Fragment>
    );
  };

  return (
    <>
      <div className="avatar-settings__avatar">
        <Avatar seed={props.id ?? ""} avatar={properties} className="avatar-settings__avatar-icon" />
        <button className="avatar-settings__avatar-shuffle" onClick={() => setProperties(generateRandomProps(Math.random().toString(36).slice(2)))} aria-label={t("Avatar.random")}>
          <Shuffle />
        </button>
      </div>
      <div className="avatar-settings__settings-wrapper">
        <div className="avatar-settings__settings">
          {Object.entries(AVATAR_CONFIG).map(([label, groups], groupIndex, array) => (
            <Fragment key={label}>
              <SettingsAccordion
                label={t(`Avatar.groups.${label as "hair" | "facialFeatures" | "clothing"}`)}
                isOpen={groupIndex === openAccordionIndex}
                onClick={() => handleAccordionOpen(groupIndex)}
                headerClassName="avatar-settings__settings-group-header"
              >
                <hr className="avatar-settings__settings-group-seperator" />
                <div className="avatar-settings__settings-group">{groups.map((group) => renderAvatarGroup(group))}</div>
              </SettingsAccordion>
              {groupIndex < array.length - 1 && <hr className="avatar-settings__settings-group-seperator" />}
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );
};
