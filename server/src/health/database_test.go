package health

import (
	"context"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/suite"
	"github.com/uptrace/bun"
	"scrumlr.io/server/initialize/testDbTemplates"
)

type DatabaseHealthTestSuite struct {
	suite.Suite
	db *bun.DB
}

func TestDatabaseHealthTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseHealthTestSuite))
}

func (suite *DatabaseHealthTestSuite) SetupTest() {
	suite.db = testDbTemplates.NewBaseTestDB(suite.T(), false)
}

func (suite *DatabaseHealthTestSuite) Test_Database_IsHealthy() {
	t := suite.T()
	database := NewHealthDatabase(suite.db)

	healthy := database.IsHealthy(context.Background())

	assert.True(t, healthy)
}