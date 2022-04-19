import {useEffect, useState, VFC} from "react";
import {t} from "i18next";
import {ReactComponent as DropdownIcon} from "assets/icon-arrow-next.svg";
import "./LanguageSettingsDropdown.scss";
import {ReactComponent as LightIcon} from "assets/icon-lightmode.svg";
import {ReactComponent as DarkIcon} from "assets/icon-darkmode.svg";

type ThemeSettingsDropdownProps = {
  showDropdown: boolean;
};

export const ThemeSettingsDropdown: VFC<ThemeSettingsDropdownProps> = ({showDropdown}) => {
  const [theme, setTheme] = useState(document.documentElement.getAttribute("theme") ?? "light");
  useEffect(() => {
    document.documentElement.setAttribute("theme", theme!);
    localStorage.setItem("theme", theme!);
  }, [theme]);

  return (
    <div className="settings-dropdown">
      {theme === "light" ? (
        <>
          <LightIcon className="settings-dropdown-flag" />
          <span className="settings-dropdown-button">{t("Appearance.colorSchemeLight")}</span>
          <DropdownIcon className="settings-dropdown-icon" />
        </>
      ) : (
        <>
          <DarkIcon className="settings-dropdown-flag" />
          <span className="settings-dropdown-button">{t("Appearance.colorSchemeDark")}</span>
          <DropdownIcon className="settings-dropdown-icon" />
        </>
      )}

      {showDropdown &&
        (theme === "light" ? (
          <ul className="settings-dropdown-content">
            <li
              onClick={() => {
                setTheme("dark");
              }}
            >
              <DarkIcon className="settings-dropdown-flag" />
              {t("Appearance.colorSchemeDark")}
            </li>
          </ul>
        ) : (
          <ul className="settings-dropdown-content">
            <li
              onClick={() => {
                setTheme("light");
              }}
            >
              <LightIcon className="settings-dropdown-flag" />
              {t("Appearance.colorSchemeLight")}
            </li>
          </ul>
        ))}
    </div>
  );
};
