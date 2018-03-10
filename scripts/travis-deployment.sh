#!/usr/bin/env bash
set -e

# TODO replace branch name with master
if [ "${TRAVIS_BRANCH}" == "tech/e2e-tests" ]; then
  firebase use staging --token ${FIREBASE_TOKEN}
  firebase deploy --token ${FIREBASE_TOKEN}

  # yarn e2e

  # firebase use live --token ${FIREBASE_TOKEN}
  # firebase deploy --token ${FIREBASE_TOKEN}
fi
