package main

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
  "github.com/Unleash/unleash-client-go/v4"
	"strings"

	"go.uber.org/zap"
	"scrumlr.io/server/common"
	"scrumlr.io/server/databaseinitialize"
	"scrumlr.io/server/serviceinitialize"

	"scrumlr.io/server/auth"
	"scrumlr.io/server/auth"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/services/health"

	"github.com/urfave/cli/v2"
	"github.com/urfave/cli/v2/altsrc"
	"scrumlr.io/server/api"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"github.com/urfave/cli/v2"
	"github.com/urfave/cli/v2/altsrc"
	"scrumlr.io/server/api"
	"scrumlr.io/server/database"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/services/board_reactions"
	"scrumlr.io/server/services/board_templates"
	"scrumlr.io/server/services/boards"
	"scrumlr.io/server/services/feedback"
	"scrumlr.io/server/services/notes"
	"scrumlr.io/server/services/users"
	"scrumlr.io/server/services/votings"
)

type UnleashFrontendConfig struct {
  URL         string `json:"url"`
  ClientKey   string `json:"clientKey"`
  Environment string `json:"environment,omitempty"`
  AppName     string `json:"appName,omitempty"`
}

func firstNonEmpty(vals ...string) string {
  for _, v := range vals {
    if s := strings.TrimSpace(v); s != "" {
      return s
    }
  }
  return ""
}

// Reads env using only FRONTEND_* variables
func readUnleashFrontendEnv() *UnleashFrontendConfig {
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

func unleashConfigHTTPHandler(cfg *UnleashFrontendConfig) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
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
  }
}

func main() {
	app := &cli.App{
		Name:      "scrumlr.io",
		Usage:     "Awesome & scalable server for the scrumlr.io web application",
		HelpName:  "scrumlr",
		UsageText: "scrumlr [global options]",
		Action:    run,
		Flags: []cli.Flag{
			altsrc.NewIntFlag(&cli.IntFlag{
				Name:    "port",
				Aliases: []string{"p"},
				EnvVars: []string{"SCRUMLR_SERVER_PORT"},
				Usage:   "the `port` of the server to launch",
				Value:   8080,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:    "nats",
				Aliases: []string{"n"},
				EnvVars: []string{"SCRUMLR_SERVER_NATS_URL"},
				Usage:   "the `url` of the nats server",
				Value:   "nats://localhost:4222", // nats://nats:4222
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:    "redis-address",
				EnvVars: []string{"SCRUMLR_SERVER_REDIS_HOST"},
				Usage:   "the `address` of the redis server. Example `localhost:6379`. If redis-address is set, it's used over the default nats",
				Value:   "",
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:    "redis-username",
				EnvVars: []string{"SCRUMLR_SERVER_REDIS_USERNAME"},
				Usage:   "the redis user (if required)",
				Value:   "",
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:    "redis-password",
				EnvVars: []string{"SCRUMLR_SERVER_REDIS_PASSWORD"},
				Usage:   "the redis password (if required)",
				Value:   "",
			}),
			altsrc.NewBoolFlag(&cli.BoolFlag{
				Name:    "insecure",
				Aliases: []string{"i"},
				EnvVars: []string{"SCRUMLR_INSECURE"},
				Usage:   "use default and embedded key to sign jwt's",
				Value:   false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:    "unsafe-key",
				EnvVars: []string{"SCRUMLR_UNSAFE_PRIVATE_KEY"},
				Usage:   "the private key which should be replaced by the new key, that'll be used to sign the jwt's - needed in ES512 (ecdsa)",
				Value:   "",
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:    "key",
				EnvVars: []string{"SCRUMLR_PRIVATE_KEY"},
				Usage:   "the private key, used to sign the jwt's - needed in ES512 (ecdsa)",
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:    "database",
				Aliases: []string{"d"},
				EnvVars: []string{"SCRUMLR_SERVER_DATABASE_URL"},
				Usage:   "the connection `url` for the database",
				Value:   "postgresql://localhost:5432", // postgres://YourUserName:YourPassword@YourHostname:5432/YourDatabaseName?sslmode=disable
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "base-path",
				Aliases:  []string{"b"},
				EnvVars:  []string{"SCRUMLR_BASE_PATH"},
				Usage:    "the base `path` of the application (e.g. '/api'); must start with '/'",
				Required: false,
				Value:    "/",
			}),
			altsrc.NewBoolFlag(&cli.BoolFlag{
				Name:     "disable-anonymous-login",
				EnvVars:  []string{"SCRUMLR_DISABLE_ANONYMOUS_LOGIN"},
				Usage:    "enables/disables the login of anonymous clients",
				Required: false,
				Value:    false,
			}),
			altsrc.NewBoolFlag(&cli.BoolFlag{
				Name:     "allow-anonymous-custom-templates",
				EnvVars:  []string{"SCRUMLR_ALLOW_ANONYMOUS_CUSTOM_TEMPLATES"},
				Usage:    "allows custom templates to be used for anonymous clients",
				Required: false,
				Value:    false,
			}),
			altsrc.NewBoolFlag(&cli.BoolFlag{
				Name:     "allow-anonymous-board-creation",
				EnvVars:  []string{"SCRUMLR_ALLOW_ANONYMOUS_BOARD_CREATION"},
				Usage:    "allows anonymous clients to create new boards",
				Required: false,
				Value:    true,
			}),
			altsrc.NewBoolFlag(&cli.BoolFlag{
				Name:     "auth-enable-experimental-file-system-store",
				EnvVars:  []string{"SCRUMLR_ENABLE_EXPERIMENTAL_AUTH_FILE_SYSTEM_STORE"},
				Usage:    "enables/disables experimental file system store, in order to allow larger session cookie sizes",
				Required: false,
				Value:    false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "auth-callback-host",
				Aliases:  []string{"c"},
				EnvVars:  []string{"SCRUMLR_AUTH_CALLBACK_HOST"},
				Usage:    "the protocol and host for the auth provider callbacks (e.g. https://scrumlr.io)",
				Required: false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "auth-google-client-id",
				EnvVars:  []string{"SCRUMLR_AUTH_GOOGLE_CLIENT_ID"},
				Usage:    "the client `id` for Google",
				Required: false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "auth-google-client-secret",
				EnvVars:  []string{"SCRUMLR_AUTH_GOOGLE_CLIENT_SECRET"},
				Usage:    "the client `secret` for Google",
				Required: false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "auth-github-client-id",
				EnvVars:  []string{"SCRUMLR_AUTH_GITHUB_CLIENT_ID"},
				Usage:    "the client `id` for GitHub",
				Required: false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "auth-github-client-secret",
				EnvVars:  []string{"SCRUMLR_AUTH_GITHUB_CLIENT_SECRET"},
				Usage:    "the client `secret` for GitHub",
				Required: false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "auth-microsoft-client-id",
				EnvVars:  []string{"SCRUMLR_AUTH_MICROSOFT_CLIENT_ID"},
				Usage:    "the client `id` for Microsoft",
				Required: false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "auth-microsoft-client-secret",
				EnvVars:  []string{"SCRUMLR_AUTH_MICROSOFT_CLIENT_SECRET"},
				Usage:    "the client `secret` for Microsoft",
				Required: false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "auth-azure-ad-tenant-id",
				EnvVars:  []string{"SCRUMLR_AUTH_AZURE_AD_TENANT_ID"},
				Usage:    "the tenant `id` for Azure AD",
				Required: false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "auth-azure-ad-client-id",
				EnvVars:  []string{"SCRUMLR_AUTH_AZURE_AD_CLIENT_ID"},
				Usage:    "the client `id` for Azure AD",
				Required: false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "auth-azure-ad-client-secret",
				EnvVars:  []string{"SCRUMLR_AUTH_AZURE_AD_CLIENT_SECRET"},
				Usage:    "the client `secret` for Azure AD",
				Required: false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "auth-apple-client-id",
				EnvVars:  []string{"SCRUMLR_AUTH_APPLE_CLIENT_ID"},
				Usage:    "the client `id` for Apple",
				Required: false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "auth-apple-client-secret",
				EnvVars:  []string{"SCRUMLR_AUTH_APPLE_CLIENT_SECRET"},
				Usage:    "the client `secret` for Apple",
				Required: false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "auth-oidc-client-id",
				EnvVars:  []string{"SCRUMLR_AUTH_OIDC_CLIENT_ID"},
				Usage:    "the client `id` for OpenID Connect",
				Required: false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "auth-oidc-client-secret",
				EnvVars:  []string{"SCRUMLR_AUTH_OIDC_CLIENT_SECRET"},
				Usage:    "the client `secret` for OpenID Connect",
				Required: false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "auth-oidc-discovery-url",
				EnvVars:  []string{"SCRUMLR_AUTH_OIDC_DISCOVERY_URL"},
				Usage:    "URL hosting the OIDC discovery document",
				Required: false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:    "auth-oidc-user-ident-scope",
				EnvVars: []string{"SCRUMLR_AUTH_OIDC_USER_IDENT_SCOPE"},
				Usage:   "JWT claim to request for the user identifier",
				Value:   "openid",
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:    "auth-oidc-user-name-scope",
				EnvVars: []string{"SCRUMLR_AUTH_OIDC_USER_NAME_SCOPE"},
				Usage:   "JWT claim to request for the user name",
				Value:   "profile",
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "session-secret",
				EnvVars:  []string{"SESSION_SECRET"},
				Usage:    "Session secret for the authentication provider. Must be provided if an authentication provider is used.",
				Required: false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "log-level",
				EnvVars:  []string{"SCRUMLR_LOG_LEVEL"},
				Aliases:  []string{"l"},
				Usage:    "Log level for the logger. Can be one of 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'. Defaults to INFO.",
				Required: false,
				Value:    "INFO",
			}),
			altsrc.NewBoolFlag(&cli.BoolFlag{
				Name:    "verbose",
				Aliases: []string{"v"},
				Usage:   "enable verbose logging",
				Value:   false,
			}),
			altsrc.NewBoolFlag(&cli.BoolFlag{
				Name:  "disable-check-origin",
				Usage: "disable check origin (strongly suggestion to only use this for development)",
				Value: false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "feedback-webhook-url",
				EnvVars:  []string{"SCRUMLR_FEEDBACK_WEBHOOK_URL"},
				Usage:    "the url where feedback will be sent to",
				Required: false,
			}),
			&cli.StringFlag{
				Name:     "config",
				EnvVars:  []string{"SCRUMLR_CONFIG_PATH"},
				Usage:    "TOML `filepath` to be loaded ",
				Required: false,
			},
		},
	}
	app.Before = altsrc.InitInputSourceWithContext(app.Flags, altsrc.NewTomlSourceFromFlagFunc("config"))

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}

func run(c *cli.Context) error {
	logger.SetLogLevel(c.String("log-level"))
	if c.Bool("verbose") {
		logger.SetLogLevel("DEBUG")
		logger.Get().Warnln("Verbose logging is set through the verbose flag. This will be deprecated. Use the SCRUMLR_LOG_LEVEL environment variable")
	}

	db, err := databaseinitialize.InitializeDatabase(c.String("database"))
	if err != nil {
		return fmt.Errorf("unable to migrate database: %w", err)
	}

	if !c.Bool("insecure") && c.String("key") == "" {
		return errors.New("you may not start the application without a private key. Use 'insecure' flag with caution if you want to use default keypair to sign jwt's")
	}

	var rt *realtime.Broker
	if c.String("redis-address") != "" {
		logger.Get().Infof("Connecting to redis at %v", c.String("redis-address"))
		rt, err = realtime.NewRedis(realtime.RedisServer{
			Addr:     c.String("redis-address"),
			Username: c.String("redis-username"),
			Password: c.String("redis-password"),
		})
		if err != nil {
			logger.Get().Fatalf("failed to connect to redis message queue: %v", err)
		}
	} else {
		logger.Get().Infof("Connecting to nats at %v", c.String("nats"))
		rt, err = realtime.NewNats(c.String("nats"))
		if err != nil {
			logger.Get().Fatalf("failed to connect to nats message queue: %v", err)
		}
	}

	basePath := "/"
	if c.IsSet("base-path") {
		basePath = c.String("base-path")
		if !strings.HasPrefix(basePath, "/") {
			return errors.New("base path must start with '/'")
		}

		if len(basePath) > 1 {
			basePath = strings.TrimSuffix(basePath, "/")
		}
	}

	providersMap := make(map[string]auth.AuthProviderConfiguration)
	if c.String("auth-google-client-id") != "" && c.String("auth-google-client-secret") != "" && c.String("auth-callback-host") != "" {
		logger.Get().Info("Using google authentication")
		providersMap[(string)(common.Google)] = auth.AuthProviderConfiguration{
			ClientId:     c.String("auth-google-client-id"),
			ClientSecret: c.String("auth-google-client-secret"),
			RedirectUri:  fmt.Sprintf("%s%s/login/google/callback", strings.TrimSuffix(c.String("auth-callback-host"), "/"), strings.TrimSuffix(basePath, "/")),
		}
	}
	if c.String("auth-github-client-id") != "" && c.String("auth-github-client-secret") != "" && c.String("auth-callback-host") != "" {
		logger.Get().Info("Using github authentication")
		providersMap[(string)(common.GitHub)] = auth.AuthProviderConfiguration{
			ClientId:     c.String("auth-github-client-id"),
			ClientSecret: c.String("auth-github-client-secret"),
			RedirectUri:  fmt.Sprintf("%s%s/login/github/callback", strings.TrimSuffix(c.String("auth-callback-host"), "/"), strings.TrimSuffix(basePath, "/")),
		}
	}
	if c.String("auth-microsoft-client-id") != "" && c.String("auth-microsoft-client-secret") != "" && c.String("auth-callback-host") != "" {
		logger.Get().Info("Using microsoft authentication")
		providersMap[(string)(common.Microsoft)] = auth.AuthProviderConfiguration{
			ClientId:     c.String("auth-microsoft-client-id"),
			ClientSecret: c.String("auth-microsoft-client-secret"),
			RedirectUri:  fmt.Sprintf("%s%s/login/microsoft/callback", strings.TrimSuffix(c.String("auth-callback-host"), "/"), strings.TrimSuffix(basePath, "/")),
		}
	}
	if c.String("auth-azure-ad-tenant-id") != "" && c.String("auth-azure-ad-client-id") != "" && c.String("auth-azure-ad-client-secret") != "" && c.String("auth-callback-host") != "" {
		logger.Get().Info("Using azure authentication")
		providersMap[(string)(common.AzureAd)] = auth.AuthProviderConfiguration{
			TenantId:     c.String("auth-azure-ad-tenant-id"),
			ClientId:     c.String("auth-azure-ad-client-id"),
			ClientSecret: c.String("auth-azure-ad-client-secret"),
			RedirectUri:  fmt.Sprintf("%s%s/login/azure_ad/callback", strings.TrimSuffix(c.String("auth-callback-host"), "/"), strings.TrimSuffix(basePath, "/")),
		}
	}
	if c.String("auth-apple-client-id") != "" && c.String("auth-apple-client-secret") != "" && c.String("auth-callback-host") != "" {
		logger.Get().Info("Using apple authentication.")
		providersMap[(string)(common.Apple)] = auth.AuthProviderConfiguration{
			ClientId:     c.String("auth-apple-client-id"),
			ClientSecret: c.String("auth-apple-client-secret"),
			RedirectUri:  fmt.Sprintf("%s%s/login/apple/callback", strings.TrimSuffix(c.String("auth-callback-host"), "/"), strings.TrimSuffix(basePath, "/")),
		}
	}
	if c.String("auth-oidc-discovery-url") != "" && c.String("auth-oidc-client-id") != "" && c.String("auth-oidc-client-secret") != "" && c.String("auth-callback-host") != "" {
		logger.Get().Info("Using oicd authentication.")
		providersMap[(string)(common.TypeOIDC)] = auth.AuthProviderConfiguration{
			ClientId:       c.String("auth-oidc-client-id"),
			ClientSecret:   c.String("auth-oidc-client-secret"),
			RedirectUri:    fmt.Sprintf("%s%s/login/oidc/callback", strings.TrimSuffix(c.String("auth-callback-host"), "/"), strings.TrimSuffix(basePath, "/")),
			DiscoveryUri:   c.String("auth-oidc-discovery-url"),
			UserIdentScope: c.String("auth-oidc-user-ident-scope"),
			UserNameScope:  c.String("auth-oidc-user-name-scope"),
		}
	}

	if c.String("session-secret") == "" && len(providersMap) != 0 {
		return errors.New("you may not start the application without a session secret if an authentication provider is configured")
	}
  app := &cli.App{
    Name:      "scrumlr.io",
    Usage:     "Awesome & scalable server for the scrumlr.io web application",
    HelpName:  "scrumlr",
    UsageText: "scrumlr [global options]",
    Action:    run,
    Flags: []cli.Flag{
      altsrc.NewIntFlag(&cli.IntFlag{
        Name:    "port",
        Aliases: []string{"p"},
        EnvVars: []string{"SCRUMLR_SERVER_PORT"},
        Usage:   "the `port` of the server to launch",
        Value:   8080,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "nats",
        Aliases: []string{"n"},
        EnvVars: []string{"SCRUMLR_SERVER_NATS_URL"},
        Usage:   "the `url` of the nats server",
        Value:   "nats://localhost:4222", // nats://nats:4222
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "redis-address",
        EnvVars: []string{"SCRUMLR_SERVER_REDIS_HOST"},
        Usage:   "the `address` of the redis server. Example `localhost:6379`. If redis-address is set, it's used over the default nats",
        Value:   "",
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "redis-username",
        EnvVars: []string{"SCRUMLR_SERVER_REDIS_USERNAME"},
        Usage:   "the redis user (if required)",
        Value:   "",
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "redis-password",
        EnvVars: []string{"SCRUMLR_SERVER_REDIS_PASSWORD"},
        Usage:   "the redis password (if required)",
        Value:   "",
      }),
      altsrc.NewBoolFlag(&cli.BoolFlag{
        Name:    "insecure",
        Aliases: []string{"i"},
        EnvVars: []string{"SCRUMLR_INSECURE"},
        Usage:   "use default and embedded key to sign jwt's",
        Value:   false,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "unsafe-key",
        EnvVars: []string{"SCRUMLR_UNSAFE_PRIVATE_KEY"},
        Usage:   "the private key which should be replaced by the new key, that'll be used to sign the jwt's - needed in ES512 (ecdsa)",
        Value:   "",
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "key",
        EnvVars: []string{"SCRUMLR_PRIVATE_KEY"},
        Usage:   "the private key, used to sign the jwt's - needed in ES512 (ecdsa)",
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "database",
        Aliases: []string{"d"},
        EnvVars: []string{"SCRUMLR_SERVER_DATABASE_URL"},
        Usage:   "the connection `url` for the database",
        Value:   "postgresql://localhost:5432", // postgres://YourUserName:YourPassword@YourHostname:5432/YourDatabaseName?sslmode=disable
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:     "base-path",
        Aliases:  []string{"b"},
        EnvVars:  []string{"SCRUMLR_BASE_PATH"},
        Usage:    "the base `path` of the application (e.g. '/api'); must start with '/'",
        Required: false,
        Value:    "/",
      }),
      altsrc.NewBoolFlag(&cli.BoolFlag{
        Name:     "disable-anonymous-login",
        EnvVars:  []string{"SCRUMLR_DISABLE_ANONYMOUS_LOGIN"},
        Usage:    "enables/disables the login of anonymous clients",
        Required: false,
        Value:    false,
      }),
      altsrc.NewBoolFlag(&cli.BoolFlag{
        Name:     "allow-anonymous-custom-templates",
        EnvVars:  []string{"SCRUMLR_ALLOW_ANONYMOUS_CUSTOM_TEMPLATES"},
        Usage:    "allows custom templates to be used for anonymous clients",
        Required: false,
        Value:    false,
      }),
      altsrc.NewBoolFlag(&cli.BoolFlag{
        Name:     "auth-enable-experimental-file-system-store",
        EnvVars:  []string{"SCRUMLR_ENABLE_EXPERIMENTAL_AUTH_FILE_SYSTEM_STORE"},
        Usage:    "enables/disables experimental file system store, in order to allow larger session cookie sizes",
        Required: false,
        Value:    false,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:     "auth-callback-host",
        Aliases:  []string{"c"},
        EnvVars:  []string{"SCRUMLR_AUTH_CALLBACK_HOST"},
        Usage:    "the protocol and host for the auth provider callbacks (e.g. https://scrumlr.io)",
        Required: false,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:     "auth-google-client-id",
        EnvVars:  []string{"SCRUMLR_AUTH_GOOGLE_CLIENT_ID"},
        Usage:    "the client `id` for Google",
        Required: false,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:     "auth-google-client-secret",
        EnvVars:  []string{"SCRUMLR_AUTH_GOOGLE_CLIENT_SECRET"},
        Usage:    "the client `secret` for Google",
        Required: false,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:     "auth-github-client-id",
        EnvVars:  []string{"SCRUMLR_AUTH_GITHUB_CLIENT_ID"},
        Usage:    "the client `id` for GitHub",
        Required: false,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:     "auth-github-client-secret",
        EnvVars:  []string{"SCRUMLR_AUTH_GITHUB_CLIENT_SECRET"},
        Usage:    "the client `secret` for GitHub",
        Required: false,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:     "auth-microsoft-client-id",
        EnvVars:  []string{"SCRUMLR_AUTH_MICROSOFT_CLIENT_ID"},
        Usage:    "the client `id` for Microsoft",
        Required: false,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:     "auth-microsoft-client-secret",
        EnvVars:  []string{"SCRUMLR_AUTH_MICROSOFT_CLIENT_SECRET"},
        Usage:    "the client `secret` for Microsoft",
        Required: false,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:     "auth-azure-ad-tenant-id",
        EnvVars:  []string{"SCRUMLR_AUTH_AZURE_AD_TENANT_ID"},
        Usage:    "the tenant `id` for Azure AD",
        Required: false,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:     "auth-azure-ad-client-id",
        EnvVars:  []string{"SCRUMLR_AUTH_AZURE_AD_CLIENT_ID"},
        Usage:    "the client `id` for Azure AD",
        Required: false,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:     "auth-azure-ad-client-secret",
        EnvVars:  []string{"SCRUMLR_AUTH_AZURE_AD_CLIENT_SECRET"},
        Usage:    "the client `secret` for Azure AD",
        Required: false,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:     "auth-apple-client-id",
        EnvVars:  []string{"SCRUMLR_AUTH_APPLE_CLIENT_ID"},
        Usage:    "the client `id` for Apple",
        Required: false,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:     "auth-apple-client-secret",
        EnvVars:  []string{"SCRUMLR_AUTH_APPLE_CLIENT_SECRET"},
        Usage:    "the client `secret` for Apple",
        Required: false,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:     "auth-oidc-client-id",
        EnvVars:  []string{"SCRUMLR_AUTH_OIDC_CLIENT_ID"},
        Usage:    "the client `id` for OpenID Connect",
        Required: false,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:     "auth-oidc-client-secret",
        EnvVars:  []string{"SCRUMLR_AUTH_OIDC_CLIENT_SECRET"},
        Usage:    "the client `secret` for OpenID Connect",
        Required: false,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:     "auth-oidc-discovery-url",
        EnvVars:  []string{"SCRUMLR_AUTH_OIDC_DISCOVERY_URL"},
        Usage:    "URL hosting the OIDC discovery document",
        Required: false,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "auth-oidc-user-ident-scope",
        EnvVars: []string{"SCRUMLR_AUTH_OIDC_USER_IDENT_SCOPE"},
        Usage:   "JWT claim to request for the user identifier",
        Value:   "openid",
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "auth-oidc-user-name-scope",
        EnvVars: []string{"SCRUMLR_AUTH_OIDC_USER_NAME_SCOPE"},
        Usage:   "JWT claim to request for the user name",
        Value:   "profile",
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:     "session-secret",
        EnvVars:  []string{"SESSION_SECRET"},
        Usage:    "Session secret for the authentication provider. Must be provided if an authentication provider is used.",
        Required: false,
      }),
      altsrc.NewBoolFlag(&cli.BoolFlag{
        Name:    "verbose",
        Aliases: []string{"v"},
        Usage:   "enable verbose logging",
        Value:   false,
      }),
      altsrc.NewBoolFlag(&cli.BoolFlag{
        Name:  "disable-check-origin",
        Usage: "disable check origin (strongly suggestion to only use this for development)",
        Value: false,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:     "feedback-webhook-url",
        EnvVars:  []string{"SCRUMLR_FEEDBACK_WEBHOOK_URL"},
        Usage:    "the url where feedback will be sent to",
        Required: false,
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "unleash-backend-url",
        EnvVars: []string{"SCRUMLR_UNLEASH_BACKEND_URL"},
        Usage:   "The URL of the Unleash backend",
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "unleash-backend-token",
        EnvVars: []string{"SCRUMLR_UNLEASH_BACKEND_TOKEN"},
        Usage:   "The token for the Unleash backend",
      }),
      altsrc.NewBoolFlag(&cli.BoolFlag{
        Name:    "unleash-debug",
        EnvVars: []string{"SCRUMLR_UNLEASH_DEBUG"},
        Usage:   "Enable Unleash debug listener",
        Value:   false,
      }),

			&cli.StringFlag{
				Name:     "config",
				EnvVars:  []string{"SCRUMLR_CONFIG_PATH"},
				Usage:    "TOML `filepath` to be loaded ",
				Required: false,
			},
		},
	}
	app.Before = altsrc.InitInputSourceWithContext(app.Flags, altsrc.NewTomlSourceFromFlagFunc("config"))

  if err := app.Run(os.Args); err != nil {
    log.Fatal(err)
  }
}

func run(c *cli.Context) error {
  if c.Bool("verbose") {
    logger.EnableDevelopmentLogger()
  }

  db, err := initialize.InitializeDatabase(c.String("database"))
  if err != nil {
    return fmt.Errorf("DB init failed: %w", err)
  }

  if !c.Bool("insecure") && c.String("key") == "" {
    return errors.New("private key required unless running with --insecure")
  }

  var rt *realtime.Broker
  if c.String("redis-address") != "" {
    rt, err = realtime.NewRedis(realtime.RedisServer{
      Addr:     c.String("redis-address"),
      Username: c.String("redis-username"),
      Password: c.String("redis-password"),
    })
  } else {
    rt, err = realtime.NewNats(c.String("nats"))
  }
  if err != nil {
    logger.Get().Fatalf("realtime init failed: %v", err)
  }

  basePath := c.String("base-path")
  if !strings.HasPrefix(basePath, "/") {
    return errors.New("base-path must start with '/'")
  }

  providersMap := make(map[string]auth.AuthProviderConfiguration)

	if c.String("session-secret") == "" && len(providersMap) != 0 {
		return errors.New("you may not start the application without a session secret if an authentication provider is configured")
	}
	unleashURL := c.String("unleash-backend-url")
	unleashToken := c.String("unleash-backend-token")

	bun := databaseinitialize.InitializeBun(db, logger.GetLogLevel())
	initializer := serviceinitialize.NewServiceInitializer(bun, rt)

	websocket := initializer.InitializeWebsocket()
	feedbackService := initializer.InitializeFeedbackService(c.String("feedback-webhook-url"))
	healthService := initializer.InitializeHealthService()

	boardReactionService := initializer.InitializeBoardReactionService()
	reactionService := initializer.InitializeReactionService()

	boardTemplateService := initializer.InitializeBoardTemplateService()
	columnTemplateService := initializer.InitializeColumnTemplateService()

	votingService := initializer.InitializeVotingService()
	noteService := initializer.InitializeNotesService(votingService)
	columnService := initializer.InitializeColumnService(noteService)

	sessionService := initializer.InitializeSessionService(columnService, noteService)
	sessionRequestService := initializer.InitializeSessionRequestService(websocket, sessionService)

	userService := initializer.InitializeUserService(sessionService)

	keyWithNewlines := strings.ReplaceAll(c.String("key"), "\\n", "\n")
	unsafeKeyWithNewlines := strings.ReplaceAll(c.String("unsafe-key"), "\\n", "\n")
	authConfig, err := auth.NewAuthConfiguration(providersMap, unsafeKeyWithNewlines, keyWithNewlines, bun, userService)
	if err != nil {
		return fmt.Errorf("unable to setup authentication: %w", err)
	}

	boardService := initializer.InitializeBoardService(sessionRequestService, sessionService, columnService, noteService, reactionService, votingService)

	s := api.New(
		basePath,
		rt,
		authConfig,

		boardService,
		columnService,
		votingService,
		userService,
		noteService,
		reactionService,
		sessionService,
		sessionRequestService,
		healthService,
		feedbackService,
		boardReactionService,
		boardTemplateService,
		columnTemplateService,

		logger.GetLogLevel() == zap.DebugLevel || c.Bool("verbose"),
		!c.Bool("disable-check-origin"),
		c.Bool("disable-anonymous-login"),
		c.Bool("allow-anonymous-custom-templates"),
		c.Bool("allow-anonymous-board-creation"),
		c.Bool("auth-enable-experimental-file-system-store"),
	)

	port := fmt.Sprintf(":%d", c.Int("port"))
	logger.Get().Infow("starting server", "base-path", basePath, "port", port)
	return http.ListenAndServe(port, s)
}
  if unleashURL == "" || unleashToken == "" {
    logger.Get().Warn("Unleash is not configured – skipping feature flag integration")
  } else {
    headers := http.Header{}
    headers.Set("Authorization", unleashToken)
    options := []unleash.ConfigOption{
      unleash.WithAppName("scrumlr-backend"),
      unleash.WithUrl(unleashURL),
      unleash.WithCustomHeaders(headers),
      unleash.WithEnvironment("production"),
    }
    if c.Bool("unleash-debug") {
      options = append(options, unleash.WithListener(&unleash.DebugListener{}))
    }
    if err := unleash.Initialize(options...); err != nil {
      return fmt.Errorf("failed to initialize Unleash: %w", err)
    }
  }
  bun := initialize.InitializeBun(db, c.Bool("verbose"))
  dbConnection := database.New(bun)

	keyWithNewlines := strings.ReplaceAll(c.String("key"), "\\n", "\n")
	unsafeKeyWithNewlines := strings.ReplaceAll(c.String("unsafe-key"), "\\n", "\n")
	authConfig, err := auth.NewAuthConfiguration(providersMap, unsafeKeyWithNewlines, keyWithNewlines, dbConnection)
	if err != nil {
		return fmt.Errorf("unable to setup authentication: %w", err)
	}

	boardService := boards.NewBoardService(dbConnection, rt)
	boardSessionService := boards.NewBoardSessionService(dbConnection, rt)
	votingService := votings.NewVotingService(dbConnection, rt)
	userService := users.NewUserService(dbConnection, rt)
	noteService := notes.NewNoteService(dbConnection, rt)
	reactionService := initialize.InitializeReactionService(bun, rt)
	feedbackService := feedback.NewFeedbackService(c.String("feedback-webhook-url"))
	healthService := health.NewHealthService(dbConnection, rt)
	boardReactionService := board_reactions.NewReactionService(dbConnection, rt)
	boardTemplateService := board_templates.NewBoardTemplateService(dbConnection)

  s := api.New(
    basePath,
    rt,
    authConfig,
    boards.NewBoardService(dbConn, rt),
    votings.NewVotingService(dbConn, rt),
    users.NewUserService(dbConn, rt),
    notes.NewNoteService(dbConn, rt),
    initialize.InitializeReactionService(bun, rt),
    boards.NewBoardSessionService(dbConn, rt),
    health.NewHealthService(dbConn, rt),
    feedback.NewFeedbackService(c.String("feedback-webhook-url")),
    board_reactions.NewReactionService(dbConn, rt),
    board_templates.NewBoardTemplateService(dbConn),
    c.Bool("verbose"),
    !c.Bool("disable-check-origin"),
    c.Bool("disable-anonymous-login"),
    c.Bool("allow-anonymous-custom-templates"),
    c.Bool("auth-enable-experimental-file-system-store"),
  )

  mux := http.NewServeMux()
  mux.Handle("/api/unleash-config", unleashConfigHTTPHandler(readUnleashFrontendEnv()))
  mux.Handle("/", s)

  addr := fmt.Sprintf(":%d", c.Int("port"))
  logger.Get().Infow("starting server", "addr", addr)
  return http.ListenAndServe(addr, mux)
}
