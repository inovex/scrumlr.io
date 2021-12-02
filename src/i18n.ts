import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      queryStringParams: {v: "1.0.0"},
    },
    detection: {
      lookupLocalStorage: "Scrumlr/locale",
      order: ["localStorage"],
      caches: ["localStorage"],
    },
    fallbackLng: "en",
    react: {
      useSuspense: false,
      wait: false,
    },
  });

export default i18n;
