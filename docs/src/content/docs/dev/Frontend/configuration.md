---
title: Configuration
description: How the scrumlr frontend is configured at build time and at runtime
sidebar:
    order: 12
---

The frontend is configured in multiple ways:

- By Vite environment variables (`VITE_*`) set at  **build time**, which are baked into the bundle.
- Through `SCRUMLR_*` environment variables, which are configured in two ways depending on their scope. Variables responsible for analytics options, WebSocket/server URLs, and legal document visibility are configured at **runtime** by cookies, which the nginx container sets. using cookies set by the NGINX container. Conversely, variables for database and Redis setups, server port, and anonymous user permissions are configured at **build time** using flags in `main.go` and read by the info endpoint in `info.go`.

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
| --- | --- | --- |
| `VITE_SERVER_HTTP_URL` | `src/config.ts` | Base URL for REST calls |
| `VITE_SERVER_WEBSOCKET_URL` | `src/config.ts` | Base URL for the board WebSocket |
| `VITE_VERSION` | `src/index.tsx`, `components/AppInfo` | Displayed version; set from `$npm_package_version` |
| `VITE_LEGACY_CREATE_BOARD` | `store/features/view/reducer.ts` | Enables the legacy `/new` board creation route |
| `VITE_SHOW_HISTORY_PAGE` | `routes/Boards/Sessions/History.tsx` | Renders the board history list instead of the teaser |
| `BASE_URL` | several components | Vite's own built-in; used to build URLs for static assets in `public/` |

Vite only exposes variables prefixed with `VITE_` to client code, plus its own built-ins.

If you add a variable, declare it in `vite-env.d.ts` as well so `import.meta.env` stays typed. Note: `vite-env.d.ts` is still incomplete as some flags like `VITE_SHOW_HISTORY_PAGE` are currently missing from it

## Runtime configuration (cookies)

A built bundle is static JavaScript, so it cannot read environment variables. To keep one image configurable across
environments, the frontend container translates its `SCRUMLR_*` variables into cookies:

1. `Dockerfile` declares the defaults.
2. `nginx.conf` emits them as `Set-Cookie` headers on `/index.html`
3. `src/config.ts` reads those cookies with `js-cookie`.

So the bundle never reads a `SCRUMLR_*` variable directly. The full list of deployment-side names is in
[Environment Variables](/self-hosting/env-vars#frontend).

`SHOW_LEGAL_DOCUMENTS` **defaults to `true`** when the cookie is absent, so an
empty value does not hide the legal pages.

Because these are ordinary cookies, you can point a deployed frontend at a different backend from your browser's dev
tools by setting `scrumlr__server-url` and `scrumlr__websocket-url` by hand. That is occasionally useful for debugging.

## Feature flags

Feature flags reach the store from two directions, and both end up in `state.view`:

- **From the server.** The `setServerInfo` thunk calls `GET /info` and the `view` reducer copies the response into
  `state.view`. The same response carries `serverTime`, which the reducer turns
  into `serverTimeOffset` - the clock skew the timer uses so every participant sees the same countdown
- **From the build.** `legacyCreateBoard` is derived from `import.meta.env.VITE_LEGACY_CREATE_BOARD === "true"` in the
  slice's initial state.

Read either kind the same way:

```tsx
const feedbackEnabled = useAppSelector((state) => state.view.feedbackEnabled);
```

A third group of `view` values (theme, hotkey notifications, board reactions, snowfall) is persisted in `localStorage`
through the helpers in `src/utils/storage.ts`, keyed by the constants in `src/constants/storage.ts`.

## See also

- [Environment Variables](/self-hosting/env-vars#frontend) — the deployment-side `SCRUMLR_*` names.
- [Architecture](/dev/frontend/architecture/) — where `config.ts` is consumed.
