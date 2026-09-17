---
title: Guidelines
description: Frontend conventions and the checklist to run before opening a pull request
sidebar:
    order: 18
---

The conventions below are what reviewers look for. The general contribution rules are in the [contributing guideline](/docs/src/content/docs/dev/contributing.md) and are not
repeated here.

## Imports

- **Use the path aliases, not relative parent paths.** `import {Note} from "components/Note"`, never
  `import {Note} from "../../components/Note"`. Relative imports inside a single component directory are fine.
- **Import from `react-router`, not `react-router-dom`.** The project is on React Router 8; `react-router-dom` is not a
  dependency.
- **Import store helpers from `"store"`** and slices
  from `"store/features"`. Never `useSelector` / `useDispatch` from `react-redux` directly.
- **The `.scss` import goes last**, after all module imports.

## TypeScript

- Strict mode is on. Don't work around it with `any`. If a type is genuinely unknown, use `unknown` and narrow.
- Name the props type `<ComponentName>Props`, and export it if anything else needs it.
- **Domain types come from the slice**, not from a local redeclaration (see [Architecture](/docs/src/content/docs/dev/Frontend/architecture.md#where-types-live)).
- Intentionally unused bindings get an underscore prefix: `(_state, action) => …`, `catch (_error)`. That is what the
  ESLint config allows.
- Remember that `yarn build` is the only thing that typechecks. The dev server will happily run code that does not
  compile.

## Accessibility

`eslint.config.mjs` enables the **recommended `jsx-a11y` ruleset** (only `no-autofocus` is switched off). Because CI runs
`yarn lint --max-warnings 0`, **an accessibility violation fails the build.** This is the most strictly enforced
convention in the codebase after formatting.

In practice:

- An interactive `div` needs a `role`, a `tabIndex` and a keyboard handler. The note element is the pattern to copy:

  ```tsx
  <div tabIndex={0} role="button" className="note" onClick={handleClick} onKeyDown={handleKeyPress} />
  ```

- Images need meaningful `alt` text; decorative elements get `aria-hidden="true"`.
- Icon-only buttons need an accessible name. `Button` derives `aria-label` from its `title` prop when there is no visible
  label, so make sure to use it.
- Dialogs use `react-focus-lock` so focus cannot escape while they are open.

## Rendering user content

Note text goes through `components/Note/NoteTextContent`, which handles markdown (`marked`) and link detection
(`linkify-react`). **Do not add new `marked` call sites or `dangerouslySetInnerHTML` elsewhere.** Route user content
through the existing component so the sanitisation story stays in one place.

## Before you open a pull request

Run all four. The first two are the ones people forget.

```bash
yarn build                    # the only typecheck
yarn lint --max-warnings 0    # what CI runs; plain `yarn lint` always exits 0
yarn test --run
yarn format
```

Then check by hand:

- [ ] Both light and dark theme look right.
- [ ] The change works on a narrow viewport, not just on desktop.
- [ ] Snapshot changes were reviewed, not blindly regenerated with `-u`.
- [ ] No new hex or named colors in SCSS.
- [ ] No new hardcoded user-facing strings; new keys added to all three locales.
- [ ] New behaviour has a test.

The project's full [Definition of Done](/docs/src/content/docs/dev/contributing.md#definition-of-done) covers the non-frontend-specific
expectations as well.
