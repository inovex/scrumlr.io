---
title: Introduction
description: Introduction to the scrumlr frontend
sidebar:
    order: 10
---

The frontend of [scrumlr.io](https://scrumlr.io) is a React single-page application. Its source lives in
[`/src`](https://github.com/inovex/scrumlr.io/tree/main/src) at the repository root — there is no separate `frontend/`
directory. It talks to the Go backend over a REST API and, once you open a board, over a WebSocket.

Before contributing, please read the [contributing guideline](/dev/contributing/). If you are looking for the server
side instead, start with the [backend documentation](/dev/backend/).

One thing to know up front: **scrumlr is a realtime application, and almost every design decision in the frontend
follows from that.** When you write to a board you do not update local state — you call the API, and the change comes
back to every connected client over the WebSocket. Open the app in two browser windows side by side once and add a note;
the shape of the store makes a lot more sense afterwards.

## Stack at a glance

| What | Used for |
|---|---|
| React 19 + TypeScript | The application itself. Strict mode; no class components. |
| Redux Toolkit 2 | All shared state. `createAction` / `createReducer` / `createAsyncThunk` — no RTK Query. |
| React Router 8 | Routing. **Import from `react-router`, not `react-router-dom`.** |
| Vite 8 | Dev server and production build. |
| Vitest 4 + happy-dom | Unit and component tests. |
| Cypress 15 | End-to-end tests. |
| SCSS (sass) | Styling. One `.scss` file per component, BEM class names. |
| `sockette` | The board WebSocket. |
| `react-i18next` | Translations (en, de, fr). |
| `@dnd-kit` | Dragging notes between columns and onto stacks. |
| `underscore` | `_.isEqual` as the selector equality function. Not optional — see [State & Realtime](/dev/frontend/state-management/). |

## Requirements

- **Node.js 26** — the version CI and the production image use.
- **Yarn 4.14.1**, activated through Corepack. The version is pinned by the `packageManager` field in `package.json`.
- **Docker** and Docker Compose, to run the backend and its database locally.

There is no `.nvmrc` and no `engines` field in `package.json`, so your version manager will not warn you if you are on
the wrong Node version. Node 26 also no longer ships Corepack, which means `corepack enable` fails on a fresh install —
[Setup](/dev/frontend/setup/) has the exact commands.

## Quick start

Start the backend and its dependencies first:

```bash
docker compose --project-directory server/ --profile build up -d
```

Then, from the repository root:

```bash
yarn
yarn start
```

Open **http://localhost:5173**. You can create a board and join it without registering — anonymous login is enabled by
default.

You do not need to configure anything for this to work. `.env.development` is checked into the repository and already
points the client at `http://localhost:8080`, where the Docker backend listens. See
[Configuration](/dev/frontend/configuration/) if you need to change that.

## Common commands

| Command | What it does | Worth knowing |
|---|---|---|
| `yarn start` | Vite dev server on port 5173 | Hot module replacement; errors appear as an overlay in the browser |
| `yarn build` | `tsc -b && vite build` → `build/` | **The only thing that typechecks the project.** There is no separate `typecheck` script |
| `yarn test` | Vitest | Starts in **watch mode**. Use `yarn test --run` for a single run |
| `yarn lint` | ESLint over `src/` | **Exits 0 even when it reports problems.** CI runs `yarn lint --max-warnings 0` |
| `yarn lint:fix` | ESLint with `--fix` | |
| `yarn format` | Prettier over `src/**/*.{ts,tsx}` | Also runs automatically on staged files via a pre-commit hook |

The `yarn test` and `yarn lint` footnotes catch nearly everyone once. [Setup](/dev/frontend/setup/) explains why and
lists the commands CI actually runs.

## Repository map

```
src/
├── api/            one module per REST resource, spread into a single `API` object
├── assets/         icons, flags, backgrounds, illustrations (imported via the `assets/*` alias)
├── components/     ~70 component directories, each `Name.tsx` + `Name.scss` + `index.ts`
├── constants/      colors, SCSS tokens, hotkeys, avatar options, storage keys
├── i18n/           i18next setup and the translation JSON for en, de, fr
├── routes/         route-level components: Homepage, Board, Boards, LoginBoard, Legal, …
├── store/          Redux: `store.ts`, `retryable.ts` and one directory per feature slice
├── types/          cross-cutting types — most notably `websocket.ts`
├── utils/          helpers, custom hooks (`utils/hooks/`) and test fixtures (`utils/test/`)
├── config.ts       resolves the backend URLs from cookies, env vars or the current origin
├── index.tsx       entry point: providers, analytics, `initAuth`
├── index.scss      global styles, font loading, accent-color class generation
├── setupTests.ts   Vitest setup — global mocks
├── testUtils.tsx   `render` helpers that wrap components in router, store and i18n
└── i18nTest.ts     a second, test-only i18next instance
```

Domain types are *not* in `src/types/`. `Board`, `Note`, `Column`, `Participant` and friends live next to the state that
owns them, in `src/store/features/<slice>/types.ts`.

## Where to go next

The four pages after this one build on each other and are worth reading in order:

1. **[Setup](/dev/frontend/setup/)** — Node and Corepack, what each script does, what CI enforces, editor configuration.
2. **[Architecture](/dev/frontend/architecture/)** — how the app boots, how routing and route guards work, and how a
   board is actually assembled from `BoardGuard`, `Board`, `Column` and `Note`.
3. **[State & Realtime](/dev/frontend/state-management/)** — the Redux store, the naming convention that separates
   "I asked the server to do this" from "the server told me it happened", and the two WebSockets.
4. **[Components](/dev/frontend/components/)** — what a component directory looks like, plus icons, dialogs, drag and
   drop, hotkeys and the custom hooks.

The rest are reference pages. Read them when the topic comes up:

- **[Styling & Theming](/dev/frontend/styling/)** — before your first change to a `.scss` file.
- **[Testing](/dev/frontend/testing/)** — before your first test.
- **[Configuration](/dev/frontend/configuration/)** — when you need to point the client somewhere else, or add an
  environment variable.
- **[Guidelines](/dev/frontend/guidelines/)** — the conventions, and the checklist to run before opening a pull request.
- **[Contributing Translations](/dev/frontend/translating/)** — adding a language, or a new translation key.
