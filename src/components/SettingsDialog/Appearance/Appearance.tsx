import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {getColorClassName} from "constants/colors";
import {MenuItemConfig} from "constants/settings";
import {useOutletContext} from "react-router";
import {LanguageSettingsDropdown} from "../Components/LanguageSettingsDropdown";
import "../SettingsDialog.scss";
import {ThemeSettings} from "../Components/ThemeSettings";
import {NotificationSettings} from "../Components/NotificationSettings";
import {BoardReactionsSettings} from "../Components/BoardReactionsSettings";
import {SkinToneSelector} from "../Components/SkinToneSelector";
import "./Appearance.scss";
import {SnowfallSettings} from "../Components/SnowfallSettings";

export const Appearance = () => {
  const {t} = useTranslation();
  const activeMenuItem: MenuItemConfig = useOutletContext();

  return (
    <div className={classNames("settings-dialog__container", getColorClassName(activeMenuItem?.color))}>
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text">{t("SettingsDialog.Appearance")}</h2>
      </header>
      <div className="appearance-container">
        <ThemeSettings />
        <SnowfallSettings />
        <NotificationSettings />
        <BoardReactionsSettings />
        <SkinToneSelector />
        <LanguageSettingsDropdown />
      </div>
    </div>
  );
};
