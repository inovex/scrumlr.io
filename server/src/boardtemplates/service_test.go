package boardtemplates

import (
	"context"
	"errors"
	"scrumlr.io/server/board"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/columntemplates"
)

func TestCreateBoardTemplate(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	name := "Template"
	description := "This is a description"
	access := board.ByInvite
	firstColumnName := "Column 1"
	secondColumnName := "column 2"
	firstColumnDescription := "This is Column 1"
	secondColumnDescription := "This is Column 2"
	firstColumnIndex := 0
	secondColumnIndex := 1
	visible := true

	mockBoardTemplateDatabase := NewMockBoardTemplateDatabase(t)
	mockBoardTemplateDatabase.EXPECT().Create(DatabaseBoardTemplateInsert{
		Creator:      userId,
		Name:         &name,
		Description:  &description,
		AccessPolicy: access,
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
			ID:           boardId,
			Creator:      userId,
			Name:         &name,
			Description:  &description,
			AccessPolicy: access,
		}, nil)

	boardTemplateService := NewBoardTemplateService(mockBoardTemplateDatabase)

	board, err := boardTemplateService.Create(context.Background(), CreateBoardTemplateRequest{
		Creator:      userId,
		Name:         &name,
		Description:  &description,
		AccessPolicy: access,
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
	assert.Equal(t, access, board.AccessPolicy)
}

func TestCreateBoardTemplate_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	userId := uuid.New()
	name := "Template"
	description := "This is a description"
	access := board.ByInvite
	firstColumnName := "Column 1"
	secondColumnName := "column 2"
	firstColumnDescription := "This is Column 1"
	secondColumnDescription := "This is Column 2"
	firstColumnIndex := 0
	secondColumnIndex := 1
	visible := true

	mockBoardTemplateDatabase := NewMockBoardTemplateDatabase(t)
	mockBoardTemplateDatabase.EXPECT().Create(DatabaseBoardTemplateInsert{
		Creator:      userId,
		Name:         &name,
		Description:  &description,
		AccessPolicy: access,
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
		Creator:      userId,
		Name:         &name,
		Description:  &description,
		AccessPolicy: access,
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
	access := board.ByInvite

	mockBoardTemplateDatabase := NewMockBoardTemplateDatabase(t)
	mockBoardTemplateDatabase.EXPECT().Get(boardId).
		Return(DatabaseBoardTemplate{
			ID:           boardId,
			Creator:      userId,
			Name:         &name,
			Description:  &description,
			AccessPolicy: access,
		}, nil)

	boardTemplateService := NewBoardTemplateService(mockBoardTemplateDatabase)

	board, err := boardTemplateService.Get(context.Background(), boardId)

	assert.Nil(t, err)
	assert.NotNil(t, board)

	assert.Equal(t, boardId, board.ID)
	assert.Equal(t, userId, board.Creator)
	assert.Equal(t, &name, board.Name)
	assert.Equal(t, &description, board.Description)
	assert.Equal(t, access, board.AccessPolicy)
}

func TestGetBoardTemplate_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	id := uuid.New()

	mockBoardTemplateDatabase := NewMockBoardTemplateDatabase(t)
	mockBoardTemplateDatabase.EXPECT().Get(id).
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
	mockBoardTemplateDatabase.EXPECT().GetAll(userId).
		Return([]DatabaseBoardTemplateFull{
			{
				ID:      firstBoardId,
				Creator: userId,
				Name:    &firstBoardName,
				ColumnTemplates: []columntemplates.DatabaseColumnTemplate{
					{
						ID:   firstColumnId,
						Name: firstColumnName,
					},
				},
			},
			{
				ID:      secondBoardId,
				Creator: userId,
				Name:    &secondBoardName,
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

	assert.Equal(t, firstBoardId, boards[0].ID)
	assert.Equal(t, &firstBoardName, boards[0].Name)
	assert.Equal(t, userId, boards[0].Creator)
	assert.Len(t, boards[0].ColumnTemplates, 1)
	assert.Equal(t, firstColumnId, boards[0].ColumnTemplates[0].ID)
	assert.Equal(t, firstColumnName, boards[0].ColumnTemplates[0].Name)

	assert.Equal(t, secondBoardId, boards[1].ID)
	assert.Equal(t, &secondBoardName, boards[1].Name)
	assert.Equal(t, userId, boards[1].Creator)
	assert.Len(t, boards[1].ColumnTemplates, 1)
	assert.Equal(t, secondColumnId, boards[1].ColumnTemplates[0].ID)
	assert.Equal(t, secondColumnName, boards[1].ColumnTemplates[0].Name)
}

func TestGetAllBoardTemplate_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	userId := uuid.New()

	mockBoardTemplateDatabase := NewMockBoardTemplateDatabase(t)
	mockBoardTemplateDatabase.EXPECT().GetAll(userId).
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
	access := board.ByInvite

	mockBoardTemplateDatabase := NewMockBoardTemplateDatabase(t)
	mockBoardTemplateDatabase.EXPECT().Update(DatabaseBoardTemplateUpdate{
		ID:           boardId,
		Name:         &name,
		Description:  &description,
		AccessPolicy: &access,
	}).
		Return(DatabaseBoardTemplate{
			ID:           boardId,
			Creator:      userId,
			Name:         &name,
			Description:  &description,
			AccessPolicy: access,
		}, nil)

	boardTemplateService := NewBoardTemplateService(mockBoardTemplateDatabase)

	board, err := boardTemplateService.Update(context.Background(), BoardTemplateUpdateRequest{
		ID:           boardId,
		Name:         &name,
		Description:  &description,
		AccessPolicy: &access,
	})

	assert.Nil(t, err)
	assert.NotNil(t, board)
}

func TestUpdateBoardTemplate_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	boardId := uuid.New()
	name := "Template"
	description := "This is a description"
	access := board.ByInvite

	mockBoardTemplateDatabase := NewMockBoardTemplateDatabase(t)
	mockBoardTemplateDatabase.EXPECT().Update(DatabaseBoardTemplateUpdate{
		ID:           boardId,
		Name:         &name,
		Description:  &description,
		AccessPolicy: &access,
	}).
		Return(DatabaseBoardTemplate{}, dbError)

	boardTemplateService := NewBoardTemplateService(mockBoardTemplateDatabase)

	board, err := boardTemplateService.Update(context.Background(), BoardTemplateUpdateRequest{
		ID:           boardId,
		Name:         &name,
		Description:  &description,
		AccessPolicy: &access,
	})

	assert.Nil(t, board)
	assert.NotNil(t, err)
	assert.Equal(t, dbError, err)
}

func TestDeleteBoardTemplate(t *testing.T) {
	id := uuid.New()

	mockBoardTemplateDatabase := NewMockBoardTemplateDatabase(t)
	mockBoardTemplateDatabase.EXPECT().Delete(id).Return(nil)

	boardTemplateService := NewBoardTemplateService(mockBoardTemplateDatabase)

	err := boardTemplateService.Delete(context.Background(), id)

	assert.Nil(t, err)
}

func TestDeleteBoardTemplate_DatabaseError(t *testing.T) {
	dbError := errors.New("Database error")
	id := uuid.New()

	mockBoardTemplateDatabase := NewMockBoardTemplateDatabase(t)
	mockBoardTemplateDatabase.EXPECT().Delete(id).Return(dbError)

	boardTemplateService := NewBoardTemplateService(mockBoardTemplateDatabase)

	err := boardTemplateService.Delete(context.Background(), id)

	assert.NotNil(t, err)
	assert.Equal(t, dbError, err)
}
