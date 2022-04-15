#!/bin/bash

echo "\nSearching for required docker images\n"

if [[ "$(docker images -q scrumlr-frontend)" == "" ]];
then
    echo "Image scrumlr-frontend: missing";
    docker build -f ../Dockerfile -t scrumlr-frontend ..
else
    echo "Image scrumlr-frontend: found";
fi

if [[ "$(docker images -q scrumlr-server)" == "" ]];
then
    echo "Image scrumlr-server: missing";
    docker build -f ../server/src/Dockerfile -t scrumlr-server ../server/src
else
    echo "Image scrumlr-server: found";
fi
