import fs from "fs";
import {join} from "path";

describe("locales", () => {
  const translation = JSON.parse(fs.readFileSync(join(__dirname, "../../public/locales/en/translation.json")).toString());

  fs.readdirSync(join(__dirname, "../../public/locales/"))
    .filter((dir) => dir !== "en")
    .forEach((languageCode) => {
      const anotherTranslation = JSON.parse(fs.readFileSync(join(__dirname, "../../public/locales/", languageCode, "translation.json")).toString());

      const keys = Object.keys(translation);
      keys.forEach((key) => {
        test(`key '${key}' should be defined for lang '${languageCode}' in translation`, () => {
          expect(anotherTranslation[key]).toBeDefined();
        });
      });

      keys.forEach((key) => {
        test(`keys for key '${key}' should be complete for lang '${languageCode}'`, () => {
          expect(Object.keys(translation[key])).toEqual(Object.keys(anotherTranslation[key]));
        });
      });
    });
});
