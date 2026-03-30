import "i18next";
import translationEn from "i18n/en/translation.json";
import templatesEn from "i18n/en/templates.json";
import translationDe from "i18n/de/translation.json";
import templatesDe from "i18n/de/templates.json";
import translationFr from "i18n/fr/translation.json";
import templatesFr from "i18n/fr/templates.json";

export type TranslationCommon = translationDe & translationEn & translationFr;
export type TranslationTemplates = templatesDe & templatesEn & templatesFr;

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      translation: typeof TranslationCommon;
      templates: typeof TranslationTemplates;
    };
    returnNull: false;
  }
}
