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

Component stylesheets start with a bare `@use`, which resolves because Vite adds `src/` to Sass's load paths. Sass then finds `src/constants/_styles.scss` (the leading underscore marks a partial).

`_styles.scss` begins with `@forward "colors"`, so the `styles` namespace gives you both the layout tokens and the whole
palette. You rarely need to `@use "constants/colors"` separately.

Three files under `src/constants/`:

| File | Contains |
| --- | --- |
| `_colors.scss` | Color palette variables and maps. |
| `_styles.scss` | Layout constants, spacing scale, font sizes, z-index scale, breakpoints, and forwarded colors. |
| `_mixins.scss` | Reusable mixins (flex-center, input states, scrollbars, box-shadows). |

Global styles, font loading (`@fontsource/raleway`) and the accent-color class generation live in `src/index.scss`.

## BEM

To prevent name collisions between stylesheets, local SCSS variables must be prefixed with the component's BEM block name.

On the TypeScript side, `classNames` composes them (see
[Components](/docs/src/content/docs/dev/Frontend/components.md#directory-anatomy) for the argument order)

BEM is part of the project's [Definition of Done](/docs/src/content/docs/dev/contributing.md#definition-of-done), not just a preference.

## Dark theme

The theme is a single attribute on the `<html>` element, set in `components/Html/Html.tsx`.

**Write light styles as the default and append a dark block at the bottom of the same file.**

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

**2. `src/constants/_colors.scss`** maps each name to a full set of shades in `$primary-colors` / `$secondary-colors`.

**3. `src/index.scss`** loops over those maps and generates one class per color, each setting the CSS custom properties.

**4. The component** puts the class on its root element and everything below reads the variables.

The `-rgb` variants exist purely so you can use a color with alpha since `rgba()` cannot take a hex custom property and add
transparency, so the palette also emits comma-separated channel triplets. `src/index.scss` emits the same `-rgb` pairs for
the base `--navy--*` and `--gray--*` scales at `:root`.

Adding a color means touching two files: the map in `_colors.scss` and the `Color` union plus `COLOR_ORDER` in
`colors.ts`.

## Stylelint rules

**Nothing currently runs stylelint `.stylelintrc.json`** — it is not a package script, not in `lint-staged` and not in CI (see
[Setup](/docs/src/content/docs/dev/Frontend/setup.md#what-ci-enforces)). The rules still describe how the codebase is written, and they exist for
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

There is also a container query token, `$container__note`, for note-internal layout.

On small screens the board menus collapse into `MiniMenu`. `MenuBars` handles the switch. Responsiveness across screen
sizes is a Definition of Done item, so check a narrow viewport before opening a pull request.

## Z-index

Don't invent z-index values. `_styles.scss` defines a scale built from `$base-z-index` and `$base-z-index-step`. Add to that
scale rather than writing a number, so the stacking order stays readable in one place.

## Print styles

The print view (`components/SettingsDialog/ExportBoard/PrintView`) is a separate render path with its own styles. If you add something structural to the board, check the
print output too. See [Architecture](/docs/src/content/docs/dev/Frontend/architecture.md#export-import-and-print).
