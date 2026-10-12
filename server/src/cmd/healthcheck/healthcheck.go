package healthcheck

import (
	"context"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/urfave/cli/v3"
)

func RegisterHealthCheckCommand() *cli.Command {
	healthCheckCmd := &cli.Command{
		Name:      "healthcheck",
		Usage:     "Health check for the scrumlr backend",
		UsageText: "scrumlr healthcheck [global options]",
		Category:  "management",
		Action:    run,
	}

	return healthCheckCmd
}

func run(ctx context.Context, cli *cli.Command) error {
	port := 8080
	if cli.IsSet("port") {
		port = cli.Int("port")
		if port <= 0 {
			return fmt.Errorf("invalid port %d given", port)
		}
	}

	address := "127.0.0.1"
	if cli.IsSet("address") {
		address = cli.String("address")
	}

	basePath := "/"
	if cli.IsSet("base-path") {
		basePath = cli.String("base-path")
		if !strings.HasPrefix(basePath, "/") {
			return fmt.Errorf("base path must start with '/'")
		}

		if len(basePath) > 1 {
			basePath = strings.TrimSuffix(basePath, "/")
		}
	}

	healthPath := "/health"
	if basePath != "/" {
		healthPath = basePath + "/health"
	}

	url := fmt.Sprintf("http://%s:%d%s", address, port, healthPath)
	client := http.Client{Timeout: 3 * time.Second}
	response, err := client.Get(url)
	if err != nil {
		return fmt.Errorf("healthcheck failed: %w", err)
	}
	defer func() {
		_ = response.Body.Close()
	}()

	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("healthcheck failed: %s", response.Status)
	}

	return nil
}
