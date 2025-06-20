# Local development

## Requirements

- [Docker](https://www.docker.com/)
- [Docker compose](https://docs.docker.com/compose/)

## Run required services

To run the scrumlr backend localy for development, you first need to run the needed service (postgres database and nats).
For that you can use the provided docker compose files.
To start the docker containers either run

```bash
make run-docker-dev
```

or

```bash
docker compose --profile dev up
```

## Run scrumlr backend

To start the scrumlr backend run

```bash
cd src/
go run . --database "postgres://admin:supersecret@localhost:5432/scrumlr?sslmode=disable" --disable-check-origin --insecure
```

This will start the backend and connect it to the postgres database and nats.

## CLI arguments

To get all available command line arguments run

```bash
cd src/
go run . -h
```

Many of those can also be set by environment variables so you don't have to worry about the run arguments each time.

## Configuration via TOML file

You can also configure the server using a TOML file. To do this, pass the `--config` flag to the server executable,
followed by the path to the TOML file. For example, to configure the server using a file named `config_example.toml`,
you would run the following command:

```bash
go run . --config config_example.toml
```

To see all values that can be set and what purpose they serve, take a look at the provided [config_example.toml](./../config_example.toml) file.
