# Scrumlr docs

This folder contains the documentation site for Scrumlr.
It is build using [astro starlight](https://starlight.astro.build) and yarn

## Local development

For local development first run

```bash
yarn install
```

This will install all required dependencies.
After that you can start the development server with

```bash
yarn dev
```

To access the development server go to your browser and enter [http://localhost:4321](http://localhost:4321).

For more commands check the [package.json](./package.json) file or read the documentation for astro.

## Astro Starlight

Starlight looks for Markdown files (`.md` or `.mdx`) in the `src/content/docs/` directory.
Each file is exposed as a route based on its file name.
Images can be added to `src/assets/` and embedded in Markdown with a relative link.
Static assets, like favicons, can be placed in the `public/` directory.

That leaves us with the following structure

```
.
├── public/
├── src/
│   ├── assets/
│   ├── content/
│   │   ├── docs/
│   │   └── config.ts
│   └── env.d.ts
├── astro.config.mjs
├── package.json
└── tsconfig.json
```

For more information read the [astro starlight documentation](https://starlight.astro.build/getting-started/)

## Create new pages

To create a new page add a Markdown file (`.md` or `.mdx`) under the `src/content/docs/` folder.
The file should have a title and a description e.g.

```md
---
title: Architecture
description: Guide for the backend architecture
sidebar:
    order: 22
---
```

To order the pages at the sidebar add the option field `sidebar: order:`.
