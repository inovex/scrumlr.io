import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import {store} from "store";
import {LOCALE_STORAGE_KEY} from "constants/storage";
import {setLanguage} from "store/features";
import translationDe from "./de/translation.json";
import translationEn from "./en/translation.json";

export const resources = {
  en: {
    translation: translationEn,
  },
  de: {
    translation: translationDe,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    detection: {
      lookupLocalStorage: `${LOCALE_STORAGE_KEY}`,
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    fallbackLng: "en",
    returnNull: false,
  })
  .then(() => {
    store.dispatch(setLanguage(i18n.language));
  });

export default i18n;
