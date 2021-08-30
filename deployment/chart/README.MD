# Scrumlr

## Run locally

### Prerequisites
- **Running K8's Instance (e.g with Minikube or Docker-Desktop describes in [README.MD](https://github.com/inovex/scrumlr.io/blob/main/deployment/README.md))**
- **Install [Helm](https://helm.sh/docs/intro/install/)**
  
### Install Ingress-Nginx
```bash
helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
helm repo update
helm install ingress-nginx ingress-ngnix/ingress-nginx --namespace ingress-nginx --create-namespace
```
### Install Scrumlr
```bash
helm dep up
helm install scrumlr . 
```
### Uninstall

```Bash
helm uninstall scrumlr
helm uninstall ingress-nginx -n ingress-ngnix
```
You might want to delete the ingress-nginx namespace for a complete clean up
```Bash
kubectl delete namespace ingress-nginx
```
