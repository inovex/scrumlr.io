package main

import (
  "encoding/json"
  "errors"
  "fmt"
  "log"
  "net/http"
  "os"
  "strings"

  unleash "github.com/Unleash/unleash-client-go/v4"
  "github.com/joho/godotenv"
  "github.com/urfave/cli/v2"
  "github.com/urfave/cli/v2/altsrc"

  "scrumlr.io/server/api"
  "scrumlr.io/server/auth"
  "scrumlr.io/server/database"
  "scrumlr.io/server/initialize"
  "scrumlr.io/server/logger"
  "scrumlr.io/server/realtime"
  "scrumlr.io/server/services/board_reactions"
  "scrumlr.io/server/services/board_templates"
  "scrumlr.io/server/services/boards"
  "scrumlr.io/server/services/feedback"
  "scrumlr.io/server/services/health"
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
  goEnv := os.Getenv("GO_ENV")
  if goEnv == "" {
    goEnv = "development"
  }

  files := []string{
    ".env",
    ".env.local",
    ".env." + goEnv,
    ".env." + goEnv + ".local",
  }
  if err := godotenv.Load(files...); err != nil {
    log.Printf("warn: could not load some env files: %v", err)
  }

  app := &cli.App{
    Name:      "scrumlr.io",
    Usage:     "Scalable server for the scrumlr.io application",
    HelpName:  "scrumlr",
    UsageText: "scrumlr [global options]",
    Action:    run,
    Flags: []cli.Flag{
      altsrc.NewIntFlag(&cli.IntFlag{
        Name:    "port",
        Aliases: []string{"p"},
        EnvVars: []string{"SCRUMLR_SERVER_PORT"},
        Value:   8080,
        Usage:   "Port for the server",
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "nats",
        Aliases: []string{"n"},
        EnvVars: []string{"SCRUMLR_SERVER_NATS_URL"},
        Value:   "nats://localhost:4222",
        Usage:   "NATS server URL",
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "redis-address",
        EnvVars: []string{"SCRUMLR_SERVER_REDIS_HOST"},
        Value:   "",
        Usage:   "Redis server address (use instead of NATS)",
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "redis-username",
        EnvVars: []string{"SCRUMLR_SERVER_REDIS_USERNAME"},
        Usage:   "Redis username (optional)",
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "redis-password",
        EnvVars: []string{"SCRUMLR_SERVER_REDIS_PASSWORD"},
        Usage:   "Redis password (optional)",
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "database",
        Aliases: []string{"d"},
        EnvVars: []string{"SCRUMLR_SERVER_DATABASE_URL"},
        Value:   "postgresql://localhost:5432/scrumlr?sslmode=disable",
        Usage:   "Database connection URL",
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "base-path",
        Aliases: []string{"b"},
        EnvVars: []string{"SCRUMLR_BASE_PATH"},
        Value:   "/",
        Usage:   "Base API path",
      }),
      altsrc.NewBoolFlag(&cli.BoolFlag{
        Name:    "insecure",
        Aliases: []string{"i"},
        EnvVars: []string{"SCRUMLR_INSECURE"},
        Value:   false,
        Usage:   "Allow default JWT signing key",
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "key",
        EnvVars: []string{"SCRUMLR_PRIVATE_KEY"},
        Usage:   "Private key for JWT signing",
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "unleash-backend-url",
        EnvVars: []string{"SCRUMLR_UNLEASH_BACKEND_URL"},
        Usage:   "Unleash backend URL",
      }),
      altsrc.NewStringFlag(&cli.StringFlag{
        Name:    "unleash-backend-token",
        EnvVars: []string{"SCRUMLR_UNLEASH_BACKEND_TOKEN"},
        Usage:   "Unleash backend token",
      }),
      altsrc.NewBoolFlag(&cli.BoolFlag{
        Name:  "unleash-debug",
        Value: false,
        Usage: "Enable Unleash debug logging",
      }),
      &cli.StringFlag{
        Name:    "config",
        EnvVars: []string{"SCRUMLR_CONFIG_PATH"},
        Usage:   "TOML config file path",
      },
      &cli.BoolFlag{
        Name:    "verbose",
        Aliases: []string{"v"},
        Usage:   "Enable verbose logging",
      },
      &cli.BoolFlag{
        Name:  "disable-check-origin",
        Usage: "Disable origin check (development only)",
      },
      &cli.StringFlag{
        Name:    "feedback-webhook-url",
        EnvVars: []string{"SCRUMLR_FEEDBACK_WEBHOOK_URL"},
        Usage:   "URL for feedback webhook",
      },
      altsrc.NewBoolFlag(&cli.BoolFlag{
        Name:  "disable-anonymous-login",
        Usage: "Disable anonymous login",
      }),
      altsrc.NewBoolFlag(&cli.BoolFlag{
        Name:  "allow-anonymous-custom-templates",
        Usage: "Allow anonymous custom templates",
      }),
      altsrc.NewBoolFlag(&cli.BoolFlag{
        Name:  "auth-enable-experimental-file-system-store",
        Usage: "Enable experimental file system store for auth",
      }),
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

  unleashURL := c.String("unleash-backend-url")
  unleashToken := c.String("unleash-backend-token")
  env := os.Getenv("SCRUMLR_UNLEASH_ENV")
  if env == "" {
    env = "development"
  }
  if unleashURL != "" && unleashToken != "" {
    headers := http.Header{}
    headers.Set("Authorization", unleashToken)
    options := []unleash.ConfigOption{
      unleash.WithAppName("scrumlr-backend"),
      unleash.WithUrl(unleashURL),
      unleash.WithCustomHeaders(headers),
      unleash.WithEnvironment(env),
    }
    if c.Bool("unleash-debug") {
      options = append(options, unleash.WithListener(&unleash.DebugListener{}))
    }
    if err := unleash.Initialize(options...); err != nil {
      return fmt.Errorf("Unleash init failed: %w", err)
    }
  } else {
    logger.Get().Warn("Unleash backend not configured, skipping")
  }

  bun := initialize.InitializeBun(db, c.Bool("verbose"))
  dbConn := database.New(bun)
  authConfig, err := auth.NewAuthConfiguration(providersMap, "", "", dbConn)
  if err != nil {
    return fmt.Errorf("auth init failed: %w", err)
  }

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
