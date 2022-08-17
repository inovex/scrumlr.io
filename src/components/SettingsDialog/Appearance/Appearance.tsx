import classNames from "classnames";
import {t} from "i18next";
import {useEffect, useState, FocusEvent} from "react";
import ThemePreviewLight from "assets/themes/theme-preview-light.svg";
import ThemePreviewDark from "assets/themes/theme-preview-dark.svg";
import {ReactComponent as LightIcon} from "assets/icon-lightmode.svg";
import {ReactComponent as DarkIcon} from "assets/icon-darkmode.svg";
import {SettingsButton} from "../Components/SettingsButton";
import {LanguageSettingsDropdown} from "../Components/LanguageSettingsDropdown";
import "../SettingsDialog.scss";
import "./Appearance.scss";

export const Appearance = () => {
  // const [showNotifications, setShowNotifications] = useState(false);
  const [theme, setTheme] = useState(localStorage.getItem("theme") ?? "auto");
  useEffect(() => {
    if (theme === "auto") {
      const autoTheme = window.matchMedia("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
      document.documentElement.setAttribute("theme", autoTheme);
    } else document.documentElement.setAttribute("theme", theme!);

    localStorage.setItem("theme", theme!);
  }, [theme]);

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
        <div className="appearance-settings__theme-container">
          <span className="appearance-settings__theme-title">{t("Appearance.colorScheme")}</span>
          <div className="appearance-settings__theme-options">
            <label htmlFor="auto" className="appearence-settings__theme-option" title={t("Appearance.SyncModeDescription")}>
              <input id="auto" type="radio" value="auto" name="theme" checked={theme === "auto"} onChange={() => setTheme("auto")} />
              <div className="appearance-settings__auto-preview">
                <img src={ThemePreviewLight} alt={`${t("Appearance.colorScheme")} Auto`} />
                <img src={ThemePreviewDark} alt={`${t("Appearance.colorScheme")} Auto`} />
              </div>
              <span>
                <LightIcon className="appearance-settings__theme-icon" />
                Auto
              </span>
            </label>
            <label htmlFor="light" className="appearence-settings__theme-option">
              <input id="light" type="radio" value="light" name="theme" checked={theme === "light"} onChange={() => setTheme("light")} />
              <img src={ThemePreviewLight} alt={`${t("Appearance.colorScheme")} ${t("Appearance.colorSchemeLight")}`} />
              <span>
                <LightIcon className="appearance-settings__theme-icon" />
                {t("Appearance.colorSchemeLight")}
              </span>
            </label>
            <label htmlFor="dark" className="appearence-settings__theme-option">
              <input id="dark" type="radio" value="dark" name="theme" checked={theme === "dark"} onChange={() => setTheme("dark")} />
              <img src={ThemePreviewDark} alt={`${t("Appearance.colorScheme")} ${t("Appearance.colorSchemeDark")}`} />
              <span>
                <DarkIcon className="appearance-settings__theme-icon" />
                {t("Appearance.colorSchemeDark")}
              </span>
            </label>
          </div>
        </div>
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
