import {LANGUAGE_QUERY_PARAM} from "constants/i18n";

const TEMPORARY_BASE_URL = "https://scrumlr.io";
const ABSOLUTE_URL_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

/**
 * Sets (or replaces) a query parameter on a path or absolute URL.
 */
export const setQueryParam = (href: string, key: string, value: string): string => {
  const url = new URL(href, TEMPORARY_BASE_URL);
  url.searchParams.set(key, value);

  if (ABSOLUTE_URL_PATTERN.test(href)) {
    return url.toString();
  }

  return `${url.pathname}${url.search}${url.hash}`;
};

export const withLanguageQuery = (href: string, language: string): string => setQueryParam(href, LANGUAGE_QUERY_PARAM, language);
