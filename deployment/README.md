# Scrumlr K8S-Deployment

## Docker Images

First of all, we need to create a Docker image for every component we want do deploy. 

### Parse Server & LiveQuery

Since both Parse server and LiveQuery server are basically the same but only started in a
different operation mode, we can use the same docker image for both. 

Go into the server directory of our project and run the following command: <br>
``` docker build -f ../deployment/server.Dockerfile -t scrumlr-parse . ```
### HAProxy

Go into the server directory of our project and run the following command: <br>
``` docker build -f ../deployment/proxy.Dockerfile -t scrumlr-proxy . ```

### Frontend React Application

Go into the root directory of our project and run the following command: <br>
``` docker build -f Dockerfile -t scrumlr-frontend . ```

---

## Kubernetes

Kubernetes resources, e.g. deployments and services, can be created using the following command: <br>
``` kubectl create -f <*.yaml> ```

Kubernetes resources can be updated using the following command: <br>
``` kubectl apply -f <*.yaml> ```

Resources can be removed using following command: <br>
``` kubectl delete -f <*.yaml> ```

| Name | File | Description | Docker Image | 
| --- | --- | --- | --- |
| `scrumlr-server` | `server-deployment.yaml` | File to create the deployment & service of the parse server | `scrumlr-parse` |
| `scrumlr-livequery` | `livequery-deployment.yaml` | File to create the deployment & service of the parse livequery server | `scrumlr-parse` |
| `scrumlr-database` | `database-deployment.yaml` | File to create the deployment & service of the mongodb database | `mongo` |
| `scrumlr-proxy` | `haproxy-deployment.yaml` | File to create the deployment & service of the HAProxy | `scrumlr-proxy` |
| `scrumlr-cache` | `redis-deployment.yaml` | File to create the deployment & service of the Redis cache | `redis` |
| `scrumlr-frontend` | `frontend-deployment.yaml` | File to create the deployment & service of the frontend react application | `scrumlr-frontend` |
| `scrumlr-dashboard` | `dashboard-deployment.yaml` | File to create the deployment & service of the parse dashboard | `parseplatform/parse-dashboard` |

### ConfigMaps & Secrets

ConfigMaps & Secrets are used to store certain key-value-pairs to use them in our server & livequery deployment as environment variables. 

- `secrets.yaml`: Used to store our Parse masterKey base64 encoded
- `server-configmap.yaml`: Used to store our environment variables for the parse server
- `livequery-configmap.yaml`: Used to store our environment variables for the liveuquery server


--- 

## Deployment

To deploy our Kubernetes cluster, you can run our `deploy.sh` script located in the deployment directory. 

Afterwards, every ConfigMap, Secret, Deployment, Service, ReplicaSet, Pod should have been created. 

To reach our server on `localhost:4000` you can start a port-forward in the terminal via `kubectl port-forward service/scrumlr-proxy 4000:4000`

Now our Webapplication should be served on `localhost:30080` and the Parse Dashboard should be served on `localhost:30040`. 


To shut down our Cluster, go into the deployment directory and run the following command:
``` kubectl delete -f . ```

---

## Basic Docker & Kubernetes commands

- List all deployments: `kubectl get deployments`
- List all services: `kubectl get services` 
- List all pods: `kubectl get pods` 
- Show log of pod: `kubectl log <pod>`
- Show deployments, pods and services combined: `kubectl get deploy,po,svc`
- Describe resource: `kubectl describe <deploy/po/svc> <name>`
