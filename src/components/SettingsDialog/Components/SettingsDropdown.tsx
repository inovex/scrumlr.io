import {FC, useState} from "react";
import "./SettingsDropdown.scss";
import {ReactComponent as DropdownIcon} from "assets/icon-arrow-next.svg";
import {ReactComponent as GermanFlagIcon} from "assets/flags/DE.svg";
import {ReactComponent as USFlagIcon} from "assets/flags/US.svg";
import {useTranslation} from "react-i18next";
import i18n from "i18n";

interface SettingsDropdownProps {
  showDropdown?: boolean;
}

export const SettingsDropdown: FC<SettingsDropdownProps> = ({showDropdown}) => {
  const {t} = useTranslation();

  const changeLanguage = (language: string) => {
    i18n.changeLanguage(language).then(() => {
      // eslint-disable-next-line no-restricted-globals
      location.reload();
    });
  };

  const [currentlanguage, setCurrentlanguage] = useState<string>(i18n.language);

  return (
    <div className="settings-dropdown">
      {currentlanguage === "de" ? (
        <>
          <GermanFlagIcon className="settings-dropdown-flag" />
          <span className="settings-dropdown-button">{t("Language.german")}</span>
          <DropdownIcon className="settings-dropdown-icon" />
        </>
      ) : (
        <>
          <USFlagIcon className="settings-dropdown-flag" />
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
              <USFlagIcon />
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
              <GermanFlagIcon />
              {t("Language.german")}
            </li>
          </ul>
        ))}
    </div>
  );
};
