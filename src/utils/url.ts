import {LANGUAGE_QUERY_PARAM} from "constants/i18n";

const TEMPORARY_BASE_URL = "https://scrumlr.io";
const ABSOLUTE_URL_PATTERN = /^[a-zA-Z][a-zA-Z\d+.-]*:/;

// attempts to create a url object from a string
// default to https protocol if none is prefixed
export const normalizeAndParseUrl = (input: string): URL | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;

  try {
    return new URL(trimmed);
  } catch {
    try {
      return new URL(`https://${trimmed}`);
    } catch {
      return null;
    }
  }
};

// https://a is technically a valid Url but realistically not a valid web Url,
// which is why we do some custom checking to minimize false positives and therefore fetches.
// does not support ipv4/ipv6.
export const isValidWebUrl = (url: URL): boolean => {
  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return false;
  }

  const webUrlPattern = /^(?=.{1,253}$)([a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,63}$/; // taken from https://zod.dev/api#urls

  return webUrlPattern.test(url.hostname);
};

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
