---
title: Unleash via .env Files
description: Guide to integrating Unleash with your project using .env files for configuration.
---

# Unleash Integration via .env Files

This guide explains how to configure Unleash integration using `.env` files for both frontend and backend, including steps to load environment variables and start services.

## 1. Configure .env Files

Set up your `.env.development.local` file with the necessary environment variables for Unleash integration.

```env
# Frontend Configuration
SCRUMLR_UNLEASH_ENV=development
SCRUMLR_UNLEASH_FRONTEND_URL=write-your-frontend-url
SCRUMLR_UNLEASH_FRONTEND_TOKEN=write-your-frontend-token

# Backend Configuration
SCRUMLR_UNLEASH_BACKEND_URL=write-your-backend-url
SCRUMLR_UNLEASH_BACKEND_TOKEN=write-your-backend-token

# Database & Backend Options
SCRUMLR_SERVER_DATABASE_URL=postgres://your-username:your-password@localhost:5432/scrumlr?sslmode=disable
SCRUMLR_INSECURE=true
```

## 2. Load Environment Variables Automatically

Choose the appropriate method to load environment variables based on your operating system or shell.

### Option A: Linux/macOS (Bash/Zsh)

Run the following command from your project root to load variables from `.env.development.local`:

```bash
export $(grep -v '^#' .env.development.local | xargs)
```

### Option B: Fish Shell (macOS/Linux)

Fish shell does not support the standard `export` command. Follow these steps:

1. Switch to Bash:

```fish
bash
```

2. Then run:

```bash
export $(grep -v '^#' .env.development.local | xargs)
```

### Option C: Windows (CMD or PowerShell)

You can set variables manually or use `dotenv-cli` for automation.

#### Manual Setup (PowerShell)

Set each variable individually:

```powershell
$env:SCRUMLR_UNLEASH_ENV="development"
$env:SCRUMLR_UNLEASH_FRONTEND_URL="write-your-frontend-url"
# Repeat for all variables
```

#### Using dotenv-cli (Recommended)

1. Install Node.js from [nodejs.org](https://nodejs.org).
2. Install `dotenv-cli`:

```bash
npm install -g dotenv-cli
```

3. Run your command with `dotenv-cli`:

```bash
dotenv -e .env.development.local -- go run .
```

## 3. Start Services

After loading your `.env` file, start the backend and frontend services.

- **Start Backend**:

```bash
go run .
```

- **Start Frontend**:

```bash
yarn start
```

## Learn More

For additional details, refer to the official Unleash documentation.

<LinkCard
title="Unleash Documentation"
href="https://docs.getunleash.io"
description="Explore the official Unleash documentation for advanced configuration and features."
/>
