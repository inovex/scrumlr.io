import fs from "fs";
import {join} from "path";

type TranslationValue = string | TranslationValue[] | {[key: string]: TranslationValue};

const namespaces = ["translation.json", "templates.json"] as const;
const allowedFallbacks: Record<string, Set<string>> = {
  es: new Set(["CookiePolicy.body"]),
};
const flattenValues = (value: TranslationValue, path = "", result: Record<string, string> = {}): Record<string, string> => {
  if (typeof value === "string") {
    result[path] = value;
  } else if (Array.isArray(value)) {
    value.forEach((entry, index) => flattenValues(entry, `${path}.${index}`, result));
  } else {
    Object.entries(value).forEach(([key, entry]) => flattenValues(entry, path ? `${path}.${key}` : key, result));
  }

  return result;
};

const interpolationTokens = (value: string) => [...value.matchAll(/{{\s*([^},\s]+).*?}}/g)].map((match) => match[1]).sort();
const componentTags = (value: string) => [...value.matchAll(/<\/?([a-z][a-z0-9]*)>/gi)].map((match) => match[1]).sort();

describe("locales", () => {
  const i18nPath = join(__dirname, "../i18n/");
  const languageCodes = fs.readdirSync(i18nPath).filter((languageCode) => fs.statSync(join(i18nPath, languageCode)).isDirectory());

  languageCodes.forEach((languageCode) => {
    if (languageCode === "__tests__" || languageCode === "en") return;

    namespaces.forEach((namespace) => {
      test(`${languageCode}/${namespace} has the same keys and tokens as English`, () => {
        const reference = flattenValues(JSON.parse(fs.readFileSync(join(i18nPath, "en", namespace), "utf8")) as TranslationValue);
        const translation = flattenValues(JSON.parse(fs.readFileSync(join(i18nPath, languageCode, namespace), "utf8")) as TranslationValue);
        const fallbacks = allowedFallbacks[languageCode] ?? new Set<string>();
        const expectedKeys = Object.keys(reference).filter((key) => !fallbacks.has(key));

        expect(Object.keys(translation).sort()).toEqual(expectedKeys.sort());

        expectedKeys.forEach((key) => {
          expect(interpolationTokens(translation[key])).toEqual(interpolationTokens(reference[key]));
          expect(componentTags(translation[key])).toEqual(componentTags(reference[key]));
        });
      });
    });
  });
});
