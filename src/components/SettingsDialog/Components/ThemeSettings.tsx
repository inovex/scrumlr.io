import {useEffect, useState} from "react";
import {t} from "i18next";
import {ReactComponent as DarkIcon} from "assets/icon-darkmode.svg";
import {ReactComponent as LightIcon} from "assets/icon-lightmode.svg";
import {ReactComponent as AutoIcon} from "assets/icon-settings.svg";
import ThemePreviewDark from "assets/themes/theme-preview-dark.svg";
import ThemePreviewLight from "assets/themes/theme-preview-light.svg";
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
        {/* <label htmlFor="auto" className="appearence-settings__theme-option" title={t("Appearance.SyncModeDescription")}>
          <input id="auto" type="radio" value="auto" name="themeAuto" checked={theme === "auto"} onChange={() => setTheme("auto")} />
          <img src={ThemePreviewLight} alt={`${t("Appearance.colorScheme")} Auto`} />
          <img src={ThemePreviewDark} alt={`${t("Appearance.colorScheme")} Auto`} />
          <p>
            <AutoIcon className="appearance-settings__theme-icon" />
            <span>Auto</span>
          </p>
        </label> */}
        <label htmlFor="light" className="appearence-settings__theme-option">
          <input id="light" type="radio" value="light" name="themeLight" checked={theme === "light"} onChange={() => setTheme("light")} />
          <img src={ThemePreviewLight} alt={`${t("Appearance.colorScheme")} ${t("Appearance.colorSchemeLight")}`} />
          <p>
            <LightIcon className="appearance-settings__theme-icon" />
            <span>{t("Appearance.colorSchemeLight")}</span>
          </p>
        </label>
        {/* <label htmlFor="dark" className="appearence-settings__theme-option">
          <input id="dark" type="radio" value="dark" name="themeDark" checked={theme === "dark"} onChange={() => setTheme("dark")} />
          <img src={ThemePreviewDark} alt={`${t("Appearance.colorScheme")} ${t("Appearance.colorSchemeDark")}`} />
          <p>
            <DarkIcon className="appearance-settings__theme-icon" />
            <span>{t("Appearance.colorSchemeDark")}</span>
          </p>
        </label> */}
      </form>
    </div>
  );
};
