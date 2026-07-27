---
title: IDE Setup
description: IDE setup for developing the Scrumlr backend
sidebar:
  order: 23
---

You can develop the Scrumlr backend with an IDE of your choice.
Here are some example configurations for

- VS Code
- Goland

## VS Code

For VS Code, we recommend installing the [Go extension](https://marketplace.visualstudio.com/items?itemName=golang.go) for
language support.
To run the Scrumlr backend from VS Code, copy the following configuration and paste it into the `.vscode/launch.json` file.

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Scrumlr backend",
      "type": "go",
      "request": "launch",
      "mode": "auto",
      "program": "${workspaceFolder}/server/src/main.go",
      "args": [
        "-d", "postgresql://admin:supersecret@localhost:5432/scrumlr?sslmode=disable",
        "--disable-check-origin",
        "--insecure"
      ],
      "envFile": "${workspaceFolder}/server/.env",
    }
  ]
}
```

This will start the Scrumlr backend with the configured postgres database and will disable the origin check.
It also starts Scrumlr in an insecure way with the `-insecure` flag. This will use the dev keys provided with the Scrumlr
repository. **Do not use this flag in production**.

This configuration also reads environment variables from a `.env` file from `scrumlr.io/server/.env`.
Here, you can configure the Scrumlr backend with environment variables.

## Goland


