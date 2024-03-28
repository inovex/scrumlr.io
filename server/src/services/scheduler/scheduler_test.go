package scheduler

import (
	"fmt"
	"github.com/go-co-op/gocron/v2"
	"github.com/golang/mock/gomock"
	"github.com/google/uuid"
	"github.com/jonboulle/clockwork"
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
}

func TestSchedulersSuite(t *testing.T) {
	suite.Run(t, new(SchedulerTestSuite))
}

func (suite *SchedulerTestSuite) TestOneInterval() {
	dbMock := new(DBMock)
	//s := new(SchedulerService)
	//s.database = dbMock

	// was testen?
	// einemal methode die auszufuehren ist (deleteOldBoards)
	//nach 24h ausgefuehrt?

	//dbMock.On("GetSessionsOlderThan", time.Now(), 6).Return([]database.BoardSession{
	//	{BaseModel: bun.BaseModel{},
	//		Board:             uuid.New(),
	//		User:              uuid.New(),
	//		Avatar:            nil,
	//		Name:              "TestBoard",
	//		ShowHiddenColumns: false,
	//		Connected:         false,
	//		Ready:             false,
	//		RaisedHand:        false,
	//		Role:              "",
	//		Banned:            false,
	//		CreatedAt:         time.Time{},
	//	}})

	//dbMock.On("DeleteBoard", mock.Anything).Return()

	ctrl := gomock.NewController(suite.T())
	s := mocks.NewMockScheduler(ctrl)
	s.EXPECT().Start().Times(1)
	//s.EXPECT().Shutdown().Times(1).Return(nil)
	s.EXPECT().NewJob(gocron.CronJob("*/20 * * * * *", true), gomock.Any())
	StartScheduler(s, dbMock)
	//time.Sleep(21 * time.Second)
	//dbMock.AssertExpectations(suite.T())
}

func (suite *SchedulerTestSuite) TestCheckInterval() {
	mockDB := new(DBMock)
	fakeClock := clockwork.NewFakeClock()
	scheduler, _ := gocron.NewScheduler(gocron.WithClock(fakeClock))

	s := new(SchedulerService)
	s.database = mockDB
	s.scheduler = scheduler
	mockDB.On("GetSessionsOlderThan", mock.Anything, 10).Return([]database.BoardSession{
		{BaseModel: bun.BaseModel{},
			Board:             uuid.New(),
			User:              uuid.New(),
			Avatar:            nil,
			Name:              "TestBoard",
			ShowHiddenColumns: false,
			Connected:         false,
			Ready:             false,
			RaisedHand:        false,
			Role:              "",
			Banned:            false,
			CreatedAt:         time.Time{},
		}}, nil)

	StartScheduler(scheduler, mockDB)

	for i := 0; i < 4; i++ {
		mockDB.wg.Add(1)
		fakeClock.BlockUntil(1)
		fakeClock.Advance(time.Second * 20)
		mockDB.wg.Wait()
	}
	scheduler.Shutdown()

	mockDB.AssertExpectations(suite.T())
}

func (m *DBMock) GetSessionsOlderThan(t time.Time, interactions int) ([]database.BoardSession, error) {
	args := m.Called(t, interactions)
	fmt.Println("test")
	m.wg.Done()
	return args.Get(0).([]database.BoardSession), args.Error(1)
}
func (m *DBMock) DeleteBoard(id uuid.UUID) error {
	args := m.Called(id)
	return args.Error(0)
}
