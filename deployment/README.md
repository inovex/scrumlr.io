
# Scrumlr K8s

Running our Parse Server, Parse LiveQuery, MongoDB, Redis Cache, React Frontend and Parse Dashboard as Kubernetes resources. 

## Run Locally

### Prerequisites

- **Install [docker](https://docs.docker.com/get-docker/) (e.g. Docker Desktop for MacOS and Windows)**
- **Install [minikube](https://minikube.sigs.k8s.io/docs/start/) (If you don't want to use the Docker Desktop Kubernetes server and client)**
- **Install [kubectl](https://kubernetes.io/de/docs/tasks/tools/install-kubectl/)**
- **Clone our project and head to the `scrumlr.io/deployment` directory**


### Minikube

1. **Use the Docker daemon for minikube**

    To make sure our local docker-built images are used for our minikube deployments. 

    ```bash
    $ eval $(minikube docker-env)
    ```
    Important note: You have to run eval $(minikube docker-env) on each terminal you want to use, since it only sets the environment variables for the current shell session.

2. **Start your cluster**

    ```bash
    $ minikube start
    ```

    Optional: You can increase the available cpu cores and memory size in docker-desktop. The allocated resources can then also be used for minikube (e.g. 4 cpu cores and 8GB of ram):
    ```bash
    $ minikube start --cpus 4 --memory 7962
    ``` 

3. **Create Nginx Ingress Controller**

    ```bash
    $ kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.47.0/deploy/static/provider/cloud/deploy.yaml
    ```

4. **Run our deployment script**

    The deployment script will automatically search for all needed docker images, build them if they're missing and deploy all kubernetes resources afterwards.
    ```bash
    $ sh deploy.sh
    ```

5. **Create a minikube tunnel**

    The minikube tunnel is needed so that our Ingress can be reached on `127.0.0.1`.
    ```bash
    $ minikube tunnel
    ```

### Docker-Desktop

On MacOS and Windows machines you could also use the Docker Desktop application as Kubernetes context. 

1. **Enable Kubernetes**

    To enable Kubernetes support and install a standalone instance of Kubernetes running as a Docker container, go to `Docker Desktop > Preferences > Kubernetes` and then click `Enable Kubernetes`.

2. **Make sure to use the correct Kubernetes context**

    Ensure that the context is pointing to `docker-desktop`. 

    ```bash
    $ kubectl config get-contexts
    $ kubectl config use-context docker-desktop
    ```

3. **Create Nginx Ingress Controller**

    ```bash
    $ kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v0.47.0/deploy/static/provider/cloud/deploy.yaml
    ```

4. **Run our deployment script**

    The deployment script will automatically search for all needed docker images, build them if they're missing and deploy all kubernetes resources afterwards.
    ```bash
    $ sh deploy.sh
    ```

### Access our running application

- Our React application is served on http://scrumlr.local/
- The Parse Dashboard is served on http://scrumlr.local/dashboard
- API requests should go to http://scrumlr.local/api
    - The Parse Server health can be checked on http://scrumlr.local/api/health
- WebSocket requests should go to ws://scrumlr.local/ws

## kubectl cheatsheet 

- Apply a configuration to an object by filename or stdin. Overrides the existing configuration: `kubectl apply -f <*.yaml>`
- Apply configuration of all manifest files in a directory: `kubectl apply -f <./dir>` 
- Delete resource: `kubectl delete -f <resource_file>`
- List every resource: `kubectl get all` 
- List one or more deployments/services/pods: `kubectl get <deployment/service/pod>`
- Display the detailed state of one or more deployments/services/pods: `kubectl describe <deployment/service/pod> <name>`
- Print the logs for a pod: `kubectl logs <pod>`
- Print the logs for a pod and follow new logs: `kubectl logs -f <pod>`

    [Read More](https://www.bluematador.com/learn/kubectl-cheatsheet)
