---
title: API Documentation
description: Guide for documenting the Scrumlr backend REST API
sidebar:
    order: 27
---

To ducument the Scrumlr backend REST API we use [https://github.com/swaggo/swag](https://github.com/swaggo/swag).
For that reason we need to add comments to all our endpoints like described in the documentation for swag.
Before you can execute any commands you need to install swag by following the install instructions.

The formatting and genration of the swagger page is done by executing the command

```bash
cd server
make swagger
```

To enable the swagger page make sure to set the environment variable `SCRUMLR_ENABLE_SWAGGER='true'`.
The page is deactivated by default.

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

For more inforamtion which annotations can be used refere to the [swag guide](https://github.com/swaggo/swag#api-operation).

