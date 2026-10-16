import "i18next";
import translationEn from "i18n/en/translation.json";
import templatesEn from "i18n/en/templates.json";
import translationDe from "i18n/de/translation.json";
import templatesDe from "i18n/de/templates.json";
import translationFr from "i18n/fr/translation.json";
import templatesFr from "i18n/fr/templates.json";
import translationEs from "i18n/es/translation.json";
import templatesEs from "i18n/es/templates.json";

type TranslationCommon = typeof translationDe & typeof translationEn & typeof translationFr & typeof translationEs;
type TranslationTemplates = typeof templatesDe & typeof templatesEn & typeof templatesFr & typeof templatesEs;

declare module "i18next" {
  interface CustomTypeOptions {
    resources: {
      translation: TranslationCommon;
      templates: TranslationTemplates;
    };
    returnNull: false;
  }
}
