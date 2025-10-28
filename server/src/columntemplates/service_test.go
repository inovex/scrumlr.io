package columntemplates

import (
	"context"
	"errors"
	"fmt"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/columns"
)

func TestCreateColumnTemplate(t *testing.T) {
	id := uuid.New()
	board := uuid.New()
	name := "template test"
	color := columns.ColorGoalGreen
	index := 0
	visible := true

	mockColumnTemplateDatabase := NewMockColumnTemplateDatabase(t)
	mockColumnTemplateDatabase.EXPECT().GetIndex(mock.Anything, board).
		Return(0, nil)
	mockColumnTemplateDatabase.EXPECT().Create(mock.Anything, DatabaseColumnTemplateInsert{
		BoardTemplate: board,
		Name:          name,
		Color:         color,
		Visible:       &visible,
		Index:         &index,
	}).
		Return(DatabaseColumnTemplate{
			ID:            id,
			BoardTemplate: board,
			Name:          name,
			Color:         color,
			Visible:       visible,
			Index:         index,
		}, nil)

	columnTemplateService := NewColumnTemplateService(mockColumnTemplateDatabase)

	column, err := columnTemplateService.Create(context.Background(), ColumnTemplateRequest{
		BoardTemplate: board,
		Name:          name,
		Color:         color,
		Visible:       &visible,
		Index:         &index,
	})

	assert.Nil(t, err)
	assert.NotNil(t, column)

	assert.Equal(t, id, column.ID)
	assert.Equal(t, board, column.BoardTemplate)
	assert.Equal(t, name, column.Name)
	assert.Equal(t, color, column.Color)
	assert.Equal(t, index, column.Index)
	assert.Equal(t, visible, column.Visible)
}

func TestCreateColumnTemplate_NegativeIndex(t *testing.T) {
	id := uuid.New()
	board := uuid.New()
	name := "template test"
	color := columns.ColorGoalGreen
	index := -1
	expectedIndex := 0
	visible := true

	mockColumnTemplateDatabase := NewMockColumnTemplateDatabase(t)
	mockColumnTemplateDatabase.EXPECT().GetIndex(mock.Anything, board).
		Return(0, nil)
	mockColumnTemplateDatabase.EXPECT().Create(mock.Anything, DatabaseColumnTemplateInsert{
		BoardTemplate: board,
		Name:          name,
		Color:         color,
		Visible:       &visible,
		Index:         &expectedIndex,
	}).
		Return(DatabaseColumnTemplate{
			ID:            id,
			BoardTemplate: board,
			Name:          name,
			Color:         color,
			Visible:       visible,
			Index:         expectedIndex,
		}, nil)

	columnTemplateService := NewColumnTemplateService(mockColumnTemplateDatabase)

	column, err := columnTemplateService.Create(context.Background(), ColumnTemplateRequest{
		BoardTemplate: board,
		Name:          name,
		Color:         color,
		Visible:       &visible,
		Index:         &index,
	})

	assert.Nil(t, err)
	assert.NotNil(t, column)

	assert.Equal(t, id, column.ID)
	assert.Equal(t, board, column.BoardTemplate)
	assert.Equal(t, name, column.Name)
	assert.Equal(t, color, column.Color)
	assert.Equal(t, expectedIndex, column.Index)
	assert.Equal(t, visible, column.Visible)
}

func TestCreateColumnTemplate_HigherIndex(t *testing.T) {
	id := uuid.New()
	board := uuid.New()
	name := "template test"
	color := columns.ColorGoalGreen
	index := 99
	expectedIndex := 0
	visible := true

	mockColumnTemplateDatabase := NewMockColumnTemplateDatabase(t)
	mockColumnTemplateDatabase.EXPECT().GetIndex(mock.Anything, board).
		Return(0, nil)
	mockColumnTemplateDatabase.EXPECT().Create(mock.Anything, DatabaseColumnTemplateInsert{
		BoardTemplate: board,
		Name:          name,
		Color:         color,
		Visible:       &visible,
		Index:         &expectedIndex,
	}).
		Return(DatabaseColumnTemplate{
			ID:            id,
			BoardTemplate: board,
			Name:          name,
			Color:         color,
			Visible:       visible,
			Index:         expectedIndex,
		}, nil)

	columnTemplateService := NewColumnTemplateService(mockColumnTemplateDatabase)

	column, err := columnTemplateService.Create(context.Background(), ColumnTemplateRequest{
		BoardTemplate: board,
		Name:          name,
		Color:         color,
		Visible:       &visible,
		Index:         &index,
	})

	assert.Nil(t, err)
	assert.NotNil(t, column)

	assert.Equal(t, id, column.ID)
	assert.Equal(t, board, column.BoardTemplate)
	assert.Equal(t, name, column.Name)
	assert.Equal(t, color, column.Color)
	assert.Equal(t, expectedIndex, column.Index)
	assert.Equal(t, visible, column.Visible)
}

func TestCreateColumnTemplate_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	board := uuid.New()
	name := "template test"
	color := columns.ColorGoalGreen
	index := 0
	visible := true

	mockColumnTemplateDatabase := NewMockColumnTemplateDatabase(t)
	mockColumnTemplateDatabase.EXPECT().GetIndex(mock.Anything, board).
		Return(0, nil)
	mockColumnTemplateDatabase.EXPECT().Create(mock.Anything, DatabaseColumnTemplateInsert{
		BoardTemplate: board,
		Name:          name,
		Color:         color,
		Visible:       &visible,
		Index:         &index,
	}).
		Return(DatabaseColumnTemplate{}, dbError)

	columnTemplateService := NewColumnTemplateService(mockColumnTemplateDatabase)

	column, err := columnTemplateService.Create(context.Background(), ColumnTemplateRequest{
		BoardTemplate: board,
		Name:          name,
		Color:         color,
		Visible:       &visible,
		Index:         &index,
	})

	assert.Nil(t, column)
	assert.NotNil(t, err)
	assert.Equal(t, dbError, err)
}

func TestGetColumnTemplate(t *testing.T) {
	boardId := uuid.New()
	columnId := uuid.New()
	name := "template test"
	color := columns.ColorGoalGreen
	index := 1

	mockColumnTemplateDatabase := NewMockColumnTemplateDatabase(t)
	mockColumnTemplateDatabase.EXPECT().Get(mock.Anything, boardId, columnId).
		Return(DatabaseColumnTemplate{
			ID:            columnId,
			BoardTemplate: boardId,
			Name:          name,
			Color:         color,
			Index:         index,
		}, nil)

	columnTemplateService := NewColumnTemplateService(mockColumnTemplateDatabase)

	column, err := columnTemplateService.Get(context.Background(), boardId, columnId)

	assert.Nil(t, err)
	assert.NotNil(t, column)

	assert.Equal(t, columnId, column.ID)
	assert.Equal(t, boardId, column.BoardTemplate)
	assert.Equal(t, name, column.Name)
	assert.Equal(t, index, column.Index)
	assert.Equal(t, color, column.Color)
}

func TestGetColumnTemplate_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	boardId := uuid.New()
	columnId := uuid.New()

	mockColumnTemplateDatabase := NewMockColumnTemplateDatabase(t)
	mockColumnTemplateDatabase.EXPECT().Get(mock.Anything, boardId, columnId).
		Return(DatabaseColumnTemplate{}, dbError)

	columnTemplateService := NewColumnTemplateService(mockColumnTemplateDatabase)

	column, err := columnTemplateService.Get(context.Background(), boardId, columnId)

	assert.Nil(t, column)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Errorf("unable to get template column: %w", dbError), err)
}

func TestGetAllColumnTemplate(t *testing.T) {
	boardId := uuid.New()
	firstColumnId := uuid.New()
	secondColumnId := uuid.New()
	firstColumnName := "this is a name"
	secondColumnName := "This is another name"

	mockColumnTemplateDatabase := NewMockColumnTemplateDatabase(t)
	mockColumnTemplateDatabase.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseColumnTemplate{
			{
				ID:            firstColumnId,
				BoardTemplate: boardId,
				Name:          firstColumnName,
			},
			{
				ID:            secondColumnId,
				BoardTemplate: boardId,
				Name:          secondColumnName,
			},
		}, nil)

	columnTemplateService := NewColumnTemplateService(mockColumnTemplateDatabase)

	columns, err := columnTemplateService.GetAll(context.Background(), boardId)

	assert.Nil(t, err)
	assert.NotNil(t, columns)
	assert.Len(t, columns, 2)

	assert.Equal(t, firstColumnId, columns[0].ID)
	assert.Equal(t, boardId, columns[0].BoardTemplate)
	assert.Equal(t, firstColumnName, columns[0].Name)

	assert.Equal(t, secondColumnId, columns[1].ID)
	assert.Equal(t, boardId, columns[1].BoardTemplate)
	assert.Equal(t, secondColumnName, columns[1].Name)
}

func TestGetAllColumnTemplate_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	boardId := uuid.New()

	mockColumnTemplateDatabase := NewMockColumnTemplateDatabase(t)
	mockColumnTemplateDatabase.EXPECT().GetAll(mock.Anything, boardId).
		Return([]DatabaseColumnTemplate{}, dbError)

	columnTemplateService := NewColumnTemplateService(mockColumnTemplateDatabase)

	column, err := columnTemplateService.GetAll(context.Background(), boardId)

	assert.Nil(t, column)
	assert.NotNil(t, err)
	assert.Equal(t, fmt.Errorf("unable to get template columns: %w", dbError), err)
}

func TestUpdateColumnTemplate(t *testing.T) {
	id := uuid.New()
	board := uuid.New()
	name := "New Name"
	description := "New Description"
	color := columns.ColorValueViolet

	mockColumnTemplateDatabase := NewMockColumnTemplateDatabase(t)
	mockColumnTemplateDatabase.EXPECT().Update(mock.Anything, DatabaseColumnTemplateUpdate{
		ID:            id,
		BoardTemplate: board,
		Name:          name,
		Description:   description,
		Color:         color,
	}).
		Return(DatabaseColumnTemplate{
			ID:            id,
			BoardTemplate: board,
			Name:          name,
			Description:   description,
			Color:         color,
		}, nil)

	columnTemplateService := NewColumnTemplateService(mockColumnTemplateDatabase)

	column, err := columnTemplateService.Update(context.Background(), ColumnTemplateUpdateRequest{
		ID:            id,
		BoardTemplate: board,
		Name:          name,
		Description:   description,
		Color:         color,
	})

	assert.Nil(t, err)
	assert.NotNil(t, column)

	assert.Equal(t, id, column.ID)
	assert.Equal(t, board, column.BoardTemplate)
	assert.Equal(t, name, column.Name)
	assert.Equal(t, description, column.Description)
	assert.Equal(t, color, column.Color)
}

func TestUpdateColumnTemplate_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	id := uuid.New()
	board := uuid.New()
	name := "New Name"
	description := "New Description"
	color := columns.ColorValueViolet

	mockColumnTemplateDatabase := NewMockColumnTemplateDatabase(t)
	mockColumnTemplateDatabase.EXPECT().Update(mock.Anything, DatabaseColumnTemplateUpdate{
		ID:            id,
		BoardTemplate: board,
		Name:          name,
		Description:   description,
		Color:         color,
	}).
		Return(DatabaseColumnTemplate{}, dbError)

	columnTemplateService := NewColumnTemplateService(mockColumnTemplateDatabase)

	column, err := columnTemplateService.Update(context.Background(), ColumnTemplateUpdateRequest{
		ID:            id,
		BoardTemplate: board,
		Name:          name,
		Description:   description,
		Color:         color,
	})

	assert.Nil(t, column)
	assert.NotNil(t, err)
	assert.Equal(t, dbError, err)
}

func TestUpdateColumnTemplate_NegativeIndex(t *testing.T) {
	id := uuid.New()
	board := uuid.New()
	name := "New Name"
	description := "New Description"
	color := columns.ColorValueViolet
	index := -1

	mockColumnTemplateDatabase := NewMockColumnTemplateDatabase(t)
	mockColumnTemplateDatabase.EXPECT().Update(mock.Anything, DatabaseColumnTemplateUpdate{
		ID:            id,
		BoardTemplate: board,
		Name:          name,
		Description:   description,
		Color:         color,
		Index:         0,
	}).
		Return(DatabaseColumnTemplate{
			ID:            id,
			BoardTemplate: board,
			Name:          name,
			Description:   description,
			Color:         color,
			Index:         0,
		}, nil)

	columnTemplateService := NewColumnTemplateService(mockColumnTemplateDatabase)

	column, err := columnTemplateService.Update(context.Background(), ColumnTemplateUpdateRequest{
		ID:            id,
		BoardTemplate: board,
		Name:          name,
		Description:   description,
		Color:         color,
		Index:         index,
	})

	assert.Nil(t, err)
	assert.NotNil(t, column)

	assert.Equal(t, id, column.ID)
	assert.Equal(t, board, column.BoardTemplate)
	assert.Equal(t, name, column.Name)
	assert.Equal(t, description, column.Description)
	assert.Equal(t, color, column.Color)
	assert.Equal(t, 0, column.Index)
}

func TestDeleteColumnTemplate(t *testing.T) {
	boardId := uuid.New()
	columnId := uuid.New()

	mockColumnTemplateDatabase := NewMockColumnTemplateDatabase(t)
	mockColumnTemplateDatabase.EXPECT().Delete(mock.Anything, boardId, columnId).Return(nil)

	columnTemplateService := NewColumnTemplateService(mockColumnTemplateDatabase)

	err := columnTemplateService.Delete(context.Background(), boardId, columnId)

	assert.Nil(t, err)
}

func TestDeleteColumnTemplate_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	boardId := uuid.New()
	columnId := uuid.New()

	mockColumnTemplateDatabase := NewMockColumnTemplateDatabase(t)
	mockColumnTemplateDatabase.EXPECT().Delete(mock.Anything, boardId, columnId).Return(dbError)

	columnTemplateService := NewColumnTemplateService(mockColumnTemplateDatabase)

	err := columnTemplateService.Delete(context.Background(), boardId, columnId)

	assert.NotNil(t, err)
	assert.Equal(t, dbError, err)
}
