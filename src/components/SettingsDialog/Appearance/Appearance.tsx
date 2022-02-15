import classNames from "classnames";
import {useState} from "react";
import {SettingsButton} from "../Components/SettingsButton";
import {SettingsDropdown} from "../Components/SettingsDropdown";
import {SettingsToggle} from "../Components/SettingsToggle";
import "../SettingsDialog.scss";
import "./Appearance.scss";

export const Appearance = () => {
  const [syncMode, setSyncMode] = useState<boolean>(false); // in Redux
  const [showNotifications, setshowNotifications] = useState<boolean>(false); // in Redux
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const sync = () => {
    // Todo
    // default windows-moduls or default app-modus ?
    if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
      console.log("dark mode active");
    } else {
      console.log("light mode active");
    }
  };

  return (
    <div className="settings-dialog__container">
      <div className="settings-dialog__header">
        <h2 className={classNames("settings-dialog__header-text", "accent-color__lean-lilac")}>Appearance</h2>
      </div>

      <div className={classNames("appearance-container", "accent-color__lean-lilac")}>
        <div className="appearance-settings">
          <SettingsButton
            className="appearance-settings_sync-button"
            label="Sync Appearance Mode with System"
            onClick={() => {
              setSyncMode(!syncMode);
              sync();
            }}
          >
            <SettingsToggle active={syncMode} />
          </SettingsButton>
          <SettingsButton className="appearance-settings_notifications-button" label="Allow Notifications" onClick={() => setshowNotifications(!showNotifications)}>
            <SettingsToggle active={showNotifications} />
          </SettingsButton>
        </div>
        <SettingsButton className="appearance-language-dropdown" label="language" onClick={() => setShowDropdown(!showDropdown)} onBlur={() => setShowDropdown(false)}>
          <SettingsDropdown showDropdown={showDropdown} />
        </SettingsButton>
      </div>
    </div>
  );
};
