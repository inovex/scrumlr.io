import {VFC, useState} from "react";
import "./LanguageSettingsDropdown.scss";
import {ReactComponent as DropdownIcon} from "assets/icon-arrow-next.svg";
import {ReactComponent as German} from "assets/flags/DE.svg";
import {ReactComponent as English} from "assets/flags/US.svg";
import {useTranslation} from "react-i18next";
import i18n from "i18n";

interface LanguageSettingsDropdownProps {
  showDropdown?: boolean;
}

export const LanguageSettingsDropdown: VFC<LanguageSettingsDropdownProps> = ({showDropdown}) => {
  const {t} = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language).then(() => {
      document.documentElement.lang = i18n.language;
      // eslint-disable-next-line no-restricted-globals
      location.reload();
    });
  };

  const [currentlanguage, setCurrentlanguage] = useState<string>(i18n.resolvedLanguage);

  return (
    <div className="settings-dropdown">
      {currentlanguage === "de" ? (
        <>
          <German className="settings-dropdown-flag" />
          <span className="settings-dropdown-button">{t("Language.german")}</span>
          <DropdownIcon className="settings-dropdown-icon" />
        </>
      ) : (
        <>
          <English className="settings-dropdown-flag" />
          <span className="settings-dropdown-button">{t("Language.english")}</span>
          <DropdownIcon className="settings-dropdown-icon" />
        </>
      )}

      {showDropdown &&
        (currentlanguage === "de" ? (
          <ul className="settings-dropdown-content">
            <li
              onClick={() => {
                changeLanguage("en");
                setCurrentlanguage("en");
              }}
            >
              <English className="settings-dropdown-flag" />
              {t("Language.english")}
            </li>
          </ul>
        ) : (
          <ul className="settings-dropdown-content">
            <li
              onClick={() => {
                changeLanguage("de");
                setCurrentlanguage("de");
              }}
            >
              <German className="settings-dropdown-flag" />
              {t("Language.german")}
            </li>
          </ul>
        ))}
    </div>
  );
};
