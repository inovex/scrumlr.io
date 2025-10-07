import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import {store} from "store";
import {LOCALE_STORAGE_KEY} from "constants/storage";
import {setLanguage} from "store/features";
import translationDe from "./de/translation.json";
import translationEn from "./en/translation.json";
import translationFr from "./fr/translation.json";
import templatesDe from "./de/templates.json";
import templatesEn from "./en/templates.json";
import templatesFr from "./fr/templates.json";

export const resources = {
  en: {
    translation: translationEn,
    templates: templatesEn,
  },
  de: {
    translation: translationDe,
    templates: templatesDe,
  },
  fr: {
    translation: translationFr,
    templates: templatesFr,
  },
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    ns: ["translation", "templates"],
    defaultNS: "translation",
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
