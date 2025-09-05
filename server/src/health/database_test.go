package health

import (
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/testcontainers/testcontainers-go/modules/postgres"
	"github.com/uptrace/bun"
	"scrumlr.io/server/initialize"
)

type DatabaseHealthTestSuite struct {
	suite.Suite
	container *postgres.PostgresContainer
	db        *bun.DB
}

func TestDatabaseHealthTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseHealthTestSuite))
}

func (suite *DatabaseHealthTestSuite) SetupSuite() {
	container, bun := initialize.StartTestDatabase()

	suite.container = container
	suite.db = bun
}

func (suite *DatabaseHealthTestSuite) TearDownSuite() {
	initialize.StopTestDatabase(suite.container)
}

func (suite *DatabaseHealthTestSuite) Test_Database_IsHealthy() {
	t := suite.T()
	database := NewHealthDatabase(suite.db)

	healthy := database.IsHealthy()

	assert.True(t, healthy)
}
