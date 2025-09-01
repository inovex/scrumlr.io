package columntemplates

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"scrumlr.io/server/logger"
)

type ColumnTemplateDatabase interface {
	Create(column DatabaseColumnTemplateInsert) (DatabaseColumnTemplate, error)
	Get(board, id uuid.UUID) (DatabaseColumnTemplate, error)
	GetAll(board uuid.UUID) ([]DatabaseColumnTemplate, error)
	Update(column DatabaseColumnTemplateUpdate) (DatabaseColumnTemplate, error)
	Delete(board, column uuid.UUID) error
}

type Service struct {
	database ColumnTemplateDatabase
}

func NewColumnTemplateService(db ColumnTemplateDatabase) ColumnTemplateService {
	service := new(Service)
	service.database = db

	return service
}

func (service *Service) Create(ctx context.Context, body ColumnTemplateRequest) (*ColumnTemplate, error) {
	log := logger.FromContext(ctx)
	column, err := service.database.Create(DatabaseColumnTemplateInsert{
		BoardTemplate: body.BoardTemplate,
		Name:          body.Name,
		Description:   body.Description,
		Color:         body.Color,
		Visible:       body.Visible,
		Index:         body.Index,
	})

	if err != nil {
		log.Errorw("unable to create column template", "user", body.User, "err", err)
		return nil, err
	}

	return new(ColumnTemplate).From(column), err
}

func (service *Service) Get(ctx context.Context, boardTemplate, columnTemplate uuid.UUID) (*ColumnTemplate, error) {
	log := logger.FromContext(ctx)
	column, err := service.database.Get(boardTemplate, columnTemplate)
	if err != nil {
		log.Errorw("unable to get template column", "board", boardTemplate, "err", err)
		return nil, fmt.Errorf("unable to get template column: %w", err)
	}

	return new(ColumnTemplate).From(column), err
}

func (service *Service) GetAll(ctx context.Context, boardTemplate uuid.UUID) ([]*ColumnTemplate, error) {
	log := logger.FromContext(ctx)
	columns, err := service.database.GetAll(boardTemplate)
	if err != nil {
		log.Errorw("unable to get template columns", "board", boardTemplate, "err", err)
		return nil, fmt.Errorf("unable to get template columns: %w", err)
	}

	return ColumnTemplates(columns), err
}

func (service *Service) Update(ctx context.Context, body ColumnTemplateUpdateRequest) (*ColumnTemplate, error) {
	log := logger.FromContext(ctx)
	column, err := service.database.Update(DatabaseColumnTemplateUpdate{ID: body.ID, BoardTemplate: body.BoardTemplate, Name: body.Name, Description: body.Description, Color: body.Color, Visible: body.Visible, Index: body.Index})
	if err != nil {
		log.Errorw("unable to update column template", "board", body.BoardTemplate, "column", body.ID, "err", err)
		return nil, err
	}

	return new(ColumnTemplate).From(column), err
}

func (service *Service) Delete(ctx context.Context, board, column, user uuid.UUID) error {
	log := logger.FromContext(ctx)
	err := service.database.Delete(board, column)
	if err != nil {
		log.Errorw("unable to delete column template", "board", board, "column", column, "err", err)
		return err
	}

	return err
}
