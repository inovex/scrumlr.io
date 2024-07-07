package board_templates

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/logger"
)

func (s *BoardTemplateService) ListTemplateColumns(ctx context.Context, boardID uuid.UUID) ([]*dto.ColumnTemplate, error) {
	log := logger.FromContext(ctx)
	tColumns, err := s.database.GetTemplateColumns(boardID)
	if err != nil {
		log.Errorw("unable to get template columns", "boardemplate", boardID, "error", err)
		return nil, fmt.Errorf("unable to get columns: %w", err)
	}
	return dto.ColumnTemplates(tColumns), err
}
