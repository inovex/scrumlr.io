import "i18next";
import translationEn from "i18n/en/translation.json";
import templatesEn from "i18n/en/templates.json";
import translationDe from "i18n/de/translation.json";
import templatesDe from "i18n/de/templates.json";

export type TranslationCommon = translationDe & translationEn;
export type TranslationTemplates = templatesDe & templatesEn;

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      translation: typeof TranslationCommon;
      templates: typeof TranslationTemplates;
    };
    returnNull: false;
  }
}
