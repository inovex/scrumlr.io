---
title: Styling & Theming
description: SCSS conventions, BEM, dark mode and the accent color system
sidebar:
    order: 16
---

Styling is plain SCSS — one `.scss` file per component, BEM class names, no CSS-in-JS and no utility framework. Two
systems are worth understanding before your first change: how dark mode works, and how accent colors work. Both are
driven by CSS custom properties set outside the component you are editing.

## How SCSS resolves

Component stylesheets start with a bare `@use`:

```scss
@use "constants/styles";
@use "constants/mixins";
```

That resolves because Vite adds `src/` to Sass's load paths:

```ts
css: {
  preprocessorOptions: {
    scss: {loadPaths: [path.resolve(__dirname, 'src')]},
  },
},
```

Sass then finds `src/constants/_styles.scss` (the leading underscore marks a partial). This is a **separate mechanism from
the TypeScript path aliases** — configuring one does not configure the other, which is why some editors resolve the TS
imports but not the SCSS ones.

`_styles.scss` begins with `@forward "colors"`, so the `styles` namespace gives you both the layout tokens and the whole
palette. You rarely need to `@use "constants/colors"` separately.

Three files under `src/constants/`:

| File | Contains |
|---|---|
| `_colors.scss` | The raw palette (`$blue--500`, `$navy--400`, `$gray--000`, …) plus the `$primary-colors`, `$secondary-colors` and `$base-colors` maps |
| `_styles.scss` | Layout constants, spacing scale (`$spacing--xxs` … `$spacing--3xl`), border radii, icon sizes, font sizes, z-index scale, breakpoints, shadows |
| `_mixins.scss` | Reusable blocks: `flex-center`, `inset-0`, `scrollbar`, `tooltip--light` / `tooltip--dark`, `default-states`, `invalid-state`, `compensate-padding`, `column-stripes-*`, `box-shadow-*` |

Global styles, font loading (`@fontsource/raleway`) and the accent-color class generation live in `src/index.scss`.

## BEM

Block, element, modifier. The block is the kebab-case component name:

```scss
.text-input {
  &__container { … }
  &__adornment {
    &--left { … }
  }
  &--disabled { … }
}
```

Local SCSS variables are namespaced by block too — `$note__indicator-height`, `$text-input__gap` — so they don't collide
when two partials are read side by side.

On the TypeScript side, `classNames` composes them; see
[Components](/dev/frontend/components/#directory-anatomy) for the argument order.

BEM is part of the project's [Definition of Done](/dev/contributing/#definition-of-done), not just a preference.

## Dark theme

The theme is a single attribute on the `<html>` element, set in exactly one place: `components/Html/Html.tsx`, which
renders a `react-helmet-async` `<html>` tag with `data-theme={autoTheme}`. `useAutoTheme` turns the user's stored
preference (`"auto" | "light" | "dark"`) into a concrete `light` or `dark` by consulting `prefers-color-scheme`.

**Write light styles as the default and append a dark block at the bottom of the same file:**

```scss
.note {
  background-color: styles.$gray--000;
  color: styles.$navy--900;
}

[data-theme="dark"] {
  .note {
    background-color: styles.$navy--400;
    color: styles.$gray--000;
  }
}
```

Not a separate file, and not a `prefers-color-scheme` media query — the attribute has to win, because the user can
override their system setting in the app. Around 115 component stylesheets follow this pattern.

Inside a mixin the ampersand is required so the selector nests correctly:

```scss
@mixin my-thing {
  color: colors.$navy--900;

  [data-theme="dark"] & {
    color: colors.$gray--000;
  }
}
```

Both themes must work and be tested — also a Definition of Done item.

## Accent colors

Each column has one of seven accent colors, and everything inside it (notes, buttons, borders, scrollbars) picks that
color up automatically. The chain spans four files, which is why it is hard to reconstruct from any one of them:

**1. `src/constants/colors.ts`** defines the union and the class name helper:

```ts
export type Color = "backlog-blue" | "goal-green" | "poker-purple" | "online-orange"
                  | "planning-pink" | "value-violet" | "yielding-yellow";

export const getColorClassName = (color: Color | undefined) => `accent-color__${color ?? COLOR_ORDER[0]}`;
```

**2. `src/constants/_colors.scss`** maps each name to a full set of shades in `$primary-colors` / `$secondary-colors`.

**3. `src/index.scss`** loops over those maps and generates one class per color, each setting the CSS custom properties:

```scss
.accent-color__backlog-blue {
  --accent-color--500: …;
  --accent-color--500-rgb: …;
  /* … 100 through 800 … */
  --accent-color--light: /* shade 500 */;
  --accent-color--dark:  /* shade 400 */;
}
```

**4. The component** puts the class on its root element and everything below reads the variables:

```tsx
const colorClassName = getColorClassName(color);
<section className={classNames("column", colorClassName)}>
```

```scss
.note {
  border: 2px solid var(--accent-color--light);
  outline: 2px solid rgba(var(--accent-color--light-rgb), 0.5);
}
```

The `-rgb` variants exist purely so you can use a color with alpha — `rgba()` cannot take a hex custom property and add
transparency, so the palette also emits comma-separated channel triplets. `src/index.scss` emits the same `-rgb` pairs for
the base `--navy--*` and `--gray--*` scales at `:root`.

Useful helpers in `colors.ts`: `getColorForIndex` / `getNextColor` / `getPreviousColor` (the colors are ordered like a
spectrum), `formatColorName` for display, and `needsHighContrast`, which flags `backlog-blue` and `value-violet` as
needing extra contrast treatment.

Adding a color means touching two files: the map in `_colors.scss` and the `Color` union plus `COLOR_ORDER` in
`colors.ts`.

## Stylelint rules

`.stylelintrc.json` is short:

```json
{
  "rules": {
    "color-no-hex": true,
    "color-named": "never"
  }
}
```

**Nothing currently runs stylelint** — it is not a package script, not in `lint-staged` and not in CI (see
[Setup](/dev/frontend/setup/#what-ci-enforces)). The rules still describe how the codebase is written, and they exist for
a concrete reason: a hex value in a component stylesheet cannot participate in theming or in the accent color system. Use
a token (`styles.$navy--400`) or a custom property (`var(--accent-color--light)`).

The only place raw hex belongs is `_colors.scss`, where the palette is defined.

## Responsiveness

Breakpoints are stored as media query *strings* in `_styles.scss` and interpolated:

```scss
@media #{styles.$smartphone} {
  .mini-menu { … }
}
```

| Token | Query |
|---|---|
| `$mini-smartphone` | `max-width: 480px` |
| `$smartphone` | `max-width: 767px` |
| `$tablet` | `min-width: 768px` |
| `$desktop` | `min-width: 1280px` |
| `$menu-mobile` / `$menu-desktop` | `max-width: 1343px` / `min-width: 1344px` — the menu bar has its own breakpoint |

There is also a container query token, `$container__note`, for note-internal layout.

On small screens the board menus collapse into `MiniMenu`; `MenuBars` handles the switch. Responsiveness across screen
sizes is a Definition of Done item, so check a narrow viewport before opening a pull request.

## Z-index

Don't invent z-index values. `_styles.scss` defines a scale built from `$base-z-index` and `$base-z-index-step`
(`$note-z-index`, `$column-header-z-index`, `$menu-z-index`, `$backdrop-z-index`, `$tooltip-z-index`, …). Add to that
scale rather than writing a number, so the stacking order stays readable in one place.

## Print styles

The print view (`components/SettingsDialog/ExportBoard/PrintView`) is a separate render path with its own styles — board
layout, menus and interactive affordances all have to go away. If you add something structural to the board, check the
print output too. See [Architecture](/dev/frontend/architecture/#export-import-and-print).
