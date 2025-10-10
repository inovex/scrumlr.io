---
title: Contributing Translations
description: Complete guide for adding new language support to Scrumlr
---

This guide provides step-by-step instructions for contributing a new language translation to Scrumlr. The application uses i18next for internationalization and currently supports English, German and French.

## Prerequisites

Before starting your translation contribution:

1. **Check existing languages**: Review `src/i18n/` to see currently supported languages
2. **Language code**: Identify the appropriate ISO 639-1 language code for your language (e.g., `fr` for French, `es` for Spanish)
3. **Development setup**: Ensure you have the development environment set up (see [Contributing Guide](./contributing))

## Translation Files Structure

Scrumlr uses two main translation files per language:

- `src/i18n/{language_code}/translation.json` - Main UI translations
- `src/i18n/{language_code}/templates.json` - Board template translations

## Step-by-Step Process

### 1. Create Translation Files

Create the translation directory and files for your language:

```bash
# Create language directory
mkdir src/i18n/{language_code}

# Copy base translation files into the new directory
cp src/i18n/en/translation.json src/i18n/{language_code}/translation.json
cp src/i18n/en/templates.json src/i18n/{language_code}/templates.json
```

### 2. Translate Content

#### Main Translation File (`translation.json`)

Open `src/i18n/{language_code}/translation.json` and translate all JSON values while keeping the keys unchanged:

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

### 3. Update i18n Configuration

Add your language to the i18n configuration in `src/i18n/index.ts`:

```typescript
// Import your translation files
import translation{LanguageCode} from "./{language_code}/translation.json";
import templates{LanguageCode} from "./{language_code}/templates.json";

export const resources = {
  en: {
    translation: translationEn,
    templates: templatesEn,
  },
  // ...
  // Add your language here
  {language_code}: {
    translation: translation{LanguageCode},
    templates: templates{LanguageCode},
  },
};
```

### 4. Add Flag Icon

Add a flag icon for your language:

1. Add the country flag as SVG file to `assets/flags/{COUNTRY_CODE}.svg`
2. The flag will be used in the language dropdown component

### 5. Add Language to UI Selector (language dropdown component)

Update the language dropdown component in `src/components/SettingsDialog/Components/LanguageSettingsDropdown.tsx`:

```typescript
// Import flag icon
import {ReactComponent as {LanguageName}} from "assets/flags/{COUNTRY_CODE}.svg";

// Add to languages array
const languages = [
  {icon: English, text: t("Language.english"), callback: () => changeLanguage("en"), code: "en"},
  {icon: German, text: t("Language.german"), callback: () => changeLanguage("de"), code: "de"},
  // Add your language
  {icon: {LanguageName}, text: t("Language.{language_name}"), callback: () => changeLanguage("{language_code}"), code: "{language_code}"},
];
```

### 6. Add Language Label Translation

Add the language name translation to all existing translation files:

e.g. `src/i18n/en/translation.json`:
```json
{
  "Language": {
    "english": "English",
    "german": "German",
    "{language_name}": "{Language Name in English}"
  }
}
```

### 7. Testing Your Translation

1. **Start the development server**:
   ```bash
   yarn start
   ```

2. **Test language switching**:
   - Navigate to Settings → Appearance
   - Select your language from the dropdown
   - Verify all text displays correctly

3. **Test completeness**:
   - Navigate through all application features
   - Check that no English text remains
   - Verify special characters display correctly


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
