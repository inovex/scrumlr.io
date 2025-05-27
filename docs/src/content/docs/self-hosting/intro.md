---
title: Introduction
description: Introduction to Self-hosting Scrumlr
sidebar:
    order: 1
---

We currently offer two ways to self-host Scrumlr: using Docker Compose or a Kubernetes manifest.

Scrumlr is composed of 4 main services:

- **frontend**: Our React frontend that is served statically.
- **backend**: Our Go backend that serves the API and WebSocket.
- **database**: A PostgreSQL database that stores all data.
- **nats**: A NATS server which is used to keep our backend services in sync (Mainly used for multi-backend deployments).

### Getting started

-> [Docker Compose](/self-hosting/docker/)

-> [Kubernetes](/self-hosting/kubernetes/)
