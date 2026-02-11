# scrumlr.io Server

This is the server application of [scrumlr.io](https://scrumlr.io) targeted by the web client.

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

For more information read the [development documentation](./docs/development.md).
Also please make sure to read the [guidlines](./docs/guidelines.md).

## Testing

To run the tests locally run

```bash
make test
```

For more information about the tests refer to the [testing documentation](./docs/testing.md).

## API

The API is currently documented in the [Postman](https://www.postman.com/) collection `api.postman_collection.json`.
Simply start Postman, import the collection, and you can immediately start to explore all resources and take a look
at our documentation.

## Architecture

In the picture below is a high level overview of how scrumlr works

![Architecture](./docs/architecture.png)

For a detailed overview of the backend read the [architecture documentation](./docs/architecture.md).

## Refactoring

Currently the backend is refactored.
Not all parts of the backend are done.
For a list of things that need refactorings see the [todos](./docs/todo.md)

