#!/usr/bin/env bash
set -e

readonly REPO=masinio/scrumlr

if [ "${TRAVIS_BRANCH}" == "master" ]; then
    echo "Build docker image ${REPO}:${TRAVIS_COMMIT}"
    docker login -u ${DOCKER_USER} -p ${DOCKER_PASS}
    docker build -f Dockerfile -t ${REPO}:${TRAVIS_COMMIT} .
    docker tag ${REPO}:${TRAVIS_COMMIT} ${REPO}:latest
    docker push ${REPO}
fi