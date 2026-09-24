---
title: Components
description: Component conventions, icons, dialogs, drag and drop, hotkeys and hooks
sidebar:
    order: 15
---

## Directory anatomy

Every component gets its own directory under `src/components/`:

```
components/Note/
├── Note.tsx                    the component
├── Note.scss                   its styles
├── index.ts                    export * from "./Note";
├── __tests__/                  Note.test.tsx and __snapshots__/
└── NoteReactionList/           sub-components nest with the same shape
```

The `index.ts` is always a one-line barrel, which is what makes `import {Note} from "components/Note"` work.
Sub-components nest as directories rather than living in the parent file, sometimes two or three levels deep.

A component that follows every convention at once looks like this:

```tsx
import classNames from "classnames";
import {useTranslation} from "react-i18next";
import {Color, getColorClassName} from "constants/colors";
import {useAppSelector} from "store";
import {CloseIcon} from "components/Icon";
import "./Example.scss";

export type ExampleProps = {
  id: string;
  color?: Color;
  disabled?: boolean;
  className?: string;
};

export const Example = ({id, color, disabled, className}: ExampleProps) => {
  const {t} = useTranslation();
  const name = useAppSelector((state) => state.columns.find((column) => column.id === id)?.name);

  return (
    <div className={classNames("example", {"example--disabled": disabled}, getColorClassName(color), className)}>
      <span className="example__label">{name ?? t("Example.untitled")}</span>
      <CloseIcon className="example__icon" />
    </div>
  );
};
```

The conventions in that snippet:

- **Arrow-function `const`, named export.** `React.FC` is used in some older leaf components and is fine, but plain
  functions with a typed parameter are the norm. `export default` exists in three files and should be treated as legacy.
- **Props type named `<ComponentName>Props`.** `type` is more common than `interface`. Use `interface` only when you need to
  extend a DOM props type (`TextInputProps extends DetailedHTMLProps<…>`). Export it if anything else needs it.
- **`classNames` argument order:** the BEM block first, then an object of conditional modifiers, then any color class,
  then the incoming `className` **last** so callers can override.
- **The SCSS import comes last**, after all module imports. It has no bindings — it exists so Vite includes the file, and
  its position determines cascade order.

## Icons

There is **no `Icon` component**. `src/components/Icon/` contains only a stylesheet and a barrel of more than 80 re-exports to treat every single icon as its own standalone React component.

### Crucial Import Rules

**The `?react` suffix is mandatory.** `vite-plugin-svgr` is configured with `include: '**/*.svg?react'`, so only that
query turns an SVG into a React component. A plain `import logo from "assets/logo.svg"` still works, but gives you a URL
string. Both forms are typed in `vite-env-override.d.ts`.

**Do not use old Create React App syntax**: Syntax like `import {ReactComponent as X} from "…svg"` will break the build. Always use default imports combined with `?react`.

New icons come out of Figma via `scripts/convertFigmaIconExportToReact.mjs`. There is no npm script for it — run it with
`node scripts/convertFigmaIconExportToReact.mjs`.

## Dialogs, portals and focus

`components/Portal` renders outside the normal tree, `components/Dialog` is the shared frame, `ConfirmationDialog` is the
yes/no variant, and `react-focus-lock` traps focus while a dialog is open.

**Dialogs are routes.** The settings dialog, the voting dialog, the timer dialog and the note stack view are all nested
routes rendered into a parent `<Outlet />` (see [Architecture](/docs/src/content/docs/dev/Frontend/architecture.md#routing)). If you are adding a
dialog, add a route for it. Do not use `useState` to toggle dialogs on or off.

## Drag and drop

Built on `@dnd-kit/core`, in three files under `src/components/DragAndDrop/`: **`CustomDndContext.tsx`**, **`Droppable.tsx`**, and **`Sortable.tsx`**.

**Always set a `type` discriminator:** If you add a droppable, you must give it a
`type` in its `data`, or it will be treated as a note, which will break collision checks.

Anything that renders a `Note` or a `Column` must be inside a `CustomDndContext`, including in tests (see
[Testing](/docs/src/content/docs/dev/Frontend/testing.md#drag-and-drop-in-tests)).

## Hotkeys

Combos live in `src/constants/hotkeys.ts` as a flat map of SCREAMING_SNAKE keys to `react-hotkeys-hook` combo strings.

Board-wide hotkeys are all registered in one place: **`components/HotkeyAnchor/HotkeyAnchor.tsx`**, which renders nothing
but a marker div and is mounted by `BoardComponent`. That is why hotkeys only work on the board.

```tsx
useHotkeys(TOGGLE_MODERATION, toggleModeration, hotkeyOptions, [state.moderation, state.hotkeyNotificationsEnabled]);
```

**The dependency array is mandatory** wherever the handler closes over state. Omit it and the
handler captures stale values.

Two option objects gate the registrations: `hotkeyOptions` (`{enabled: hotkeysAreActive}`) and `hotkeyOptionsAdmin`
(additionally requires the moderator role). `TOGGLE_HOTKEYS` is deliberately registered *without* them so it can always
switch the system back on.

## Custom hooks

Check `src/utils/hooks/` before writing a new hook to see if an existing utility already covers your use case.

Several of these custom hooks depend on real element dimensions, which matters when testing (see
[Testing](/docs/src/content/docs/dev/Frontend/testing.md#the-setup-file)).

## Avatars

Avatars use `@gamepark/avataaars` and are **deterministic**: `Avatar.tsx` derives every feature from `hashCode(seed)`
(`src/utils/hash.ts`) over the option sets in `src/constants/avatar.ts`, where the seed is the user id. The colored ring
around an avatar comes from `getColorClassName(getColorForIndex(...))`.

Because it is deterministic, the same fixture user always produces the same avatar, which is what keeps snapshots stable.
