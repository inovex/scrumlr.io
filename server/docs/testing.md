# Testing

## Mocking

At a certain point, it is more convenient to use a framework to generate mocks for interfaces.
This is where the use of [Mockery](https://vektra.github.io/mockery/latest/) comes into play.

### Install mockery

To install mockery follow the instructions on their [installation docs](https://vektra.github.io/mockery/latest/installation/).

#### MacOS

On macOs install mockery via Homebrew like it is described in th [installation docs](https://vektra.github.io/mockery/latest/installation/).

```bash
brew install mockery
brew upgrade mockery
```

#### Linux

For Linux download the latest release from the [github release page](https://github.com/vektra/mockery/releases) for your system.
After that unpack the downloaded file and make the executable available to your shell by either adding the path of the
downloaded file to your PATH environment variable or extract the file to a path that already belongs to the `PATH`
environment variable, e.g. /usr/local/bin by running the following command

```bash
tar -C /usr/local/bin -xzf <mockery.tar.gz>
```

*Note*: you may need to run this command as the root user

### Run

After you installed mockery you can run it in the `src` directory of the scrumlr server.

```bash
# switch to src directory of the server
cd src
# and just run mockery to refresh the mocks
mockery
```

The [Makefile](./../Makefile) also contains a command to generate the mocks through mockery.
For that run

```bash
make mockery
```

This will create the mocks if they do not exists or will refresh them if they exists.
Mockery is configured via the [.mockery.yaml](./../src/.mockery.yaml) file in the `src` directory.

## Test

Each package has its own tests for the service and the database.

*Note*: All database tests are currently in the database package which will be changed in the future.

We also provide a postman collection to test the scrumlr backend.

### Requirements

- [Docker](https://www.docker.com/)
- [Postman](https://www.postman.com/) or [newman](https://learning.postman.com/docs/collections/using-newman-cli/command-line-integration-with-newman/)

### Service and database tests

To run the service and database tests you can use the [Makefile](./../Makefile) and run

```bash
make test
```

If you don't want to use the Makefile, you can run in the `src` directory

```bash
go test ./... -cover -coverprofile=coverage.txt
```

This will run all the tests.
For the database tests a postgres database container is started through docker.
After the tests finished the container is stopped.

After the tests are run a coverage file is produced.
To convert this file to an html file run

```bash
cat coverage.txt | grep -v "mock" > coverage.out
go tool cover -html=coverage.out -o coverage.html
```

The first command removes the mock files from the coverage report.
The second command creates the htlm coverage report.

To run the tests and produce the coverage report you could also use the Makefile and run

```bash
make coverage
```

This will run all tests and produce the coverage report.

### Postman tests

To run the postman tests you can either import the [postman collection](./../api.postman_collection.json) into postman
and run it from the postman app or you could use the postman cli tool `newman`.

To run the postman collection with `newman` you could use the Makefile and run

```bash
make postman
```

or run

```bash
newman run api.postman_collection.json --env-var "base_url=localhost:8080" --verbose
```

For the postman tests the backend must be started.
You can either start the backend and the needed components through docker with

```bash
make run-docker
```

or

```bash
docker compose up --build scrumlr
```

These commands will start a postgres database, nats and the scrumlr backend through docker.
The scrumlr backend is first build with the [Dockerfile](./../src/Dockerfile) in the `src` directory.
