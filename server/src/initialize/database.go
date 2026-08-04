package initialize

import (
	"database/sql"
	"embed"
	"errors"
	"fmt"
	"net/http"
	"runtime"

	"github.com/golang-migrate/migrate/v4"
	"github.com/golang-migrate/migrate/v4/database/postgres"
	"github.com/golang-migrate/migrate/v4/source/httpfs"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/extra/bundebug"
	"github.com/uptrace/bun/extra/bunotel"
	"github.com/urfave/cli/v2"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
	"scrumlr.io/server/logger"
)

//go:embed migrations/sql
var Migrations embed.FS

var traceProvider trace.TracerProvider = otel.GetTracerProvider()
var meterProvider metric.MeterProvider = otel.GetMeterProvider()

func InitializeDatabase(ctx *cli.Context) (*bun.DB, error) {
	log := logger.FromContext(ctx.Context)

	var databaseUrl string
	if ctx.String("database") != "" {
		databaseUrl = ctx.String("database")
	} else if ctx.String("database-host") != "" && ctx.String("database-username") != "" && ctx.String("database-password") != "" {
		databaseUrl = fmt.Sprintf("postgresql://%s:%s@%s", ctx.String("database-username"), ctx.String("database-password"), ctx.String("database-host"))
	} else {
		return nil, errors.New("no valid database connection found")
	}

	db, err := sql.Open("postgres", databaseUrl)
	if err != nil {
		return nil, err
	}

	driver, err := postgres.WithInstance(db, &postgres.Config{})
	if err != nil {
		return nil, err
	}

	source, err := httpfs.New(http.FS(Migrations), "migrations/sql")
	if err != nil {
		return nil, err
	}

	m, err := migrate.NewWithInstance(
		"httpfs",
		source,
		"postgres",
		driver,
	)
	if err != nil {
		return nil, err
	}

	err = m.Up()
	if err != nil && !errors.Is(err, migrate.ErrNoChange) {
		return nil, err
	}

	log.Infow("successfully migrated database")

	return InitializeBun(db, logger.GetLogLevel()), nil
}

func InitializeBun(db *sql.DB, logLevel zapcore.Level) *bun.DB {
	d := bun.NewDB(db, pgdialect.New())
	maxOpenConnections := 4 * runtime.GOMAXPROCS(0)
	d.SetMaxOpenConns(maxOpenConnections)
	d.SetMaxIdleConns(maxOpenConnections)
	d.AddQueryHook(bunotel.NewQueryHook(
		bunotel.WithDBName("scruml-database"),
		bunotel.WithTracerProvider(traceProvider),
		bunotel.WithMeterProvider(meterProvider),
	))

	if logLevel == zap.DebugLevel {
		d.AddQueryHook(bundebug.NewQueryHook(bundebug.WithVerbose(true)))
	}

	return d
}
