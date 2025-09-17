package boardtemplates

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/columntemplates"
)

func TestCreateBoardTemplate(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	name := "Template"
	description := "This is a description"
	firstColumnName := "Column 1"
	secondColumnName := "column 2"
	firstColumnDescription := "This is Column 1"
	secondColumnDescription := "This is Column 2"
	firstColumnIndex := 0
	secondColumnIndex := 1
	visible := true

	mockBoardTemplateDatabase := NewMockBoardTemplateDatabase(t)
	mockBoardTemplateDatabase.EXPECT().Create(mock.Anything, DatabaseBoardTemplateInsert{
		Creator:     userId,
		Name:        &name,
		Description: &description,
	}, []columntemplates.DatabaseColumnTemplateInsert{
		{
			Name:        firstColumnName,
			Description: firstColumnDescription,
			Visible:     &visible,
			Index:       &firstColumnIndex,
		},
		{
			Name:        secondColumnName,
			Description: secondColumnDescription,
			Visible:     &visible,
			Index:       &secondColumnIndex,
		},
	}).
		Return(DatabaseBoardTemplate{
			ID:          boardId,
			Creator:     userId,
			Name:        &name,
			Description: &description,
		}, nil)

	boardTemplateService := NewBoardTemplateService(mockBoardTemplateDatabase)

	board, err := boardTemplateService.Create(context.Background(), CreateBoardTemplateRequest{
		Creator:     userId,
		Name:        &name,
		Description: &description,
		Columns: []*columntemplates.ColumnTemplateRequest{
			{
				Name:        firstColumnName,
				Description: firstColumnDescription,
				Visible:     &visible,
				Index:       &firstColumnIndex,
			},
			{
				Name:        secondColumnName,
				Description: secondColumnDescription,
				Visible:     &visible,
				Index:       &secondColumnIndex,
			},
		},
	})

	assert.Nil(t, err)
	assert.NotNil(t, board)

	assert.Equal(t, boardId, board.ID)
	assert.Equal(t, userId, board.Creator)
	assert.Equal(t, &name, board.Name)
	assert.Equal(t, &description, board.Description)
}

func TestCreateBoardTemplate_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	userId := uuid.New()
	name := "Template"
	description := "This is a description"
	firstColumnName := "Column 1"
	secondColumnName := "column 2"
	firstColumnDescription := "This is Column 1"
	secondColumnDescription := "This is Column 2"
	firstColumnIndex := 0
	secondColumnIndex := 1
	visible := true

	mockBoardTemplateDatabase := NewMockBoardTemplateDatabase(t)
	mockBoardTemplateDatabase.EXPECT().Create(mock.Anything, DatabaseBoardTemplateInsert{
		Creator:     userId,
		Name:        &name,
		Description: &description,
	}, []columntemplates.DatabaseColumnTemplateInsert{
		{
			Name:        firstColumnName,
			Description: firstColumnDescription,
			Visible:     &visible,
			Index:       &firstColumnIndex,
		},
		{
			Name:        secondColumnName,
			Description: secondColumnDescription,
			Visible:     &visible,
			Index:       &secondColumnIndex,
		},
	}).
		Return(DatabaseBoardTemplate{}, dbError)

	boardTemplateService := NewBoardTemplateService(mockBoardTemplateDatabase)

	board, err := boardTemplateService.Create(context.Background(), CreateBoardTemplateRequest{
		Creator:     userId,
		Name:        &name,
		Description: &description,
		Columns: []*columntemplates.ColumnTemplateRequest{
			{
				Name:        firstColumnName,
				Description: firstColumnDescription,
				Visible:     &visible,
				Index:       &firstColumnIndex,
			},
			{
				Name:        secondColumnName,
				Description: secondColumnDescription,
				Visible:     &visible,
				Index:       &secondColumnIndex,
			},
		},
	})

	assert.Nil(t, board)
	assert.NotNil(t, err)
	assert.Equal(t, dbError, err)
}

func TestGetBoardTemplate(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	name := "Template"
	description := "This is a description"

	mockBoardTemplateDatabase := NewMockBoardTemplateDatabase(t)
	mockBoardTemplateDatabase.EXPECT().Get(mock.Anything, boardId).
		Return(DatabaseBoardTemplate{
			ID:          boardId,
			Creator:     userId,
			Name:        &name,
			Description: &description,
		}, nil)

	boardTemplateService := NewBoardTemplateService(mockBoardTemplateDatabase)

	board, err := boardTemplateService.Get(context.Background(), boardId)

	assert.Nil(t, err)
	assert.NotNil(t, board)

	assert.Equal(t, boardId, board.ID)
	assert.Equal(t, userId, board.Creator)
	assert.Equal(t, &name, board.Name)
	assert.Equal(t, &description, board.Description)
}

func TestGetBoardTemplate_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	id := uuid.New()

	mockBoardTemplateDatabase := NewMockBoardTemplateDatabase(t)
	mockBoardTemplateDatabase.EXPECT().Get(mock.Anything, id).
		Return(DatabaseBoardTemplate{}, dbError)

	boardTemplateService := NewBoardTemplateService(mockBoardTemplateDatabase)

	board, err := boardTemplateService.Get(context.Background(), id)

	assert.Nil(t, board)
	assert.NotNil(t, err)
	assert.Equal(t, dbError, err)
}

func TestGetAllBoardTemplate(t *testing.T) {
	userId := uuid.New()
	firstBoardId := uuid.New()
	secondBoardId := uuid.New()
	firstBoardName := "Board 1"
	secondBoardName := "Board 2"
	firstColumnId := uuid.New()
	secondColumnId := uuid.New()
	firstColumnName := "Column 1"
	secondColumnName := "Column 2"

	mockBoardTemplateDatabase := NewMockBoardTemplateDatabase(t)
	mockBoardTemplateDatabase.EXPECT().GetAll(mock.Anything, userId).
		Return([]DatabaseBoardTemplateFull{
			{
				Template: DatabaseBoardTemplate{
					ID:      firstBoardId,
					Creator: userId,
					Name:    &firstBoardName,
				},
				ColumnTemplates: []columntemplates.DatabaseColumnTemplate{
					{
						ID:   firstColumnId,
						Name: firstColumnName,
					},
				},
			},
			{
				Template: DatabaseBoardTemplate{
					ID:      secondBoardId,
					Creator: userId,
					Name:    &secondBoardName,
				},
				ColumnTemplates: []columntemplates.DatabaseColumnTemplate{
					{
						ID:   secondColumnId,
						Name: secondColumnName,
					},
				},
			},
		}, nil)

	boardTemplateService := NewBoardTemplateService(mockBoardTemplateDatabase)

	boards, err := boardTemplateService.GetAll(context.Background(), userId)

	assert.Nil(t, err)
	assert.NotNil(t, boards)
	assert.Len(t, boards, 2)

	assert.Equal(t, firstBoardId, boards[0].Template.ID)
	assert.Equal(t, &firstBoardName, boards[0].Template.Name)
	assert.Equal(t, userId, boards[0].Template.Creator)
	assert.Len(t, boards[0].ColumnTemplates, 1)
	assert.Equal(t, firstColumnId, boards[0].ColumnTemplates[0].ID)
	assert.Equal(t, firstColumnName, boards[0].ColumnTemplates[0].Name)

	assert.Equal(t, secondBoardId, boards[1].Template.ID)
	assert.Equal(t, &secondBoardName, boards[1].Template.Name)
	assert.Equal(t, userId, boards[1].Template.Creator)
	assert.Len(t, boards[1].ColumnTemplates, 1)
	assert.Equal(t, secondColumnId, boards[1].ColumnTemplates[0].ID)
	assert.Equal(t, secondColumnName, boards[1].ColumnTemplates[0].Name)
}

func TestGetAllBoardTemplate_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	userId := uuid.New()

	mockBoardTemplateDatabase := NewMockBoardTemplateDatabase(t)
	mockBoardTemplateDatabase.EXPECT().GetAll(mock.Anything, userId).
		Return([]DatabaseBoardTemplateFull{}, dbError)

	boardTemplateService := NewBoardTemplateService(mockBoardTemplateDatabase)

	board, err := boardTemplateService.GetAll(context.Background(), userId)

	assert.Nil(t, board)
	assert.NotNil(t, err)
	assert.Equal(t, dbError, err)
}

func TestUpdateBoardTemplate(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	name := "Template"
	description := "This is a description"

	mockBoardTemplateDatabase := NewMockBoardTemplateDatabase(t)
	mockBoardTemplateDatabase.EXPECT().Update(mock.Anything, DatabaseBoardTemplateUpdate{
		ID:          boardId,
		Name:        &name,
		Description: &description,
	}).
		Return(DatabaseBoardTemplate{
			ID:          boardId,
			Creator:     userId,
			Name:        &name,
			Description: &description,
		}, nil)

	boardTemplateService := NewBoardTemplateService(mockBoardTemplateDatabase)

	board, err := boardTemplateService.Update(context.Background(), BoardTemplateUpdateRequest{
		ID:          boardId,
		Name:        &name,
		Description: &description,
	})

	assert.Nil(t, err)
	assert.NotNil(t, board)
}

func TestUpdateBoardTemplate_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	boardId := uuid.New()
	name := "Template"
	description := "This is a description"

	mockBoardTemplateDatabase := NewMockBoardTemplateDatabase(t)
	mockBoardTemplateDatabase.EXPECT().Update(mock.Anything, DatabaseBoardTemplateUpdate{
		ID:          boardId,
		Name:        &name,
		Description: &description,
	}).
		Return(DatabaseBoardTemplate{}, dbError)

	boardTemplateService := NewBoardTemplateService(mockBoardTemplateDatabase)

	board, err := boardTemplateService.Update(context.Background(), BoardTemplateUpdateRequest{
		ID:          boardId,
		Name:        &name,
		Description: &description,
	})

	assert.Nil(t, board)
	assert.NotNil(t, err)
	assert.Equal(t, dbError, err)
}

func TestDeleteBoardTemplate(t *testing.T) {
	id := uuid.New()

	mockBoardTemplateDatabase := NewMockBoardTemplateDatabase(t)
	mockBoardTemplateDatabase.EXPECT().Delete(mock.Anything, id).Return(nil)

	boardTemplateService := NewBoardTemplateService(mockBoardTemplateDatabase)

	err := boardTemplateService.Delete(context.Background(), id)

	assert.Nil(t, err)
}

func TestDeleteBoardTemplate_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	id := uuid.New()

	mockBoardTemplateDatabase := NewMockBoardTemplateDatabase(t)
	mockBoardTemplateDatabase.EXPECT().Delete(mock.Anything, id).Return(dbError)

	boardTemplateService := NewBoardTemplateService(mockBoardTemplateDatabase)

	err := boardTemplateService.Delete(context.Background(), id)

	assert.NotNil(t, err)
	assert.Equal(t, dbError, err)
}
