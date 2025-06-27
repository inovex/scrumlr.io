## Unleash Integration via .env Files

# 📁1.Unleash Integration via .env Files

```env
# 🔧 Frontend Configuration
REACT_APP_UNLEASH_ENV=development
REACT_APP_UNLEASH_FRONTEND_URL=write-your-frontend-url
REACT_APP_UNLEASH_FRONTEND_TOKEN=write-your-frontend-token

# 🖥️ Backend Configuration
SCRUMLR_UNLEASH_BACKEND_URL=write-your-backend-url
SCRUMLR_UNLEASH_BACKEND_TOKEN=write-your-backend-token

# 🗃️ Database & Backend Options
SCRUMLR_SERVER_DATABASE_URL=postgres://your-username:your-password@localhost:5432/scrumlr?sslmode=disable
SCRUMLR_INSECURE=true
```
## ⚙️ 2. Load Environment Variables Automatically

##  Option A – Linux/macOS (Bash/Zsh)

Run this from project root:

```
export $(grep -v '^#' .env.development.local | xargs)

```

## 🐟 Option B – Fish Shell (macOS/Linux)

Fish does not support the standard export command.

Step 1: Switch to Bash


```
bash

```
Step 2: Then run:

```
export $(grep -v '^#' .env.development.local | xargs)

```


## Option C – Windows (CMD or PowerShell)

You must set each variable manually or use dotenv-cli:

PowerShell (manual example):

```
$env:REACT_APP_UNLEASH_ENV="development"
$env:REACT_APP_UNLEASH_FRONTEND_URL="write-your-frontend-url"
# repeat for all variables

```
Using dotenv-cli (recommended):

1. Install Node.js
2. Install dotenv-cli

```
npm install -g dotenv-cli

```
3. Run your command with:

```
dotenv -e .env.development.local -- go run .

```

## 🚀 3. Start Services

After loading your .env:

. Start backend:
  ```
  go run .

  ```
. Start frontend:
  ```
  yarn start

  ```

## 🔗 [Learn more: Unleash Documentation](https://docs.getunleash.io)

