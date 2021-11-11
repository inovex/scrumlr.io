import {join} from "path";
import i18n from "i18next";
import {initReactI18next} from "react-i18next";
import Backend from "i18next-fs-backend";

i18n
  .use(Backend)
  .use(initReactI18next)
  .init({
    backend: {
      loadPath: join(__dirname, "../public/locales/en/translation.json"),
    },
    initImmediate: false,
    lng: "en",
    debug: false,
    react: {
      useSuspense: false,
      wait: false,
    },
  });

export default i18n;
