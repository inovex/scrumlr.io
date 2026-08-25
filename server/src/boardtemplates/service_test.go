package boardtemplates

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/columntemplates"
	"scrumlr.io/server/timeprovider"
)

type ServiceMocks struct {
	db    *MockBoardTemplateDatabase
	cols  *columntemplates.MockColumnTemplateService
	clock *timeprovider.MockTimeProvider
}

func SetupBoardTemplateService(t *testing.T) (BoardTemplateService, ServiceMocks) {
	mocks := ServiceMocks{
		db:    NewMockBoardTemplateDatabase(t),
		cols:  columntemplates.NewMockColumnTemplateService(t),
		clock: timeprovider.NewMockTimeProvider(t),
	}

	service := NewBoardTemplateService(mocks.db, mocks.cols, mocks.clock)

	return service, mocks
}

func TestCreateBoardTemplate(t *testing.T) {
	service, mocks := SetupBoardTemplateService(t)

	boardId := uuid.New()
	userId := uuid.New()
	name := "Template"
	description := "This is a description"
	firstColumnName := "Column 1"
	firstColumnDescription := "This is Column 1"
	firstColumnIndex := 0
	visible := true

	mocks.db.EXPECT().Create(mock.Anything, DatabaseBoardTemplateInsert{
		Creator:     userId,
		Name:        &name,
		Description: &description,
	}).
		Return(DatabaseBoardTemplate{
			ID:          boardId,
			Creator:     userId,
			Name:        &name,
			Description: &description,
		}, nil)

	mocks.cols.EXPECT().Create(mock.Anything,
		columntemplates.ColumnTemplateRequest{
			BoardTemplate: boardId,
			User:          userId,
			Name:          firstColumnName,
			Description:   firstColumnDescription,
			Visible:       &visible,
			Index:         &firstColumnIndex,
		},
	).Return(&columntemplates.ColumnTemplate{
		BoardTemplate: boardId,
		Name:          firstColumnName,
		Description:   firstColumnDescription,
		Visible:       visible,
		Index:         firstColumnIndex,
	}, nil)

	board, err := service.Create(context.Background(), CreateBoardTemplateRequest{
		Creator:     userId,
		Name:        &name,
		Description: &description,
		Columns: []*columntemplates.ColumnTemplateRequest{
			{
				Name:        firstColumnName,
				Description: firstColumnDescription,
				Visible:     &visible,
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
	service, mocks := SetupBoardTemplateService(t)

	dbError := errors.New("Database error")
	userId := uuid.New()
	name := "Template"
	description := "This is a description"
	firstColumnName := "Column 1"
	secondColumnName := "column 2"
	firstColumnDescription := "This is Column 1"
	secondColumnDescription := "This is Column 2"
	visible := true

	mocks.db.EXPECT().Create(mock.Anything, DatabaseBoardTemplateInsert{
		Creator:     userId,
		Name:        &name,
		Description: &description,
	}).
		Return(DatabaseBoardTemplate{}, dbError)

	board, err := service.Create(context.Background(), CreateBoardTemplateRequest{
		Creator:     userId,
		Name:        &name,
		Description: &description,
		Columns: []*columntemplates.ColumnTemplateRequest{
			{
				Name:        firstColumnName,
				Description: firstColumnDescription,
				Visible:     &visible,
				Index:       new(0),
			},
			{
				Name:        secondColumnName,
				Description: secondColumnDescription,
				Visible:     &visible,
				Index:       new(1),
			},
		},
	})

	assert.Nil(t, board)
	assert.NotNil(t, err)
	assert.ErrorIs(t, err, dbError)
}

func TestGetBoardTemplate(t *testing.T) {
	service, mocks := SetupBoardTemplateService(t)

	boardId := uuid.New()
	userId := uuid.New()
	name := "Template"
	description := "This is a description"

	mocks.db.EXPECT().Get(mock.Anything, boardId).
		Return(DatabaseBoardTemplate{
			ID:          boardId,
			Creator:     userId,
			Name:        &name,
			Description: &description,
		}, nil)

	board, err := service.Get(context.Background(), boardId)

	assert.Nil(t, err)
	assert.NotNil(t, board)

	assert.Equal(t, boardId, board.ID)
	assert.Equal(t, userId, board.Creator)
	assert.Equal(t, &name, board.Name)
	assert.Equal(t, &description, board.Description)
}

func TestGetBoardTemplate_DatabaseError(t *testing.T) {
	service, mocks := SetupBoardTemplateService(t)

	dbError := errors.New("Database error")
	id := uuid.New()

	mocks.db.EXPECT().Get(mock.Anything, id).
		Return(DatabaseBoardTemplate{}, dbError)

	board, err := service.Get(context.Background(), id)

	assert.Nil(t, board)
	assert.NotNil(t, err)
	assert.ErrorIs(t, err, dbError)
}

func TestGetAllBoardTemplate(t *testing.T) {
	service, mocks := SetupBoardTemplateService(t)

	userId := uuid.New()
	firstBoardId := uuid.New()
	secondBoardId := uuid.New()
	firstBoardName := "Board 1"
	secondBoardName := "Board 2"
	firstColumnId := uuid.New()
	secondColumnId := uuid.New()
	firstColumnName := "Column 1"
	secondColumnName := "Column 2"

	mocks.db.EXPECT().GetAll(mock.Anything, userId).
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

	boards, err := service.GetAll(context.Background(), userId)

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
	service, mocks := SetupBoardTemplateService(t)

	dbError := errors.New("Database error")
	userId := uuid.New()

	mocks.db.EXPECT().GetAll(mock.Anything, userId).
		Return([]DatabaseBoardTemplateFull{}, dbError)

	board, err := service.GetAll(context.Background(), userId)

	assert.Nil(t, board)
	assert.NotNil(t, err)
	assert.ErrorIs(t, err, dbError)
}

func TestUpdateBoardTemplate(t *testing.T) {
	service, mocks := SetupBoardTemplateService(t)

	boardId := uuid.New()
	userId := uuid.New()
	name := "Template"
	description := "This is a description"
	fixedTime := time.Date(2026, time.August, 25, 12, 0, 0, 0, time.UTC)

	mocks.clock.EXPECT().Now().Return(fixedTime)
	mocks.db.EXPECT().Update(mock.Anything, DatabaseBoardTemplateUpdate{
		ID:          boardId,
		Name:        &name,
		Description: &description,
		ModifiedAt:  fixedTime,
	}).
		Return(DatabaseBoardTemplate{
			ID:          boardId,
			Creator:     userId,
			Name:        &name,
			Description: &description,
			ModifiedAt:  fixedTime,
		}, nil)

	board, err := service.Update(context.Background(), BoardTemplateUpdateRequest{
		ID:          boardId,
		Name:        &name,
		Description: &description,
	})

	assert.Nil(t, err)
	assert.NotNil(t, board)
}

func TestUpdateBoardTemplate_DatabaseError(t *testing.T) {
	service, mocks := SetupBoardTemplateService(t)

	dbError := errors.New("Database error")
	boardId := uuid.New()
	name := "Template"
	description := "This is a description"
	fixedTime := time.Date(2026, time.August, 25, 12, 0, 0, 0, time.UTC)

	mocks.clock.EXPECT().Now().Return(fixedTime)
	mocks.db.EXPECT().Update(mock.Anything, DatabaseBoardTemplateUpdate{
		ID:          boardId,
		Name:        &name,
		Description: &description,
		ModifiedAt:  fixedTime,
	}).
		Return(DatabaseBoardTemplate{}, dbError)

	board, err := service.Update(context.Background(), BoardTemplateUpdateRequest{
		ID:          boardId,
		Name:        &name,
		Description: &description,
	})

	assert.Nil(t, board)
	assert.NotNil(t, err)
	assert.ErrorIs(t, err, dbError)
}

func TestDeleteBoardTemplate(t *testing.T) {
	service, mocks := SetupBoardTemplateService(t)

	id := uuid.New()

	mocks.db.EXPECT().Delete(mock.Anything, id).Return(nil)

	err := service.Delete(context.Background(), id)

	assert.Nil(t, err)
}

func TestDeleteBoardTemplate_DatabaseError(t *testing.T) {
	service, mocks := SetupBoardTemplateService(t)

	dbError := errors.New("Database error")
	id := uuid.New()

	mocks.db.EXPECT().Delete(mock.Anything, id).Return(dbError)

	err := service.Delete(context.Background(), id)

	assert.NotNil(t, err)
	assert.ErrorIs(t, err, dbError)
}
