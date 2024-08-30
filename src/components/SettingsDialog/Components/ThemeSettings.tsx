import {useAppSelector} from "store";
import {useDispatch} from "react-redux";
import {Theme} from "store/features/view/types";
import {Actions} from "store/action";
import {t} from "i18next";
import {SettingsDarkMode, SettingsLightMode, GeneralSettings} from "components/Icon";
import ThemePreviewDark from "assets/themes/theme-preview-dark.svg";
import ThemePreviewLight from "assets/themes/theme-preview-light.svg";
import "./ThemeSettings.scss";

export const ThemeSettings = () => {
  const dispatch = useDispatch();
  const theme = useAppSelector((state) => state.view.theme);

  const setTheme = (newTheme: Theme) => {
    dispatch(Actions.setTheme(newTheme));
  };

  return (
    <div className="appearance-settings__theme-container">
      <span className="appearance-settings__theme-title">{t("Appearance.colorScheme")}</span>
      <form className="appearance-settings__theme-options">
        <label htmlFor="auto" className="appearence-settings__theme-option" title={t("Appearance.SyncModeDescription")}>
          <input id="auto" type="radio" value="auto" name="themeAuto" checked={theme === "auto"} onChange={() => setTheme("auto")} />
          <img src={ThemePreviewLight} alt={`${t("Appearance.colorScheme")} Auto`} />
          <img src={ThemePreviewDark} alt={`${t("Appearance.colorScheme")} Auto`} />
          <p>
            <GeneralSettings className="appearance-settings__theme-icon" />
            <span>Auto</span>
          </p>
        </label>
        <label htmlFor="light" className="appearence-settings__theme-option">
          <input id="light" type="radio" value="light" name="themeLight" checked={theme === "light"} onChange={() => setTheme("light")} />
          <img src={ThemePreviewLight} alt={`${t("Appearance.colorScheme")} ${t("Appearance.colorSchemeLight")}`} />
          <p>
            <SettingsLightMode className="appearance-settings__theme-icon" />
            <span>{t("Appearance.colorSchemeLight")}</span>
          </p>
        </label>
        <label htmlFor="dark" className="appearence-settings__theme-option">
          <input id="dark" type="radio" value="dark" name="themeDark" checked={theme === "dark"} onChange={() => setTheme("dark")} />
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
