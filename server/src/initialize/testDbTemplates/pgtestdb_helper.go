package testDbTemplates

import (
  "context"
  "log"
  "sync"
  "testing"

  "scrumlr.io/server/initialize"

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

type AdditionalSeed struct {
  Name string
  Func func(*bun.DB)
}

// Returns a new db instance that is either created new
// or if the wanted seed is already there copied from the existing instance (done with a lock).
// To be used in tests only.
// Add additional seeds for your integration test (see voting integration test as an example). Must be named uniquely
func NewBaseTestDB(t *testing.T, includeBaseSeed bool, additionalSeeds ...AdditionalSeed) *bun.DB {
  t.Helper()

  conf := InitPgTestDB(t)

  seedFunc := func(db *bun.DB) {
    if includeBaseSeed {
      SeedDBBase(db)
    }
    for _, additionalSeed := range additionalSeeds {
      additionalSeed.Func(db)
    }
  }

  seedHash := "no_base_seed"
  if includeBaseSeed {
    seedHash = baseSeedHash
  }
  for _, seed := range additionalSeeds {
    seedHash += "_" + seed.Name
  }

  migrator := NewSeededMigrator(seedFunc, seedHash)
  hash, err := migrator.Hash()
  if err != nil {
    log.Fatalf("Failed to calculate migrator hash: %s", err)
  }

  migratorMutex.Lock()
  cachedMigrator, exists := migratorCache[hash]
  if !exists {
    migratorCache[hash] = migrator
    cachedMigrator = migrator
  }
  migratorMutex.Unlock()

  sqlDB := pgtestdb.New(t, conf, cachedMigrator)
  db := initialize.InitializeBun(sqlDB, zapcore.DebugLevel)

  return db
}
