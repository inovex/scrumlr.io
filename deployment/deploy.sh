#!/bin/bash

echo "\n[1] Searching for required docker images\n"

if [[ "$(docker images -q scrumlr-frontend)" == "" ]]; 
then
    echo "Image scrumlr-frontend: missing";
    cd ..
    docker build -f Dockerfile -t scrumlr-frontend .
    cd deployment
else
    echo "Image scrumlr-frontend: found";
fi

if [[ "$(docker images -q scrumlr-parse)" == "" ]]; 
then
    echo "Image scrumlr-parse: missing";
    cd ../server
    docker build -f ../deployment/scrumlr-server/Dockerfile -t scrumlr-parse .
    cd ../deployment
else
    echo "Image scrumlr-parse: found";
fi

if [[ "$(docker images -q scrumlr-proxy)" == "" ]]; 
then
    echo "Image scrumlr-proxy: missing";
    cd scrumlr-proxy
    docker build -f Dockerfile -t scrumlr-proxy .
    cd ..
else
    echo "Image scrumlr-proxy: found";
fi

echo "\n[2] Create Kubernetes resources (e.g. deployments, services, configmaps, secrets)\n"

# scrumlr-database
kubectl apply -f scrumlr-database/service.yaml
kubectl apply -f scrumlr-database/deployment.yaml

# scrumlr-cache
kubectl apply -f scrumlr-cache/service.yaml
kubectl apply -f scrumlr-cache/deployment.yaml

# scrumlr-server
kubectl apply -f scrumlr-server/configmap.yaml
kubectl apply -f scrumlr-server/secrets.yaml
kubectl apply -f scrumlr-server/service.yaml
kubectl apply -f scrumlr-server/deployment.yaml

# scrumlr-livequery
kubectl apply -f scrumlr-livequery/configmap.yaml
kubectl apply -f scrumlr-livequery/secrets.yaml
kubectl apply -f scrumlr-livequery/service.yaml
kubectl apply -f scrumlr-livequery/deployment.yaml

# scrumlr-dashboard
kubectl apply -f scrumlr-dashboard/service.yaml
kubectl apply -f scrumlr-dashboard/deployment.yaml

#scrumlr-frontend
kubectl apply -f scrumlr-frontend/service.yaml
kubectl apply -f scrumlr-frontend/deployment.yaml

# Wait until all deployments are available
echo "\n[3] Wait until all deployments are available\n"
kubectl wait --for=condition=available --timeout=60s --all deployments

# Port-forwarding to service/scrumlr-proxy
echo "\n[4] Create Ingress\n"
kubectl apply -f ingress.yaml
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.47.0/deploy/static/provider/cloud/deploy.yaml

# Shut down resources
# for d in ./*/ ; do (cd "$d" && kubectl delete -f . ); done

