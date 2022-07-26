import {useEffect, useState, VFC, KeyboardEvent, SetStateAction, Dispatch} from "react";
import {t} from "i18next";
import {ReactComponent as DropdownIcon} from "assets/icon-arrow-next.svg";
import "./LanguageSettingsDropdown.scss";
import {ReactComponent as LightIcon} from "assets/icon-lightmode.svg";
import {ReactComponent as DarkIcon} from "assets/icon-darkmode.svg";

type ThemeSettingsDropdownProps = {
  showDropdown: boolean;
  setShowDropdown: Dispatch<SetStateAction<boolean>>;
};

enum Theme {
  LIGHT = "light",
  DARK = "dark",
}

export const ThemeSettingsDropdown: VFC<ThemeSettingsDropdownProps> = ({showDropdown, setShowDropdown}) => {
  const [theme, setTheme] = useState<Theme>((document.documentElement.getAttribute("theme") as Theme) ?? Theme.LIGHT);
  useEffect(() => {
    document.documentElement.setAttribute("theme", theme!);
    localStorage.setItem("theme", theme!);
  }, [theme]);

  const handleKeyDown = (newTheme: Theme) => (e: KeyboardEvent<HTMLLIElement>) => {
    switch (e.key) {
      case " ":
      case "SpaceBar":
      case "Enter":
        e.preventDefault();
        setTheme(newTheme);
        setShowDropdown(false);
        break;
      default:
        break;
    }
  };

  return (
    <div className="settings-dropdown">
      {theme === Theme.LIGHT ? (
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
        (theme === Theme.LIGHT ? (
          <ul className="settings-dropdown-content" role="listbox" tabIndex={-1}>
            <li
              onClick={() => {
                setTheme(Theme.DARK);
              }}
              onKeyDown={handleKeyDown(Theme.DARK)}
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={0}
            >
              <DarkIcon className="settings-dropdown-flag" />
              {t("Appearance.colorSchemeDark")}
            </li>
          </ul>
        ) : (
          <ul className="settings-dropdown-content" role="listbox" tabIndex={-1}>
            <li
              onClick={() => {
                setTheme(Theme.LIGHT);
              }}
              onKeyDown={handleKeyDown(Theme.LIGHT)}
              // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
              tabIndex={0}
            >
              <LightIcon className="settings-dropdown-flag" />
              {t("Appearance.colorSchemeLight")}
            </li>
          </ul>
        ))}
    </div>
  );
};
