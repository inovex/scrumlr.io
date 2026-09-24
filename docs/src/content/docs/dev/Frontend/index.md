---
title: Introduction
description: Introduction to the scrumlr frontend
sidebar:
    order: 10
---

The frontend of [scrumlr.io](https://scrumlr.io) is a React single-page application. Its source lives in
[`/src`](https://github.com/inovex/scrumlr.io/tree/main/src) at the repository root. It talks to the Go backend over a REST API and, once you open a board, over a WebSocket.

Before contributing, please read the [contributing guideline](/dev/contributing/). If you are looking for the server
side instead, start with the [backend documentation](/dev/backend/).

One thing to know up front: **scrumlr is a realtime application, and almost every design decision in the frontend
follows from that.** When you write to a board you do not update local state. You call the API, and the change comes
back to every connected client over the WebSocket.

## Requirements

- **Node.js 26** — the version CI and the production image use.
- **Yarn Berry**, activated through Corepack. The version is pinned by the `packageManager` field in `package.json`.
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

Open **<http://localhost:5173>**.

You do not need to configure anything for this to work. `.env.development` is checked into the repository and already
points the client at `http://localhost:8080`, where the Docker backend listens. See
[Configuration](/dev/frontend/configuration/) if you need to change that.

## Where to go next

The four pages after this one build on each other and are worth reading in order:

1. **[Setup](/dev/frontend/setup/)** — Node and Corepack, what each script does, what CI enforces, editor configuration.
2. **[Architecture](/dev/frontend/architecture/)** — how the app boots, how routing and route guards work, and how a
   board is actually assembled from `BoardGuard`, `Board`, `Column` and `Note`.
3. **[State & Realtime](/dev/frontend/state-management/)** — the Redux store, the naming convention, and the two WebSockets.
4. **[Components](/dev/frontend/components/)** — what a component directory looks like, plus icons, dialogs, drag and
   drop, hotkeys and the custom hooks.

The rest are reference pages. Read them when the topic comes up:

- **[Styling & Theming](/dev/frontend/styling/)** — before your first change to a `.scss` file.
- **[Testing](/dev/frontend/testing/)** — before your first test.
- **[Configuration](/dev/frontend/configuration/)** — when you need to point the client somewhere else, or add an
  environment variable.
- **[Guidelines](/dev/frontend/guidelines/)** — the conventions, and the checklist to run before opening a pull request.
- **[Contributing Translations](/dev/frontend/translating/)** — adding a language, or a new translation key.
