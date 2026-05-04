import fs from "fs";
import {join} from "path";

describe("locales", () => {
  const i18nPath = join(__dirname, "../i18n/");
  const translation = JSON.parse(fs.readFileSync(join(i18nPath, "en/translation.json")).toString());

  fs.readdirSync(i18nPath).forEach((languageCode) => {
    const languageFolderPath = join(i18nPath, languageCode);

    // Only validate locale directories that actually provide a translation file.
    const hasTranslation = fs.existsSync(join(languageFolderPath, "translation.json"));

    if (hasTranslation && languageCode !== "en") {
      const anotherTranslation = JSON.parse(fs.readFileSync(join(languageFolderPath, "translation.json")).toString());

      const keys = Object.keys(translation);

      keys.forEach((key) => {
        test(`key '${key}' should be defined for lang '${languageCode}' in translation`, () => {
          expect(anotherTranslation[key]).toBeDefined();
        });

        test(`keys for key '${key}' should be complete for lang '${languageCode}'`, () => {
          expect(Object.keys(translation[key])).toEqual(Object.keys(anotherTranslation[key]));
        });
      });
    }
  });
});
