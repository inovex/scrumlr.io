import {useAppDispatch, useAppSelector} from "store";
import {Theme} from "store/features/view/types";
import {t} from "i18next";
import {SettingsDarkMode, SettingsLightMode, GeneralSettings} from "components/Icon";
import ThemePreviewDark from "assets/themes/theme-preview-dark.svg";
import ThemePreviewLight from "assets/themes/theme-preview-light.svg";
import "./ThemeSettings.scss";
import {setTheme} from "store/features";

export const ThemeSettings = () => {
  const dispatch = useAppDispatch();
  const theme = useAppSelector((state) => state.view.theme);

  const dispatchTheme = (newTheme: Theme) => {
    dispatch(setTheme(newTheme));
  };

  return (
    <div className="appearance-settings__theme-container">
      <span className="appearance-settings__theme-title">{t("Appearance.colorScheme")}</span>
      <form className="appearance-settings__theme-options">
        <label htmlFor="auto" className="appearence-settings__theme-option" title={t("Appearance.SyncModeDescription")}>
          <input id="auto" type="radio" value="auto" name="themeAuto" checked={theme === "auto"} onChange={() => dispatchTheme("auto")} />
          <img src={ThemePreviewLight} alt={`${t("Appearance.colorScheme")} Auto`} />
          <img src={ThemePreviewDark} alt={`${t("Appearance.colorScheme")} Auto`} />
          <p>
            <GeneralSettings className="appearance-settings__theme-icon" />
            <span>Auto</span>
          </p>
        </label>
        <label htmlFor="light" className="appearence-settings__theme-option">
          <input id="light" type="radio" value="light" name="themeLight" checked={theme === "light"} onChange={() => dispatchTheme("light")} />
          <img src={ThemePreviewLight} alt={`${t("Appearance.colorScheme")} ${t("Appearance.colorSchemeLight")}`} />
          <p>
            <SettingsLightMode className="appearance-settings__theme-icon" />
            <span>{t("Appearance.colorSchemeLight")}</span>
          </p>
        </label>
        <label htmlFor="dark" className="appearence-settings__theme-option">
          <input id="dark" type="radio" value="dark" name="themeDark" checked={theme === "dark"} onChange={() => dispatchTheme("dark")} />
          <img src={ThemePreviewDark} alt={`${t("Appearance.colorScheme")} ${t("Appearance.colorSchemeDark")}`} />
          <p>
            <SettingsDarkMode className="appearance-settings__theme-icon" />
            <span>{t("Appearance.colorSchemeDark")}</span>
          </p>
        </label>
      </form>
    </div>
  );
};
