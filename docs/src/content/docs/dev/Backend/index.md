---
title: Introduction
description: Introduction to the Scrumlr backend
sidebar:
  order: 20
---

The backend application of [scrumlr.io](https://scrumlr.io) targeted by the web client is written in [go](https://go.dev/).
Before contributing to the project, please make sure you have read the [contributing guideline](/dev/contributing).

## Recommended Requirements

- [Docker](https://www.docker.com/)
- [Docker compose](https://docs.docker.com/compose/)

## Quick start

Before you can run the Scrumlr backend locally for development, you first need the following services to be running

- a postgres database
- a nats instance

For that you can use the provided docker compose files.
To start the docker containers either run

```bash
make run-docker-dev
```

or

```bash
docker compose --profile dev up
```

After the container started, you can start the Scrumlr backend with.

```bash
cd src/
go run . --database "postgres://admin:supersecret@localhost:5432/scrumlr?sslmode=disable" --disable-check-origin --insecure
```

Please make sure to read the [guidelines](/dev/backend/guidelines) for the backend.

## Testing

To run the tests locally run

```bash
make test
```

For more information about the tests refer to the [testing documentation](/dev/backend/testing).

## Architecture

In the picture below is a high level overview of how Scrumlr works

![Architecture](../../../../assets/architecture.png)

For a detailed overview of the backend read the [architecture documentation](/dev/backend/architecture).
