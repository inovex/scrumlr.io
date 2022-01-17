import i18n from "i18next";
import Backend from "i18next-fs-backend";
import {initReactI18next} from "react-i18next";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const options: any = {
  backend: {
    loadPath: "locales/en/translation.json",
  },
  initImmediate: false,
  lng: "en",
  debug: true,
  react: {
    useSuspense: false,
  },
};

i18n.use(Backend).use(initReactI18next).init(options);

export default i18n;
