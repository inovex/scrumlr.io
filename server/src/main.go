package main

import (
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"go.uber.org/zap"
	"scrumlr.io/server/api"
	"scrumlr.io/server/cache"
	"scrumlr.io/server/common"
	"scrumlr.io/server/initialize"
	"scrumlr.io/server/serviceinitialize"

	"scrumlr.io/server/auth"

	"github.com/urfave/cli/v2"
	"github.com/urfave/cli/v2/altsrc"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

// @title			Scrumlr backend
// @version		5.2.2
// @description	This is the scrumlr backend server.
// @termsOfService	https://scrumlr.io/terms
// @contact.email	info@scrumlr.io
// @license.name	MIT
// @license.url	https://github.com/inovex/scrumlr.io/blob/main/LICENSE
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
				Name:    "address",
				EnvVars: []string{"SCRUMLR_SERVER_LISTEN_ADDRESS"},
				Usage:   "the `address` on which the server listens",
				Value:   "",
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
				Usage:   "the complete connection `url` for the database, e.g. `postgresql://YourUserName:YourPassword:@YourHostname:5432/YourDatabaseName?sslmode=disable`",
				Value:   "",
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:    "database-host",
				EnvVars: []string{"SCRUMLR_SERVER_DATABASE_HOST"},
				Usage:   "the host name of the database with port e.g. `YourHostName:5432/YourDatabaseName?sslmode=disable`. The host name will be combined with the username and password to form the connection url",
				Value:   "",
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:    "database-username",
				EnvVars: []string{"SCRUMLR_SERVER_DATABASE_USER"},
				Usage:   "the user name for the database connection. The username name will be combined with the host and password to form the connection url",
				Value:   "",
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:    "database-password",
				EnvVars: []string{"SCRUMLR_SERVER_DATABASE_PASSWORD"},
				Usage:   "the password for the database connection. The password will be combined with the host and username to form the connection url",
				Value:   "",
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
				Name:     "otel-grpc",
				EnvVars:  []string{"SCRUMLR_OTEL_GRPC"},
				Usage:    "grpc connection string for an OpenTelemetry collector",
				Required: false,
			}),
			altsrc.NewStringFlag(&cli.StringFlag{
				Name:     "otel-http",
				EnvVars:  []string{"SCRUMLR_OTEL_HTTP"},
				Usage:    "http connection string for an OpenTelemetry collector",
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
			altsrc.NewBoolFlag(&cli.BoolFlag{
				Name:     "enable-swagger",
				EnvVars:  []string{"SCRUMLR_ENABLE_SWAGGER"},
				Usage:    "enable the swagger page",
				Value:    false,
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

func run(ctx *cli.Context) error {
	logger.SetLogLevel(ctx.String("log-level"))
	log := logger.FromContext(ctx.Context)

	otelShutdown, err := initialize.SetupOTelSDK(ctx.Context, ctx.String("otel-grpc"), ctx.String("otel-http"))
	if err != nil {
		log.Errorf("failed to setup OpenTelemetry: %w", err)
		return err
	}
	defer func() {
		err = errors.Join(err, otelShutdown(ctx.Context))
	}()

	db, err := initialize.InitializeDatabase(ctx)
	if err != nil {
		log.Errorf("failed to initialize database: %w", err)
		return err
	}

	if !ctx.Bool("insecure") && ctx.String("key") == "" {
		return errors.New("you may not start the application without a private key. Use 'insecure' flag with caution if you want to use default keypair to sign jwt's")
	}

	rt, err := realtime.InitializeRealtime(ctx)
	if err != nil {
		log.Fatalf("failed to connect to message broker: %v", err)
		return err
	}

	c, err := cache.InitializeCache(ctx)
	if err != nil {
		log.Fatalf("failed to connect to cache: %v", err)
		return err
	}

	basePath := "/"
	if ctx.IsSet("base-path") {
		basePath = ctx.String("base-path")
		if !strings.HasPrefix(basePath, "/") {
			return errors.New("base path must start with '/'")
		}

		if len(basePath) > 1 {
			basePath = strings.TrimSuffix(basePath, "/")
		}
	}

	providersMap, err := configureAuthProvider(ctx, basePath)
	if err != nil {
		log.Fatalf("failed to configure auth provider: %v", err)
		return err
	}

	initializer := serviceinitialize.NewServiceInitializer(db, rt, c)

	wsService := initializer.InitializeWebSocketService()
	websocket := initializer.InitializeSessionRequestWebsocket(wsService)
	feedbackService := initializer.InitializeFeedbackService(ctx.String("feedback-webhook-url"))
	healthService := initializer.InitializeHealthService()

	boardReactionService := initializer.InitializeBoardReactionService()
	reactionService := initializer.InitializeReactionService()

	columnTemplateService := initializer.InitializeColumnTemplateService()
	boardTemplateService := initializer.InitializeBoardTemplateService(columnTemplateService)

	votingService := initializer.InitializeVotingService()
	noteService := initializer.InitializeNotesService()
	columnService := initializer.InitializeColumnService(noteService)

	sessionService := initializer.InitializeSessionService(columnService, noteService)
	sessionRequestService := initializer.InitializeSessionRequestService(websocket, sessionService)

	userService := initializer.InitializeUserService(sessionService, noteService)

	keyWithNewlines := strings.ReplaceAll(ctx.String("key"), "\\n", "\n")
	unsafeKeyWithNewlines := strings.ReplaceAll(ctx.String("unsafe-key"), "\\n", "\n")
	authConfig, err := auth.NewAuthConfiguration(providersMap, unsafeKeyWithNewlines, keyWithNewlines, db, userService)
	if err != nil {
		return fmt.Errorf("unable to setup authentication: %w", err)
	}

	boardService := initializer.InitializeBoardService(sessionRequestService, sessionService, columnService, noteService, reactionService, votingService)

	apiInitializer := serviceinitialize.NewApiInitializer(basePath)
	sessionApi := apiInitializer.InitializeSessionApi(sessionService)
	userApi := apiInitializer.InitializeUserApi(userService, sessionService, ctx.Bool("allow-anonymous-board-creation"), ctx.Bool("allow-anonymous-custom-templates"))

	routesInitializer := serviceinitialize.NewRoutesInitializer()
	userRoutes := routesInitializer.InitializeUserRoutes(userApi, sessionApi)
	sessionRoutes := routesInitializer.InitializeSessionRoutes(sessionApi)
	swaggerRoutes := routesInitializer.InitializeSwaggerRoutes(basePath)

	s := api.New(
		basePath,
		rt,
		wsService,
		authConfig,

		userRoutes,
		sessionRoutes,
		swaggerRoutes,

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

		logger.GetLogLevel() == zap.DebugLevel,
		!ctx.Bool("disable-check-origin"),
		ctx.Bool("disable-anonymous-login"),
		ctx.Bool("allow-anonymous-custom-templates"),
		ctx.Bool("allow-anonymous-board-creation"),
		ctx.Bool("auth-enable-experimental-file-system-store"),
		ctx.Bool("enable-swagger"),
	)

	listen := fmt.Sprintf("%s:%d", ctx.String("address"), ctx.Int("port"))
	logger.Get().Infow("starting server", "base-path", basePath, "listen", listen)
	return http.ListenAndServe(listen, s)
}

func configureAuthProvider(ctx *cli.Context, basePath string) (map[string]auth.AuthProviderConfiguration, error) {
	log := logger.FromContext(ctx.Context)
	providersMap := make(map[string]auth.AuthProviderConfiguration)

	log.Debug("configuring auth provider")

	callbackHost := ctx.String("auth-callback-host")
	if callbackHost == "" {
		log.Info("No auth callback host configured. Can not configure any auth provider")
		return providersMap, nil
	}

	if ctx.String("auth-google-client-id") != "" && ctx.String("auth-google-client-secret") != "" {
		log.Info("Using google authentication")
		providersMap[(string)(common.Google)] = auth.AuthProviderConfiguration{
			ClientId:     ctx.String("auth-google-client-id"),
			ClientSecret: ctx.String("auth-google-client-secret"),
			RedirectUri:  fmt.Sprintf("%s%s/login/google/callback", strings.TrimSuffix(callbackHost, "/"), strings.TrimSuffix(basePath, "/")),
		}
	}

	if ctx.String("auth-github-client-id") != "" && ctx.String("auth-github-client-secret") != "" {
		log.Info("Using github authentication")
		providersMap[(string)(common.GitHub)] = auth.AuthProviderConfiguration{
			ClientId:     ctx.String("auth-github-client-id"),
			ClientSecret: ctx.String("auth-github-client-secret"),
			RedirectUri:  fmt.Sprintf("%s%s/login/github/callback", strings.TrimSuffix(callbackHost, "/"), strings.TrimSuffix(basePath, "/")),
		}
	}

	if ctx.String("auth-microsoft-client-id") != "" && ctx.String("auth-microsoft-client-secret") != "" {
		log.Info("Using microsoft authentication")
		providersMap[(string)(common.Microsoft)] = auth.AuthProviderConfiguration{
			ClientId:     ctx.String("auth-microsoft-client-id"),
			ClientSecret: ctx.String("auth-microsoft-client-secret"),
			RedirectUri:  fmt.Sprintf("%s%s/login/microsoft/callback", strings.TrimSuffix(callbackHost, "/"), strings.TrimSuffix(basePath, "/")),
		}
	}

	if ctx.String("auth-azure-ad-tenant-id") != "" && ctx.String("auth-azure-ad-client-id") != "" && ctx.String("auth-azure-ad-client-secret") != "" {
		log.Info("Using azure authentication")
		providersMap[(string)(common.AzureAd)] = auth.AuthProviderConfiguration{
			TenantId:     ctx.String("auth-azure-ad-tenant-id"),
			ClientId:     ctx.String("auth-azure-ad-client-id"),
			ClientSecret: ctx.String("auth-azure-ad-client-secret"),
			RedirectUri:  fmt.Sprintf("%s%s/login/azure_ad/callback", strings.TrimSuffix(callbackHost, "/"), strings.TrimSuffix(basePath, "/")),
		}
	}

	if ctx.String("auth-apple-client-id") != "" && ctx.String("auth-apple-client-secret") != "" {
		log.Info("Using apple authentication.")
		providersMap[(string)(common.Apple)] = auth.AuthProviderConfiguration{
			ClientId:     ctx.String("auth-apple-client-id"),
			ClientSecret: ctx.String("auth-apple-client-secret"),
			RedirectUri:  fmt.Sprintf("%s%s/login/apple/callback", strings.TrimSuffix(callbackHost, "/"), strings.TrimSuffix(basePath, "/")),
		}
	}

	if ctx.String("auth-oidc-discovery-url") != "" && ctx.String("auth-oidc-client-id") != "" && ctx.String("auth-oidc-client-secret") != "" {
		log.Info("Using oidc authentication.")
		providersMap[(string)(common.TypeOIDC)] = auth.AuthProviderConfiguration{
			ClientId:       ctx.String("auth-oidc-client-id"),
			ClientSecret:   ctx.String("auth-oidc-client-secret"),
			RedirectUri:    fmt.Sprintf("%s%s/login/oidc/callback", strings.TrimSuffix(callbackHost, "/"), strings.TrimSuffix(basePath, "/")),
			DiscoveryUri:   ctx.String("auth-oidc-discovery-url"),
			UserIdentScope: ctx.String("auth-oidc-user-ident-scope"),
			UserNameScope:  ctx.String("auth-oidc-user-name-scope"),
		}
	}

	// session secret is used by the auth lib github.com/markbates/goth
	// the lib takes the session secret from the env var
	if ctx.String("session-secret") == "" && len(providersMap) != 0 {
		return nil, errors.New("you may not start the application without a session secret if an authentication provider is configured")
	}

	log.Debug("Configured %d auth provider", len(providersMap))

	return providersMap, nil
}
