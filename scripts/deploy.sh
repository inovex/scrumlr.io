#!/usr/bin/env bash
set -e

# Change to root directory
cd "$( dirname "${BASH_SOURCE[0]}" )"/..

readonly STAGE=${1:-staging}

case "$STAGE" in
        staging)
            export REACT_APP_PROJECT_ID=scrumlr-staging
            export REACT_APP_FIREBASE_API_KEY=AIzaSyBvrxlE-gSrWvC6ir_LVzyPEba65EYth2w
            export REACT_APP_FIREBASE_AUTH_DOMAIN=scrumlr-staging.firebaseapp.com
            export REACT_APP_DATABASE_URL=https://scrumlr-staging.firebaseio.com
            export REACT_APP_FIREBASE_STORAGE_BUCKET=scrumlr-staging.appspot.com
            export REACT_APP_FIREBASE_MESSAGING_SENDER_ID=775711400697
            unset REACT_APP_SENTRY_DSN
            unset REACT_APP_SLACK_FEEDBACK_HOOK
            ;;

        live)
            export REACT_APP_PROJECT_ID=scrumlr-d74d6
            export REACT_APP_FIREBASE_API_KEY=AIzaSyDGc60nvYXIbZu8EinVdtUD-evpXSjP6qI
            export REACT_APP_FIREBASE_AUTH_DOMAIN=scrumlr-d74d6.firebaseapp.com
            export REACT_APP_DATABASE_URL=https://scrumlr-d74d6.firebaseio.com/
            export REACT_APP_FIREBASE_STORAGE_BUCKET=scrumlr-d74d6.appspot.com
            export REACT_APP_FIREBASE_MESSAGING_SENDER_ID=1013557222626
            export REACT_APP_SENTRY_DSN=https://d3f0283a37e34b08a72fcdd38981ce69@sentry.io/206110
            export REACT_APP_SLACK_FEEDBACK_HOOK=https://hooks.slack.com/services/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
            ;;
esac

# Build app
yarn build

# Deploy app (default to staging)
firebase login
firebase use ${STAGE}
firebase deploy
