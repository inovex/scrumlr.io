package board_templates

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/database"
	"scrumlr.io/server/logger"
)

func (s *BoardTemplateService) CreateColumnTemplate(ctx context.Context, body dto.ColumnTemplateRequest) (*dto.ColumnTemplate, error) {
	tColumn, err := s.database.CreateColumnTemplate(database.ColumnTemplateInsert{BoardTemplate: body.BoardTemplate, Name: body.Name, Description: body.Description, Color: body.Color, Visible: body.Visible, Index: body.Index})
	if err != nil {
		logger.Get().Errorw("unable to create column template", "err", err)
		return nil, err
	}
	return new(dto.ColumnTemplate).From(tColumn), err
}

func (s *BoardTemplateService) GetColumnTemplate(ctx context.Context, boardTemplate, columnTemplate uuid.UUID) (*dto.ColumnTemplate, error) {
	log := logger.FromContext(ctx)
	tColumn, err := s.database.GetColumnTemplate(boardTemplate, columnTemplate)
	if err != nil {
		log.Errorw("unable to get template column", "board", boardTemplate, "error", err)
		return nil, fmt.Errorf("unable to get template column: %w", err)
	}
	return new(dto.ColumnTemplate).From(tColumn), err
}

func (s *BoardTemplateService) ListColumnTemplates(ctx context.Context, boardTemplate uuid.UUID) ([]*dto.ColumnTemplate, error) {
	log := logger.FromContext(ctx)
	tColumns, err := s.database.ListColumnTemplates(boardTemplate)
	if err != nil {
		log.Errorw("unable to get template columns", "board", boardTemplate, "error", err)
		return nil, fmt.Errorf("unable to get template columns: %w", err)
	}
	return dto.ColumnTemplates(tColumns), err
}

func (s *BoardTemplateService) UpdateColumnTemplate(_ context.Context, body dto.ColumnTemplateUpdateRequest) (*dto.ColumnTemplate, error) {
	tColumn, err := s.database.UpdateColumnTemplate(database.ColumnTemplateUpdate{ID: body.ID, BoardTemplate: body.BoardTemplate, Name: body.Name, Description: body.Description, Color: body.Color, Visible: body.Visible, Index: body.Index})
	if err != nil {
		logger.Get().Errorw("unable to update column template", "err", err)
		return nil, err
	}
	return new(dto.ColumnTemplate).From(tColumn), err
}

func (s *BoardTemplateService) DeleteColumnTemplate(_ context.Context, board, column, user uuid.UUID) error {
	err := s.database.DeleteColumnTemplate(board, column, user)
	if err != nil {
		logger.Get().Errorw("unable to delete column template", "err", err)
		return err
	}
	return err
}
