# Scrumlr.io Server

This is the backend for the [scrumlr.io](https://scrumlr.io) service.
It is based on the [Parse Platform](https://parseplatform.org/).

## Prerequisites

You'll need a local Mongo database running on port `:27017` if you want
to start this server by `yarn start` if you intend to use it without further
configuration steps.

Otherwise you can setup quite a few environment variables to change the
host, port, database URI and so on. These variables are listed in
`src/index.ts`.

## Run

### Running node application with reload on change

First of you'll need to start the database and optionally the Parse dashboard:

```
docker-compose up -d database dashboard
```

You'll be able to access those services on following ports and URLs:

* Mongo database: `mongodb://localhost:27017` (use [Mongo Compass](https://www.mongodb.com/products/compass) to explore the data)
* Parse dashboard: `http://localhost:4040`

Next you can start serving the application by executing:
```
yarn install
yarn serve
```

This will open the server on `localhost:4000` and reload the application on every change.

### Running everything via Docker

Executing `docker-compose up` will start up the Mongo database, the server
and the [Parse dashboard](https://www.npmjs.com/package/parse-dashboard) at
once.

You'll be able to access those services on following ports and URLs:

* Mongo database: `mongodb://localhost:27017` (use [Mongo Compass](https://www.mongodb.com/products/compass) to explore the data)
* scrumlr.io server: `http://localhost:4000`
* Parse dashboard: `http://localhost:4040`