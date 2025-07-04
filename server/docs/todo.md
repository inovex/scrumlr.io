# TODOs

These are some todos that were not resolved during the first refactoring of the backend or came from the first
refactoring.

- Remove `user` from `session` package into its own package
- Try to get rid of the `common` package
- Refactor API
  - Move the API endpoints to their respective package
  - Change models to contain only the Ids of nested objects
  - Change the event models to contain only the Ids of nested object
  - Adjust frontend to the changes
- Rewrite the database tests
- Combine `Create` and `Update` in the `sessionrequests` package to an `Upsert`
- Move logic out of the database querries to the services

## Improvements

- Add OpenTelemetry
- Add OpenAPI documents
- Evaluate the standard golang logger and improve logging
  - configure the log level throug env variables
  - enable/disable the database logging with an additional env variable
