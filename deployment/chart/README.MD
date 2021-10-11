# Scrumlr

## Run locally
### Prerequisites

- **Install [docker](https://docs.docker.com/get-docker/) (e.g. Docker Desktop for MacOS and Windows)**
- **Install [minikube](https://minikube.sigs.k8s.io/docs/start/) (If you don't want to use the Docker Desktop Kubernetes server and client)**
- **Install [kubectl](https://kubernetes.io/de/docs/tasks/tools/install-kubectl/)**
- **Install [Helm](https://helm.sh/docs/intro/install/)**
- **Clone our project and head to the `scrumlr.io/deployment` directory**

### Minikube

1. **Start your cluster**

    ```bash
    $ minikube start
    ```

    Optional: You can increase the available cpu cores and memory size in docker-desktop. The allocated resources can then also be used for minikube (e.g. 4 cpu cores and 8GB of ram):
    ```bash
    $ minikube start --cpus 4 --memory 7962
    ```

2. **Check minikube**

    ```bash
    $ minikube dashboard
    ```

### Install Ingress-Nginx

```bash
$ helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
$ helm repo update
$ helm install ingress-nginx ingress-nginx/ingress-nginx --namespace ingress-nginx --create-namespace
```
### Install Scrumlr

1. **Use the Docker daemon for minikube**

    To make sure our local docker-built images are used for our minikube deployments.

    ```bash
    $ eval $(minikube -p minikube docker-env)
    ```
    Important note: You have to run this command on each terminal you want to use, since it only sets the environment variables for the current shell session.

2. **Build Docker Images**

    The build script will automatically search for all needed docker images, build them if they're missing and the deployment script will deploy all kubernetes resources afterwards.

    ```bash
    $ cd deployment
    $ sh build.sh
    ```

3. **Install Helm Charts**

    ```bash
    $ cd chart
    $ helm dep up
    $ helm install scrumlr .
    ```
### Start Scrumlr

1. **Check Pods**

    ```bash
    $ kubectl get pods
    ```
    All pods should be running. This may take sometime. You might want to run this command again and again. Or you run it with `--watch`.

2. **Create a minikube tunnel**

    The minikube tunnel is needed so that our Ingress can be reached on `127.0.0.1`.

    ```bash
    $ minikube tunnel
    ```
    You might have to enter your password.
### Uninstall

```bash
$ helm uninstall scrumlr
$ helm uninstall ingress-nginx -n ingress-ngnix
```

You might want to delete the ingress-nginx namespace for a complete clean up.

```bash
$ kubectl delete namespace ingress-nginx
```
