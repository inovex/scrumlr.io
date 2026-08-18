---
title: Testing
description: Guide for testing the Scrumlr backend
sidebar:
    order: 26
---

Each package has its own tests for the API, service and the database.
We also provide End-to-End tests for the Scrumlr backend.

## Requirements

- [Docker](https://www.docker.com/)
- [Mockery](https://vektra.github.io/mockery/latest/)
- [Postman](https://www.postman.com/) or [newman](https://learning.postman.com/docs/collections/using-newman-cli/command-line-integration-with-newman/) (Legacy Postman Test)

## Unit tests

For the unit tests e.g. the calls to the database are mocked.

Because it is more convenient to use a framework to generate mocks for interfaces, we use [Mockery](https://vektra.github.io/mockery/latest/)
for this purpose.

### Install mockery

To install mockery follow the instructions on their [installation docs](https://vektra.github.io/mockery/latest/installation/).

#### MacOS

On macOS install mockery via Homebrew like it is described in the [installation docs](https://vektra.github.io/mockery/latest/installation/).

```bash
brew install mockery
brew upgrade mockery
```

#### Linux

For Linux download the latest release from the [github release page](https://github.com/vektra/mockery/releases) for your system.
After that unpack the downloaded file and make the executable available to your shell by either adding the path of the
downloaded file to your PATH environment variable or extract the file to a path that already belongs to the `PATH`
environment variable, e.g. `/usr/local/bin` by running the following command

```bash
tar -C /usr/local/bin -xzf <mockery.tar.gz>
```

*Note*: you may need to run this command as the root user

### Generate mocks

After you have installed mockery, you can generate the mocks by running it in the `src` directory of the Scrumlr server.

```bash
# switch to src directory of the server
cd src
# and just run mockery to refresh the mocks
mockery
```

The [Makefile](https://github.com/inovex/scrumlr.io/blob/main/server/Makefile) also contains a command to generate the
mocks through mockery.
For that run

```bash
make mockery
```

This will create the mocks if they do not exist or will refresh them if they exist.
Mockery is configured via the [.mockery.yaml](https://github.com/inovex/scrumlr.io/blob/main/server/src/.mockery.yaml)
file in the `src` directory.
To configure mockery follow the instructions in the [configuration docs](https://vektra.github.io/mockery/latest/configuration/).

## Integration tests

Currently, there are integration tests for the database access and the services for each package.
To run these tests you need to have docker installed.
The integration tests use [testcontainers](https://testcontainers.com/) to spawn the database and the message broker.

## Run tests

To run the tests you can use the [Makefile](https://github.com/inovex/scrumlr.io/blob/main/server/Makefile) and run

```bash
make test
```

If you don't want to use the Makefile, you can run in the `src` directory

```bash
go test ./... -cover -coverprofile=coverage.txt
```

This will run all the unit and integration tests.
For the database integration tests a postgres database container is started through docker.
After the tests finished the container is stopped.
For the service integration tests a postgres database and a nats container are started through docker.
After the tests finished the containers are stopped.

After the tests are run a coverage file is produced.
To convert this file to an HTML file run the following two commands

```bash
cat coverage.txt | grep -v "mock" > coverage.out
go tool cover -html=coverage.out -o coverage.html
```

The first command removes the mock files from the coverage report, the second command creates the HTML coverage report
that then can be opened in a browser of your choice.

To run the tests and produce the coverage report you could also use the Makefile and run

```bash
make coverage
```

This will run all tests and produce the coverage report.

## End-to-End Tests

There is an [e2e test folder](https://github.com/inovex/scrumlr.io/tree/main/server/e2e-tests), which contains tests for
the backend.
These are the old postman tests in go code.
Before you can run the E2E test the backend should be started using docker.
For that run one of the following commands:

```bash
make run-docker
```

or

```bash
docker compose up
```

These commands will start a postgres database, nats and the Scrumlr backend through docker.
The Scrumlr backend is first built with the Dockerfile in the `src` directory.
If the backend is started you can run the E2E test using

```bash
cd e2e-tests
go test ./...
```


### Deprecated postman tests

The repository contains the old legacy postman tests that are rewritten in go code.
The postman tests are a postman collection that can either be imported into the postman app, which requires a postman account,
or you can run them with the postman cli tool [newman](https://learning.postman.com/docs/collections/using-newman-cli/command-line-integration-with-newman/)

Before you can run the postman tests, you need to start the Scrumlr backend.
For that run one of the following commands:

```bash
make run-docker
```

or

```bash
docker compose up
```

These commands will start a postgres database, nats and the Scrumlr backend through docker.
The Scrumlr backend is first built with the Dockerfile in the `src` directory.
If the backend is started you can run the postman tests.

To run the postman collection with `newman` you can use the Makefile and run

```bash
make postman
```

or run

```bash
newman run api.postman_collection.json --env-var "base_url=localhost:8080" --verbose
```
