# scrumlr.io Server

This is the server application of [scrumlr.io](https://scrumlr.io) targeted by the web client.

The basic components of the server are visualized by the PlantUML `architecture.puml` or in this graphic:

![Architecture](architecture.png)

## Local development

First you need to either call `make run-docker-dev` or `docker-compose --profile dev up`,
so that the database and the nats instance come up.

Afterwards you can start the server by executing:

```bash
cd src/
go run . --database "postgres://admin:supersecret@localhost:5432/scrumlr?sslmode=disable" --disable-check-origin --insecure
```

Or simply call `go run . -h` to see all available command line arguments. Many of those
can also be set by environment variables so you don't have to worry about the run arguments
each time.

## Configuration via TOML file
You can also configure the server using a TOML file. To do this, pass the `--config` flag to the server executable, followed by the path to the TOML file.

For example, to configure the server using a file named `config_example.toml`, you would run the following command:

```bash
go run . --config config_example.toml
```

To see all values that can be set and what purpose they serve, take a look at the provided `config_example.toml` file.

## API

The API is currently documented in the [Postman](https://www.postman.com/) collection `api.postman_collection.json`.
Simply start Postman, import the collection, and you can immediately start to explore all
resources and take a look at our documentation.

Currently, you can also just open your browser on [http://localhost:8080](http://localhost:8080)
to see our debug client. We'll disable it once everything got stable.


## Testing and Mockery

At a certain point, it is more convenient to use a framework to generate mocks for interfaces.
This is where the use of [Mockery](https://vektra.github.io/mockery/latest/) comes into play.

### Install

#### MacOS

On macOs install mockery via Homebrew like it is described in th [installation docs](https://vektra.github.io/mockery/latest/installation/).

```bash
brew install mockery
brew upgrade mockery
```

#### Linux

For Linux ownload the latest release from the [github release page](https://github.com/vektra/mockery/releases) for your system.
After that unpack the downloaded file and copy it to `/usr/local/bin`

```bash
tar -C /usr/local/bin -xzf <mockery.tar.gz>
```

*Note*: you may need to run this as sudo

### Run

After you installed mockery you can run it in the `src` directory.

```bash
# switch to src directory
cd src
# and just run mockery to refresh the mocks
mockery
```

This will create the mocks if they do not exists or will refresh them if they exists.
Mockery is configured via the [.mockery.yaml](./src/.mockery.yaml) file in the `src` directory.
