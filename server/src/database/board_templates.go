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
	bun.BaseModel   `bun:"table:board_templates"`
	ID              uuid.UUID
	Creator         uuid.UUID
	Name            *string
	Description     *string
	AccessPolicy    types.AccessPolicy
	Favourite       *bool
	CreatedAt       time.Time
	ColumnTemplates []ColumnTemplate
}

type BoardTemplateGetter struct {
	bun.BaseModel `bun:"table:board_templates"`
	ID            uuid.UUID
	Creator       uuid.UUID
	Name          *string
	Description   *string
	AccessPolicy  types.AccessPolicy
	Favourite     *bool
	CreatedAt     time.Time
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

		query = query.With("createdColumns", d.db.NewInsert().
			Model(&columns).
			Value("board_template", "(SELECT id FROM \"createdBoardTemplate\")"))
	}

	err := query.Table("createdBoardTemplate").Column("*").Scan(context.Background(), &b)
	if err != nil {
		return BoardTemplate{}, err
	}

	err = d.db.NewSelect().Model(&b.ColumnTemplates).Where("board_template = ?", b.ID).Scan(context.Background())
	if err != nil {
		return BoardTemplate{}, err
	}

	return b, err
}

func (d *Database) GetBoardTemplate(id uuid.UUID) (BoardTemplate, error) {
	var tBoard BoardTemplateGetter

	// Get settings
	err := d.db.NewSelect().Model(&tBoard).Where("id = ?", id).Scan(context.Background())
	if err != nil {
		return BoardTemplate{}, err
	}

	// Get columns
	var tColumns []ColumnTemplate
	err = d.db.NewSelect().Model(&tColumns).Where("board_template = ?", tBoard.ID).Order("index ASC").Scan(context.Background())
	if err != nil {
		return BoardTemplate{}, err
	}

	dbBoardTemplate := BoardTemplate{
		ID:              tBoard.ID,
		Creator:         tBoard.Creator,
		Name:            tBoard.Name,
		Description:     tBoard.Description,
		AccessPolicy:    tBoard.AccessPolicy,
		Favourite:       tBoard.Favourite,
		ColumnTemplates: tColumns,
	}

	return dbBoardTemplate, err
}

func (d *Database) GetBoardTemplates(user uuid.UUID) ([]BoardTemplate, error) {
	var tBoards []BoardTemplateGetter

	err := d.db.NewSelect().Model(&tBoards).Where("creator = ?", user).Order("created_at ASC").Scan(context.Background())
	if err != nil {
		return []BoardTemplate{}, err
	}

	var templates []BoardTemplate
	for _, board := range tBoards {
		var cols []ColumnTemplate
		err = d.db.NewSelect().Model(&cols).Where("board_template = ?", board.ID).Scan(context.Background())
		if err != nil {
			return []BoardTemplate{}, err
		}

		dbBoardTemplate := BoardTemplate{
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
