import classNames from "classnames";
import {t} from "i18next";
import {useState} from "react";
import {SettingsButton} from "../Components/SettingsButton";
import {LanguageSettingsDropdown} from "../Components/LanguageSettingsDropdown";
import "../SettingsDialog.scss";
import "./Appearance.scss";
import {ThemeSettingsDropdown} from "../Components/ThemeSettingsDropdown";

export const Appearance = () => {
  // const [syncMode, setSyncMode] = useState(false);
  // const [showNotifications, setShowNotifications] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [showThemeDropdown, setShowThemeDropdown] = useState(false);

  return (
    <div className={classNames("settings-dialog__container", "accent-color__lean-lilac")}>
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text">{t("SettingsDialog.Appearance")}</h2>
      </header>
      <div className="appearance-container">
        <SettingsButton
          className="appearance-settings_language-dropdown"
          label={t("Appearance.colorScheme")}
          onClick={() => setShowThemeDropdown((o) => !o)}
          onBlur={() => setShowThemeDropdown(false)}
        >
          <ThemeSettingsDropdown showDropdown={showThemeDropdown} />
        </SettingsButton>
        {/* <SettingsButton */}
        {/*   className="appearance-settings_sync-button" */}
        {/*   onClick={() => { */}
        {/*     setSyncMode((prevVal) => !prevVal); */}
        {/*   }} */}
        {/* > */}
        {/*   <div className="appearance-settings_sync-button_label"> */}
        {/*     <p>{t("Appearance.SyncMode")}</p> */}
        {/*     <p>{t("Appearance.SyncModeDescription")}</p> */}
        {/*   </div> */}
        {/*   <SettingsToggle active={syncMode} /> */}
        {/* </SettingsButton> */}
        {/* <SettingsButton className="appearance-settings_notifications-button" label={t("Appearance.AllowNotifications")} onClick={() => setShowNotifications(!showNotifications)}> */}
        {/*   <SettingsToggle active={showNotifications} /> */}
        {/* </SettingsButton> */}
        <SettingsButton
          className="appearance-settings_language-dropdown"
          label={t("Appearance.Language")}
          onClick={() => setShowDropdown((prevVal) => !prevVal)}
          onBlur={() => setShowDropdown(false)}
        >
          <LanguageSettingsDropdown showDropdown={showDropdown} />
        </SettingsButton>
      </div>
    </div>
  );
};
