#!/bin/bash

# scrumlr-cache
kubectl delete -f ./scrumlr-cache/deployment.yaml
kubectl delete -f ./scrumlr-cache/service.yaml

# scrumlr-dashboard
kubectl delete -f ./scrumlr-dashboard/deployment.yaml
kubectl delete -f ./scrumlr-dashboard/ingress.yaml
kubectl delete -f ./scrumlr-dashboard/service.yaml
kubectl delete -f ./scrumlr-dashboard/configmap.yaml

# scrumlr-database

kubectl delete -f ./scrumlr-database/deployment.yaml
kubectl delete -f ./scrumlr-database/pvc.yaml
kubectl delete -f ./scrumlr-database/service.yaml

# scrumlr-frontend
kubectl delete -f ./scrumlr-frontend/deployment.yaml
kubectl delete -f ./scrumlr-frontend/ingress.yaml
kubectl delete -f ./scrumlr-frontend/service.yaml

# scrumlr-livequery
kubectl delete -f ./scrumlr-livequery/configmap.yaml
kubectl delete -f ./scrumlr-livequery/deployment.yaml
kubectl delete -f ./scrumlr-livequery/ingress.yaml
kubectl delete -f ./scrumlr-livequery/secrets.yaml
kubectl delete -f ./scrumlr-livequery/service.yaml

# scrumlr-server
kubectl delete -f ./scrumlr-server/configmap.yaml
kubectl delete -f ./scrumlr-server/deployment.yaml
kubectl delete -f ./scrumlr-server/ingress.yaml
kubectl delete -f ./scrumlr-server/secrets.yaml
kubectl delete -f ./scrumlr-server/service.yaml
