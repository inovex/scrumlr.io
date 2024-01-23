package main

import (
	"fmt"
	"log"
	"net/http"
	"os"
	"strings"

	"scrumlr.io/server/auth"
	"scrumlr.io/server/services/health"

	"scrumlr.io/server/api"
	"scrumlr.io/server/database"
	"scrumlr.io/server/database/migrations"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/services/board_reactions"
	"scrumlr.io/server/services/boards"
	"scrumlr.io/server/services/feedback"
	"scrumlr.io/server/services/notes"
	"scrumlr.io/server/services/reactions"
	"scrumlr.io/server/services/users"
	"scrumlr.io/server/services/votings"

	"github.com/pkg/errors"
	"github.com/urfave/cli/v2"
	"github.com/urfave/cli/v2/altsrc"
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

	// check if process is executed within docker environment
	if _, err := os.Stat("/.dockerenv"); err != nil {
		logger.EnableDevelopmentLogger()
	}

	if err := app.Run(os.Args); err != nil {
		log.Fatal(err)
	}
}

func run(c *cli.Context) error {
	db, err := migrations.MigrateDatabase(c.String("database"))
	if err != nil {
		return errors.Wrap(err, "unable to migrate database")
	}

	if !c.Bool("insecure") && c.String("key") == "" {
		return errors.New("you may not start the application without a private key. Use 'insecure' flag with caution if you want to use default keypair to sign jwt's")
	}

	var rt *realtime.Broker
	if c.String("redis-address") != "" {
		rt, err = realtime.NewRedis(realtime.RedisServer{
			Addr:     c.String("redis-address"),
			Username: c.String("redis-username"),
			Password: c.String("redis-password"),
		})
		if err != nil {
			logger.Get().Fatalf("failed to connect to redis message queue: %v", err)
		}
	} else {
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
	if c.IsSet("auth-google-client-id") && c.IsSet("auth-google-client-secret") && c.IsSet("auth-callback-host") {
		providersMap[(string)(types.AccountTypeGoogle)] = auth.AuthProviderConfiguration{
			ClientId:     c.String("auth-google-client-id"),
			ClientSecret: c.String("auth-google-client-secret"),
			RedirectUri:  fmt.Sprintf("%s%s/login/google/callback", strings.TrimSuffix(c.String("auth-callback-host"), "/"), strings.TrimSuffix(basePath, "/")),
		}
	}
	if c.IsSet("auth-github-client-id") && c.IsSet("auth-github-client-secret") && c.IsSet("auth-callback-host") {
		providersMap[(string)(types.AccountTypeGitHub)] = auth.AuthProviderConfiguration{
			ClientId:     c.String("auth-github-client-id"),
			ClientSecret: c.String("auth-github-client-secret"),
			RedirectUri:  fmt.Sprintf("%s%s/login/github/callback", strings.TrimSuffix(c.String("auth-callback-host"), "/"), strings.TrimSuffix(basePath, "/")),
		}
	}
	if c.IsSet("auth-microsoft-client-id") && c.IsSet("auth-microsoft-client-secret") && c.IsSet("auth-callback-host") {
		providersMap[(string)(types.AccountTypeMicrosoft)] = auth.AuthProviderConfiguration{
			ClientId:     c.String("auth-microsoft-client-id"),
			ClientSecret: c.String("auth-microsoft-client-secret"),
			RedirectUri:  fmt.Sprintf("%s%s/login/microsoft/callback", strings.TrimSuffix(c.String("auth-callback-host"), "/"), strings.TrimSuffix(basePath, "/")),
		}
	}
	if c.IsSet("auth-azure-ad-tenant-id") && c.IsSet("auth-azure-ad-client-id") && c.IsSet("auth-azure-ad-client-secret") && c.IsSet("auth-callback-host") {
		providersMap[(string)(types.AccountTypeAzureAd)] = auth.AuthProviderConfiguration{
			TenantId:     c.String("auth-azure-ad-tenant-id"),
			ClientId:     c.String("auth-azure-ad-client-id"),
			ClientSecret: c.String("auth-azure-ad-client-secret"),
			RedirectUri:  fmt.Sprintf("%s%s/login/azure_ad/callback", strings.TrimSuffix(c.String("auth-callback-host"), "/"), strings.TrimSuffix(basePath, "/")),
		}
	}
	if c.IsSet("auth-apple-client-id") && c.IsSet("auth-apple-client-secret") && c.IsSet("auth-callback-host") {
		providersMap[(string)(types.AccountTypeApple)] = auth.AuthProviderConfiguration{
			ClientId:     c.String("auth-apple-client-id"),
			ClientSecret: c.String("auth-apple-client-secret"),
			RedirectUri:  fmt.Sprintf("%s%s/login/apple/callback", strings.TrimSuffix(c.String("auth-callback-host"), "/"), strings.TrimSuffix(basePath, "/")),
		}
	}

	dbConnection := database.New(db, c.Bool("verbose"))

	keyWithNewlines := strings.ReplaceAll(c.String("key"), "\\n", "\n")
	unsafeKeyWithNewlines := strings.ReplaceAll(c.String("unsafe-key"), "\\n", "\n")
	authConfig := auth.NewAuthConfiguration(providersMap, unsafeKeyWithNewlines, keyWithNewlines, dbConnection)

	boardService := boards.NewBoardService(dbConnection, rt)
	boardSessionService := boards.NewBoardSessionService(dbConnection, rt)
	votingService := votings.NewVotingService(dbConnection, rt)
	userService := users.NewUserService(dbConnection)
	noteService := notes.NewNoteService(dbConnection, rt)
	reactionService := reactions.NewReactionService(dbConnection, rt)
	feedbackService := feedback.NewFeedbackService(c.String("feedback-webhook-url"))
	healthService := health.NewHealthService(dbConnection, rt)
	boardReactionService := board_reactions.NewReactionService(dbConnection, rt)

	s := api.New(
		basePath,
		rt,
		authConfig,
		boardService,
		votingService,
		userService,
		noteService,
		reactionService,
		boardSessionService,
		healthService,
		feedbackService,
		boardReactionService,
		c.Bool("verbose"),
		!c.Bool("disable-check-origin"),
	)

	port := fmt.Sprintf(":%d", c.Int("port"))
	logger.Get().Infow("starting server", "base-path", basePath, "port", port)
	return http.ListenAndServe(port, s)
}
