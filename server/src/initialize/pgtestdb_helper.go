package initialize

import (
	"context"
	"log"
	"sync"
	"testing"

	"github.com/peterldowns/pgtestdb"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/uptrace/bun"
	"go.uber.org/zap/zapcore"

	_ "github.com/lib/pq"
)

var (
	testDBContainer *postgres.PostgresContainer
	testDBConfig    pgtestdb.Config
	once            sync.Once
	initErr         error
	migratorCache   = make(map[string]pgtestdb.Migrator)
	migratorMutex   sync.Mutex
)

func InitPgTestDB(t *testing.T) pgtestdb.Config {
	t.Helper()

	once.Do(func() {
		ctx := context.Background()
		container, err := postgres.Run(
			ctx,
			POSTGRES_IMAGE,
			postgres.WithDatabase(DATABASE_NAME),
			postgres.WithUsername(DATABASE_USERNAME),
			postgres.WithPassword(DATABASE_PASSWORD),
			postgres.BasicWaitStrategies(),
		)
		if err != nil {
			initErr = err
			return
		}

		testDBContainer = container

		mappedPort, err := container.MappedPort(ctx, "5432")
		if err != nil {
			initErr = err
			return
		}

		host, err := container.Host(ctx)
		if err != nil {
			initErr = err
			return
		}

		testDBConfig = pgtestdb.Config{
			DriverName: "postgres",
			User:       DATABASE_USERNAME,
			Password:   DATABASE_PASSWORD,
			Host:       host,
			Port:       mappedPort.Port(),
			Database:   DATABASE_NAME,
			Options:    "sslmode=disable",
		}
	})

	if initErr != nil {
		log.Fatalf("Failed to initialize test database container: %s", initErr)
	}

	return testDBConfig
}

func NewSeededTestDB(t *testing.T, seedFunc func(*bun.DB), seedHash string) *bun.DB {
	t.Helper()

	conf := InitPgTestDB(t)

	migratorMutex.Lock()
	migrator, exists := migratorCache[seedHash]
	if !exists {
		// only start a new seed migration if it didn't happen already
		migrator = NewSeededMigrator(seedFunc, seedHash)
		migratorCache[seedHash] = migrator
	}
	migratorMutex.Unlock()

	sqlDB := pgtestdb.New(t, conf, migrator)

	return InitializeBun(sqlDB, zapcore.DebugLevel)
}
