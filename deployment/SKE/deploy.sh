#!/bin/bash

set -e

# Function to check if a command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

# Function to check if a Kubernetes cluster is connected
check_k8s_connection() {
  if ! kubectl cluster-info >/dev/null 2>&1; then
    echo "Error: No Kubernetes cluster connection found."
    exit 1
  fi
}

# Function to wait for a deployment to complete
wait_for_deployment() {
  local namespace=$1
  local deployment=$2
  kubectl -n "$namespace" rollout status deployment "$deployment"
}

# Function to check if a Helm release exists
helm_release_exists() {
  local release=$1
  local namespace=$2
  if helm status "$release" --namespace "$namespace" >/dev/null 2>&1; then
    return 0
  else
    return 1
  fi
}

# Check if helm is installed
if ! command_exists helm; then
  echo "Error: Helm is not installed."
  exit 1
fi

# Check if kubectl is installed
if ! command_exists kubectl; then
  echo "Error: kubectl is not installed."
  exit 1
fi

# Check if a Kubernetes cluster is connected
check_k8s_connection

# Input parameters
DB_URL=$1

if [ -z "$DB_URL" ]; then
  echo "Usage: $0 <DB_URL>"
  exit 1
fi

# Create namespace
kubectl create namespace scrumlr || true

# Install Traefik
if ! helm_release_exists traefik scrumlr; then
  helm repo add traefik https://traefik.github.io/charts
  helm repo update
  helm install traefik traefik/traefik --namespace scrumlr
  wait_for_deployment scrumlr traefik
else
  echo "Traefik is already installed, skipping installation."
fi

# Prompt user to set up DNS records and input deployment domain
echo "Please set up your DNS records to point to the Traefik load balancer."
read -rp "Enter your deployment domain (e.g., scrumlr.stackit.rocks): " DEPLOYMENT_DOMAIN

if [ -z "$DEPLOYMENT_DOMAIN" ]; then
  echo "Error: Deployment domain is required."
  exit 1
fi

export SCRUMLR_DEPLOYMENT_DOMAIN="$DEPLOYMENT_DOMAIN"

# Install Cert-Manager
if ! helm_release_exists cert-manager cert-manager; then
  helm repo add jetstack https://charts.jetstack.io --force-update
  helm repo update
  helm install cert-manager jetstack/cert-manager --namespace cert-manager --create-namespace --version v1.15.0 --set crds.enabled=true
  wait_for_deployment cert-manager cert-manager
else
  echo "Cert-Manager is already installed, skipping installation."
fi

# Deploy NATS
if ! helm_release_exists nats scrumlr; then
  helm repo add nats https://nats-io.github.io/k8s/helm/charts/
  helm repo update
  helm install nats nats/nats --set cluster.enabled=true --set cluster.replicas=3 --namespace scrumlr
  wait_for_deployment scrumlr nats-box
else
  echo "NATS is already installed, skipping installation."
fi

# Create secrets
# replace /stackit with correct db path
DB_URL_SCRUMLR=$(echo "$DB_URL" | sed 's/\/stackit/\/scrumlr/')
kubectl -n scrumlr create secret generic postgresql-creds --from-literal=url="$DB_URL_SCRUMLR" --dry-run=client -o yaml | kubectl apply -f -

# Check if ECDSA key already exists
if ! kubectl -n scrumlr get secret scrumlr-ecdsa-key >/dev/null 2>&1; then
  openssl ecparam -genkey -name secp521r1 -noout -out scrumlr-ecdsa-key.pem
  kubectl -n scrumlr create secret generic scrumlr-ecdsa-key --from-file=private_key=scrumlr-ecdsa-key.pem --dry-run=client -o yaml | kubectl apply -f -
else
  echo "ECDSA key already exists, skipping key generation."
fi

export DB_URL="$DB_URL"
# Apply the database creation job
envsubst < create_db_job.yaml | kubectl apply -f -

# Wait for the job to complete
kubectl -n scrumlr wait --for=condition=complete job/create-db-job

# Apply cluster issuer
kubectl apply -f cluster_issuer.yaml

# Apply frontend and backend deployments
envsubst < scrumlr_frontend.yaml | kubectl apply -f -
envsubst < scrumlr_backend.yaml | kubectl apply -f -

# Wait for deployments to complete
wait_for_deployment scrumlr scrumlr-deployment
wait_for_deployment scrumlr frontend-deployment

echo "Deployment completed successfully."
