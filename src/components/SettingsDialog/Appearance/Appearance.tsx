import classNames from "classnames";
import {t} from "i18next";
import {useState} from "react";
import {SettingsButton} from "../Components/SettingsButton";
import {SettingsDropdown} from "../Components/SettingsDropdown";
import {SettingsToggle} from "../Components/SettingsToggle";
import "../SettingsDialog.scss";
import "./Appearance.scss";

export const Appearance = () => {
  const [syncMode, setSyncMode] = useState<boolean>(false); // move to Redux
  const [showNotifications, setshowNotifications] = useState<boolean>(false); // move to Redux
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const sync = () => {
    // default windows-moduls or default app-modus -> TODO
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      console.log("dark mode active");
    } else {
      console.log("light mode active");
    }
  };

  return (
    <div className={classNames("settings-dialog__container", "accent-color__lean-lilac")}>
      <header className="settings-dialog__header">
        <h2 className="settings-dialog__header-text">{t("SettingsDialog.Appearance")}</h2>
      </header>

      <div className="appearance-container">
        <div className="appearance-settings">
          <SettingsButton
            className="appearance-settings_sync-button"
            onClick={() => {
              setSyncMode(!syncMode);
              sync();
            }}
          >
            <div className="appearance-settings_sync-button_label">
              <p>{t("Appearance.SyncMode")}</p>
              <p>{t("Appearance.SyncModeDescription")}</p>
            </div>
            <SettingsToggle active={syncMode} />
          </SettingsButton>
          <SettingsButton className="appearance-settings_notifications-button" label={t("Appearance.AllowNotifications")} onClick={() => setshowNotifications(!showNotifications)}>
            <SettingsToggle active={showNotifications} />
          </SettingsButton>
        </div>
        <SettingsButton
          className="appearance-settings_language-dropdown"
          label={t("Appearance.Language")}
          onClick={() => setShowDropdown(!showDropdown)}
          onBlur={() => setShowDropdown(false)}
        >
          <SettingsDropdown showDropdown={showDropdown} />
        </SettingsButton>
      </div>
    </div>
  );
};
