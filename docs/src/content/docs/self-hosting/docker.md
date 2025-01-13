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
cd scrumlr.io/deployment/docker
```

Copy the `.env.example` file to `.env` and adjust the variables to your needs.
```sh
cp .env.example .env
```

For a new deployment the mandatory variables to fill out are `POSTGRES_PASSWORD` and `SCRUMLR_PRIVATE_KEY`.

## Generating needed secrets

### Postgres Password

Make sure to set the `POSTGRES_PASSWORD` variable in your `.env` file to a secure password. For example you can generate a 64 characters long one from the terminal with the following command (if you have `pwgen` installed):

```sh
pwgen -s 64 1
```
### JWT Private Key
We use an ECDSA private key to sign the JWT tokens.
***Make sure to keep this key secure as it can be used to decrypt the tokens and generate new ones, potentially compromising your users' accounts.***
```sh
openssl ecparam -genkey -name secp521r1 -noout -out jwt.key
```
Now we need to encode this key to be able to use it as a string in the `.env` file:
```sh
cat jwt.key | awk '{printf "%s\\n", $0}'
```

Copy the result of this command and paste it into your `.env` file (with `\n` line breaks included) like this, surrounded with quotes:

```ini
SCRUMLR_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----\n"
```

### Session Secret

Make sure to set the `SESSION_SECRET` variable in your `.env` file if you are using an authentication provider.
You can generate a session secret with

```sh
pwgen -s 64 1
```

## Deployment
You can now start the deployment using the following command.
```sh
docker-compose up -d
```

After a few seconds you can check with `docker ps --all` to see if all the containers have started up. If one crashed or if there is an issue you can check logs with `docker logs (container name or id)`

## Reverse Proxy
We strongly recommend using a reverse proxy to handle TLS termination and to provide a secure connection to your users.
Scrumlr should work with all major reverse proxies like [Nginx](https://nginx.org), [Traefik](https://traefik.io/traefik/) or [Caddy](https://caddyserver.com/docs/quick-starts/reverse-proxy).
We automatically include a caddy deployment in the docker-compose file, which you can use as a reverse proxy.
All you need to do is updating the `Caddyfile` to include your host domain instead of `0.0.0.0:80`.
If you don't want TLS you can simply keep the specified port.
Keep in mind that running Scrumlr without TLS is **not recommended**.

```
your_domain {
}
```

## Troubleshooting

### Scrumlr works fine on my machine, but others get an error when they click on "Start now"

Make sure the `SCRUMLR_SERVER_URL` in the `.env` file uses your external ip address, instead of `localhost` or `127.0.0.1`.
You can search "what is my ip" on the internet to find your external ip address.
