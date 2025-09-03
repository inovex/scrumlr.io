package main

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"github.com/urfave/cli/v2"
	"github.com/urfave/cli/v2/altsrc"
	"go.uber.org/zap"

	"scrumlr.io/server/api"
	"scrumlr.io/server/auth"
	"scrumlr.io/server/common"
	"scrumlr.io/server/databaseinitialize"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/serviceinitialize"
)

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
				Value:   "nats://localhost:4222",
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:    "redis-address",
				EnvVars: []string{"SCRUMLR_SERVER_REDIS_HOST"},
				Usage:   "the `address` of the redis server. Example `localhost:6379`. If set, used over NATS",
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:    "redis-username",
				EnvVars: []string{"SCRUMLR_SERVER_REDIS_USERNAME"},
				Usage:   "the redis user (if required)",
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:    "redis-password",
				EnvVars: []string{"SCRUMLR_SERVER_REDIS_PASSWORD"},
				Usage:   "the redis password (if required)",
			}),
			altsrc.NewBoolFlag(&cli.BoolFlag{
				Name:    "insecure",
				Aliases: []string{"i"},
				EnvVars: []string{"SCRUMLR_INSECURE"},
				Usage:   "use default embedded key to sign JWTs (dev only)",
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:    "unsafe-key",
				EnvVars: []string{"SCRUMLR_UNSAFE_PRIVATE_KEY"},
				Usage:   "the private key that will be replaced by a new key (ES512)",
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:    "key",
				EnvVars: []string{"SCRUMLR_PRIVATE_KEY"},
				Usage:   "the private key to sign JWTs (ES512)",
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:    "database",
				Aliases: []string{"d"},
				EnvVars: []string{"SCRUMLR_SERVER_DATABASE_URL"},
				Usage:   "the connection `url` for the database",
				Value:   "postgresql://localhost:5432",
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:    "base-path",
				Aliases: []string{"b"},
				EnvVars: []string{"SCRUMLR_BASE_PATH"},
				Usage:   "the base `path` of the application (e.g. '/api'); must start with '/'",
				Value:   "/",
			}),
			altsrc.NewBoolFlag(&cli.BoolFlag{
				Name:    "disable-anonymous-login",
				EnvVars: []string{"SCRUMLR_DISABLE_ANONYMOUS_LOGIN"},
				Usage:   "enables/disables the login of anonymous clients",
			}),
			altsrc.NewBoolFlag(&cli.BoolFlag{
				Name:    "allow-anonymous-custom-templates",
				EnvVars: []string{"SCRUMLR_ALLOW_ANONYMOUS_CUSTOM_TEMPLATES"},
				Usage:   "allows custom templates to be used for anonymous clients",
			}),
			altsrc.NewBoolFlag(&cli.BoolFlag{
				Name:    "allow-anonymous-board-creation",
				EnvVars: []string{"SCRUMLR_ALLOW_ANONYMOUS_BOARD_CREATION"},
				Usage:   "allows anonymous clients to create new boards",
				Value:   true,
			}),
			altsrc.NewBoolFlag(&cli.BoolFlag{
				Name:    "auth-enable-experimental-file-system-store",
				EnvVars: []string{"SCRUMLR_ENABLE_EXPERIMENTAL_AUTH_FILE_SYSTEM_STORE"},
				Usage:   "enables experimental file system store (larger session cookies)",
			}),

			altsrc.NewStringFlag(&cli.StringFlag{Name: "auth-callback-host", Aliases: []string{"c"}, EnvVars: []string{"SCRUMLR_AUTH_CALLBACK_HOST"}}),
			altsrc.NewStringFlag(&cli.StringFlag{Name: "auth-google-client-id", EnvVars: []string{"SCRUMLR_AUTH_GOOGLE_CLIENT_ID"}}),
			altsrc.NewStringFlag(&cli.StringFlag{Name: "auth-google-client-secret", EnvVars: []string{"SCRUMLR_AUTH_GOOGLE_CLIENT_SECRET"}}),
			altsrc.NewStringFlag(&cli.StringFlag{Name: "auth-github-client-id", EnvVars: []string{"SCRUMLR_AUTH_GITHUB_CLIENT_ID"}}),
			altsrc.NewStringFlag(&cli.StringFlag{Name: "auth-github-client-secret", EnvVars: []string{"SCRUMLR_AUTH_GITHUB_CLIENT_SECRET"}}),
			altsrc.NewStringFlag(&cli.StringFlag{Name: "auth-microsoft-client-id", EnvVars: []string{"SCRUMLR_AUTH_MICROSOFT_CLIENT_ID"}}),
			altsrc.NewStringFlag(&cli.StringFlag{Name: "auth-microsoft-client-secret", EnvVars: []string{"SCRUMLR_AUTH_MICROSOFT_CLIENT_SECRET"}}),
			altsrc.NewStringFlag(&cli.StringFlag{Name: "auth-azure-ad-tenant-id", EnvVars: []string{"SCRUMLR_AUTH_AZURE_AD_TENANT_ID"}}),
			altsrc.NewStringFlag(&cli.StringFlag{Name: "auth-azure-ad-client-id", EnvVars: []string{"SCRUMLR_AUTH_AZURE_AD_CLIENT_ID"}}),
			altsrc.NewStringFlag(&cli.StringFlag{Name: "auth-azure-ad-client-secret", EnvVars: []string{"SCRUMLR_AUTH_AZURE_AD_CLIENT_SECRET"}}),
			altsrc.NewStringFlag(&cli.StringFlag{Name: "auth-apple-client-id", EnvVars: []string{"SCRUMLR_AUTH_APPLE_CLIENT_ID"}}),
			altsrc.NewStringFlag(&cli.StringFlag{Name: "auth-apple-client-secret", EnvVars: []string{"SCRUMLR_AUTH_APPLE_CLIENT_SECRET"}}),
			altsrc.NewStringFlag(&cli.StringFlag{Name: "auth-oidc-client-id", EnvVars: []string{"SCRUMLR_AUTH_OIDC_CLIENT_ID"}}),
			altsrc.NewStringFlag(&cli.StringFlag{Name: "auth-oidc-client-secret", EnvVars: []string{"SCRUMLR_AUTH_OIDC_CLIENT_SECRET"}}),
			altsrc.NewStringFlag(&cli.StringFlag{Name: "auth-oidc-discovery-url", EnvVars: []string{"SCRUMLR_AUTH_OIDC_DISCOVERY_URL"}}),
			altsrc.NewStringFlag(&cli.StringFlag{Name: "auth-oidc-user-ident-scope", EnvVars: []string{"SCRUMLR_AUTH_OIDC_USER_IDENT_SCOPE"}, Value: "openid"}),
			altsrc.NewStringFlag(&cli.StringFlag{Name: "auth-oidc-user-name-scope", EnvVars: []string{"SCRUMLR_AUTH_OIDC_USER_NAME_SCOPE"}, Value: "profile"}),
			altsrc.NewStringFlag(&cli.StringFlag{Name: "session-secret", EnvVars: []string{"SESSION_SECRET"}, Usage: "Session secret (required if any auth provider is configured)"}),

			altsrc.NewStringFlag(&cli.StringFlag{Name: "log-level", Aliases: []string{"l"}, EnvVars: []string{"SCRUMLR_LOG_LEVEL"}, Value: "INFO"}),
			altsrc.NewBoolFlag(&cli.BoolFlag{Name: "verbose", Aliases: []string{"v"}}),
			altsrc.NewBoolFlag(&cli.BoolFlag{Name: "disable-check-origin"}),
			altsrc.NewStringFlag(&cli.StringFlag{Name: "feedback-webhook-url", EnvVars: []string{"SCRUMLR_FEEDBACK_WEBHOOK_URL"}}),

			altsrc.NewStringFlag(&cli.StringFlag{Name: "unleash-backend-url", EnvVars: []string{"SCRUMLR_UNLEASH_BACKEND_URL"}}),
			altsrc.NewStringFlag(&cli.StringFlag{Name: "unleash-backend-token", EnvVars: []string{"SCRUMLR_UNLEASH_BACKEND_TOKEN"}}),
			altsrc.NewBoolFlag(&cli.BoolFlag{Name: "unleash-debug", EnvVars: []string{"SCRUMLR_UNLEASH_DEBUG"}}),

			&cli.StringFlag{Name: "config", EnvVars: []string{"SCRUMLR_CONFIG_PATH"}, Usage: "TOML `filepath` to be loaded"},
		},
	}

	app.Before = altsrc.InitInputSourceWithContext(app.Flags, altsrc.NewTomlSourceFromFlagFunc("config"))

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}

func run(c *cli.Context) error {
	// logging
	logger.SetLogLevel(c.String("log-level"))
	if c.Bool("verbose") {
		logger.SetLogLevel("DEBUG")
		logger.Get().Warnln("Verbose flag will be deprecated; prefer SCRUMLR_LOG_LEVEL")
	}

	// db
	db, err := databaseinitialize.InitializeDatabase(c.String("database"))
	if err != nil {
		return fmt.Errorf("unable to migrate database: %w", err)
	}

	// keys
	if !c.Bool("insecure") && c.String("key") == "" {
		return errors.New("you may not start the application without a private key. Use '--insecure' with caution to use default keypair")
	}

	// message broker
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

	// base path
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

	// auth providers (unchanged)
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
		logger.Get().Info("Using apple authentication")
		providersMap[(string)(common.Apple)] = auth.AuthProviderConfiguration{
			ClientId:     c.String("auth-apple-client-id"),
			ClientSecret: c.String("auth-apple-client-secret"),
			RedirectUri:  fmt.Sprintf("%s%s/login/apple/callback", strings.TrimSuffix(c.String("auth-callback-host"), "/"), strings.TrimSuffix(basePath, "/")),
		}
	}
	if c.String("auth-oidc-discovery-url") != "" && c.String("auth-oidc-client-id") != "" && c.String("auth-oidc-client-secret") != "" && c.String("auth-callback-host") != "" {
		logger.Get().Info("Using OIDC authentication")
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

	// ---- Unleash (via serviceinitialize) ----
	if err := serviceinitialize.InitializeUnleash(
		strings.TrimSpace(c.String("unleash-backend-url")),
		strings.TrimSpace(c.String("unleash-backend-token")),
		c.Bool("unleash-debug"),
	); err != nil {
		return fmt.Errorf("unleash init failed: %w", err)
	}

	// services
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

	// http server
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

	mux := http.NewServeMux()
	mux.Handle("/", s)

	unleashPath := "/unleash-config"
	if basePath != "/" {
		unleashPath = strings.TrimSuffix(basePath, "/") + "/unleash-config"
	}
	mux.Handle(unleashPath,
		serviceinitialize.UnleashConfigHTTPHandler(
			serviceinitialize.ReadUnleashFrontendEnv(),
		),
	)

	port := fmt.Sprintf(":%d", c.Int("port"))
	logger.Get().Infow("starting server",
		"base-path", basePath,
		"port", port,
		"unleash-config-endpoint", unleashPath,
	)
	return http.ListenAndServe(port, mux)
}
