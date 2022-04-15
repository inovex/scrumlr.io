package main

import (
	"fmt"
	"log"
	"net/http"
	"net/url"
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
	"scrumlr.io/server/services/boards"
	"scrumlr.io/server/services/notes"
	"scrumlr.io/server/services/users"
	"scrumlr.io/server/services/votings"

	"github.com/pkg/errors"
	"github.com/urfave/cli/v2"
)

func main() {
	app := &cli.App{
		Name:      "scrumlr.io",
		Usage:     "Awesome & scalable server for the scrumlr.io web application",
		HelpName:  "scrumlr",
		UsageText: "scrumlr [global options]",
		Action:    run,
		Flags: []cli.Flag{
			&cli.IntFlag{
				Name:    "port",
				Aliases: []string{"p"},
				EnvVars: []string{"SCRUMLR_SERVER_PORT"},
				Usage:   "the `port` of the server to launch",
				Value:   8080,
			},
			&cli.StringFlag{
				Name:    "nats",
				Aliases: []string{"n"},
				EnvVars: []string{"SCRUMLR_SERVER_NATS_URL"},
				Usage:   "the `url` of the nats server",
				Value:   "nats://localhost:4222", // nats://nats:4222
			},
			&cli.StringFlag{
				Name:    "database",
				Aliases: []string{"d"},
				EnvVars: []string{"SCRUMLR_SERVER_DATABASE_URL"},
				Usage:   "the connection `url` for the database",
				Value:   "postgresql://localhost:5432", // postgres://YourUserName:YourPassword@YourHostname:5432/YourDatabaseName?sslmode=disable
			},
			&cli.StringFlag{
				Name:    "key",
				EnvVars: []string{"SCRUMLR_PRIVATE_KEY"},
				Usage:   "the private key, used to sign the jwt's - needed in ES512 (ecdsa)",
			},
			&cli.StringFlag{
				Name:     "base-url",
				Aliases:  []string{"b"},
				EnvVars:  []string{"SCRUMLR_BASE_URL"},
				Usage:    "the base `url` of the application (e.g. https://scrumlr.io/api)",
				Required: false,
			},
			&cli.StringFlag{
				Name:     "auth-google-client-id",
				EnvVars:  []string{"SCRUMLR_AUTH_GOOGLE_CLIENT_ID"},
				Usage:    "the client `id` for Google",
				Required: false,
			},
			&cli.StringFlag{
				Name:     "auth-google-client-secret",
				EnvVars:  []string{"SCRUMLR_AUTH_GOOGLE_CLIENT_SECRET"},
				Usage:    "the client `secret` for Google",
				Required: false,
			},
			&cli.StringFlag{
				Name:     "auth-github-client-id",
				EnvVars:  []string{"SCRUMLR_AUTH_GITHUB_CLIENT_ID"},
				Usage:    "the client `id` for GitHub",
				Required: false,
			},
			&cli.StringFlag{
				Name:     "auth-github-client-secret",
				EnvVars:  []string{"SCRUMLR_AUTH_GITHUB_CLIENT_SECRET"},
				Usage:    "the client `secret` for GitHub",
				Required: false,
			},
			&cli.StringFlag{
				Name:     "auth-microsoft-client-id",
				EnvVars:  []string{"SCRUMLR_AUTH_MICROSOFT_CLIENT_ID"},
				Usage:    "the client `id` for Microsoft",
				Required: false,
			},
			&cli.StringFlag{
				Name:     "auth-microsoft-client-secret",
				EnvVars:  []string{"SCRUMLR_AUTH_MICROSOFT_CLIENT_SECRET"},
				Usage:    "the client `secret` for Microsoft",
				Required: false,
			},
			&cli.StringFlag{
				Name:     "auth-apple-client-id",
				EnvVars:  []string{"SCRUMLR_AUTH_APPLE_CLIENT_ID"},
				Usage:    "the client `id` for Apple",
				Required: false,
			},
			&cli.StringFlag{
				Name:     "auth-apple-client-secret",
				EnvVars:  []string{"SCRUMLR_AUTH_APPLE_CLIENT_SECRET"},
				Usage:    "the client `secret` for Apple",
				Required: false,
			},
			&cli.BoolFlag{
				Name:    "verbose",
				Aliases: []string{"v"},
				Usage:   "enable verbose logging",
				Value:   false,
			},
			&cli.BoolFlag{
				Name:  "disable-check-origin",
				Usage: "disable check origin (strongly suggestion to only use this for development)",
				Value: false,
			},
		},
	}

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

	rt := realtime.New(c.String("nats"))

	var baseUrl string
	if c.IsSet("base-url") {
		r := strings.TrimSuffix(c.String("base-url"), "/")
		if _, err := url.Parse(r); err != nil {
			return errors.Wrap(err, "invalid base url")
		}
		baseUrl = r
	}

	providersMap := make(map[string]auth.AuthProviderConfiguration)
	if c.IsSet("auth-google-client-id") && c.IsSet("auth-google-client-secret") {
		providersMap[(string)(types.AccountTypeGoogle)] = auth.AuthProviderConfiguration{
			ClientId:     c.String("auth-google-client-id"),
			ClientSecret: c.String("auth-google-client-secret"),
		}
	}
	if c.IsSet("auth-github-client-id") && c.IsSet("auth-github-client-secret") {
		providersMap[(string)(types.AccountTypeGitHub)] = auth.AuthProviderConfiguration{
			ClientId:     c.String("auth-github-client-id"),
			ClientSecret: c.String("auth-github-client-secret"),
		}
	}
	if c.IsSet("auth-microsoft-client-id") && c.IsSet("auth-microsoft-client-secret") {
		providersMap[(string)(types.AccountTypeMicrosoft)] = auth.AuthProviderConfiguration{
			ClientId:     c.String("auth-microsoft-client-id"),
			ClientSecret: c.String("auth-microsoft-client-secret"),
		}
	}
	if c.IsSet("auth-apple-client-id") && c.IsSet("auth-apple-client-secret") {
		providersMap[(string)(types.AccountTypeApple)] = auth.AuthProviderConfiguration{
			ClientId:     c.String("auth-apple-client-id"),
			ClientSecret: c.String("auth-apple-client-secret"),
		}
	}

	authConfig := auth.NewAuthConfiguration(baseUrl, providersMap, c.String("key"))

	dbConnection := database.New(db, c.Bool("verbose"))
	boardService := boards.NewBoardService(dbConnection, rt)
	boardSessionService := boards.NewBoardSessionService(dbConnection, rt)
	votingService := votings.NewVotingService(dbConnection, rt)
	userService := users.NewUserService(dbConnection)
	noteService := notes.NewNoteService(dbConnection, rt)
	healthService := health.NewHealthService(dbConnection, rt)

	s := api.New(
		baseUrl,
		rt,
		authConfig,
		boardService,
		votingService,
		userService,
		noteService,
		boardSessionService,
		healthService,
		c.Bool("verbose"),
		!c.Bool("disable-check-origin"),
	)

	port := fmt.Sprintf(":%d", c.Int("port"))
	logger.Get().Infow("starting server", "baseURL", baseUrl, "port", port)
	return http.ListenAndServe(port, s)
}
