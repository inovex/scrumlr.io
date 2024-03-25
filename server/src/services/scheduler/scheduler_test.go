package scheduler

import (
	"github.com/golang/mock/gomock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"github.com/uptrace/bun"
	"scrumlr.io/server/database"
	"scrumlr.io/server/services/scheduler/mocks"
	"testing"
	"time"
)

type SchedulerTestSuite struct {
	suite.Suite
}
type DBMock struct {
	*database.Database
	mock.Mock
}

func SchedulersTestSuite(t *testing.T) {
	suite.Run(t, new(SchedulerTestSuite))
}

func (suite *SchedulerTestSuite) OneInterval() {
	dbMock := new(DBMock)
	// was testen?
	// einemal methode die auszufuehren ist (deleteOldBoards)
	//nach 24h ausgefuehrt?

	dbMock.On("GetSessionsOlderThan", time.Now()).Return(database.BoardSession{
		BaseModel:         bun.BaseModel{},
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
	})

	dbMock.On("DeleteBoard", mock.Anything).Return()

	ctrl := gomock.NewController(suite.T())
	s := mocks.NewMockScheduler(ctrl)
	s.EXPECT().Start().Times(1)
	s.EXPECT().Shutdown().Times(1).Return(nil)

	StartScheduler(s, dbMock.Database)
	dbMock.AssertExpectations(suite.T())
}

//	func myFunc(s gocron.Scheduler) {
//		s.Start()
//		_ = s.Shutdown()
//	}
func (m *DBMock) GetSessionsOlderThan(t time.Time) ([]database.BoardSession, error) {
	args := m.Called(t)
	return args.Get(0).([]database.BoardSession), args.Error(1)
}
func (m *DBMock) DeleteBoard(id uuid.UUID) error {
	args := m.Called(id)
	return args.Error(0)
}
