
# Scrumlr K8s

Running our Parse server, LiveQuery server, database, cache, frontend and dashboard as Kubernetes resources. 
## Run Locally

### Minikube

1. **Install [minikube](https://minikube.sigs.k8s.io/docs/start/), [docker](https://docs.docker.com/get-docker/)**

2. **Clone our project and head to the `/deployment` directory**

3. **Use the Docker daemon for minikube**
```bash
eval $(minikube docker-env)
```
Important note: You have to run eval $(minikube docker-env) on each terminal you want to use, since it only sets the environment variables for the current shell session.

4. **Start your cluster**

```bash
minikube start
```

5. **Create Nginx Ingress Controller**

```bash
kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.47.0/deploy/static/provider/cloud/deploy.yaml
```

6. **Run our deployment script**

The deployment script will automatically search for all needed docker images, build them if they're missing and 
deploy all kubernetes resources afterwards.
```bash
sh deploy.sh
```

7. **Update /etc/hosts**
Update our `/etc/hosts` file to route requests from `scrumlr.local` to our minikube cluster.

```bash
echo "127.0.0.1 scrumlr.local" | sudo tee -a /etc/hosts
```

8. **Create a minikube tunnel**

The minikube tunnel is needed so that our Ingress can be reached on `127.0.0.1`.
```bash
minikube tunnel
```
