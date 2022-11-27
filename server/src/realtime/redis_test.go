package realtime_test

import (
	"errors"
	"log"
	"sync"
	"testing"
	"time"

	"github.com/ory/dockertest/v3"
	"github.com/ory/dockertest/v3/docker"
	"github.com/stretchr/testify/require"

	"scrumlr.io/server/realtime"
)

var (
	onceRedisSetup sync.Once
	redisTestURL   string
)

// SetupRedisContainer starts the nats container if required.
// Returns the connection string for nats
func SetupRedisContainer(t *testing.T) realtime.RedisServer {
	onceRedisSetup.Do(
		func() {
			pool, err := dockertest.NewPool("")
			if err != nil {
				log.Fatalf("Could not connect to docker: %s", err)
			}

			// pulls an image, creates a container based on it and runs it
			resource, err := pool.RunWithOptions(&dockertest.RunOptions{
				Repository: "redis",
				Tag:        "5",
			}, func(config *docker.HostConfig) {
				// set AutoRemove to true so that stopped container goes away by itself
				config.AutoRemove = true
				config.RestartPolicy = docker.RestartPolicy{Name: "no"}
			})
			require.Nilf(t, err, "failed to setup redis container")
			cleanupResources = append(cleanupResources, resource)

			redisTestURL = resource.GetHostPort("6379/tcp")

			// exponential backoff-retry, because the application in the container might not be ready to accept connections yet
			pool.MaxWait = 120 * time.Second
			if err = pool.Retry(func() error {
				rt, err := realtime.NewRedis(realtime.RedisServer{Addr: redisTestURL})
				if err != nil || !rt.IsHealthy() {
					return errors.New("redis not healthy yet")
				}
				return nil
			}); err != nil {
				log.Fatalf("Could not connect to docker: %s", err)
			}

		})
	return realtime.RedisServer{
		Addr: redisTestURL,
	}
}
