---
title: Contributing Translations
description: Complete guide for adding new language support to Scrumlr
sidebar:
    order: 19
---

This guide provides step-by-step instructions for contributing a new language translation to Scrumlr. The application uses i18next for internationalization and currently supports English, German and French.

## Prerequisites

Before starting your translation contribution:

1. **Check existing languages**: Review `src/i18n/` to see currently supported languages
2. **Language code**: Identify the appropriate ISO 639-1 language code for your language (e.g., `fr` for French, `es` for Spanish)
3. **Development setup**: Ensure you have the development environment set up (see [Setup](/dev/frontend/setup/) and the [Contributing Guide](/dev/contributing/))

## Translation Files Structure

Scrumlr uses two main translation files per language:

- `src/i18n/{language_code}/translation.json` - Main UI translations
- `src/i18n/{language_code}/templates.json` - Board template translations

Adding a language touches more than these two files. There are **four separate hardcoded language lists** plus two
directories of static assets — the steps below cover all of them, and skipping any one leaves a partly broken language.

## Step-by-Step Process

Throughout this guide, replace `es` with your own language code.

### 1. Create Translation Files

Create the translation directory and files for your language:

```bash
mkdir src/i18n/es
cp src/i18n/en/translation.json src/i18n/es/translation.json
cp src/i18n/en/templates.json src/i18n/es/templates.json
```

### 2. Translate Content

#### Main Translation File (`translation.json`)

Open `src/i18n/es/translation.json` and translate all JSON values while keeping the keys unchanged:

```json
{
  "InfoBar": {
    "ReturnToPresentedNote": "Your translation here",
    "VotingIsAnonymous": "Your translation here",
    "VotingIsNotAnonymous": "Your translation here"
  },
  "LegacyNewBoard": {
    "boardName": "Your translation here",
    "createNewBoard": "Your translation here"
    // ... continue translating all values
  }
}
```

#### Template Translations (`templates.json`)

Similarly, translate the template file:

```json
{
  "template": {
    "lean_coffee": {
      "name": "Your translation here",
      "description": "Your translation here",
      "column": {
        "lean_coffee": {
          "name": "Your translation here",
          "description": "Your translation here"
        }
        // ... continue translating
      }
    }
  }
}
```

### 3. Update the i18n Configuration

Register the language in `src/i18n/index.ts`. This is the **first** of four language lists:

```typescript
// Import your translation files
import translationEs from "./es/translation.json";
import templatesEs from "./es/templates.json";

export const resources = {
  en: {
    translation: translationEn,
    templates: templatesEn,
  },
  // ...
  // Add your language here
  es: {
    translation: translationEs,
    templates: templatesEs,
  },
};
```

The `AppLanguage` type is derived from `resources`, so adding an entry here is what makes the language known to the rest
of the codebase.

### 4. Add Flag Icon

Flag icons live in **`src/assets/flags/`** and are named after the ISO 3166-1 alpha-2 **country** code, in uppercase —
`DE.svg`, `FR.svg`, `US.svg`. Add yours the same way, e.g. `src/assets/flags/ES.svg`.

The existing flags are circular SVGs taken from [HatScripts/circle-flags](https://github.com/HatScripts/circle-flags)
(see `src/assets/flags/readme.md`). Take yours from the same source so it matches the others visually.

There is no top-level `assets/` directory — `assets/*` is a path alias for `src/assets/*`, which is why the import strings
below look like they have no path.

### 5. Add the Language to the Settings Dropdown

Update `src/components/SettingsDialog/Components/LanguageSettingsDropdown.tsx` — the **second** language list:

```typescript
// Import the flag icon. Note the `?react` suffix: it is what turns the SVG into a component.
import Spanish from "assets/flags/ES.svg?react";

// Add to the languages array
const languages = [
  {icon: English, text: t("Language.english"), callback: () => changeLanguage("en"), code: "en"},
  {icon: German, text: t("Language.german"), callback: () => changeLanguage("de"), code: "de"},
  {icon: French, text: t("Language.french"), callback: () => changeLanguage("fr"), code: "fr"},
  // Add your language
  {icon: Spanish, text: t("Language.spanish"), callback: () => changeLanguage("es"), code: "es"},
];
```

:::caution
The `?react` query is required. `vite-plugin-svgr` is configured with `include: '**/*.svg?react'`, so only that form
produces a React component — a plain `.svg` import gives you a URL string. The old Create React App syntax
`import {ReactComponent as Spanish} from "assets/flags/ES.svg"` **no longer compiles** and appears nowhere in `src/`.
:::

### 6. Add the Language to the Homepage Picker

The landing page has its **own** flag list, separate from the settings dialog. Update
`src/routes/Homepage/Homepage.tsx`:

```typescript
import Spanish from "assets/flags/ES.svg?react";
```

```tsx
<li>
  <LegacyButton leftIcon={<Spanish />} className="homepage__language" hideLabel onClick={changeLanguage("es")}>
    Español
  </LegacyButton>
</li>
```

Note that the label here is the language's own name, written out literally rather than translated.

### 7. Add the Language to the Test i18n Instance

`src/i18nTest.ts` is a second, test-only i18next instance with a **third** hardcoded list. It uses the `translation`
namespace only:

```typescript
import translationEs from "./i18n/es/translation.json";

export const resources = {
  en: {translation: translationEn},
  de: {translation: translationDe},
  fr: {translation: translationFr},
  es: {translation: translationEs},
};
```

Skip this and tests that assert on translated text will render raw keys, with no obvious explanation.

### 8. Add the Language Label Translation

Add the language name to the `Language` key of **every** translation file, including the new one:

e.g. `src/i18n/en/translation.json`:
```json
{
  "Language": {
    "english": "English",
    "german": "German",
    "french": "French",
    "spanish": "Spanish"
  }
}
```

### 9. Add Emoji Picker Data

The emoji picker loads its dataset per language from `public/emoji-data/<language_code>.json`. `EmojiPicker.tsx` builds
the URL from `i18n.resolvedLanguage`, so a language without a matching file gets a 404 and a broken picker.

Generate the file with:

```bash
node scripts/generateEmojiData.mjs
```

The script writes to `scripts/out/` (gitignored); copy the result into `public/emoji-data/`.

### 10. Add Legal Documents (optional)

The legal pages (`/legal/termsAndConditions`, `/legal/privacyPolicy`, `/legal/cookiePolicy`) are markdown files fetched
at runtime from `public/locales/<language_code>/`:

```
public/locales/es/termsAndConditions.md
public/locales/es/privacyPolicy.md
public/locales/es/cookiePolicy.md
```

These are **optional** — they are legal text, and a machine translation is worse than none. If you skip them, the legal
pages will simply be empty in your language, as is currently the case for French. Note that the pages are only shown at
all when the `scrumlr__show-legal-documents` cookie is not `false`; see
[Configuration](/dev/frontend/configuration/#runtime-configuration-cookies).

### 11. Testing Your Translation

1. **Run the key parity test**:
   ```bash
   yarn test --run src/__tests__/locales.test.ts
   ```
   This compares your `translation.json` against the English one. Be aware of its limits: it only checks the **top two
   levels** of keys, and it does not look at `templates.json` at all. A green run means you have not missed a whole
   section — not that the file is complete.

2. **Start the development server**:
   ```bash
   yarn start
   ```

3. **Test language switching**:
   - Switch from the homepage flag buttons, and from Settings → Appearance
   - Verify all text displays correctly in both places

4. **Test completeness**:
   - Navigate through all application features
   - Check that no English text remains
   - Open the emoji picker and a board template to check the `templates` namespace and the emoji data
   - Verify special characters display correctly

## Adding a Single Translation Key

Far more common than adding a language: you are building a feature and need a new string.

1. Add the key to `src/i18n/en/translation.json`, under an object named after your component
   (`"Note": {"showMore": "Show more"}`).
2. Add the same key to `de/translation.json` and `fr/translation.json`. A machine translation is acceptable — say so in
   the pull request and a native speaker can correct it later. Leaving the key out is not, because
   `src/__tests__/locales.test.ts` will fail.
3. Use it in the component:

   ```tsx
   const {t} = useTranslation();
   // ...
   {t("Note.showMore")}
   ```

   With interpolation:

   ```tsx
   {t("Note.userImageAlt", {user: participant.user.name})}
   ```

Two special cases:

- **Board templates** live in the `templates` namespace: `useTranslation(["translation", "templates"])`.
- **`retryable` error keys** must go under the `Error` object in `src/i18n/en/translation.json`. The key is typed, so a
  thunk using a missing one will not compile — see
  [State & Realtime](/dev/frontend/state-management/#error-handling-retryable).

## Translation Guidelines

### Best Practices

1. **Maintain context**: Understand the UI context where text appears
2. **Consistent terminology**: Use consistent terms throughout your translation
3. **Length considerations**: Consider text length differences that might affect UI layout

### Handling Pluralization

Some strings use i18next pluralization syntax:

```json
{
  "column_one": "{{count}} Column",
  "column_other": "{{count}} Columns"
}
```

Follow your language's pluralization rules and i18next documentation for proper implementation.

### Special Characters and Encoding

- Use UTF-8 encoding for all translation files
- Test special characters (accents, umlauts, etc.) thoroughly
- Ensure proper display across different browsers and devices

## Submitting Your Translation

1. **Create a pull request** with the title format: `feat: add {Language Name} translation support`

2. **Include in your PR description**:
   - Language code used
   - Any specific notes about your translation choices
   - Confirmation that you've tested the complete UI

3. **Be prepared for review**:
   - Maintainers may ask native speakers to review samples
   - Be open to feedback and suggestions

## Maintaining Translations

Once your translation is merged:

- **Monitor updates**: Watch for new strings added to the English version
- **Update accordingly**: Contribute updates when new features are added
- **Report issues**: If you notice translation problems, please report them

## Getting Help

If you need assistance during the translation process:

- **GitHub Discussions**: Ask questions in the [Q&A section](https://github.com/inovex/scrumlr.io/discussions)
- **Issues**: Report technical problems with the translation system
- **Community**: Connect with other translators and maintainers

---

## 🌍 Our Amazing Translation Contributors 🎉

We want to give a huge shoutout to all the incredible people who have made Scrumlr accessible to users around the world! 🙌

### 🇩🇪 German (Deutsch)
- Core team contributors 💪

### 🇫🇷 French (Français)
- **Loule95450** - Thank you for adding French support! 🥐✨

### 🚀 Want to see your name here?

Join our community and help make Scrumlr available in your language! Every contribution, no matter how small, makes a difference. 💪

---

## 💝 Thank You!

Thank you for contributing to make Scrumlr accessible to more users worldwide! Your efforts help break down language barriers and bring the power of collaborative retrospectives to teams everywhere.

Together, we're building something amazing! 🚀✨
