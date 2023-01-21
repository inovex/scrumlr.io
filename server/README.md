<div align="center" markdown="1" style="margin-bottom: 2.5em">
  <p>
    <img src="scrumlr.png" alt="scrumlr.io" style="width: 284px; max-width: 80%; height: auto;" />
  </p>
</div>

This is the server application of [scrumlr.io](https://scrumlr.io) targeted by the web client.
It uses the Postgres database, as it's persistence layer and the nats.io service to synchronize all
occurring events between multiple running instances.

You can also use Redis instead of nats.io, which may help you to deploy faster to any
cloud provider. Most of them offer managed Redis instances.

The architecture is visualized by the PlantUML `docs/architecture.puml` or in this graphic:

![Architecture](docs/architecture.png)

## Development

First you need to call `docker-compose -f ./deployments/docker-compose.yml --profile dev up`,
so that the database and the nats instance will come up.

Afterwards you can start the server by executing:

```bash
go run ./cmd/scrumlr/main.go --database "postgres://admin:supersecret@localhost:5432/scrumlr?sslmode=disable" --disable-check-origin --insecure
```

Or simply call `go run ./cmd/scrumlr/main.go -h` to see all available command line arguments. Many of those
can also be set by environment variables, so you don't have to worry about the run arguments
each time.

## API

The API is currently documented in the [Postman](https://www.postman.com/) collection `api/api.postman_collection.json`.
Simply start Postman, import the collection, and you can immediately start to explore all
resources and take a look at our documentation.
