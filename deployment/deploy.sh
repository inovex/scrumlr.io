#!/bin/bash

echo "\n[1] Create Kubernetes resources (e.g. deployments, services, configmaps, secrets)\n"

# scrumlr-cache
kubectl apply -f ./scrumlr-cache/deployment.yaml
kubectl apply -f ./scrumlr-cache/service.yaml

# scrumlr-dashboard
kubectl apply -f ./scrumlr-dashboard/deployment.yaml
kubectl apply -f ./scrumlr-dashboard/ingress.yaml
kubectl apply -f ./scrumlr-dashboard/service.yaml
kubectl apply -f ./scrumlr-dashboard/configmap.yaml
kubectl apply -f ./scrumlr-dashboard/secrets.yaml

# scrumlr-database
kubectl apply -f ./scrumlr-database/pvc.yaml
kubectl apply -f ./scrumlr-database/deployment.yaml
kubectl apply -f ./scrumlr-database/service.yaml

# scrumlr-frontend
kubectl apply -f ./scrumlr-frontend/deployment.yaml
kubectl apply -f ./scrumlr-frontend/ingress.yaml
kubectl apply -f ./scrumlr-frontend/service.yaml

# scrumlr-livequery
kubectl apply -f ./scrumlr-livequery/configmap.yaml
kubectl apply -f ./scrumlr-livequery/deployment.yaml
kubectl apply -f ./scrumlr-livequery/ingress.yaml
kubectl apply -f ./scrumlr-livequery/secrets.yaml
kubectl apply -f ./scrumlr-livequery/service.yaml

# scrumlr-server
kubectl apply -f ./scrumlr-server/configmap.yaml
kubectl apply -f ./scrumlr-server/deployment.yaml
kubectl apply -f ./scrumlr-server/ingress.yaml
kubectl apply -f ./scrumlr-server/secrets.yaml
kubectl apply -f ./scrumlr-server/service.yaml


# Wait until all deployments are running
echo "\n[2] Wait until all deployments are running\n"
kubectl wait --for=condition=available --timeout=60s --all deployments


