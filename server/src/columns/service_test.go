package columns

import (
	"context"
	"errors"
	"fmt"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/common"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
)

type ColumnServiceTestSuite struct {
	suite.Suite
	mockDB                   *MockColumnDatabase
	mockBrokerClient         *realtime.MockClient
	broker                   *realtime.Broker
	mockNoteService          *notes.MockNotesService
	mockBoardModifiedUpdater *common.MockBoardLastModifiedUpdater
	service                  ColumnService
	boardID                  uuid.UUID
	columnID                 uuid.UUID
	userID                   uuid.UUID
	columnName               string
	columnDescription        string
}

func TestColumnServiceTestSuite(t *testing.T) {
	suite.Run(t, new(ColumnServiceTestSuite))
}

func (suite *ColumnServiceTestSuite) SetupTest() {
	suite.mockDB = NewMockColumnDatabase(suite.T())
	suite.mockBrokerClient = realtime.NewMockClient(suite.T())
	suite.broker = new(realtime.Broker)
	suite.broker.Con = suite.mockBrokerClient
	suite.mockNoteService = notes.NewMockNotesService(suite.T())
	suite.mockBoardModifiedUpdater = common.NewMockBoardLastModifiedUpdater(suite.T())
	suite.service = NewColumnService(suite.mockDB, suite.broker, suite.mockNoteService, suite.mockBoardModifiedUpdater)
	suite.boardID = uuid.New()
	suite.columnID = uuid.New()
	suite.userID = uuid.New()
	suite.columnName = "Column One"
	suite.columnDescription = "This is a column"
}

func (suite *ColumnServiceTestSuite) TearDownTest() {
	suite.mockBoardModifiedUpdater.AssertExpectations(suite.T())
}

func (suite *ColumnServiceTestSuite) TestCreateColumn() {
	columnToCreate := suite.createDatabaseColumn()
	suite.expectGetIndex()
	suite.expectGetAllNotes(&notes.Note{}, nil)
	suite.expectColumnCreated(suite.createDatabaseColumnInsert(), columnToCreate, nil)
	suite.expectBoardLastModifiedAtTouched()
	suite.expectGetAllColumns([]DatabaseColumn{columnToCreate}, nil)

	column, err := suite.service.Create(context.Background(), ColumnRequest{
		Name:        suite.columnName,
		Board:       suite.boardID,
		Description: suite.columnDescription,
	})

	suite.Nil(err)
	suite.NotNil(column)
	suite.Equal(suite.columnID, column.ID)
	suite.Equal(suite.columnName, column.Name)
	suite.Equal(suite.columnDescription, column.Description)
}

func (suite *ColumnServiceTestSuite) TestCreateColumn_DatabaseError() {
	dbError := errors.New("Database error")

	suite.expectGetIndex()
	suite.expectColumnCreated(suite.createDatabaseColumnInsert(), DatabaseColumn{}, dbError)

	column, err := suite.service.Create(context.Background(), ColumnRequest{
		Name:        suite.columnName,
		Board:       suite.boardID,
		Description: suite.columnDescription,
	})

	suite.Nil(column)
	suite.NotNil(err)
	suite.Equal(dbError, err)
}

func (suite *ColumnServiceTestSuite) TestDeleteColumn() {
	noteText := "Hallo"
	noteId := uuid.New()

	suite.expectColumnDeletedAndBroadcast()
	suite.expectGetAllNotes(&notes.Note{ID: noteId, Text: noteText, Position: notes.NotePosition{Column: suite.columnID}}, nil)
	suite.expectBoardLastModifiedAtTouched()

	err := suite.service.Delete(context.Background(), suite.boardID, suite.columnID, suite.userID)

	suite.Nil(err)
}

func (suite *ColumnServiceTestSuite) TestDeleteColumn_DatabaseError() {
	dbError := errors.New("Database error")

	suite.mockDB.EXPECT().Delete(mock.Anything, suite.boardID, suite.columnID).
		Return(dbError)

	suite.expectGetAllNotes(&notes.Note{}, nil)

	err := suite.service.Delete(context.Background(), suite.boardID, suite.columnID, suite.userID)

	suite.NotNil(err)
	suite.Equal(dbError, err)
}

func (suite *ColumnServiceTestSuite) TestDeleteColumn_NoteServiceGetAllError() {

	suite.expectGetAllNotes(nil, common.NotFoundError)

	err := suite.service.Delete(context.Background(), suite.boardID, suite.columnID, suite.userID)

	suite.NotNil(err)
	suite.Equal(common.NotFoundError, err)
}

func (suite *ColumnServiceTestSuite) TestUpdateColumn() {

	mockedColumn := suite.createDatabaseColumn()
	suite.expectColumnsUpdated(mockedColumn, nil)
	suite.expectGetAllColumns([]DatabaseColumn{mockedColumn}, nil)
	suite.expectBoardLastModifiedAtTouched()

	suite.expectGetAllNotes(&notes.Note{}, nil)

	column, err := suite.service.Update(context.Background(), ColumnUpdateRequest{
		ID:          suite.columnID,
		Board:       suite.boardID,
		Name:        suite.columnName,
		Description: suite.columnDescription,
	})

	suite.Nil(err)
	suite.NotNil(column)
	suite.Equal(suite.columnID, column.ID)
	suite.Equal(suite.columnName, column.Name)
	suite.Equal(suite.columnDescription, column.Description)
}

func (suite *ColumnServiceTestSuite) TestUpdateColumn_DatabaseError() {
	dbError := errors.New("Database error")
	suite.expectColumnsUpdated(DatabaseColumn{}, dbError)

	column, err := suite.service.Update(context.Background(), ColumnUpdateRequest{
		ID:          suite.columnID,
		Board:       suite.boardID,
		Name:        suite.columnName,
		Description: suite.columnDescription,
	})

	suite.Nil(column)
	suite.NotNil(err)
	suite.Equal(dbError, err)
}

func (suite *ColumnServiceTestSuite) TestGetColumn() {
	suite.mockDB.EXPECT().Get(mock.Anything, suite.boardID, suite.columnID).
		Return(DatabaseColumn{
			ID:          suite.columnID,
			Board:       suite.boardID,
			Name:        suite.columnName,
			Description: suite.columnDescription,
		}, nil)

	column, err := suite.service.Get(context.Background(), suite.boardID, suite.columnID)

	suite.Nil(err)
	suite.NotNil(column)
	suite.Equal(suite.columnID, column.ID)
	suite.Equal(suite.columnName, column.Name)
	suite.Equal(suite.columnDescription, column.Description)
}

func (suite *ColumnServiceTestSuite) TestGetColumn_DatabaseError() {
	dbError := errors.New("Database error")
	suite.mockDB.EXPECT().Get(mock.Anything, suite.boardID, suite.columnID).
		Return(DatabaseColumn{}, dbError)

	column, err := suite.service.Get(context.Background(), suite.boardID, suite.columnID)

	suite.Nil(column)
	suite.NotNil(err)
	suite.Equal(fmt.Errorf("unable to get column: %w", dbError), err)
}

func (suite *ColumnServiceTestSuite) TestGetAllColumns() {
	secondColumnId := uuid.New()
	secondColumnName := "Column Two"
	secondColumnDescription := "This is also a column"

	suite.expectGetAllColumns([]DatabaseColumn{
		suite.createDatabaseColumn(),
		{
			ID:          secondColumnId,
			Board:       suite.boardID,
			Name:        secondColumnName,
			Description: secondColumnDescription,
		},
	}, nil)

	columns, err := suite.service.GetAll(context.Background(), suite.boardID)

	suite.Nil(err)
	suite.NotNil(columns)
	suite.Len(columns, 2)

	suite.Equal(suite.columnID, columns[0].ID)
	suite.Equal(suite.columnName, columns[0].Name)
	suite.Equal(suite.columnDescription, columns[0].Description)

	suite.Equal(secondColumnId, columns[1].ID)
	suite.Equal(secondColumnName, columns[1].Name)
	suite.Equal(secondColumnDescription, columns[1].Description)
}

func (suite *ColumnServiceTestSuite) TestGetAllColumns_DatabaseError() {
	dbError := errors.New("Database error")
	suite.expectGetAllColumns([]DatabaseColumn{}, dbError)

	column, err := suite.service.GetAll(context.Background(), suite.boardID)

	suite.Nil(column)
	suite.NotNil(err)
	suite.Equal(fmt.Errorf("unable to get columns: %w", dbError), err)
}

func (suite *ColumnServiceTestSuite) TestGetCount() {
	count := 3
	suite.mockDB.EXPECT().Count(mock.Anything, suite.boardID).
		Return(count, nil)

	columnCount, err := suite.service.GetCount(context.Background(), suite.boardID)

	suite.Nil(err)
	suite.Equal(count, columnCount)
}

func (suite *ColumnServiceTestSuite) TestGetCount_DatabaseError() {
	dbError := errors.New("database error")
	count := 0
	suite.mockDB.EXPECT().Count(mock.Anything, suite.boardID).
		Return(0, dbError)

	columnCount, err := suite.service.GetCount(context.Background(), suite.boardID)

	suite.NotNil(err)
	suite.Equal(common.InternalServerError, err)
	suite.Equal(count, columnCount)
}

// Helper functions

func (suite *ColumnServiceTestSuite) createDatabaseColumn() DatabaseColumn {
	return DatabaseColumn{
		ID:          suite.columnID,
		Board:       suite.boardID,
		Name:        suite.columnName,
		Description: suite.columnDescription,
	}
}

func (suite *ColumnServiceTestSuite) createDatabaseColumnInsert() DatabaseColumnInsert {
	return DatabaseColumnInsert{
		Board:       suite.boardID,
		Name:        suite.columnName,
		Description: suite.columnDescription,
	}
}

func (suite *ColumnServiceTestSuite) expectBroadcast() {
	suite.mockBrokerClient.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
}

func (suite *ColumnServiceTestSuite) expectBoardTouched() {
	suite.mockBoardModifiedUpdater.EXPECT().UpdateLastModified(mock.Anything, suite.boardID).Return(nil)
}

func (suite *ColumnServiceTestSuite) expectColumnsUpdated(result DatabaseColumn, err error) {
	suite.mockDB.EXPECT().Update(mock.Anything, DatabaseColumnUpdate{
		ID:          suite.columnID,
		Board:       suite.boardID,
		Name:        suite.columnName,
		Description: suite.columnDescription,
	}).Return(result, err)
	if err == nil {
		suite.expectBroadcast()
	}
}

func (suite *ColumnServiceTestSuite) expectColumnCreated(insert DatabaseColumnInsert, result DatabaseColumn, err error) {
	suite.mockDB.EXPECT().Create(mock.Anything, insert).Return(result, err)
	if err == nil {
		suite.expectBroadcast()
	}
}

func (suite *ColumnServiceTestSuite) expectGetAllColumns(result []DatabaseColumn, err error) {
	suite.mockDB.EXPECT().GetAll(mock.Anything, suite.boardID).Return(result, err)
}

func (suite *ColumnServiceTestSuite) expectGetIndex() {
	suite.mockDB.EXPECT().GetIndex(mock.Anything, suite.boardID).
		Return(0, nil)
}

func (suite *ColumnServiceTestSuite) expectGetAllNotes(note *notes.Note, err error) {
	suite.mockNoteService.EXPECT().GetAll(mock.Anything, suite.boardID, []uuid.UUID{suite.columnID}).
		Return([]*notes.Note{
			note,
		}, err)
}

func (suite *ColumnServiceTestSuite) expectBoardLastModifiedAtTouched() {
	suite.mockBoardModifiedUpdater.EXPECT().UpdateLastModified(mock.Anything, suite.boardID).Return(nil)
}
func (suite *ColumnServiceTestSuite) expectColumnDeletedAndBroadcast() {
	suite.mockDB.EXPECT().Delete(mock.Anything, suite.boardID, suite.columnID).Return(nil)
	suite.expectBroadcast()
}
