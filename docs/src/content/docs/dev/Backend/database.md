---
title: Database
description: Guide for the database layout
sidebar:
    order: 25
---

The following diagram shows the Scrumlr database layout.

![Database](../../../../assets/scrumlr-db.png)

The diagram was created with [ChartDB](https://github.com/chartdb/chartdb)

## Migrations

On startup of the Scrumlr backend, migrations for the database are automatically applied to the configured database
using [migrate](https://github.com/golang-migrate/migrate).
The migration step applies all migrations in the [migrations folder](https://github.com/inovex/scrumlr.io/tree/main/server/src/initialize/migrations/sql).

**Note**: The automatic migrations **cannot** apply down migrations. These need to be executed manually.

The logs of the server will show you the current migration and if a migration happend.

### Manual migrations

To perform manual migrations to your database, you can use the sub command `database migrate` from the scrumlr backend.
This command the supports the three sub commands `up`, `down` and `version`.

**Note**: Before running any database commands either set the env variables to connect to the database or use the flags
to pass the database parameters.

#### Migrate version

The `version` command will show you the current version of the migration your database has.
To get the version run

```bash
scrumlr database migrate version
```

#### Migrate up

To apply the up migrations manual, you can use the command

```bash
scrumlr database migrate up
```

This will apply all available migrations to the database.
You can also pass the `--version` flag to upgrade to a specific database version.

```bash
scrumlr database migrate up --version 26
```

This will apply all migrations until the 26th migration.

**Note**: The scrumlr backend will apply all migrations to the database if you are not on the current migration.

### Migrate down

To apply the down migrations manual, you can use the command

```bash
scrumlr database migrate down --version 26
```

For the `down` command you must specify a version.

**Note**: The scrumlr backend will apply all migrations to the database if you are not on the current migration.

## Inspect the database

To inspect the database you can either use the commandline tool `psql` or a tool like [pgadmin](https://www.pgadmin.org/).

To connect to the database with psql you can either use the database connection string

```bash
psql postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=disable
```

or the command

```bash
psql -h <host> -p <port> -d <database> -U <user>
```

after you successfully logge into your database, you can the execute your sql commands and inspect the database.
