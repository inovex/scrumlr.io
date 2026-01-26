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
	port, err := getEnvInt("SCRUMLR_SERVER_PORT", 8080)
	if err != nil {
		return err
	}

	address := getEnvString("SCRUMLR_SERVER_LISTEN_ADDRESS", "127.0.0.1")
	basePath := getEnvString("SCRUMLR_BASE_PATH", "/")
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
	defer response.Body.Close()

	if response.StatusCode < http.StatusOK || response.StatusCode >= http.StatusMultipleChoices {
		return fmt.Errorf("healthcheck failed: %s", response.Status)
	}

	return nil
}

func getEnvString(name, defaultValue string) string {
	value := strings.TrimSpace(os.Getenv(name))
	if value == "" {
		return defaultValue
	}
	return value
}

func getEnvInt(name string, defaultValue int) (int, error) {
	value := strings.TrimSpace(os.Getenv(name))
	if value == "" {
		return defaultValue, nil
	}
	parsed, err := strconv.Atoi(value)
	if err != nil {
		return 0, fmt.Errorf("invalid %s: %w", name, err)
	}
	return parsed, nil
}
