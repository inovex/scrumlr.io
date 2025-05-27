import {ComponentProps} from "react";
import {useTranslation} from "react-i18next";
import {useAppDispatch, useAppSelector} from "store";
import {SkinToneName, skinTones} from "store/features/skinTone/types";
import {setSkinTone} from "store/features";
import {SettingsDropdown} from "./SettingsDropdown";

export const SkinToneSelector = () => {
  const dispatch = useAppDispatch();
  const {t} = useTranslation();
  const skinToneComponent = useAppSelector((state) => state.skinTone.component);

  const skinToneItems: ComponentProps<typeof SettingsDropdown>["items"] = Object.entries(skinTones).map(([name, component]) => ({
    text: `👏${component}`,
    callback: () => dispatch(setSkinTone(name as SkinToneName)),
  }));

  return <SettingsDropdown items={skinToneItems} label={t("Appearance.EmojiSkinTone")} current={{text: `👏${skinToneComponent}`}} />;
};
