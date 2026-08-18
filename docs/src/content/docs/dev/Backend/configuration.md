---
title: Configuration
description: Configuration of the Scrumlr backend
sidebar:
  order: 22
---

The Scrumlr backend can either be configured through CLI arguments, through environment variables or through a toml file.

## Configuration via CLI

To get a full list of all available CLI arguments run

```bash
cd src/
go run . --help
```

After that select the arguments you want to set and add them to the `go run .` command.

## Configuration via environment variables

To configure the Scrumlr backend using environment variables, set the required variables before starting the application.
A complete list of all environment variables can be found [here](/../self-hosting/env-vars/#backend).

## Configuration via TOML file

You can also configure the server using a TOML file. To do this, pass the `--config` flag to the server executable,
followed by the path to the TOML file.
For example, to configure the server using a file named `config_example.toml`, you would run the following command:

```bash
go run . --config config_example.toml
```

To see all values that can be set and what purpose they serve, take a look at the example
[config_example.toml](https://github.com/inovex/scrumlr.io/blob/main/server/config_example.toml) file on GitHub.

## Local OAuth setup

To test the authentication with Google, Microsoft or GitHub locally, the following environment variables must be set.

1. `SESSION_SECRET`: Set the session secret to a random string
2. `SCRUMLR_AUTH_CALLBACK_HOST`: Set the callback host to the Scrumlr backend running on your machine, most likely to `http://localhost:8080`
3. `SCRUMLR_AUTH_<PROVIDER>_CLIENT_ID` and `SCRUMLR_AUTH_<PROVIDER>_CLIENT_SECRET`: Set the client id and client secret
you got from the provider
