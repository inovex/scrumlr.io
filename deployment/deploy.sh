#!/bin/bash

# Apply ConfigMaps & Secrets
kubectl apply -f server-configmap.yaml
kubectl apply -f livequery-configmap.yaml
kubectl apply -f secrets.yaml

# Apply deployments
kubectl apply -f database-deployment.yaml
kubectl apply -f redis-deployment.yaml
kubectl apply -f server-deployment.yaml
kubectl apply -f livequery-deployment.yaml
kubectl apply -f haproxy-deployment.yaml
kubectl apply -f dashboard-deployment.yaml
kubectl apply -f frontend-deployment.yaml
