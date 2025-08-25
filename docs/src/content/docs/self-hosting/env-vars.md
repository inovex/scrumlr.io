---
title: Environment Variables
description: A full list of all environment variables that can be used to configure Scrumlr.
sidebar:
    order: 3
---

Full documentation of all environment variables that can be used to configure Scrumlr.

## Frontend

### Show legal documents

Toggle visibility of cookie policy, privacy policy, and terms & conditions in the footer.
Recommended for public instances.

```ini
SCRUMLR_SHOW_LEGAL_DOCUMENTS=''
```

### Server URL

Override the server address for API calls. This is the URL of the backend server.

```ini
SCRUMLR_SERVER_URL=''
```

### Websocket URL

Override the websocket address for API calls. This is the URL of the backend server but beginning with the `ws` or `wss`
protocol.

```ini
SCRUMLR_WEBSOCKET_URL=''
```

### Frontend Listen Port

The port on which the frontend should listen for incoming connections.

```ini
SCRUMLR_LISTEN_PORT='8080'
```

### Analytics variables

We provide the option to use [Plausible](https://plausible.io) for analytics. If you want to use Plausible, you need to
set the following environment variables.

```ini
SCRUMLR_ANALYTICS_DATA_DOMAIN=''
SCRUMLR_ANALYTICS_SRC=''
```

### Clarity id

The clarity id to use [Clarity](https://clarity.microsoft.com/).

```ini
SCRUMLR_CLARITY_ID=''
```

## Backend

### Server Port

The port on which the backend should listen for incoming connections.

```ini
SCRUMLR_SERVER_PORT='8080'
```

### NATS URL

The URL of the NATS server.
You can either use a NATS server or a Redis server for the backend communication.
Only configure one of the two.

```ini
SCRUMLR_SERVER_NATS_URL=''
```

### Redis Variables

You can either use a NATS server or a Redis server for the backend communication.
Only configure one of the two.

```ini
SCRUMLR_SERVER_REDIS_HOST=''
SCRUMLR_SERVER_REDIS_USERNAME=''
SCRUMLR_SERVER_REDIS_PASSWORD=''
```

### Insecure Mode

Uses the insecure private key for JWT token signing.
**Do not use in production!**

```ini
SCRUMLR_INSECURE=''
```

### Private Key

The private key used to sign the JWT tokens.
Please generate a new key for production use and keep it secure.

```ini
SCRUMLR_PRIVATE_KEY=''
```

### Database URL

The URL of the PostgreSQL database.
Credentials are passed in the URL.
If you havent configured postgres for TLS, you can use the `?sslmode=disable` parameter.

```ini
SCRUMLR_SERVER_DATABASE_URL='postgres://user:password@host:port/database'
```

### Base Path

The base path of the API. The default is `/`.

```ini
SCRUMLR_BASE_PATH=''
```

### Disable Anonymous Login

If set to `true`, users won't be able to log in anonymously, forcing them to use a provider (any OAuth or OIDC).
Note that if this is set to `true`, and no valid providers are available, login won't be possible at all.
Default is `false`.

```ini
SCRUMLR_DISABLE_ANONYMOUS_LOGIN=false
```

### Allow Anonymous Template Creation

If set to `false`, users won't be able to create custom templates anonymously (i.e., not using OAuth).
They can still create boards using recommended templates.
Default is `false`.

```ini
SCRUMLR_ALLOW_ANONYMOUS_CUSTOM_TEMPLATES=false
```

### Allow Anonymous Board Creation

If set to `false`, users won't be able to create boards anonymously (i.e., not using OAuth).
This applies to creating boards from both recommended and custom templates.
They can still join existing boards.
Default is `true`.

```ini
SCRUMLR_ALLOW_ANONYMOUS_BOARD_CREATION=true
```

### Enable Experimental File System Store

Enables an experimental file store for session cookies, which is used during OAuth authentication to store session info
while on the provider page.
Required for some OIDC providers, since their session cookies exceed the size limit of 4KB.
Default is `false`.

```ini
SCRUMLR_ENABLE_EXPERIMENTAL_AUTH_FILE_SYSTEM_STORE=false
```

### Auth Callback Host

The host to which the OAuth callback should redirect.

```ini
SCRUMLR_AUTH_CALLBACK_HOST=''
```

### Google OAuth

Required Google OAuth credentials.
Only configure if you wish to use Google OAuth.

```ini
SCRUMLR_AUTH_GOOGLE_CLIENT_ID=''
SCRUMLR_AUTH_GOOGLE_CLIENT_SECRET=''
```

### GitHub OAuth

Required GitHub OAuth credentials.
Only configure if you wish to use GitHub OAuth.

```ini
SCRUMLR_AUTH_GITHUB_CLIENT_ID=''
SCRUMLR_AUTH_GITHUB_CLIENT_SECRET=''
```

### Microsoft OAuth

Required Microsoft OAuth credentials.
Only configure if you wish to use Microsoft OAuth.

```ini
SCRUMLR_AUTH_MICROSOFT_CLIENT_ID=''
SCRUMLR_AUTH_MICROSOFT_CLIENT_SECRET=''
```

### Azure AD OAuth

Required Azure AD OAuth credentials.
Only configure if you wish to use Azure AD OAuth.

```ini
SCRUMLR_AUTH_AZURE_AD_TENANT_ID=''
SCRUMLR_AUTH_AZURE_AD_CLIENT_ID=''
SCRUMLR_AUTH_AZURE_AD_CLIENT_SECRET=''
```

### Apple OAuth

Required Apple OAuth credentials.
Only configure if you wish to use Apple OAuth.

```ini
SCRUMLR_AUTH_APPLE_CLIENT_ID=''
SCRUMLR_AUTH_APPLE_CLIENT_SECRET=''
```

### OpenID Connect OAuth

Required OIDC credentials.
Only configure if you wish to use generic OpenID Connect Authentication.

```ini
SCRUMLR_AUTH_OIDC_CLIENT_ID=''
SCRUMLR_AUTH_OIDC_CLIENT_SECRET=''
SCRUMLR_AUTH_OIDC_DISCOVERY_URL=''
SCRUMLR_AUTH_OIDC_USER_IDENT_SCOPE=''
SCRUMLR_AUTH_OIDC_USER_NAME_SCOPE=''
```

Note: Might require larger session store to be active, see [SCRUMLR_ENABLE_EXPERIMENTAL_AUTH_FILE_SYSTEM_STORE](#enable-experimental-file-system-store)

### Session Secret

The secret for the session. This secret is used by gothic.
This needs to be configured if you are using an authentication provider.

```ini
SESSION_SECRET=''
```

### Feedback Webhook URL

A webhook URL to which feedback should be sent.
This is not required.

```ini
SCRUMLR_FEEDBACK_WEBHOOK_URL=''
```

### Scrumlr Config Path

The path to the Scrumlr configuration file.

```ini
SCRUMLR_CONFIG_PATH=''
```
