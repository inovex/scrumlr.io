package realtime_test

import (
	"errors"
	"fmt"
	"io"
	"log"
	"os"
	"sync"
	"testing"
	"time"

	"github.com/ory/dockertest/v3"
	"github.com/ory/dockertest/v3/docker"
	"github.com/stretchr/testify/require"

	"scrumlr.io/server/internal/realtime"
)

func TestMain(m *testing.M) {
	exitCode := m.Run()
	for _, res := range cleanupResources {
		err := res.Close()
		if err != nil {
			log.Printf("failed to close: %v\n", err)
		}
	}
	os.Exit(exitCode)
}

var cleanupResources []io.Closer

var natsTestURL string
var onceNatsSetup sync.Once

// SetupNatsContainer starts the nats container if required.
// Returns the connection string for nats
func SetupNatsContainer(t *testing.T) string {
	onceNatsSetup.Do(
		func() {
			pool, err := dockertest.NewPool("")
			if err != nil {
				log.Fatalf("Could not connect to docker: %s", err)
			}

			// pulls an image, creates a container based on it and runs it
			resource, err := pool.RunWithOptions(&dockertest.RunOptions{
				Repository: "nats",
				Tag:        "2-alpine",
			}, func(config *docker.HostConfig) {
				// set AutoRemove to true so that stopped container goes away by itself
				config.AutoRemove = true
				config.RestartPolicy = docker.RestartPolicy{Name: "no"}
			})
			require.Nilf(t, err, "failed to setup nats container")
			cleanupResources = append(cleanupResources, resource)

			natsTestURL = fmt.Sprintf("nats://%s", resource.GetHostPort("4222/tcp"))

			// exponential backoff-retry, because the application in the container might not be ready to accept connections yet
			pool.MaxWait = 120 * time.Second
			if err = pool.Retry(func() error {
				rt, err := realtime.NewNats(natsTestURL)
				if err != nil || !rt.IsHealthy() {
					return errors.New("nats not healthy yet")
				}
				return nil
			}); err != nil {
				log.Fatalf("Could not connect to docker: %s", err)
			}

		})
	return natsTestURL
}
