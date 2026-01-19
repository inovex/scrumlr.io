package testDbTemplates

import (
  "context"
  "log"
  "scrumlr.io/server/initialize"
  "sync"
  "testing"

  "github.com/peterldowns/pgtestdb"
  "github.com/testcontainers/testcontainers-go/modules/postgres"
  "github.com/uptrace/bun"
  "go.uber.org/zap/zapcore"
)

var (
  testDBConfig  pgtestdb.Config
  once          sync.Once
  initErr       error
  migratorCache = make(map[string]pgtestdb.Migrator)
  migratorMutex sync.Mutex
)

func InitPgTestDB(t *testing.T) pgtestdb.Config {
  t.Helper()

  once.Do(func() {
    ctx := context.Background()
    container, err := postgres.Run(
      ctx,
      initialize.POSTGRES_IMAGE,
      postgres.WithDatabase(initialize.DATABASE_NAME),
      postgres.WithUsername(initialize.DATABASE_USERNAME),
      postgres.WithPassword(initialize.DATABASE_PASSWORD),
      postgres.BasicWaitStrategies(),
    )
    if err != nil {
      initErr = err
      return
    }

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
      User:       initialize.DATABASE_USERNAME,
      Password:   initialize.DATABASE_PASSWORD,
      Host:       host,
      Port:       mappedPort.Port(),
      Database:   initialize.DATABASE_NAME,
      Options:    "sslmode=disable",
    }
  })

  if initErr != nil {
    log.Fatalf("Failed to initialize test database container: %s", initErr)
  }

  return testDBConfig
}

// Returns a new db instance that is either created new
// or if the wanted seed is already there copied from the existing instance (done with a lock).
// To be used in tests only.
func NewSeededTestDB(t *testing.T, seedFunc func(*bun.DB), seedHash string) *bun.DB {
  t.Helper()

  conf := InitPgTestDB(t)

  migratorMutex.Lock()
  migrator, exists := migratorCache[seedHash]
  // only initialize the db with the seed function if there isn't a db with the wanted seed yet
  if !exists {
    migrator = NewSeededMigrator(seedFunc, seedHash)
    migratorCache[seedHash] = migrator
  }
  migratorMutex.Unlock()

  sqlDB := pgtestdb.New(t, conf, migrator)

  return initialize.InitializeBun(sqlDB, zapcore.DebugLevel)
}
