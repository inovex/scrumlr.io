import {ReactComponent as DarkIcon} from "assets/icon-darkmode.svg";
import {ReactComponent as LightIcon} from "assets/icon-lightmode.svg";
import {ReactComponent as AutoIcon} from "assets/icon-settings.svg";
import ThemePreviewDark from "assets/themes/theme-preview-dark.svg";
import ThemePreviewLight from "assets/themes/theme-preview-light.svg";
import {t} from "i18next";
import {useEffect, useState} from "react";
import "./ThemeSettings.scss";

export const ThemeSettings = () => {
  const [theme, setTheme] = useState(localStorage.getItem("theme") ?? "auto");
  useEffect(() => {
    if (theme === "auto") {
      const autoTheme = window.matchMedia("(prefers-color-scheme: dark)")?.matches ? "dark" : "light";
      document.documentElement.setAttribute("theme", autoTheme);
    } else document.documentElement.setAttribute("theme", theme!);

    localStorage.setItem("theme", theme!);
  }, [theme]);

  return (
    <div className="appearance-settings__theme-container">
      <span className="appearance-settings__theme-title">{t("Appearance.colorScheme")}</span>
      <form className="appearance-settings__theme-options">
        <label htmlFor="auto" className="appearence-settings__theme-option" title={t("Appearance.SyncModeDescription")}>
          <input id="auto" type="radio" value="auto" name="theme" checked={theme === "auto"} onChange={() => setTheme("auto")} />
          <div className="appearance-settings__auto-preview">
            <img src={ThemePreviewLight} alt={`${t("Appearance.colorScheme")} Auto`} />
            <img src={ThemePreviewDark} alt={`${t("Appearance.colorScheme")} Auto`} />
          </div>
          <span>
            <AutoIcon className="appearance-settings__theme-icon" />
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
      </form>
    </div>
  );
};
