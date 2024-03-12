import fs from "fs";
import {join} from "path";

describe("locales", () => {
  const translation = JSON.parse(fs.readFileSync(join(__dirname, "../i18n/en/translation.json")).toString());

  fs.readdirSync(join(__dirname, "../i18n/")).forEach((languageCode) => {
    const languageFolderPath = join(__dirname, "../i18n/", languageCode);

    // bugfix for filtering unwanted files, e.g., .DS_Store on macOS
    const isDirectory = fs.statSync(languageFolderPath).isDirectory();

    if (isDirectory && languageCode !== "en") {
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
