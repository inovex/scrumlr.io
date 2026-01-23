package main

import (
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestRunHealthcheck_DefaultPath(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/health" {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		w.WriteHeader(http.StatusOK)
	}))
	t.Cleanup(server.Close)

	setServerEnv(t, server.URL)
	t.Setenv("SCRUMLR_BASE_PATH", "")

	err := run()

	assert.NoError(t, err)
}

func TestRunHealthcheck_BasePath(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/health" {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		w.WriteHeader(http.StatusOK)
	}))
	t.Cleanup(server.Close)

	setServerEnv(t, server.URL)
	t.Setenv("SCRUMLR_BASE_PATH", "/api/")

	err := run()

	assert.NoError(t, err)
}

func TestRunHealthcheck_InvalidPort(t *testing.T) {
	t.Setenv("SCRUMLR_SERVER_PORT", "not-a-number")

	err := run()

	assert.ErrorContains(t, err, "invalid SCRUMLR_SERVER_PORT")
}

func TestRunHealthcheck_InvalidBasePath(t *testing.T) {
	t.Setenv("SCRUMLR_BASE_PATH", "api")

	err := run()

	assert.ErrorContains(t, err, "base path must start with '/'")
}

func TestRunHealthcheck_NonOK(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	t.Cleanup(server.Close)

	setServerEnv(t, server.URL)

	err := run()

	assert.ErrorContains(t, err, "503")
}

func setServerEnv(t *testing.T, serverURL string) {
	t.Helper()

	host, port := splitServerURL(t, serverURL)
	t.Setenv("SCRUMLR_SERVER_LISTEN_ADDRESS", host)
	t.Setenv("SCRUMLR_SERVER_PORT", port)
}

func splitServerURL(t *testing.T, serverURL string) (string, string) {
	t.Helper()

	url := strings.TrimPrefix(serverURL, "http://")
	host, port, err := net.SplitHostPort(url)
	if err != nil {
		t.Fatalf("failed to parse server URL %q: %v", serverURL, err)
	}
	return host, port
}
