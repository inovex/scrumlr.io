package main

import (
	"context"
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

	altsrc "github.com/urfave/cli-altsrc/v3"
	"github.com/urfave/cli-altsrc/v3/toml"
	"github.com/urfave/cli/v3"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

const basePathFlag = "base-path"
const allowAnonymousCustomTemplatesFlag = "allow-anonymous-custom-templates"
const allowAnonymousBoardCreationFlag = "allow-anonymous-board-creation"
const authGoogleClientIDFlag = "auth-google-client-id"
const authGoogleClientSecretFlag = "auth-google-client-secret"
const authGithubClientIDFlag = "auth-github-client-id"
const authGithubClientSecretFlag = "auth-github-client-secret"
const authMicrosoftClientIDFlag = "auth-microsoft-client-id"
const authMicrosoftClientSecretFlag = "auth-microsoft-client-secret"
const authAzureADTenantIDFlag = "auth-azure-ad-tenant-id"
const authAzureADClientIDFlag = "auth-azure-ad-client-id"
const authAzureADClientSecretFlag = "auth-azure-ad-client-secret"
const authAppleClientIDFlag = "auth-apple-client-id"
const authAppleClientSecretFlag = "auth-apple-client-secret"
const authOIDCClientIDFlag = "auth-oidc-client-id"
const authOIDCClientSecretFlag = "auth-oidc-client-secret"
const authOIDCDiscoveryURLFlag = "auth-oidc-discovery-url"
const authOIDCUserIdentScopeFlag = "auth-oidc-user-ident-scope"
const authOIDCUserNameScopeFlag = "auth-oidc-user-name-scope"

// @title			Scrumlr backend
// @version		5.3.1
// @description	This is the scrumlr backend server.
// @termsOfService	https://scrumlr.io/terms
// @contact.email	info@scrumlr.io
// @license.name	MIT
// @license.url	https://github.com/inovex/scrumlr.io/blob/main/LICENSE
func main() {
	var tomlconfigFile string

	app := &cli.Command{
		Name:      "scrumlr.io",
		Usage:     "Awesome & scalable server for the scrumlr.io web application",
		UsageText: "scrumlr [global options]",
		Action:    run,
		Flags: []cli.Flag{
			&cli.IntFlag{
				Name:    "port",
				Aliases: []string{"p"},
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_SERVER_PORT"),
					toml.TOML("port", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage: "the `port` of the server to launch",
				Value: 8080,
			},
			&cli.StringFlag{
				Name: "address",
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_SERVER_LISTEN_ADDRESS"),
					toml.TOML("address", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage: "the `address` on which the server listens",
				Value: "",
			},
			&cli.StringFlag{
				Name:    "nats",
				Aliases: []string{"n"},
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_SERVER_NATS_URL"),
					toml.TOML("nats", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage: "the `url` of the nats server",
				Value: "nats://localhost:4222", // nats://nats:4222
			},
			&cli.StringFlag{
				Name: "redis-address",
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_SERVER_REDIS_HOST"),
					toml.TOML("redis-address", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage: "the `address` of the redis server. Example `localhost:6379`. If redis-address is set, it's used over the default nats",
				Value: "",
			},
			&cli.StringFlag{
				Name: "redis-username",
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_SERVER_REDIS_USERNAME"),
					toml.TOML("redis-username", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage: "the redis user (if required)",
				Value: "",
			},
			&cli.StringFlag{
				Name: "redis-password",
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_SERVER_REDIS_PASSWORD"),
					toml.TOML("redis-password", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage: "the redis password (if required)",
				Value: "",
			},
			&cli.BoolFlag{
				Name:    "insecure",
				Aliases: []string{"i"},
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_INSECURE"),
					toml.TOML("insecure", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage: "use default and embedded key to sign jwt's",
				Value: false,
			},
			&cli.StringFlag{
				Name: "unsafe-key",
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_UNSAFE_PRIVATE_KEY"),
					toml.TOML("unsafe-key", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage: "the private key which should be replaced by the new key, that'll be used to sign the jwt's - needed in ES512 (ecdsa)",
				Value: "",
			},
			&cli.StringFlag{
				Name: "key",
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_PRIVATE_KEY"),
					toml.TOML("key", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage: "the private key, used to sign the jwt's - needed in ES512 (ecdsa)",
			},
			&cli.StringFlag{
				Name:    "database",
				Aliases: []string{"d"},
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_SERVER_DATABASE_URL"),
					toml.TOML("database", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage: "the complete connection `url` for the database, e.g. `postgresql://YourUserName:YourPassword:@YourHostname:5432/YourDatabaseName?sslmode=disable`",
				Value: "",
			},
			&cli.StringFlag{
				Name: "database-host",
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_SERVER_DATABASE_HOST"),
					toml.TOML("database-host", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage: "the host name of the database with port e.g. `YourHostName:5432/YourDatabaseName?sslmode=disable`. The host name will be combined with the username and password to form the connection url",
				Value: "",
			},
			&cli.StringFlag{
				Name: "database-username",
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_SERVER_DATABASE_USER"),
					toml.TOML("database-username", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage: "the user name for the database connection. The username name will be combined with the host and password to form the connection url",
				Value: "",
			},
			&cli.StringFlag{
				Name: "database-password",
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_SERVER_DATABASE_PASSWORD"),
					toml.TOML("database-password", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage: "the password for the database connection. The password will be combined with the host and username to form the connection url",
				Value: "",
			},
			&cli.StringFlag{
				Name:    basePathFlag,
				Aliases: []string{"b"},
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_BASE_PATH"),
					toml.TOML(basePathFlag, altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "the base `path` of the application (e.g. '/api'); must start with '/'",
				Required: false,
				Value:    "/",
			},
			&cli.BoolFlag{
				Name: "disable-anonymous-login",
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_DISABLE_ANONYMOUS_LOGIN"),
					toml.TOML("disable-anonymous-login", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "enables/disables the login of anonymous clients",
				Required: false,
				Value:    false,
			},
			&cli.BoolFlag{
				Name: allowAnonymousCustomTemplatesFlag,
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_ALLOW_ANONYMOUS_CUSTOM_TEMPLATES"),
					toml.TOML(allowAnonymousCustomTemplatesFlag, altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "allows custom templates to be used for anonymous clients",
				Required: false,
				Value:    false,
			},
			&cli.BoolFlag{
				Name: allowAnonymousBoardCreationFlag,
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_ALLOW_ANONYMOUS_BOARD_CREATION"),
					toml.TOML(allowAnonymousBoardCreationFlag, altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "allows anonymous clients to create new boards",
				Required: false,
				Value:    true,
			},
			&cli.BoolFlag{
				Name: "allow-anonymous-history",
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_ALLOW_ANONYMOUS_HISTORY"),
					toml.TOML("allow-anonymous-history", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "allows anonymous clients to view their history",
				Required: false,
				Value:    false,
			},
			&cli.BoolFlag{
				Name: "auth-enable-experimental-file-system-store",
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_ENABLE_EXPERIMENTAL_AUTH_FILE_SYSTEM_STORE"),
					toml.TOML("auth-enable-experimental-file-system-store", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "enables/disables experimental file system store, in order to allow larger session cookie sizes",
				Required: false,
				Value:    false,
			},
			&cli.StringFlag{
				Name:    "auth-callback-host",
				Aliases: []string{"c"},
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_AUTH_CALLBACK_HOST"),
					toml.TOML("auth-callback-host", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "the protocol and host for the auth provider callbacks (e.g. https://scrumlr.io)",
				Required: false,
			},
			&cli.StringFlag{
				Name: authGoogleClientIDFlag,
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_AUTH_GOOGLE_CLIENT_ID"),
					toml.TOML(authGoogleClientIDFlag, altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "the client `id` for Google",
				Required: false,
			},
			&cli.StringFlag{
				Name: authGoogleClientSecretFlag,
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_AUTH_GOOGLE_CLIENT_SECRET"),
					toml.TOML(authGoogleClientSecretFlag, altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "the client `secret` for Google",
				Required: false,
			},
			&cli.StringFlag{
				Name: authGithubClientIDFlag,
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_AUTH_GITHUB_CLIENT_ID"),
					toml.TOML(authGithubClientIDFlag, altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "the client `id` for GitHub",
				Required: false,
			},
			&cli.StringFlag{
				Name: authGithubClientSecretFlag,
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_AUTH_GITHUB_CLIENT_SECRET"),
					toml.TOML(authGithubClientSecretFlag, altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "the client `secret` for GitHub",
				Required: false,
			},
			&cli.StringFlag{
				Name: authMicrosoftClientIDFlag,
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_AUTH_MICROSOFT_CLIENT_ID"),
					toml.TOML(authMicrosoftClientIDFlag, altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "the client `id` for Microsoft",
				Required: false,
			},
			&cli.StringFlag{
				Name: authMicrosoftClientSecretFlag,
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_AUTH_MICROSOFT_CLIENT_SECRET"),
					toml.TOML(authMicrosoftClientSecretFlag, altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "the client `secret` for Microsoft",
				Required: false,
			},
			&cli.StringFlag{
				Name: authAzureADTenantIDFlag,
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_AUTH_AZURE_AD_TENANT_ID"),
					toml.TOML(authAzureADTenantIDFlag, altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "the tenant `id` for Azure AD",
				Required: false,
			},
			&cli.StringFlag{
				Name: authAzureADClientIDFlag,
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_AUTH_AZURE_AD_CLIENT_ID"),
					toml.TOML(authAzureADClientIDFlag, altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "the client `id` for Azure AD",
				Required: false,
			},
			&cli.StringFlag{
				Name: authAzureADClientSecretFlag,
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_AUTH_AZURE_AD_CLIENT_SECRET"),
					toml.TOML(authAzureADClientSecretFlag, altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "the client `secret` for Azure AD",
				Required: false,
			},
			&cli.StringFlag{
				Name: authAppleClientIDFlag,
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_AUTH_APPLE_CLIENT_ID"),
					toml.TOML(authAppleClientIDFlag, altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "the client `id` for Apple",
				Required: false,
			},
			&cli.StringFlag{
				Name: authAppleClientSecretFlag,
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_AUTH_APPLE_CLIENT_SECRET"),
					toml.TOML(authAppleClientSecretFlag, altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "the client `secret` for Apple",
				Required: false,
			},
			&cli.StringFlag{
				Name: authOIDCClientIDFlag,
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_AUTH_OIDC_CLIENT_ID"),
					toml.TOML(authOIDCClientIDFlag, altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "the client `id` for OpenID Connect",
				Required: false,
			},
			&cli.StringFlag{
				Name: authOIDCClientSecretFlag,
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_AUTH_OIDC_CLIENT_SECRET"),
					toml.TOML(authOIDCClientSecretFlag, altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "the client `secret` for OpenID Connect",
				Required: false,
			},
			&cli.StringFlag{
				Name: authOIDCDiscoveryURLFlag,
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_AUTH_OIDC_DISCOVERY_URL"),
					toml.TOML(authOIDCDiscoveryURLFlag, altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "URL hosting the OIDC discovery document",
				Required: false,
			},
			&cli.StringFlag{
				Name: authOIDCUserIdentScopeFlag,
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_AUTH_OIDC_USER_IDENT_SCOPE"),
					toml.TOML(authOIDCUserIdentScopeFlag, altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage: "JWT claim to request for the user identifier",
				Value: "openid",
			},
			&cli.StringFlag{
				Name: authOIDCUserNameScopeFlag,
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_AUTH_OIDC_USER_NAME_SCOPE"),
					toml.TOML(authOIDCUserNameScopeFlag, altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage: "JWT claim to request for the user name",
				Value: "profile",
			},
			&cli.StringFlag{
				Name: "session-secret",
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SESSION_SECRET"),
					toml.TOML("session-secret", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "Session secret for the authentication provider. Must be provided if an authentication provider is used.",
				Required: false,
			},
			&cli.StringFlag{
				Name: "otel-grpc",
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_OTEL_GRPC"),
					toml.TOML("otel-grpc", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "grpc connection string for an OpenTelemetry collector",
				Required: false,
			},
			&cli.StringFlag{
				Name: "otel-http",
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_OTEL_HTTP"),
					toml.TOML("otel-http", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "http connection string for an OpenTelemetry collector",
				Required: false,
			},
			&cli.StringFlag{
				Name: "log-level",
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_LOG_LEVEL"),
					toml.TOML("log-level", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Aliases:  []string{"l"},
				Usage:    "Log level for the logger. Can be one of 'DEBUG', 'INFO', 'WARN', 'ERROR', 'FATAL'. Defaults to INFO.",
				Required: false,
				Value:    "INFO",
			},
			&cli.BoolFlag{
				Name: "disable-check-origin",
				Sources: cli.NewValueSourceChain(
					toml.TOML("disable-check-origin", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage: "disable check origin (strongly suggestion to only use this for development)",
				Value: false,
			},
			&cli.StringFlag{
				Name: "feedback-webhook-url",
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_FEEDBACK_WEBHOOK_URL"),
					toml.TOML("feedback-webhook-url", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "the url where feedback will be sent to",
				Required: false,
			},
			&cli.BoolFlag{
				Name: "enable-swagger",
				Sources: cli.NewValueSourceChain(
					cli.EnvVar("SCRUMLR_ENABLE_SWAGGER"),
					toml.TOML("enable-swagger", altsrc.NewStringPtrSourcer(&tomlconfigFile)),
				),
				Usage:    "enable the swagger page",
				Value:    false,
				Required: false,
			},
			&cli.StringFlag{
				Name:        "config",
				Sources:     cli.EnvVars("SCRUMLR_CONFIG_PATH"),
				Usage:       "TOML `filepath` to be loaded ",
				Required:    false,
				Destination: &tomlconfigFile,
			},
		},
	}

	if err := app.Run(context.Background(), os.Args); err != nil {
		log.Fatal(err)
	}
}

func run(ctx context.Context, cli *cli.Command) error {
	logger.SetLogLevel(cli.String("log-level"))
	log := logger.FromContext(ctx)

	otelShutdown, err := initialize.SetupOTelSDK(ctx, cli.String("otel-grpc"), cli.String("otel-http"))
	if err != nil {
		log.Errorf("failed to setup OpenTelemetry: %w", err)
		return err
	}
	defer func() {
		err = errors.Join(err, otelShutdown(ctx))
	}()

	db, err := initialize.InitializeDatabase(ctx, cli)
	if err != nil {
		log.Errorf("failed to initialize database: %w", err)
		return err
	}

	if !cli.Bool("insecure") && cli.String("key") == "" {
		return errors.New("you may not start the application without a private key. Use 'insecure' flag with caution if you want to use default keypair to sign jwt's")
	}

	rt, err := realtime.InitializeRealtime(ctx, cli)
	if err != nil {
		log.Fatalf("failed to connect to message broker: %v", err)
		return err
	}

	c, err := cache.InitializeCache(ctx, cli)
	if err != nil {
		log.Fatalf("failed to connect to cache: %v", err)
		return err
	}

	basePath := "/"
	if cli.IsSet(basePathFlag) {
		basePath = cli.String(basePathFlag)
		if !strings.HasPrefix(basePath, "/") {
			return errors.New("base path must start with '/'")
		}

		if len(basePath) > 1 {
			basePath = strings.TrimSuffix(basePath, "/")
		}
	}

	providersMap, err := configureAuthProvider(ctx, cli, basePath)
	if err != nil {
		log.Fatalf("failed to configure auth provider: %v", err)
		return err
	}

	initializer := serviceinitialize.NewServiceInitializer(db, rt, c)

	wsService := initializer.InitializeWebSocketService()
	websocket := initializer.InitializeSessionRequestWebsocket(wsService)
	feedbackService := initializer.InitializeFeedbackService(cli.String("feedback-webhook-url"))
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

	keyWithNewlines := strings.ReplaceAll(cli.String("key"), "\\n", "\n")
	unsafeKeyWithNewlines := strings.ReplaceAll(cli.String("unsafe-key"), "\\n", "\n")
	authConfig, err := auth.NewAuthConfiguration(providersMap, unsafeKeyWithNewlines, keyWithNewlines, db, userService)
	if err != nil {
		return fmt.Errorf("unable to setup authentication: %w", err)
	}

	boardService := initializer.InitializeBoardService(sessionRequestService, sessionService, columnService, noteService, reactionService, votingService, userService)

	apiInitializer := serviceinitialize.NewApiInitializer(basePath)
	sessionApi := apiInitializer.InitializeSessionApi(sessionService)
	userApi := apiInitializer.InitializeUserApi(userService, sessionService, cli.Bool(allowAnonymousBoardCreationFlag), cli.Bool(allowAnonymousCustomTemplatesFlag))

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
		!cli.Bool("disable-check-origin"),
		cli.Bool("disable-anonymous-login"),
		cli.Bool(allowAnonymousCustomTemplatesFlag),
		cli.Bool(allowAnonymousBoardCreationFlag),
		cli.Bool("allow-anonymous-history"),
		cli.Bool("auth-enable-experimental-file-system-store"),
		cli.Bool("enable-swagger"),
	)

	listen := fmt.Sprintf("%s:%d", cli.String("address"), cli.Int("port"))
	logger.Get().Infow("starting server", basePathFlag, basePath, "listen", listen)
	return http.ListenAndServe(listen, s)
}

func configureAuthProvider(ctx context.Context, cli *cli.Command, basePath string) (map[string]auth.AuthProviderConfiguration, error) {
	log := logger.FromContext(ctx)
	providersMap := make(map[string]auth.AuthProviderConfiguration)

	log.Debug("configuring auth provider")

	callbackHost := cli.String("auth-callback-host")
	if callbackHost == "" {
		log.Info("No auth callback host configured. Can not configure any auth provider")
		return providersMap, nil
	}

	if cli.String(authGoogleClientIDFlag) != "" && cli.String(authGoogleClientSecretFlag) != "" {
		log.Info("Using google authentication")
		providersMap[(string)(common.Google)] = auth.AuthProviderConfiguration{
			ClientId:     cli.String(authGoogleClientIDFlag),
			ClientSecret: cli.String(authGoogleClientSecretFlag),
			RedirectUri:  fmt.Sprintf("%s%s/login/google/callback", strings.TrimSuffix(callbackHost, "/"), strings.TrimSuffix(basePath, "/")),
		}
	}

	if cli.String(authGithubClientIDFlag) != "" && cli.String(authGithubClientSecretFlag) != "" {
		log.Info("Using github authentication")
		providersMap[(string)(common.GitHub)] = auth.AuthProviderConfiguration{
			ClientId:     cli.String(authGithubClientIDFlag),
			ClientSecret: cli.String(authGithubClientSecretFlag),
			RedirectUri:  fmt.Sprintf("%s%s/login/github/callback", strings.TrimSuffix(callbackHost, "/"), strings.TrimSuffix(basePath, "/")),
		}
	}

	if cli.String(authMicrosoftClientIDFlag) != "" && cli.String(authMicrosoftClientSecretFlag) != "" {
		log.Info("Using microsoft authentication")
		providersMap[(string)(common.Microsoft)] = auth.AuthProviderConfiguration{
			ClientId:     cli.String(authMicrosoftClientIDFlag),
			ClientSecret: cli.String(authMicrosoftClientSecretFlag),
			RedirectUri:  fmt.Sprintf("%s%s/login/microsoft/callback", strings.TrimSuffix(callbackHost, "/"), strings.TrimSuffix(basePath, "/")),
		}
	}

	if cli.String(authAzureADTenantIDFlag) != "" && cli.String(authAzureADClientIDFlag) != "" && cli.String(authAzureADClientSecretFlag) != "" {
		log.Info("Using azure authentication")
		providersMap[(string)(common.AzureAd)] = auth.AuthProviderConfiguration{
			TenantId:     cli.String(authAzureADTenantIDFlag),
			ClientId:     cli.String(authAzureADClientIDFlag),
			ClientSecret: cli.String(authAzureADClientSecretFlag),
			RedirectUri:  fmt.Sprintf("%s%s/login/azure_ad/callback", strings.TrimSuffix(callbackHost, "/"), strings.TrimSuffix(basePath, "/")),
		}
	}

	if cli.String(authAppleClientIDFlag) != "" && cli.String(authAppleClientSecretFlag) != "" {
		log.Info("Using apple authentication.")
		providersMap[(string)(common.Apple)] = auth.AuthProviderConfiguration{
			ClientId:     cli.String(authAppleClientIDFlag),
			ClientSecret: cli.String(authAppleClientSecretFlag),
			RedirectUri:  fmt.Sprintf("%s%s/login/apple/callback", strings.TrimSuffix(callbackHost, "/"), strings.TrimSuffix(basePath, "/")),
		}
	}

	if cli.String(authOIDCDiscoveryURLFlag) != "" && cli.String(authOIDCClientIDFlag) != "" && cli.String(authOIDCClientSecretFlag) != "" {
		log.Info("Using oidc authentication.")
		providersMap[(string)(common.TypeOIDC)] = auth.AuthProviderConfiguration{
			ClientId:       cli.String(authOIDCClientIDFlag),
			ClientSecret:   cli.String(authOIDCClientSecretFlag),
			RedirectUri:    fmt.Sprintf("%s%s/login/oidc/callback", strings.TrimSuffix(callbackHost, "/"), strings.TrimSuffix(basePath, "/")),
			DiscoveryUri:   cli.String(authOIDCDiscoveryURLFlag),
			UserIdentScope: cli.String(authOIDCUserIdentScopeFlag),
			UserNameScope:  cli.String(authOIDCUserNameScopeFlag),
		}
	}

	// session secret is used by the auth lib github.com/markbates/goth
	// the lib takes the session secret from the env var
	if cli.String("session-secret") == "" && len(providersMap) != 0 {
		return nil, errors.New("you may not start the application without a session secret if an authentication provider is configured")
	}

	log.Debugf("Configured %d auth provider", len(providersMap))

	return providersMap, nil
}
