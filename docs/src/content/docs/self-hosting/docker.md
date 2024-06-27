---
title: Docker Compose
description: Deploy Scrumlr using Docker Compose
sidebar:
    order: 2
---

Scrumlr can be deployed using a Docker Compose file. This is the easiest way to get started with Scrumlr.
We maintain a Docker Compose file in our Repository that you can use to deploy Scrumlr.

## Prerequisites
Clone the Scrumlr repository to your server and navigate to the deployment directory.
```sh
git clone https://github.com/inovex/scrumlr.io
cd scrumlr.io/deployment/
```

Copy the `.env.example` file to `.env` and adjust the variables to your needs.
```sh
cp .env.example .env
```

## Generating needed secrets

### Postgres Password

Generate a secure password for the Postgres database.
Make sure to set the `POSTGRES_PASSWORD`variable in your .env file to the generated password.
```sh
pwgen -s 64 1
```
### JWT Private Key
We use an ECDSA private key to sign the JWT tokens.
***Make sure to keep this key secure as it can be used to decrypt the tokens and generate new ones, potentially compromising your users' accounts.***
```sh
openssl ecparam -genkey -name secp521r1 -noout -out jwt.key
```
Now we need to encode this key to be able to use it as a string in the .env file.
```sh
cat jwt.key | awk '{printf "%s\\n", $0}'
```

## Deployment
You can now start the deployment using the following command.
```sh
docker-compose up -d
```
