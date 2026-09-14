package healthcheck

import (
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/urfave/cli/v3"
)

func TestRunHealthcheck_DefaultPath(t *testing.T) {
	ctx := t.Context()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/health" {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		w.WriteHeader(http.StatusOK)
	}))
	t.Cleanup(server.Close)

	host, port := splitServerURL(t, server.URL)

	cmd := &cli.Command{
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "address"},
			&cli.IntFlag{Name: "port"},
			&cli.StringFlag{Name: "base-path"},
		},
	}

	err := cmd.Set("address", host)
	assert.NoError(t, err)
	err = cmd.Set("port", port)
	assert.NoError(t, err)

	err = run(ctx, cmd)

	assert.NoError(t, err)
}

func TestRunHealthcheck_BasePath(t *testing.T) {
	ctx := t.Context()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/api/health" {
			w.WriteHeader(http.StatusNotFound)
			return
		}
		w.WriteHeader(http.StatusOK)
	}))
	t.Cleanup(server.Close)

	host, port := splitServerURL(t, server.URL)

	cmd := &cli.Command{
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "address"},
			&cli.IntFlag{Name: "port"},
			&cli.StringFlag{Name: "base-path"},
		},
	}

	err := cmd.Set("address", host)
	assert.NoError(t, err)
	err = cmd.Set("port", port)
	assert.NoError(t, err)
	err = cmd.Set("base-path", "/api/")
	assert.NoError(t, err)

	err = run(ctx, cmd)

	assert.NoError(t, err)
}

func TestRunHealthcheck_InvalidPort(t *testing.T) {
	ctx := t.Context()

	cmd := &cli.Command{
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "address"},
			&cli.IntFlag{Name: "port"},
			&cli.StringFlag{Name: "base-path"},
		},
	}

	err := cmd.Set("port", "0")
	assert.NoError(t, err)

	err = run(ctx, cmd)

	assert.Error(t, err)
	assert.ErrorContains(t, err, "invalid port 0 given")
}

func TestRunHealthcheck_InvalidBasePath(t *testing.T) {
	ctx := t.Context()
	cmd := &cli.Command{
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "address"},
			&cli.IntFlag{Name: "port"},
			&cli.StringFlag{Name: "base-path"},
		},
	}

	err := cmd.Set("base-path", "api")
	assert.NoError(t, err)

	err = run(ctx, cmd)

	assert.Error(t, err)
	assert.ErrorContains(t, err, "base path must start with '/'")
}

func TestRunHealthcheck_NonOK(t *testing.T) {
	ctx := t.Context()

	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(http.StatusServiceUnavailable)
	}))
	t.Cleanup(server.Close)

	host, port := splitServerURL(t, server.URL)

	cmd := &cli.Command{
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "address"},
			&cli.IntFlag{Name: "port"},
			&cli.StringFlag{Name: "base-path"},
		},
	}

	err := cmd.Set("address", host)
	assert.NoError(t, err)
	err = cmd.Set("port", port)
	assert.NoError(t, err)

	err = run(ctx, cmd)

	assert.Error(t, err)
	assert.ErrorContains(t, err, "503")
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
