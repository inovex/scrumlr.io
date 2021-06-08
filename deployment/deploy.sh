#!/bin/bash

echo "\n[1] Searching for required docker images\n"

if [[ "$(docker images -q scrumlr-dashboard)" == "" ]]; 
then
    echo "Image scrumlr-dashboard: missing";
    docker build -f ../dashboard/Dockerfile -t scrumlr-dashboard ../dashboard
else
    echo "Image scrumlr-dashboard: found";
fi

if [[ "$(docker images -q scrumlr-frontend)" == "" ]]; 
then
    echo "Image scrumlr-frontend: missing";
    docker build -f ../Dockerfile -t scrumlr-frontend ..
else
    echo "Image scrumlr-frontend: found";
fi

if [[ "$(docker images -q scrumlr-parse)" == "" ]]; 
then
    echo "Image scrumlr-parse: missing";
    docker build -f scrumlr-server/Dockerfile -t scrumlr-parse ../server
else
    echo "Image scrumlr-parse: found";
fi

echo "\n[2] Create Kubernetes resources (e.g. deployments, services, configmaps, secrets)\n"

for d in ./*/ ;
do
    kubectl apply -f $d;
done

# Wait until all deployments are available
echo "\n[3] Wait until all deployments are available\n"
kubectl wait --for=condition=available --timeout=60s --all deployments

# Port-forwarding to service/scrumlr-proxy
#echo "\n[4] Create Ingress controller\n"
#kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.47.0/deploy/static/provider/cloud/deploy.yaml

# Shut down resources
# for d in ./*/ ; do (cd "$d" && kubectl delete -f . ); done

