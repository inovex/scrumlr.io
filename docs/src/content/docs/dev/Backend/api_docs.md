---
title: API Documentation
description: Guide for documenting the Scrumlr backend REST API
sidebar:
  order: 27
---

To document the Scrumlr backend REST API we use [https://github.com/swaggo/swag](https://github.com/swaggo/swag).
For that reason we need to add comments to all our endpoints like described in the documentation for swag.

## Prerequisites

Before you can run `make swagger` you need the following set up:

1. **Install the pinned `swag` CLI.** Use the same version that is pinned in `server/src/go.mod`
   (currently `v1.16.6`) so the generated output stays reproducible:

   ```bash
   go install github.com/swaggo/swag/cmd/swag@v1.16.6
   ```

2. **Use GNU Make ≥ 3.82 (macOS only).** macOS ships GNU Make 3.81, therefore install a newer one and run the target as `gmake swagger`:
   ```bash
   brew install make # installs GNU Make 4.x as `gmake`
   # optional: so that `make` resolves to 4.x too
   export PATH="/opt/homebrew/opt/make/libexec/gnubin:$PATH"
   ```
   Why: the Makefile uses `.ONESHELL`, which only works on GNU Make 3.82+. On 3.81 it is silently ignored.

## Generating the docs

The formatting and generation of the swagger page is done by executing the command

```bash
cd server
make swagger
```

## Viewing the page locally

The swagger page is served by the backend at `/swagger/index.html`, but the route is only registered when the `SCRUMLR_ENABLE_SWAGGER` environment variable is set to `true` (it is disabled by default).

```bash
# 1. start the backing services (nats + postgres)
cd server
docker compose --profile dev up

# 2. run the backend with swagger enabled
cd server/src
SCRUMLR_ENABLE_SWAGGER=true go run . -d "postgresql://admin:supersecret@localhost:5432/scrumlr?sslmode=disable" --disable-check-origin --insecure
```

Then open [http://localhost:8080/swagger/index.html](http://localhost:8080/swagger/index.html).

## Annotations

To document the REST API endpoint each method must be annotated.
For that each method should have the following annotations

```go
// Describe the method
//
//	@Summary		Summary of the method
//	@Description	Longer description of the method
//	@Tags			<package>
//	@Accept			json
//	@Param			<parameters that the method needs>
//	@Produce		json
//	@Success		<success code with response>
//  @Failure    <failure code with response>
//	@Router			<mount path> [<method>]
```

For more information on which annotations can be used, refer to the [swag guide](https://github.com/swaggo/swag#api-operation).
