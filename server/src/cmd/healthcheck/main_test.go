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

func TestGetEnvString_DefaultAndTrim(t *testing.T) {
	t.Setenv("SCRUMLR_SERVER_LISTEN_ADDRESS", "")
	assert.Equal(t, "127.0.0.1", getEnvString("SCRUMLR_SERVER_LISTEN_ADDRESS", "127.0.0.1"))

	t.Setenv("SCRUMLR_SERVER_LISTEN_ADDRESS", " 0.0.0.0 ")
	assert.Equal(t, "0.0.0.0", getEnvString("SCRUMLR_SERVER_LISTEN_ADDRESS", "127.0.0.1"))
}

func TestGetEnvInt_DefaultAndParse(t *testing.T) {
	t.Setenv("SCRUMLR_SERVER_PORT", "")
	value, err := getEnvInt("SCRUMLR_SERVER_PORT", 8080)
	assert.NoError(t, err)
	assert.Equal(t, 8080, value)

	t.Setenv("SCRUMLR_SERVER_PORT", " 9090 ")
	value, err = getEnvInt("SCRUMLR_SERVER_PORT", 8080)
	assert.NoError(t, err)
	assert.Equal(t, 9090, value)
}

func TestGetEnvInt_Invalid(t *testing.T) {
	t.Setenv("SCRUMLR_SERVER_PORT", "nope")
	_, err := getEnvInt("SCRUMLR_SERVER_PORT", 8080)
	assert.ErrorContains(t, err, "invalid SCRUMLR_SERVER_PORT")
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
