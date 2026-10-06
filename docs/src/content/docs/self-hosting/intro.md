---
title: Introduction
description: Introduction to Self-hosting Scrumlr
sidebar:
    order: 1
---

We currently offer a Docker Compose file to self-host Scrumlr.
There is also a helm chart wich is not released yet.

Scrumlr is composed of 4 main services:

- **frontend**: Our React frontend that is served statically.
- **backend**: Our Go backend that serves the API and WebSocket.
- **database**: A PostgreSQL database that stores all data.
- **message broker**: A NATS or redis server which is used to send, receive and then process the events asynchronously.
For multi note deployments this keeps our backends in sync.

### Getting started

-> [Docker Compose](/self-hosting/docker/)

-> [Kubernetes](/self-hosting/kubernetes/)
