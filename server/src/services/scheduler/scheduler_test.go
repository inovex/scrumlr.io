package scheduler

import (
	"fmt"
	"github.com/go-co-op/gocron/v2"
	"github.com/golang/mock/gomock"
	"github.com/google/uuid"
	"github.com/jonboulle/clockwork"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"github.com/uptrace/bun"
	"scrumlr.io/server/database"
	"scrumlr.io/server/services/scheduler/mocks"
	"sync"
	"testing"
	"time"
)

type SchedulerTestSuite struct {
	suite.Suite
}
type DBMock struct {
	DB
	wg sync.WaitGroup
	mock.Mock
	Calls int
}

func TestSchedulersSuite(t *testing.T) {
	suite.Run(t, new(SchedulerTestSuite))
}

func (suite *SchedulerTestSuite) TestInitialization() {
	mockDB := new(DBMock)
	s := new(SchedulerService)
	ctrl := gomock.NewController(suite.T())
	sched := mocks.NewMockScheduler(ctrl)

	s.database = mockDB
	s.scheduler = sched

	sched.EXPECT().Start().Times(1)
	sched.EXPECT().NewJob(gocron.CronJob(fmt.Sprintf("0 3 * * *"), false), gomock.Any())
	s.StartScheduler("./config.yaml", "0")

	mockDB.AssertExpectations(suite.T())
}

func (suite *SchedulerTestSuite) TestCheckMultipleIntervals() {
	s := new(SchedulerService)
	mockDB := new(DBMock)

	fakeClock := clockwork.NewFakeClock()
	scheduler, _ := gocron.NewScheduler(gocron.WithClock(fakeClock))

	s.database = mockDB
	s.scheduler = scheduler

	testBoard := database.BoardSession{
		BaseModel: bun.BaseModel{},
		Board:     uuid.New(),
		User:      uuid.New(),
		Name:      "TestBoard",
	}
	expected :=
		6
	mockDB.On("GetSessionsOlderThan", mock.Anything, mock.Anything).
		Return([]database.BoardSession{testBoard}, nil)
	mockDB.On("DeleteBoard", testBoard.Board).Return(nil)

	s.StartScheduler("./config.yaml", "0")

	for i := 0; i < expected; i++ {
		mockDB.wg.Add(1)
		fakeClock.BlockUntil(1)
		fakeClock.Advance(time.Hour * 24)
		mockDB.wg.Wait()
	}

	scheduler.Shutdown()
	assert.Equal(suite.T(), expected, mockDB.Calls, "they should be equal")
	mockDB.AssertExpectations(suite.T())
}

func (m *DBMock) GetSessionsOlderThan(t time.Time, interactions int) ([]database.BoardSession, error) {
	args := m.Called(t, interactions)
	m.Calls++
	m.wg.Done()

	return args.Get(0).([]database.BoardSession), args.Error(1)
}
func (m *DBMock) DeleteBoard(id uuid.UUID) error {
	args := m.Called(id)
	return args.Error(0)
}
