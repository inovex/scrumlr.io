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
	log := logger.FromContext(ctx)
	tColumn, err := s.database.CreateColumnTemplate(database.ColumnTemplateInsert{BoardTemplate: body.BoardTemplate, Name: body.Name, Description: body.Description, Color: body.Color, Visible: body.Visible, Index: body.Index})
	if err != nil {
		log.Errorw("unable to create column template", "user", body.User, "err", err)
		return nil, err
	}
	return new(dto.ColumnTemplate).From(tColumn), err
}

func (s *BoardTemplateService) GetColumnTemplate(ctx context.Context, boardTemplate, columnTemplate uuid.UUID) (*dto.ColumnTemplate, error) {
	log := logger.FromContext(ctx)
	tColumn, err := s.database.GetColumnTemplate(boardTemplate, columnTemplate)
	if err != nil {
		log.Errorw("unable to get template column", "board", boardTemplate, "err", err)
		return nil, fmt.Errorf("unable to get template column: %w", err)
	}
	return new(dto.ColumnTemplate).From(tColumn), err
}

func (s *BoardTemplateService) ListColumnTemplates(ctx context.Context, boardTemplate uuid.UUID) ([]*dto.ColumnTemplate, error) {
	log := logger.FromContext(ctx)
	tColumns, err := s.database.ListColumnTemplates(boardTemplate)
	if err != nil {
		log.Errorw("unable to get template columns", "board", boardTemplate, "err", err)
		return nil, fmt.Errorf("unable to get template columns: %w", err)
	}
	return dto.ColumnTemplates(tColumns), err
}

func (s *BoardTemplateService) UpdateColumnTemplate(ctx context.Context, body dto.ColumnTemplateUpdateRequest) (*dto.ColumnTemplate, error) {
	log := logger.FromContext(ctx)
	tColumn, err := s.database.UpdateColumnTemplate(database.ColumnTemplateUpdate{ID: body.ID, BoardTemplate: body.BoardTemplate, Name: body.Name, Description: body.Description, Color: body.Color, Visible: body.Visible, Index: body.Index})
	if err != nil {
		log.Errorw("unable to update column template", "board", body.BoardTemplate, "column", body.ID, "err", err)
		return nil, err
	}
	return new(dto.ColumnTemplate).From(tColumn), err
}

func (s *BoardTemplateService) DeleteColumnTemplate(ctx context.Context, board, column, user uuid.UUID) error {
	log := logger.FromContext(ctx)
	err := s.database.DeleteColumnTemplate(board, column, user)
	if err != nil {
		log.Errorw("unable to delete column template", "board", board, "column", column, "err", err)
		return err
	}
	return err
}
