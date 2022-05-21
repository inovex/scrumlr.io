import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import Backend from "i18next-http-backend";
import LanguageDetector from "i18next-browser-languagedetector";
import store from "./store";
import {Actions} from "./store/action";

i18n
  .use(Backend)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    backend: {
      queryStringParams: {v: process.env.REACT_APP_LOCALES_HASH ?? "0000000000"},
    },
    detection: {
      lookupLocalStorage: "Scrumlr/locale",
      order: ["localStorage", "navigator"],
      caches: ["localStorage"],
    },
    fallbackLng: "en",
  })
  .then(() => {
    store.dispatch(Actions.setLanguage(i18n.language));
  });

export default i18n;
