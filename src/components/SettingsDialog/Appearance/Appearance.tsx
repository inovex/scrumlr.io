import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {LanguageSettingsDropdown} from "../Components/LanguageSettingsDropdown";
import "../SettingsDialog.scss";
import "./Appearance.scss";
import {ThemeSettings} from "../Components/ThemeSettings";

export const Appearance = () => {
  const {t} = useTranslation();

  return (
    <div className={classNames("settings-dialog__container", "accent-color__lean-lilac")}>
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text">{t("SettingsDialog.Appearance")}</h2>
      </header>
      <div className="appearance-container">
        <ThemeSettings />
        <LanguageSettingsDropdown />
      </div>
    </div>
  );
};
