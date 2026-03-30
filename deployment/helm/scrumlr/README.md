# Scrumlr

## Parameters

### Frontend paramaters

| Name                                          | Description                                                                                 | Value                                        |
| --------------------------------------------- | ------------------------------------------------------------------------------------------- | -------------------------------------------- |
| `frontend.image.repository`                   | The scrumlr image to deploy                                                                 | `ghcr.io/inovex/scrumlr.io/scrumlr-frontend` |
| `frontend.image.tag`                          | The image tag to use                                                                        | `nil`                                        |
| `frontend.image.pullSecrets`                  | Docker registry secret names as an array                                                    | `[]`                                         |
| `frontend.image.pullPolicy`                   | The imagePullPolicy to use                                                                  | `IfNotPresent`                               |
| `frontend.image.args`                         | Aguments for the scrumlr backend                                                            | `[]`                                         |
| `frontend.replicaCount`                       | Set the replica count for the backend                                                       | `1`                                          |
| `frontend.autoscaling.enabled`                | Enable autoscaling                                                                          | `false`                                      |
| `frontend.autoscaling.minReplicas`            | Min replics for autoscaling                                                                 | `1`                                          |
| `frontend.autoscaling.maxReplicas`            | Max replicas for autoscaling                                                                | `3`                                          |
| `frontend.autoscaling.cpuUtilization`         | Define the CPU target to trigger the scaling actions (utilization percentage)               | `60`                                         |
| `frontend.autoscaling.memoryUtilization`      | Define the memory target to trigger the scaling actions (utilization percentage)            | `60`                                         |
| `frontend.config.listenPort`                  | Port for the frontend                                                                       | `8080`                                       |
| `frontend.config.serverUrl`                   | Server url for api calls                                                                    | `/api`                                       |
| `frontend.extraConfig`                        | Extra configuration values as a map                                                         | `{}`                                         |
| `frontend.secrets`                            | Extra secrets values as a map                                                               | `{}`                                         |
| `frontend.secretRef`                          | Name of existing secret. If set override the secrets.                                       | `""`                                         |
| `frontend.env`                                | Additional environment variables for the frontend container                                 | `[]`                                       |
| `frontend.resources`                          | Set container requests and limits for different resources like CPU or memory                | `{}`                                         |
| `frontend.podSecurityContext`                 | Pod-level security context                                                                  | `{"seccompProfile":{"type":"RuntimeDefault"}}` |
| `frontend.containerSecurityContext`           | Container-level security context                                                            | `{"allowPrivilegeEscalation":false}`          |
| `frontend.startupProbe.enabled`               | Enable/disable the startup probe                                                            | `true`                                       |
| `frontend.startupProbe.initialDelaySeconds`   | Delay before startup probe is initiated                                                     | `10`                                         |
| `frontend.startupProbe.periodSeconds`         | How often to perform the probe                                                              | `10`                                         |
| `frontend.startupProbe.timeoutSeconds`        | When the probe times out                                                                    | `5`                                          |
| `frontend.startupProbe.successThreshold`      | Minimum consecutive successes for the probe to be considered successful after having failed | `1`                                          |
| `frontend.startupProbe.failureThreshold`      | Minimum consecutive failures for the probe to be considered failed after having succeeded   | `5`                                          |
| `frontend.readinessProbe.enabled`             | Enable/disable the readiness probe                                                          | `true`                                       |
| `frontend.readinessProbe.initialDelaySeconds` | Delay before readiness probe is initiated                                                   | `10`                                         |
| `frontend.readinessProbe.periodSeconds`       | How often to perform the probe                                                              | `10`                                         |
| `frontend.readinessProbe.timeoutSeconds`      | When the probe times out                                                                    | `5`                                          |
| `frontend.readinessProbe.successThreshold`    | Minimum consecutive successes for the probe to be considered successful after having failed | `1`                                          |
| `frontend.readinessProbe.failureThreshold`    | Minimum consecutive failures for the probe to be considered failed after having succeeded   | `5`                                          |
| `frontend.livenessProbe.enabled`              | Enable/disable the liveness probe                                                           | `true`                                       |
| `frontend.livenessProbe.initialDelaySeconds`  | Delay before liveness probe is initiated                                                    | `10`                                         |
| `frontend.livenessProbe.periodSeconds`        | How often to perform the probe                                                              | `10`                                         |
| `frontend.livenessProbe.timeoutSeconds`       | When the probe times out                                                                    | `5`                                          |
| `frontend.livenessProbe.successThreshold`     | Minimum consecutive successes for the probe to be considered successful after having failed | `1`                                          |
| `frontend.livenessProbe.failureThreshold`     | Minimum consecutive failures for the probe to be considered failed after having succeeded   | `5`                                          |
| `frontend.customStartupProbe`                 | Override default startup probe                                                              | `{}`                                         |
| `frontend.customReadinessProbe`               | Override default liveness probe                                                             | `{}`                                         |
| `frontend.customLivenessProbe`                | Override default readiness probe                                                            | `{}`                                         |

### Backend parameters

| Name                                         | Description                                                                                 | Value                                     |
| -------------------------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------------------- |
| `backend.image.repository`                   | The scrumlr image to deploy                                                                 | `ghcr.io/inovex/scrumlr.io/scrumlr-server` |
| `backend.image.tag`                          | The image tag to use                                                                        | `nil`                                     |
| `backend.image.pullSecrets`                  | Docker registry secret names as an array                                                    | `[]`                                      |
| `backend.image.pullPolicy`                   | The imagePullPolicy to use                                                                  | `IfNotPresent`                            |
| `backend.image.args`                         | Aguments for the scrumlr backend                                                            | `["-disable-check-origin"]`    |
| `backend.replicaCount`                       | Set the replica count for the backend                                                       | `1`                                       |
| `backend.autoscaling.enabled`                | Enable autoscaling                                                                          | `false`                                   |
| `backend.autoscaling.minReplicas`            | Min replics for autoscaling                                                                 | `1`                                       |
| `backend.autoscaling.maxReplicas`            | Max replicas for autoscaling                                                                | `3`                                       |
| `backend.autoscaling.cpuUtilization`         | Define the CPU target to trigger the scaling actions (utilization percentage)               | `60`                                      |
| `backend.autoscaling.memoryUtilization`      | Define the memory target to trigger the scaling actions (utilization percentage)            | `60`                                      |
| `backend.config.serverPort`                  | Server port for the backend                                                                 | `8080`                                    |
| `backend.config.basePath`                    | Base path for the backend                                                                   | `/api`                                    |
| `backend.config.natsUrl`                     | Url to reach the nats server                                                                | `nil`                                     |
| `backend.extraConfig`                        | Extra configuration values as a map                                                         | `{}`                                      |
| `backend.secrets.privateKey`                 | Private key for the backend                                                                 | `""`                                      |
| `backend.secrets.databaseUrl`                | Url to the postgres database                                                                | `""`                                      |
| `backend.extraSecrets`                       | Extra secrets values as a map                                                               | `{}`                                      |
| `backend.secretRef`                          | Name of existing secret. If set override the secrets and extra secret.                      | `""`                                      |
| `backend.env`                                | Additional environment variables for the backend container                                  | `[]`                                      |
| `backend.resources`                          | Set container requests and limits for different resources like CPU or memory                | `{}`                                      |
| `backend.podSecurityContext`                 | Pod-level security context                                                                  | `{"seccompProfile":{"type":"RuntimeDefault"}}` |
| `backend.containerSecurityContext`           | Container-level security context                                                            | `{"allowPrivilegeEscalation":false}`         |
| `backend.startupProbe.enabled`               | Enable/disable the startup probe                                                            | `true`                                    |
| `backend.startupProbe.initialDelaySeconds`   | Delay before startup probe is initiated                                                     | `10`                                      |
| `backend.startupProbe.periodSeconds`         | How often to perform the probe                                                              | `10`                                      |
| `backend.startupProbe.timeoutSeconds`        | When the probe times out                                                                    | `5`                                       |
| `backend.startupProbe.successThreshold`      | Minimum consecutive successes for the probe to be considered successful after having failed | `1`                                       |
| `backend.startupProbe.failureThreshold`      | Minimum consecutive failures for the probe to be considered failed after having succeeded   | `5`                                       |
| `backend.readinessProbe.enabled`             | Enable/disable the readiness probe                                                          | `true`                                    |
| `backend.readinessProbe.initialDelaySeconds` | Delay before readiness probe is initiated                                                   | `10`                                      |
| `backend.readinessProbe.periodSeconds`       | How often to perform the probe                                                              | `10`                                      |
| `backend.readinessProbe.timeoutSeconds`      | When the probe times out                                                                    | `5`                                       |
| `backend.readinessProbe.successThreshold`    | Minimum consecutive successes for the probe to be considered successful after having failed | `1`                                       |
| `backend.readinessProbe.failureThreshold`    | Minimum consecutive failures for the probe to be considered failed after having succeeded   | `5`                                       |
| `backend.livenessProbe.enabled`              | Enable/disable the liveness probe                                                           | `true`                                    |
| `backend.livenessProbe.initialDelaySeconds`  | Delay before liveness probe is initiated                                                    | `10`                                      |
| `backend.livenessProbe.periodSeconds`        | How often to perform the probe                                                              | `10`                                      |
| `backend.livenessProbe.timeoutSeconds`       | When the probe times out                                                                    | `5`                                       |
| `backend.livenessProbe.successThreshold`     | Minimum consecutive successes for the probe to be considered successful after having failed | `1`                                       |
| `backend.livenessProbe.failureThreshold`     | Minimum consecutive failures for the probe to be considered failed after having succeeded   | `5`                                       |
| `backend.customStartupProbe`                 | Override default startup probe                                                              | `{}`                                      |
| `backend.customReadinessProbe`               | Override default liveness probe                                                             | `{}`                                      |
| `backend.customLivenessProbe`                | Override default readiness probe                                                            | `{}`                                      |

### Ingress parameters

| Name                       | Description                                                                                                                      | Value           |
| -------------------------- | -------------------------------------------------------------------------------------------------------------------------------- | --------------- |
| `ingress.enabled`          | Enable/disable the ingress                                                                                                       | `false`         |
| `ingress.ingressClassName` | IngressClass that will be be used to implement the Ingress                                                                       | `""`            |
| `ingress.hostname`         | Default host for the ingress record. Set “*” here to omit the host.                                                              | `scrumlr.local` |
| `ingress.path.frontend`    | Default path for the frontend ingress record                                                                                     | `/`             |
| `ingress.path.backend`     | Default path for the backend ingress record                                                                                      | `/api`          |
| `ingress.pathType`         | Ingress path type                                                                                                                | `Prefix`        |
| `ingress.annotations`      | Additional annotations for the Ingress resource. To enable certificate autogeneration, place here your cert-manager annotations. | `{}`            |
| `ingress.tls`              | Enable TLS configuration for the host defined at `ingress.hostname` parameter                                                    | `false`         |
| `ingress.selfSigned`       | Create a TLS secret for this ingress record using self-signed certificates generated by Helm                                     | `false`         |
| `ingress.extraPaths`       | Additional path o add to the ingress                                                                                             | `[]`            |
| `ingress.extraTls`         | TLS configuration for additional hostnames                                                                                       | `[]`            |
| `ingress.secrets`          | Additional TLS-secrets for the extra TLS filed                                                                                   | `[]`            |
