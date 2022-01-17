import { join } from "path"
import i18n, { InitOptions } from "i18next"
import { initReactI18next } from "react-i18next"
import Backend from "i18next-fs-backend"

const options: InitOptions = {
  backend: {
    backendOptions: [
      {
        loadPath: join(__dirname, "../public/locales/en/translation.json"),
      },
    ],
  },
  initImmediate: false,
  lng: "en",
  debug: false,
}

i18n.use(Backend).use(initReactI18next).init(options)

export default i18n
