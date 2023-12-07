import {ComponentProps} from "react";
import {useTranslation} from "react-i18next";
import {useAppSelector} from "store";
import {SkinToneName, skinTones} from "types/skinTone";
import {useDispatch} from "react-redux";
import {Actions} from "store/action";
import {SettingsDropdown} from "./SettingsDropdown";

export const SkinToneSelector = () => {
  const {t} = useTranslation();
  const skinToneComponent = useAppSelector((state) => state.skinTone.component);
  const dispatch = useDispatch();

  const skinToneItems: ComponentProps<typeof SettingsDropdown>["items"] = Object.entries(skinTones).map(([name, component]) => ({
    text: `👏${component}`,
    callback: () => dispatch(Actions.setSkinTone(name as SkinToneName)),
  }));

  return <SettingsDropdown items={skinToneItems} label={t("Appearance.EmojiSkinTone")} current={{text: `👏${skinToneComponent}`}} />;
};
