import {FC, useState} from "react";
import "./SettingsDropdown.scss";
import {ReactComponent as DropdownIcon} from "assets/icon-arrow-next.svg";
import germanFlagIcon from "assets/flags/DE.svg";
import usFlagIcon from "assets/flags/US.svg";
import {useTranslation} from "react-i18next";
import i18n from "i18n";

interface SettingsDropdownProps {
  showDropdown?: boolean;
}

export const SettingsDropdown: FC<SettingsDropdownProps> = ({showDropdown}) => {
  const {t} = useTranslation();

  // TODO changes HTML lang="" back to "en" after reload
  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language).then(() => {
      document.documentElement.lang = i18n.language;
      // eslint-disable-next-line no-restricted-globals
      location.reload();
    });
  };

  const [currentlanguage, setCurrentlanguage] = useState<string>(i18n.language);

  return (
    <div className="settings-dropdown">
      {currentlanguage === "de" ? (
        <>
          <div className="settings-dropdown-flag">
            <img src={germanFlagIcon} alt="German Flag" />
          </div>
          <span className="settings-dropdown-button">{t("Language.german")}</span>
          <DropdownIcon className="settings-dropdown-icon" />
        </>
      ) : (
        <>
          <div className="settings-dropdown-flag">
            <img src={usFlagIcon} alt="English Flag" />
          </div>
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
              <div className="settings-dropdown-flag">
                <img src={usFlagIcon} alt="English Flag" />
              </div>
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
              <div className="settings-dropdown-flag">
                <img src={germanFlagIcon} alt="English Flag" />
              </div>
              {t("Language.german")}
            </li>
          </ul>
        ))}
    </div>
  );
};
