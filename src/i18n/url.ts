import {getI18n} from "react-i18next";
import {withLanguageQuery} from "utils/url";

const FALLBACK_LANGUAGE = "en";

/**

Embedded wrapper for withLanguageQuery that automatically sets language to current.
*/
export const withCurrentLanguageQuery = (href: string): string => {
  const i18n = getI18n();
  const language = i18n.resolvedLanguage || i18n.language || FALLBACK_LANGUAGE;
  return withLanguageQuery(href, language);
};
