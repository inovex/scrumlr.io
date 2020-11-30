# Scrumlr.io Server

This is the backend for the [scrumlr.io](https://scrumlr.io) service.
It is based on the [Parse Platform](https://parseplatform.org/).

## Prerequisites

You'll need a local Mongo database running on port `:27017` if you want
to start this server by `npm start` if you intend to use it without further
configuration steps.

Otherwise you can setup quite a few environment variables to change the
host, port, database URI and so on. These variables are listed in
`src/index.ts`.

## Run

### Running node applcation

```
npm install
npm start
```

This will open the server on `localhost:4000`.

### Running everything via Docker

Executing `docker-compose up` will start up the Mongo database, the server
and the [Parse dashboard](https://www.npmjs.com/package/parse-dashboard) at
once.

You'll be able to access those services on following ports and URLs:

* Mongo database: `mongodb://localhost:27017` (use [Mongo Compass](https://www.mongodb.com/products/compass) to explore the data)
* scrumlr.io server: `http://localhost:4000`
* Parse dashboard: `http://localhost:4040`