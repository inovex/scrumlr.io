import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: localStorage.getItem("Scrumlr/locale") || undefined,
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
      wait: false,
    },
  });

if (localStorage.getItem("Scrumlr/locale") !== i18n.language) {
  localStorage.setItem("Scrumlr/locale", i18n.language);
}

export default i18n;
