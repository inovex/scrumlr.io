# scrumlr.io Server

This is the server application of [scrumlr.io](https://scrumlr.io) targeted by the web client.
Before contributing to the project, please make sure you have read the [contributing guideline](./../CONTRIBUTING.md)

## Local development

To run the scrumlr backend locally for development, you first need to run the needed services (postgres database and nats).
For that you can use the provided docker compose files.
To start the docker containers either run

```bash
make run-docker-dev
```

or

```bash
docker compose --profile dev up
```

After the container started you can start the scrumlr backend with.

```bash
cd src/
go run . --database "postgres://admin:supersecret@localhost:5432/scrumlr?sslmode=disable" --disable-check-origin --insecure
```

Also please make sure to read the [guidlines](https://docs.scrumlr.io/dev/backend/guidelines/).

## Testing

To run the tests locally run

```bash
make test
```

For more information about the tests refer to the [testing documentation](https://docs.scrumlr.io/dev/backend/testing/).


## Architecture

In the picture below is a high level overview of how scrumlr works

![Architecture](./docs/architecture.png)

For a detailed overview of the backend read the [architecture documentation](https://docs.scrumlr.io/dev/backendarchitecture).

## Refactoring

The backend is currently refactored.
Not all parts of the backend are done.
For a list of things that need refactorings see the [todos](./docs/todo.md)
