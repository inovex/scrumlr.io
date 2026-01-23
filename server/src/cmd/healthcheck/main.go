package main

import (
	"fmt"
	"net/http"
	"os"
	"strconv"
	"strings"
	"time"
)

func main() {
	if err := run(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}

func run() error {
	port := 8080
	if value := strings.TrimSpace(os.Getenv("SCRUMLR_SERVER_PORT")); value != "" {
		parsed, err := strconv.Atoi(value)
		if err != nil {
			return fmt.Errorf("invalid SCRUMLR_SERVER_PORT: %w", err)
		}
		port = parsed
	}

	address := strings.TrimSpace(os.Getenv("SCRUMLR_SERVER_LISTEN_ADDRESS"))
	if address == "" {
		address = "127.0.0.1"
	}

	basePath := strings.TrimSpace(os.Getenv("SCRUMLR_BASE_PATH"))
	if basePath == "" {
		basePath = "/"
	}
	if !strings.HasPrefix(basePath, "/") {
		return fmt.Errorf("base path must start with '/'")
	}
	if len(basePath) > 1 {
		basePath = strings.TrimSuffix(basePath, "/")
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
