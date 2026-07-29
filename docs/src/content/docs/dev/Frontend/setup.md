---
title: Setup
description: Setting up the scrumlr frontend for local development
sidebar:
    order: 11
---

Everything on this page runs from the **repository root**. The frontend is not in a subdirectory.

## Node and Yarn

The project uses **Node 26** and **Yarn 4.14.1**. The Yarn version is pinned in `package.json`:

```json
"packageManager": "yarn@4.14.1"
```

Yarn 4 is activated through [Corepack](https://nodejs.org/api/corepack.html). **Node 26 no longer ships Corepack**, so
on a fresh Node 26 installation you have to install it yourself before `yarn` will work:

```bash
npm install -g corepack@0.35.0 --ignore-scripts
corepack enable
corepack install
```

This is exactly what CI and the production `Dockerfile` do. If you skip it you will see one of two symptoms:

- `corepack: command not found` — Corepack is not installed at all.
- A Yarn usage error complaining that the project requires `yarn@4.14.1` while a different global Yarn is active —
  Corepack is installed but has not been enabled, so an older global Yarn is answering.

Once Corepack is set up, install the dependencies:

```bash
yarn
```

CI uses `yarn install --immutable --mode=skip-build`, which fails rather than updating `yarn.lock`. If your local install
modifies the lockfile, commit that change deliberately — otherwise CI will reject it.

Yarn is configured through `.yarnrc.yml` with `nodeLinker: node-modules` (a plain `node_modules` directory, not Plug'n'Play)
and `enableScripts: false`.

## Scripts

`package.json` defines six scripts. There is no `typecheck`, no `stylelint` and no `cypress` script.

### `yarn start`

Starts the Vite dev server on **http://localhost:5173** with hot module replacement. Type and lint errors are *not*
reported here — Vite only surfaces module resolution and runtime errors, as an overlay in the browser.

### `yarn build`

Runs `tsc -b && vite build` and writes to `build/`. Because `tsc` runs first, **this is the only command that typechecks
the project.** Run it before pushing; a type error that never shows up in the dev server will fail CI here.

### `yarn test`

Runs Vitest in **watch mode**. For a single run:

```bash
yarn test --run
```

See [Testing](/dev/frontend/testing/) for fixtures, render helpers and the Cypress setup.

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

## What CI enforces

The `Build and Test – Frontend` job in `.github/workflows/continuous-integration.yml` runs, in order:

| Step | Command |
|---|---|
| Install Corepack | `npm install -g corepack@0.35.0 --ignore-scripts && corepack enable && corepack install` |
| Set up Node | `actions/setup-node` with `node-version: "26"` and the yarn cache |
| Install | `yarn install --immutable --mode=skip-build` |
| Build | `CI=false yarn build` |
| Lint | `yarn lint --max-warnings 0` |
| Test | `yarn test --run --coverage --passWithNoTests` |

Two things this list does *not* include:

- **Stylelint.** `.stylelintrc.json` exists and defines real rules (`color-no-hex`, `color-named: never`), but nothing
  runs it — not a script, not `lint-staged`, not CI. The rules still describe how the codebase is written; see
  [Styling & Theming](/dev/frontend/styling/).
- **A separate typecheck.** `tsc` only runs as part of `yarn build`.

The `CI=false` prefix on the build step is a leftover from Create React App and has no effect on Vite.

Cypress runs in a separate, pull-request-only job that starts the dev server and waits on
`http://localhost:5173`. It is not driven by a package script — see [Testing](/dev/frontend/testing/) for how to run it
locally.

## Git hooks

`.husky/pre-commit` runs `lint-staged`, which is configured in `package.json`:

| Files | Action |
|---|---|
| `src/**/*.{ts,tsx}` | `eslint --fix` |
| `src/**/*.{ts,tsx,json,css,scss,md}` | `prettier --write` |

So your staged changes are formatted and auto-fixed on every commit. `git commit --no-verify` skips the hook; if you use
it, run `yarn format` and `yarn lint --max-warnings 0` yourself before pushing.

## Editor setup

The repository root has an [`.editorconfig`](https://github.com/inovex/scrumlr.io/blob/main/.editorconfig) — make sure
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

## Prettier settings worth knowing

`.prettierrc` is deliberately unusual:

```json
{
  "printWidth": 180,
  "bracketSpacing": false,
  "arrowParens": "always",
  "trailingComma": "es5",
  "semi": true,
  "tabWidth": 2
}
```

`printWidth: 180` means long JSX lines are expected, not a mistake. `bracketSpacing: false` is why imports read
`import {Note} from "components/Note"` and not `import { Note } from …`. Don't fight either — the pre-commit hook will
just rewrite your file.

## Path aliases

`tsconfig.json` defines path aliases and Vite applies them via `resolve.tsconfigPaths`:

```
api/*         assets/*      components/*   constants/*
i18n/*        routes/*      store/*        types/*
utils/*       *             → ./src/*
```

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

SCSS has its own, separate resolution mechanism — see [Styling & Theming](/dev/frontend/styling/).
