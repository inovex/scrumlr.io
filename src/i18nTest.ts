import i18n from "i18next";
import {initReactI18next} from "react-i18next";

import translationDe from "./i18n/de/translation.json";
import translationEn from "./i18n/en/translation.json";

export const resources = {
  en: {
    translation: translationEn,
  },
  de: {
    translation: translationDe,
  },
};

i18n.use(initReactI18next).init({
  resources,
  initImmediate: false,
  lng: "en",
  debug: false,
  react: {
    useSuspense: false,
  },
});

export default i18n;
