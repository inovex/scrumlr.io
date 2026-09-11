---
title: Testing
description: Unit, component and end-to-end tests in the scrumlr frontend
sidebar:
    order: 17
---

Unit and component tests run on [Vitest](https://vitest.dev/) with `happy-dom` and Testing Library. End-to-end tests run
on [Cypress](https://www.cypress.io/). New features are expected to come with tests — it is part of the
[Definition of Done](/dev/contributing/#definition-of-done).

## Running tests

```bash
yarn test           # watch mode
yarn test --run     # single run
```

`yarn test` alone starts **watch mode**, which is the first surprise for most people. CI runs:

```bash
yarn test --run --coverage --passWithNoTests
```

Configuration lives in the `test` block of `vite.config.ts`:

- `globals: true` — `describe`, `it`, `test`, `expect` and `vi` are available without importing them.
- `environment: 'happy-dom'`.
- `setupFiles: './src/setupTests.ts'`.
- `css: true` — stylesheets are processed, so class names appear in snapshots.

Tests live in a `__tests__/` directory next to the code they cover.

## Rendering a component

Use the wrappers in `src/testUtils.tsx`, not Testing Library's `render` directly. They provide the router, the store and
i18n:

| Export | Wraps in |
|---|---|
| `render` | `MemoryRouter` → `I18nextProvider` → `Provider` with a default test store |
| `renderWithoutRouter` | the same, minus the router |
| `renderWithContext(ui, {context, initialRouteEntries, currentPath})` | builds a `Routes`/`Route`/`Outlet context={…}` tree so `useOutletContext`, `useLocation` and `useParams` work |

```tsx
import {render} from "testUtils";
import {Badge} from "components/Badge";

test("renders the label", () => {
  const {container} = render(<Badge text="3" />);
  expect(container.firstChild).toMatchSnapshot();
});
```

## Preloading state

`render` supplies its **own** default store, so passing a store to it is not an option. To seed state, wrap the element in
a *second* `<Provider>` — the inner one wins:

```tsx
import {Provider} from "react-redux";
import getTestStore from "utils/test/getTestStore";
import {ApplicationState} from "store";
import {CustomDndContext} from "components/DragAndDrop/CustomDndContext";
import {Column} from "components/Column";
import {render} from "testUtils";

const createColumn = (overwrite?: Partial<ApplicationState>) => (
  <Provider store={getTestStore(overwrite)}>
    <CustomDndContext>
      <Column id="test-columns-id-1" name="Testheader 1" description="" color="planning-pink" visible index={0} />
    </CustomDndContext>
  </Provider>
);

test("column has the correct accent color", () => {
  const {container} = render(createColumn());
  expect(container).toMatchSnapshot();
});
```

It looks redundant and it is, slightly — but it is the established pattern and every existing test does it this way.

## Fixtures

`src/utils/test/` holds the builders. All are **default** exports and all take an optional partial that is spread last, so
you override only what your test cares about:

| Fixture | Returns |
|---|---|
| `getTestStore(overwrite?)` | A real store — `configureStore` with the real `rootReducer` and a preloaded state |
| `getTestApplicationState(overwrite?)` | A complete `ApplicationState` |
| `getTestNote(overwrite?)` | A single `Note` |
| `getTestParticipant(overwrite?)` | A single participant |
| `getTestVoting(overwrite?)` | A single voting |
| `dummy-board-data.json` | A full board payload, used by the export tests |

`getTestStore` uses the **real reducers**, so a test can dispatch and assert on the result. `redux-mock-store` is a
dependency but is barely used; prefer the real store.

The ids in `getTestApplicationState` are stable and meaningful — `test-board-id`, `test-columns-id-1`,
`test-notes-id-1`, a self participant with the `OWNER` role. Reuse them rather than inventing new ones: snapshots stay
diffable, and the fixture already wires the relationships between board, columns, notes and participants correctly.

```tsx
const store = getTestStore({
  notes: [getTestNote({id: "test-notes-id-1", text: "hello"})],
});
```

## Drag and drop in tests

**Anything that renders a `Note` or a `Column` must be wrapped in `CustomDndContext`.** Both use `useSortable`, which
throws outside a `DndContext`. In the running app the context is mounted by `BoardGuard`, far above the component, so it
is easy to forget in a test — and the resulting error does not obviously point at drag and drop.

```tsx
<CustomDndContext>
  <Note noteId="test-notes-id-1" viewer={…} />
</CustomDndContext>
```

## The setup file

`src/setupTests.ts` patches things happy-dom does not provide:

- jest-dom matchers are registered on `expect`.
- `global.localStorage` is replaced with a `node-localstorage` instance backed by `src/utils/test/localstorage`.
- `ResizeObserver` and `matchMedia` are mocked.
- `offsetLeft`, `offsetTop` and `offsetParent` are defined on `HTMLElement.prototype`.

That last one matters: happy-dom reports every dimension as 0, and `useSize`, `useStripeOffset` and `useTextOverflow` all
depend on real geometry. **If a test fails on a zero width, height or offset, this file is where to look.**

`src/__mocks__/emoji-picker-element.ts` stubs the emoji picker, which is a web component happy-dom cannot run. Everything
else is mocked per-test:

```tsx
vi.mock("utils/hooks/useImageChecker.ts", async () => ({
  useImageChecker: () => false,
}));
```

## i18n in tests

`src/i18nTest.ts` is a **second, separate** i18next instance — `translation` namespace only, `lng: "en"`,
`useSuspense: false`. It has its own hardcoded language list. Adding a language or a namespace means updating this file
too, or tests will render raw keys.

Prefer queries that go through the real translations, which is what newer tests do:

```tsx
import {t} from "i18next";

getByLabelText(container, t("Appearance.showHotkeyNotifications"));
```

## Test ids

Two attributes are in use, for historical reasons:

- **`data-cy`** is prop-driven. `Button` maps its `testId` prop to it, `Input` maps `dataCy`, `MiniMenu` derives one per
  item. Cypress uses it, and some unit tests query it with `container.querySelector("[data-cy=…]")`.
- **`data-testid`** is hardcoded in JSX where a component needs a stable handle.

For new code, prefer role- and label-based queries. Reach for a test id only when there is no accessible handle — and if
there isn't one, that is usually an accessibility problem worth fixing instead (see
[Guidelines](/dev/frontend/guidelines/#accessibility)).

## Snapshots

Snapshots are used heavily — around 64 `toMatchSnapshot()` calls, usually
`expect(container.firstChild).toMatchSnapshot()`. Expect to regenerate them whenever you change markup or class names:

```bash
yarn test --run -u
```

Read the diff before you do. A snapshot change is only noise if you *meant* to change the markup; otherwise it is the test
telling you something. Use snapshots for structure and explicit assertions for behaviour — a snapshot will happily record
a broken button.

## The locale parity test

`src/__tests__/locales.test.ts` reads `src/i18n/en/translation.json` as the source of truth and, for every other locale
directory that has a `translation.json`, asserts that each top-level key exists and that its immediate children match.

Its limits are worth knowing, because a green run is easy to over-trust:

- It only checks **two levels**. A key missing three levels deep is not caught.
- It does not look at `templates.json` at all.

So it catches whole missing sections, not incomplete ones. Manual verification is still needed — see
[Contributing Translations](/dev/frontend/translating/).

## What is worth testing

- **Reducers and pure functions** in `src/store/features/*/reducer.ts` and `src/utils/*` are cheap to test and catch real
  bugs. `notesReducer`'s stack re-parenting logic is a good example of why.
- **Components**: render them, interact with them, assert on what the user sees. Don't assert on internal state.
- **Thunks** need the API and the socket mocked and are usually not worth the setup. Test the reducer that handles the
  resulting action instead.

## End-to-end tests (Cypress)

Specs live in `cypress/e2e/` — currently `login-spec.cy.ts` and `templates-spec.cy.ts`. `cypress.config.ts` sets
`baseUrl: 'http://localhost:5173'` and `testIsolation: true`.

**There is no `cypress` package script.** To run them locally, start the backend and the dev server, then open Cypress:

```bash
docker compose --project-directory server/ --profile build up -d
yarn start
```

```bash
yarn cypress open
```

In CI, Cypress runs in a pull-request-only job via `cypress-io/github-action`, which starts `yarn run start` itself and
waits on `http://localhost:5173` before running the specs in Chrome. The job is skipped for dependabot pull requests.
