---
title: Configuration
description: How the scrumlr frontend is configured at build time and at runtime
sidebar:
    order: 12
---

The frontend is configured **twice**, through two unrelated mechanisms:

- At **build time** by Vite environment variables (`VITE_*`), which are baked into the bundle.
- At **runtime** by cookies, which the nginx container sets from `SCRUMLR_*` environment variables.

Knowing which one applies where saves a lot of confusion. During local development you only care about the first. In a
self-hosted deployment you only care about the second.

## Environment files

`.env` and `.env.development` are both **checked into the repository** — they contain no secrets. Vite loads `.env`
always and `.env.development` additionally when running `yarn start`.

`.env.development` supplies:

```ini
VITE_SERVER_HTTP_URL=http://localhost:8080
VITE_SERVER_WEBSOCKET_URL=ws://localhost:8080
```

That is why `yarn start` reaches a local backend without any setup on your part. For machine-local overrides use
`.env.local` or `.env.development.local` — both are gitignored.

## Available variables

| Variable | Read in | Purpose |
|---|---|---|
| `VITE_SERVER_HTTP_URL` | `src/config.ts` | Base URL for REST calls |
| `VITE_SERVER_WEBSOCKET_URL` | `src/config.ts` | Base URL for the board WebSocket |
| `VITE_VERSION` | `src/index.tsx`, `components/AppInfo` | Displayed version; set from `$npm_package_version` |
| `VITE_LEGACY_CREATE_BOARD` | `store/features/view/reducer.ts` | Enables the legacy `/new` board creation route |
| `VITE_SHOW_HISTORY_PAGE` | `routes/Boards/Sessions/History.tsx` | Renders the board history list instead of the teaser |
| `BASE_URL` | several components | Vite's own built-in; used to build URLs for static assets in `public/` |

Vite only exposes variables prefixed with `VITE_` to client code, plus its own built-ins.

If you add a variable, declare it in `vite-env.d.ts` as well so `import.meta.env` stays typed. That file is currently
incomplete — `VITE_SHOW_HISTORY_PAGE` is missing from it — so do not treat it as the authoritative list.

## Runtime configuration (cookies)

A built bundle is static JavaScript; it cannot read environment variables. To keep one image configurable across
environments, the frontend container translates its `SCRUMLR_*` variables into cookies:

1. `Dockerfile` declares the defaults (`SCRUMLR_SERVER_URL`, `SCRUMLR_WEBSOCKET_URL`,
   `SCRUMLR_SHOW_LEGAL_DOCUMENTS`, `SCRUMLR_ANALYTICS_DATA_DOMAIN`, `SCRUMLR_ANALYTICS_SRC`, `SCRUMLR_CLARITY_ID`).
2. `nginx.conf` emits them as `Set-Cookie` headers on `/index.html`, named `scrumlr__server-url`,
   `scrumlr__websocket-url`, `scrumlr__show-legal-documents`, `scrumlr__analytics_data_domain`,
   `scrumlr__analytics_src` and `scrumlr__clarity_id`. All of them have `Max-Age=3600`.
3. `src/config.ts` reads those cookies with `js-cookie`.

So the bundle never reads a `SCRUMLR_*` variable directly. The full list of deployment-side names is in
[Environment Variables](/self-hosting/env-vars/#frontend).

### Resolution order

`src/config.ts` resolves the backend URLs in this order, taking the first value that is set:

1. The cookie (`scrumlr__server-url` / `scrumlr__websocket-url`) — set by nginx in a deployed environment.
2. The build-time variable (`VITE_SERVER_HTTP_URL` / `VITE_SERVER_WEBSOCKET_URL`).
3. `window.location.origin + "/api"`, with the protocol switched to `ws:`/`wss:` for the WebSocket.

The third case is the normal production path: the frontend and backend are served from the same origin, with the API
behind `/api`.

`SHOW_LEGAL_DOCUMENTS` follows the same cookie-first pattern but **defaults to `true`** when the cookie is absent, so an
empty value does not hide the legal pages.

Because these are ordinary cookies, you can point a deployed frontend at a different backend from your browser's dev
tools by setting `scrumlr__server-url` and `scrumlr__websocket-url` by hand. That is occasionally useful for debugging.

## Feature flags

Feature flags reach the store from two directions, and both end up in `state.view`:

- **From the server.** The `setServerInfo` thunk calls `GET /info` and the `view` reducer copies the response into
  `state.view`: `anonymousLoginDisabled`, `enabledAuthProvider`, `allowAnonymousCustomTemplates`,
  `allowAnonymousBoardCreation` and `feedbackEnabled`. The same response carries `serverTime`, which the reducer turns
  into `serverTimeOffset` — the clock skew the timer uses so every participant sees the same countdown.
- **From the build.** `legacyCreateBoard` is derived from `import.meta.env.VITE_LEGACY_CREATE_BOARD === "true"` in the
  slice's initial state.

Read either kind the same way:

```tsx
const feedbackEnabled = useAppSelector((state) => state.view.feedbackEnabled);
```

A third group of `view` values (theme, hotkey notifications, board reactions, snowfall) is persisted in `localStorage`
through the helpers in `src/utils/storage.ts`, keyed by the constants in `src/constants/storage.ts`.

## See also

- [Environment Variables](/self-hosting/env-vars/#frontend) — the deployment-side `SCRUMLR_*` names.
- [Architecture](/dev/frontend/architecture/) — where `config.ts` is consumed.
