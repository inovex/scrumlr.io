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

## API

The API is currently documented in the [Postman](https://www.postman.com/) collection `api.postman_collection.json`.
Simply start Postman, import the collection, and you can immediately start to explore all
resources and take a look at our documentation.

Currently, you can also just open your browser on [http://localhost:8080](http://localhost:8080)
to see our debug client. We'll disable it once everything got stable.
