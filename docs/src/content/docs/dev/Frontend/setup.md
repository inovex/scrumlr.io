---
title: Setup
description: Setting up the scrumlr frontend for local development
sidebar:
    order: 11
---

Everything on this page runs from the **repository root**. The frontend is not in a subdirectory.

## Node and Yarn

The project uses **Node 26** and **Yarn 4.14.1**. The Yarn version is pinned in `package.json`.

Yarn 4 is activated through [Corepack](https://nodejs.org/api/corepack.html). **Node 26 no longer ships Corepack**, so
on a fresh Node 26 installation you have to install it yourself before `yarn` will work:

```bash
npm install -g corepack@0.35.0 --ignore-scripts
corepack enable
corepack install
```

Once Corepack is set up, install the dependencies:

```bash
yarn
```

CI uses `yarn install --immutable --mode=skip-build`, which fails rather than updating `yarn.lock`. If your local install
modifies the lockfile, commit that change deliberately, otherwise CI will reject it.

Yarn is configured through `.yarnrc.yml` with `nodeLinker: node-modules` (a plain `node_modules` directory, not Plug'n'Play)
and `enableScripts: false`.

## Scripts

`package.json` defines six scripts. There is no `typecheck`, no `stylelint` and no `cypress` script.

### `yarn start`

Starts the Vite dev server on **<http://localhost:5173>** with hot module replacement. Type and lint errors are *not*
reported here — Vite only surfaces module resolution and runtime errors, as an overlay in the browser.

### `yarn build`

Runs `tsc -b && vite build` and writes to `build/`. Because `tsc` runs first, **this is the only command that typechecks
the project.** Run it before pushing; a type error that never shows up in the dev server will fail CI here.

### `yarn test`

Runs Vitest in **watch mode**. For a single run:

```bash
yarn test --run
```

See [Testing](/docs/src/content/docs/dev/frontend/testing.md) for fixtures, render helpers and the Cypress setup.

### `yarn lint` / `yarn lint:fix`

Runs ESLint over `src/`. The config (`eslint.config.mjs`) loads `eslint-plugin-only-warn`, which **downgrades every rule
to a warning**. That means `yarn lint` reports problems and still exits with code 0, so a passing local lint tells you
nothing. CI runs:

```bash
yarn lint --max-warnings 0
```

Use that form locally too. It is the single most common cause of a first red pipeline.

### `yarn format`

Runs Prettier over `src/**/*.{ts,tsx}`.

### `yarn prepare`

Installs the Husky git hooks. Yarn runs it automatically after `yarn install`.

## Git hooks

`.husky/pre-commit` runs `lint-staged`, which is configured in `package.json`:

| Files | Action |
| --- | --- |
| `src/**/*.{ts,tsx}` | `eslint --fix` |
| `src/**/*.{ts,tsx,json,css,scss,md}` | `prettier --write` |

So your staged changes are formatted and auto-fixed on every commit. `git commit --no-verify` skips the hook; if you use
it, run `yarn format` and `yarn lint --max-warnings 0` yourself before pushing.

## Editor setup

The repository root has an [`.editorconfig`](https://github.com/inovex/scrumlr.io/blob/main/.editorconfig), so make sure
your editor honours it (LF line endings, UTF-8, 2-space indent, trailing whitespace trimmed, final newline).

### VS Code

Install the **ESLint** and **Prettier** extensions, then add to `.vscode/settings.json`:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

Pointing at the workspace TypeScript matters: the project is on TypeScript 6, and VS Code's bundled version may be older.

### WebStorm / IntelliJ

- **Languages & Frameworks → JavaScript → Code Quality Tools → ESLint**: choose *Automatic ESLint configuration*.
- **Prettier**: enable *On save*, with the file pattern `{**/*,*}.{ts,tsx,json,css,scss,md}`.
- **Project Structure**: mark `src` as a *Resources root*, otherwise the IDE will not resolve the bare imports described
  below even though the build does.

## Path aliases

`tsconfig.json` defines path aliases and Vite applies them via `resolve.tsconfigPaths`.

The final catch-all is why `import {render} from "testUtils"` and `import i18n from "i18nTest"` resolve.

**Always import through the alias, never with relative parent paths:**

```tsx
// yes
import {Note} from "components/Note";
import {useAppSelector} from "store";

// no
import {Note} from "../../components/Note";
```

Relative imports within a single component directory (`import "./Note.scss"`, `import {NoteReactionList} from "./NoteReactionList"`)
are fine and expected. It is climbing out of the directory with `../..` that the codebase avoids.

SCSS has its own, separate resolution mechanism — see [Styling & Theming](/docs/src/content/docs/dev/frontend/styling.md).
