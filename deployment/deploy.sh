#!/bin/bash

# scrumlr-database
kubectl create -f scrumlr-database/service.yaml
kubectl create -f scrumlr-database/deployment.yaml

# scrumlr-cache
kubectl create -f scrumlr-cache/service.yaml
kubectl create -f scrumlr-cache/deployment.yaml

# scrumlr-server
kubectl create -f scrumlr-server/configmap.yaml
kubectl create -f scrumlr-server/secrets.yaml
kubectl create -f scrumlr-server/service.yaml
kubectl create -f scrumlr-server/deployment.yaml

# scrumlr-livequery
kubectl create -f scrumlr-livequery/configmap.yaml
kubectl create -f scrumlr-livequery/secrets.yaml
kubectl create -f scrumlr-livequery/service.yaml
kubectl create -f scrumlr-livequery/deployment.yaml

# scrumlr-proxy
kubectl create -f scrumlr-proxy/service.yaml
kubectl create -f scrumlr-proxy/deployment.yaml

# scrumlr-dashboard
kubectl create -f scrumlr-dashboard/service.yaml
kubectl create -f scrumlr-dashboard/deployment.yaml

#scrumlr-frontend
kubectl create -f scrumlr-frontend/service.yaml
kubectl create -f scrumlr-frontend/deployment.yaml


# Wait until all deployments are available
kubectl wait --for=condition=available --timeout=60s --all deployments

# Port-forwarding to service/scrumlr-proxy
kubectl port-forward service/scrumlr-proxy 4000:4000

