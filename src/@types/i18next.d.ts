import "i18next";
import translationEn from "../i18n/en/translation.json";
import translationDe from "../i18n/de/translation.json";

type GermanTranslation = typeof translationDe;
type EnglishTranslation = typeof translationEn;

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      translation: GermanTranslation & EnglishTranslation;
    };
    returnNull: false;
  }
}
