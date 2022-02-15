import {FC, useState} from "react";
import "./SettingsDropdown.scss";
import {ReactComponent as DropdownIcon} from "assets/icon-arrow-next.svg";
import {ReactComponent as GermanFlagIcon} from "assets/flags/DE.svg";
import {ReactComponent as USFlagIcon} from "assets/flags/US.svg";
// import {useTranslation} from "react-i18next";

interface SettingsDropdownProps {
  showDropdown?: boolean;
}

export const SettingsDropdown: FC<SettingsDropdownProps> = ({showDropdown}) => {
  // const {i18n} = useTranslation();

  // const changeLanguage = (language: string) => () => {
  //   i18n.changeLanguage(language).then(() => {
  //     // eslint-disable-next-line no-restricted-globals
  //     location.reload();
  //   });
  // };

  // const languages = ["German", "English"]; // Redux

  // const restLanguages = languages.filter(language => language !== currentlanguage)

  const [currentlanguage, setCurrentLanguage] = useState<string>(); // Redux

  // doesnt work when clicking on the actual Dropdown. When clicking the parent button it works...

  return (
    <div className="settings-dropdown">
      {currentlanguage === "German" ? (
        <>
          <GermanFlagIcon className="settings-dropdown-flag" />
          <button className="settings-dropdown-button">German</button>
          <DropdownIcon className="settings-dropdown-icon" />
        </>
      ) : (
        <>
          <USFlagIcon className="settings-dropdown-flag" />
          <button className="settings-dropdown-button">English</button>
          <DropdownIcon className="settings-dropdown-icon" />
        </>
      )}

      {showDropdown &&
        (currentlanguage === "German" ? (
          <ul className="settings-dropdown-content">
            <li
              onClick={() => {
                setCurrentLanguage("English");
              }}
            >
              <USFlagIcon />
              English
            </li>
          </ul>
        ) : (
          <ul className="settings-dropdown-content">
            <li
              onClick={() => {
                setCurrentLanguage("German");
              }}
            >
              <GermanFlagIcon />
              German
            </li>
          </ul>
        ))}
    </div>
  );
};
