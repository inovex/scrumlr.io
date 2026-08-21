---
title: Architecture
description: Guide for the backend architecture
sidebar:
    order: 24
---

## Backend Packages

The following diagram shows the packages of the backend and how they interact with each other.

```mermaid
%%{init: {"flowchart": {"defaultRenderer": "elk"}} }%%
flowchart TB
    api[API]
    auth[Auth]
    boards[Boards]
    boardTemplates[Board Templates]
    boardReactions[Board Reactions]
    columns[Columns]
    columnTemplates[Column Templates]
    notes[Notes]
    votings[Votings]
    sessions[Sessions]
    sessionRequests[Session Requests]
    users[Users]
    reactions[Reactions]
    health[Health]
    feedback[Feedback]
    events[Events]

    database@{ shape: cyl, label: "Database" }
    nats@{ shape: das, label: "Nats" }
    cache@{ shape: cyl, label: "Cache" }

    api --> auth
    api --> boards
    api --> boardTemplates
    api --> boardReactions
    api --> columns
    api --> columnTemplates
    api --> notes
    api --> votings
    api --> sessions
    api --> sessionRequests
    api --> users
    api --> reactions
    api --> health
    api --> feedback
    api --> events

    auth --> users

    boards --> columns
    boards --> notes
    boards --> sessions
    boards --> reactions
    boards --> votings
    boards --> users

    boardTemplates --> columnTemplates

    columns --> notes

    sessions --> columns
    sessions --> notes

    sessionRequests --> sessions
    sessionRequests --> events

    users --> sessions
    users --> notes

    events --> sessions
    events --> notes

    auth --> database
    boards --> database
    boardTemplates --> database
    columns --> database
    columnTemplates --> database
    notes --> database
    votings --> database
    sessions --> database
    sessionRequests --> database
    users --> database
    reactions --> database
    health --> database

    boards --> nats
    boardReactions --> nats
    columns --> nats
    notes --> nats
    votings --> nats
    sessions --> nats
    sessionRequests --> nats
    users --> nats
    reactions --> nats
    health --> nats
    events --> nats

    notes --> cache
```

## Package structure

A general package structure is shown in the diagram below.

```mermaid
flowchart TB
    subgraph "Package"
        api[API]
        service[Service]
        databaseAccess[Database Access]
        api --> service
        service --> databaseAccess
    end

    database@{ shape: cyl, label: "Database" }
    nats@{ shape: das, label: "Nats" }

    service --> nats
    databaseAccess --> database
```

Each package has at least an api and a service.
If the service needs access to the database, a database access is created.
If the service needs access to a database, which is not under the control of that service, the corresponding service is injected.
For access to the message broker, the `realtime` package is used.
