package serviceinitialize

import (
	"encoding/json"
	"net/http"
	"os"
	"strings"

	unleash "github.com/Unleash/unleash-client-go/v4"

	"scrumlr.io/server/logger"
)

type UnleashFrontendConfig struct {
	URL         string `json:"url"`
	ClientKey   string `json:"clientKey"`
	Environment string `json:"environment,omitempty"`
	AppName     string `json:"appName,omitempty"`
}

func ReadUnleashFrontendEnv() *UnleashFrontendConfig {
	url := strings.TrimSpace(os.Getenv("SCRUMLR_UNLEASH_FRONTEND_URL"))
	key := strings.TrimSpace(os.Getenv("SCRUMLR_UNLEASH_FRONTEND_TOKEN"))
	if url == "" || key == "" {
		return nil
	}
	return &UnleashFrontendConfig{
		URL:         url,
		ClientKey:   key,
		Environment: strings.TrimSpace(os.Getenv("SCRUMLR_UNLEASH_ENV")),
		AppName:     strings.TrimSpace(os.Getenv("SCRUMLR_UNLEASH_APPNAME")),
	}
}

func UnleashConfigHTTPHandler(cfg *UnleashFrontendConfig) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodGet {
			w.WriteHeader(http.StatusMethodNotAllowed)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		w.Header().Set("Cache-Control", "no-store")
		if cfg == nil {
			w.WriteHeader(http.StatusNoContent)
			return
		}
		_ = json.NewEncoder(w).Encode(cfg)
	})
}

func InitializeUnleash(url, token string, debug bool) error {
	url = strings.TrimSpace(url)
	token = strings.TrimSpace(token)

	if url == "" || token == "" {
		logger.Get().Info("unleash not configured (missing URL or token)")
		return nil
	}

	headers := http.Header{}
	headers.Set("Authorization", token)

	opts := []unleash.ConfigOption{
		unleash.WithAppName("scrumlr-backend"),
		unleash.WithUrl(url),
		unleash.WithCustomHeaders(headers),
		unleash.WithEnvironment(strings.TrimSpace(os.Getenv("SCRUMLR_UNLEASH_ENV"))),
	}
	if debug {
		opts = append(opts, unleash.WithListener(&unleash.DebugListener{}))
	}

	if err := unleash.Initialize(opts...); err != nil {
		return err
	}

	logger.Get().Infow("unleash initialized", "url", url)
	return nil
}
