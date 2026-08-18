import German from "assets/flags/DE.svg?react";
import English from "assets/flags/US.svg?react";
import French from "assets/flags/FR.svg?react";
import {useTranslation} from "react-i18next";
import {useAppDispatch, useAppSelector} from "store";
import {setLanguage} from "store/features";
import {SettingsDropdown} from "./SettingsDropdown";

export const LanguageSettingsDropdown = () => {
  const {t} = useTranslation();
  const dispatch = useAppDispatch();
  const currentLanguage = useAppSelector((state) => state.view.language);

  const changeLanguage = (language: string) => {
    dispatch(setLanguage(language));
  };

  const languages = [
    {icon: English, text: t("Language.english"), callback: () => changeLanguage("en"), code: "en"},
    {icon: German, text: t("Language.german"), callback: () => changeLanguage("de"), code: "de"},
    {icon: French, text: t("Language.french"), callback: () => changeLanguage("fr"), code: "fr"},
  ];

  return <SettingsDropdown items={languages} label={t("Appearance.Language")} current={languages.find((item) => item.code === currentLanguage) ?? languages[0]} />;
};
