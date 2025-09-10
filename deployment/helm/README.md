# Kubernetes deployment

## Helm chart

### Development requirements

- [helm](https://helm.sh)
- [readme generator](https://github.com/bitnami/readme-generator-for-helm)
- [helm unittests](https://github.com/helm-unittest/helm-unittest)
- [tilt](https://tilt.dev/) (optional)
- kubernetes cluster (optional)
- make (optional)

### Development

We provide a [Makefile](./scrumlr/Makefile) with the most common commands you need to develop the helm chart

- `make render`: renders the helm chart in the `.render` folder
- `make clean`: removes the `.render` folder
- `make debug`: debugs the helm chart
- `make lint`: runs linting for the helm chart
- `make readme`: generates the Readme for the values file
- `make tilt-up`: starts tilt to deploy scrumlr to a test cluster
- `make tilt-down`: cleans the tilt deployment
- `make test`: runs the helm unittests

#### Unittests

To run the unittests for the helm chart you must install [helm unittests](https://github.com/helm-unittest/helm-unittest).
After that you can run

```bash
make test
```

or

```bash
helm unittest --file 'tests/**/*.yaml' ../scrumlr
```

to execute the tests.

#### Tilt

For the development of the helm chart we provide a [Tiltfile](./tilt/Tiltfile) that deploys all needed requirements to a
cluster.
The tiltfile deploys a minimal deployment for scrumlr, which consist out of a namespace, a postgresql database, nats and
the scrumlr helm chart.
*Note*: For the scrumlr helm chart you need to provide a private key.

*Note*: Before you start tilt make sure to set the right kube config for the cluster you want to test the scrumlr helm chart.
To start tilt change the directory and use

```bash
cd tilt
tilt up
```
