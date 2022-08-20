import classNames from "classnames";
import {t} from "i18next";
import {useState, FocusEvent} from "react";
import {SettingsButton} from "../Components/SettingsButton";
import {LanguageSettingsDropdown} from "../Components/LanguageSettingsDropdown";
import "../SettingsDialog.scss";
import "./Appearance.scss";
import {ThemeSettings} from "../Components/ThemeSettings";

export const Appearance = () => {
  const [showDropdown, setShowDropdown] = useState(false);

  const handleBlur = (e: FocusEvent<HTMLButtonElement>, callback: () => void) => {
    if (!e.currentTarget.contains(e.relatedTarget)) callback();
  };

  return (
    <div className={classNames("settings-dialog__container", "accent-color__lean-lilac")}>
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text">{t("SettingsDialog.Appearance")}</h2>
      </header>
      <div className="appearance-container">
        <ThemeSettings />
        <SettingsButton
          className="appearance-settings_language-dropdown"
          label={t("Appearance.Language")}
          aria-haspopup="listbox"
          aria-expanded={showDropdown}
          onClick={() => setShowDropdown((prevVal) => !prevVal)}
          onBlur={(e) => handleBlur(e, () => setShowDropdown(false))}
        >
          <LanguageSettingsDropdown showDropdown={showDropdown} setShowDropdown={setShowDropdown} />
        </SettingsButton>
      </div>
    </div>
  );
};
