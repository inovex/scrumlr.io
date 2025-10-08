package columns

import (
	"context"
	"errors"
	"fmt"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/common"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
)

func TestCreateColumn(t *testing.T) {
	columnId := uuid.New()
	boardId := uuid.New()
	columnName := "Column One"
	columnDescription := "This is a column"

	mockColumnDatabase := NewMockColumnDatabase(t)
	mockColumnDatabase.EXPECT().GetIndex(mock.Anything, boardId).
		Return(0, nil)
	mockColumnDatabase.EXPECT().Create(mock.Anything, DatabaseColumnInsert{
		Board:       boardId,
		Name:        columnName,
		Description: columnDescription,
	}).
		Return(DatabaseColumn{
			ID:          columnId,
			Board:       boardId,
			Name:        columnName,
			Description: columnDescription,
		}, nil)
	mockColumnDatabase.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseColumn{
			{ID: columnId, Board: boardId, Name: columnName, Description: columnDescription},
		}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetAll(mock.Anything, boardId, []uuid.UUID{columnId}).
		Return([]*notes.Note{}, nil)

	columnService := NewColumnService(mockColumnDatabase, broker, mockNoteService)

	column, err := columnService.Create(context.Background(), ColumnRequest{
		Name:        columnName,
		Board:       boardId,
		Description: columnDescription,
	})

	assert.Nil(t, err)
	assert.NotNil(t, column)
	assert.Equal(t, columnId, column.ID)
	assert.Equal(t, columnName, column.Name)
	assert.Equal(t, columnDescription, column.Description)
}

func TestCreateColumn_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	boardId := uuid.New()
	columnName := "Column One"
	columnDescription := "This is a column"

	mockColumnDatabase := NewMockColumnDatabase(t)
	mockColumnDatabase.EXPECT().GetIndex(mock.Anything, boardId).
		Return(0, nil)
	mockColumnDatabase.EXPECT().Create(mock.Anything, DatabaseColumnInsert{
		Board:       boardId,
		Name:        columnName,
		Description: columnDescription,
	}).
		Return(DatabaseColumn{}, dbError)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockNoteService := notes.NewMockNotesService(t)

	columnService := NewColumnService(mockColumnDatabase, broker, mockNoteService)

	column, err := columnService.Create(context.Background(), ColumnRequest{
		Name:        columnName,
		Board:       boardId,
		Description: columnDescription,
	})

	assert.Nil(t, column)
	assert.NotNil(t, err)
	assert.Equal(t, dbError, err)
}

func TestDeleteColumn(t *testing.T) {
	boardId := uuid.New()
	columnId := uuid.New()
	userId := uuid.New()
	noteId := uuid.New()
	noteText := "Hallo"

	mockColumnDatabase := NewMockColumnDatabase(t)
	mockColumnDatabase.EXPECT().Delete(mock.Anything, boardId, columnId).Return(nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetAll(mock.Anything, boardId, []uuid.UUID{columnId}).
		Return([]*notes.Note{
			{ID: noteId, Text: noteText, Position: notes.NotePosition{Column: columnId}},
		}, nil)

	columnService := NewColumnService(mockColumnDatabase, broker, mockNoteService)

	err := columnService.Delete(context.Background(), boardId, columnId, userId)

	assert.Nil(t, err)
}

func TestDeleteColumn_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	boardId := uuid.New()
	columnId := uuid.New()
	userId := uuid.New()

	mockColumnDatabase := NewMockColumnDatabase(t)
	mockColumnDatabase.EXPECT().Delete(mock.Anything, boardId, columnId).
		Return(dbError)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetAll(mock.Anything, boardId, []uuid.UUID{columnId}).
		Return([]*notes.Note{}, nil)

	columnService := NewColumnService(mockColumnDatabase, broker, mockNoteService)

	err := columnService.Delete(context.Background(), boardId, columnId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, dbError, err)
}

func TestDeleteColumn_NoteServiceGetAllError(t *testing.T) {
	boardId := uuid.New()
	columnId := uuid.New()
	userId := uuid.New()

	mockColumnDatabase := NewMockColumnDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetAll(mock.Anything, boardId, []uuid.UUID{columnId}).
		Return(nil, common.NotFoundError)

	columnService := NewColumnService(mockColumnDatabase, broker, mockNoteService)

	err := columnService.Delete(context.Background(), boardId, columnId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func TestDeleteColumn_NoteServiceDeleteError(t *testing.T) {
	boardId := uuid.New()
	columnId := uuid.New()
	userId := uuid.New()
	noteId := uuid.New()
	noteText := "Hallo"
	serviceError := "Note service error"

	mockColumnDatabase := NewMockColumnDatabase(t)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetAll(mock.Anything, boardId, []uuid.UUID{columnId}).
		Return([]*notes.Note{
			{ID: noteId, Text: noteText, Position: notes.NotePosition{Column: columnId}},
		}, nil)
	mockNoteService.EXPECT().Delete(mock.Anything, userId, notes.NoteDeleteRequest{ID: noteId, Board: boardId, DeleteStack: true}).
		Return(errors.New(serviceError))

	columnService := NewColumnService(mockColumnDatabase, broker, mockNoteService)

	err := columnService.Delete(context.Background(), boardId, columnId, userId)

	assert.NotNil(t, err)
	assert.Equal(t, errors.New(serviceError), err)
}

func TestUpdateColumn(t *testing.T) {
	boardId := uuid.New()
	columnId := uuid.New()
	columnName := "Column One"
	columnDescription := "This is a column"

	mockColumnDatabase := NewMockColumnDatabase(t)
	mockColumnDatabase.EXPECT().Update(mock.Anything, DatabaseColumnUpdate{
		ID:          columnId,
		Board:       boardId,
		Name:        columnName,
		Description: columnDescription,
	}).
		Return(DatabaseColumn{
			ID:          columnId,
			Board:       boardId,
			Name:        columnName,
			Description: columnDescription,
		}, nil)
	mockColumnDatabase.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseColumn{{ID: columnId, Board: boardId, Name: columnName, Description: columnDescription}}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetAll(mock.Anything, boardId, []uuid.UUID{columnId}).
		Return([]*notes.Note{}, nil)

	columnService := NewColumnService(mockColumnDatabase, broker, mockNoteService)

	column, err := columnService.Update(context.Background(), ColumnUpdateRequest{
		ID:          columnId,
		Board:       boardId,
		Name:        columnName,
		Description: columnDescription,
	})

	assert.Nil(t, err)
	assert.NotNil(t, column)
	assert.Equal(t, columnId, column.ID)
	assert.Equal(t, columnName, column.Name)
	assert.Equal(t, columnDescription, column.Description)
}

func TestUpdateColumn_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	boardId := uuid.New()
	columnId := uuid.New()
	columnName := "Column One"
	columnDescription := "This is a column"

	mockColumnDatabase := NewMockColumnDatabase(t)
	mockColumnDatabase.EXPECT().Update(mock.Anything, DatabaseColumnUpdate{
		ID:          columnId,
		Board:       boardId,
		Name:        columnName,
		Description: columnDescription,
	}).
		Return(DatabaseColumn{}, dbError)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockNoteService := notes.NewMockNotesService(t)

	columnService := NewColumnService(mockColumnDatabase, broker, mockNoteService)

	column, err := columnService.Update(context.Background(), ColumnUpdateRequest{
		ID:          columnId,
		Board:       boardId,
		Name:        columnName,
		Description: columnDescription,
	})

	assert.Nil(t, column)
	assert.NotNil(t, err)
	assert.Equal(t, dbError, err)
}

func TestGetColumn(t *testing.T) {
	boardId := uuid.New()
	columnId := uuid.New()
	columnName := "Column One"
	columnDescription := "This is a column"

	mockColumnDatabase := NewMockColumnDatabase(t)
	mockColumnDatabase.EXPECT().Get(mock.Anything, boardId, columnId).
		Return(DatabaseColumn{
			ID:          columnId,
			Board:       boardId,
			Name:        columnName,
			Description: columnDescription,
		}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockNoteService := notes.NewMockNotesService(t)

	columnService := NewColumnService(mockColumnDatabase, broker, mockNoteService)

	column, err := columnService.Get(context.Background(), boardId, columnId)

	assert.Nil(t, err)
	assert.NotNil(t, column)
	assert.Equal(t, columnId, column.ID)
	assert.Equal(t, columnName, column.Name)
	assert.Equal(t, columnDescription, column.Description)
}

func TestGetColumn_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	boardId := uuid.New()
	columnId := uuid.New()

	mockColumnDatabase := NewMockColumnDatabase(t)
	mockColumnDatabase.EXPECT().Get(mock.Anything, boardId, columnId).
		Return(DatabaseColumn{}, dbError)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockNoteService := notes.NewMockNotesService(t)

	columnService := NewColumnService(mockColumnDatabase, broker, mockNoteService)

	column, err := columnService.Get(context.Background(), boardId, columnId)

	assert.Nil(t, column)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Errorf("unable to get column: %w", dbError), err)
}

func TestGetAllColumns(t *testing.T) {
	boardId := uuid.New()
	firstColumnId := uuid.New()
	secondColumnId := uuid.New()
	firstColumnName := "Column One"
	secondColumnName := "Column Two"
	firstColumnDescription := "This is a column"
	secondColumnDescription := "This is also a column"

	mockColumnDatabase := NewMockColumnDatabase(t)
	mockColumnDatabase.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseColumn{
			{
				ID:          firstColumnId,
				Board:       boardId,
				Name:        firstColumnName,
				Description: firstColumnDescription,
			},
			{
				ID:          secondColumnId,
				Board:       boardId,
				Name:        secondColumnName,
				Description: secondColumnDescription,
			},
		}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockNoteService := notes.NewMockNotesService(t)

	columnService := NewColumnService(mockColumnDatabase, broker, mockNoteService)

	columns, err := columnService.GetAll(context.Background(), boardId)

	assert.Nil(t, err)
	assert.NotNil(t, columns)
	assert.Len(t, columns, 2)

	assert.Equal(t, firstColumnId, columns[0].ID)
	assert.Equal(t, firstColumnName, columns[0].Name)
	assert.Equal(t, firstColumnDescription, columns[0].Description)

	assert.Equal(t, secondColumnId, columns[1].ID)
	assert.Equal(t, secondColumnName, columns[1].Name)
	assert.Equal(t, secondColumnDescription, columns[1].Description)
}

func TestGetAllColumns_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	boardId := uuid.New()

	mockColumnDatabase := NewMockColumnDatabase(t)
	mockColumnDatabase.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseColumn{}, dbError)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockNoteService := notes.NewMockNotesService(t)

	columnService := NewColumnService(mockColumnDatabase, broker, mockNoteService)

	column, err := columnService.GetAll(context.Background(), boardId)

	assert.Nil(t, column)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Errorf("unable to get columns: %w", dbError), err)
}

func TestGetCount(t *testing.T) {
	boardId := uuid.New()
	count := 3

	mockColumnDatabase := NewMockColumnDatabase(t)
	mockColumnDatabase.EXPECT().Count(mock.Anything, boardId).
		Return(count, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockNoteService := notes.NewMockNotesService(t)

	columnService := NewColumnService(mockColumnDatabase, broker, mockNoteService)

	columnCount, err := columnService.GetCount(context.Background(), boardId)

	assert.Nil(t, err)
	assert.Equal(t, count, columnCount)
}

func TestGetCount_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	dbError := errors.New("database error")
	count := 0

	mockColumnDatabase := NewMockColumnDatabase(t)
	mockColumnDatabase.EXPECT().Count(mock.Anything, boardId).
		Return(0, dbError)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockNoteService := notes.NewMockNotesService(t)

	columnService := NewColumnService(mockColumnDatabase, broker, mockNoteService)

	columnCount, err := columnService.GetCount(context.Background(), boardId)

	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
	assert.Equal(t, count, columnCount)
}
