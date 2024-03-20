package scheduler

import (
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/database"
	"testing"
	"time"
)

type SchedulerTestSuite struct {
	suite.Suite
}
type MockDB struct {
	*database.Database
	mock.Mock
}

func TestScheduler(t *testing.T) {
	suite.Run(t, new(SchedulerTestSuite))
}

func (suite *SchedulerTestSuite) TestScheduledTask() {
	s := new(Scheduler)
	mock := new(MockDB)
	Init(mock.Database)

	// Schedule a job to run every 1 minute
	job := s.Every(1).Minute().Do(func() {
		// Job logic here
	})

	// Get the next run time of the job
	nextRun := job.nextRun()

	// Calculate the expected next run time
	expectedNextRun := time.Now().Add(1 * time.Minute)

	// Assert that the next run time is as expected
	assert.Equal(suite.T(), expectedNextRun, nextRun)
}
