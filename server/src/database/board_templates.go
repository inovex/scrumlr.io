package database

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
)

type BoardTemplate struct {
	bun.BaseModel `bun:"table:board_templates"`
	ID            uuid.UUID
	Creator       uuid.UUID
	Name          *string
	Description   *string
	AccessPolicy  types.AccessPolicy
	Favourite     *bool
	CreatedAt     time.Time
}

type BoardTemplateFull struct {
	bun.BaseModel   `bun:"table:board_templates"`
	ID              uuid.UUID
	Creator         uuid.UUID
	Name            *string
	Description     *string
	AccessPolicy    types.AccessPolicy
	Favourite       *bool
	ColumnTemplates []ColumnTemplate
	CreatedAt       time.Time
}

type BoardTemplateInsert struct {
	bun.BaseModel `bun:"table:board_templates"`
	Creator       uuid.UUID
	Name          *string
	Description   *string
	AccessPolicy  types.AccessPolicy
	Favourite     *bool
}

type BoardTemplateUpdate struct {
	bun.BaseModel `bun:"table:board_templates"`
	ID            uuid.UUID
	Name          *string
	Description   *string
	AccessPolicy  *types.AccessPolicy
	Favourite     *bool
}

func (d *Database) CreateBoardTemplate(board BoardTemplateInsert, columns []ColumnTemplateInsert) (BoardTemplate, error) {
	boardInsert := d.db.NewInsert().Model(&board).Returning("*")

	var b BoardTemplate
	query := d.db.NewSelect().With("createdBoardTemplate", boardInsert)
	if len(columns) > 0 {
		for index := range columns {
			newColumnIndex := index
			columns[index].Index = &newColumnIndex
		}

		// create columns
		query = query.With("createdColumns", d.db.NewInsert().
			Model(&columns).
			Value("board_template", "(SELECT id FROM \"createdBoardTemplate\")"))
	}

	err := query.Table("createdBoardTemplate").Column("*").Scan(context.Background(), &b)
	if err != nil {
		return BoardTemplate{}, err
	}

	return b, err
}

func (d *Database) GetBoardTemplate(id uuid.UUID) (BoardTemplate, error) {
	var tBoard BoardTemplate

	// Get settings
	err := d.db.NewSelect().Model(&tBoard).Where("id = ?", id).Scan(context.Background())
	if err != nil {
		return BoardTemplate{}, err
	}

	return tBoard, err
}

func (d *Database) GetBoardTemplates(user uuid.UUID) ([]BoardTemplateFull, error) {
	var tBoards []BoardTemplate

	// note that if no templates match, nil is returned
	err := d.db.NewSelect().Model(&tBoards).Where("creator = ?", user).Order("created_at ASC").Scan(context.Background())
	if err != nil {
		return []BoardTemplateFull{}, err
	}

	var templates []BoardTemplateFull
	for _, board := range tBoards {
		var cols []ColumnTemplate
		err = d.db.NewSelect().Model(&cols).Where("board_template = ?", board.ID).Scan(context.Background())
		if err != nil {
			return []BoardTemplateFull{}, err
		}

		dbBoardTemplate := BoardTemplateFull{
			ID:              board.ID,
			Creator:         board.Creator,
			Name:            board.Name,
			Description:     board.Description,
			AccessPolicy:    board.AccessPolicy,
			Favourite:       board.Favourite,
			CreatedAt:       board.CreatedAt,
			ColumnTemplates: cols,
		}
		templates = append(templates, dbBoardTemplate)
	}

	return templates, err
}

func (d *Database) UpdateBoardTemplate(board BoardTemplateUpdate) (BoardTemplate, error) {
	// General Settings
	query_settings := d.db.NewUpdate().Model(&board)

	if board.Name != nil {
		query_settings.Column("name")
	}

	if board.Description != nil {
		query_settings.Column("description")
	}

	if board.AccessPolicy != nil {
		query_settings.Column("access_policy")
	}

	if board.Favourite != nil {
		query_settings.Column("favourite")
	}

	var boardTemplate BoardTemplate
	_, err := query_settings.
		Where("id = ?", board.ID).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", d, "Result", &boardTemplate), &boardTemplate)

	if err != nil {
		logger.Get().Errorw("failed to update board template settings", "board", board.ID, "err", err)
		return BoardTemplate{}, err
	}

	return boardTemplate, err
}

func (d *Database) DeleteBoardTemplate(templateId uuid.UUID) error {
	_, err := d.db.NewDelete().Model((*BoardTemplate)(nil)).Where("id = ?", templateId).Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardTemplateIdentifier, templateId))
	return err
}
