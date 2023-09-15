import {useState, VFC} from "react";
import {ReactComponent as German} from "assets/flags/DE.svg";
import {ReactComponent as English} from "assets/flags/US.svg";
import {useTranslation} from "react-i18next";
import i18n from "i18n";
import {SettingsDropdown} from "./SettingsDropdown";

export const LanguageSettingsDropdown: VFC = () => {
  const {t} = useTranslation();
  const [currentlanguage, setCurrentlanguage] = useState(i18n.resolvedLanguage);

  const changeLanguage = (language: string) => {
    setCurrentlanguage(language);
    i18n.changeLanguage(language).then(() => {
      document.documentElement.lang = i18n.language;
    });
  };

  const languages = [
    {icon: English, text: t("Language.english"), callback: () => changeLanguage("en"), code: "en"},
    {icon: German, text: t("Language.german"), callback: () => changeLanguage("de"), code: "de"},
  ];

  return <SettingsDropdown items={languages} label={t("Appearance.Language")} current={languages.find((item) => item.code === currentlanguage) ?? languages[0]} />;
};
