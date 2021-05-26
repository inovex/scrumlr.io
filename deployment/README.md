# Scrumlr K8S-Deployment

## Docker Images

First of all, we need to create a Docker image for every component we want do deploy. 

### Parse Server

Go into the server directory of our project and run the following command: <br>
``` docker build -f ../deployment/server.Dockerfile -t scrumlr-server . ```

### Parse LiveQuery

Go into the server directory of our project and run the following command: <br>
``` docker build -f ../deployment/liveQuery.Dockerfile -t scrumlr-livequery . ```

### HAProxy

Go into the server directory of our project and run the following command: <br>
``` docker build -f ../deployment/proxy.Dockerfile -t scrumlr-proxy . ```

---

## Kubernetes

Kubernetes resources, e.g. deployments and services, can be created using the following command: <br>
``` kubectl apply -f <*.yaml> ```

Resources can be removed using following command: <br>
``` kubectl delete -f <*.yaml> ```

| Name | File | Description | Docker Image | 
| --- | --- | --- | --- |
| `scrumlr-server` | `server-deployment.yaml` | File to create the deployment & service of the parse server | `scrumlr-server` |
| `scrumlr-livequery` | `livequery-deployment.yaml` | File to create the deployment & service of the parse livequery server | `scrumlr-livequery` |
| `scrumlr-database` | `database-deployment.yaml` | File to create the deployment & service of the mongodb database | `mongo` |
| `scrumlr-proxy` | `haproxy-deployment.yaml` | File to create the deployment & service of the HAProxy | `scrumlr-proxy` |
| `scrumlr-cache` | `redis-deployment.yaml` | File to create the deployment & service of the Redis cache | `redis` |

Once every resource was created, we can use our server cluster using the 

---

## Basic Docker & Kubernetes commands

- List all deployments: `kubectl get deployments`
- List all services: `kubectl get services` 
- List all pods: `kubectl get pods` 
- Show log of pod: `kubectl log <pod>`
- Show deployments, pods and services combined: `kubectl get deploy,po,svc`
- Describe resource: `kubectl describe <deploy/po/svc> <name>`
