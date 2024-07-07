package database

import (
	"context"
	"errors"
	"fmt"
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
	Passphrase      *string
	Salt            *string
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
	Passphrase    *string
	Salt          *string
	CreatedAt     time.Time
}

type BoardTemplateInsert struct {
	bun.BaseModel `bun:"table:board_templates"`
	Creator       uuid.UUID
	Name          *string
	Description   *string
	AccessPolicy  types.AccessPolicy
	Passphrase    *string
	Salt          *string
}

type BoardTemplateUpdate struct {
	bun.BaseModel   `bun:"table:board_templates"`
	ID              uuid.UUID
	Name            *string
	Description     *string
	AccessPolicy    *types.AccessPolicy
	Passphrase      *string
	Salt            *string
	ColumnTemplates []*ColumnTemplate
}

func (d *Database) CreateBoardTemplate(board BoardTemplateInsert, columns []ColumnTemplateInsert) (BoardTemplate, error) {
	boardInsert := d.db.NewInsert().Model(&board).Returning("*")

	if board.AccessPolicy == types.AccessPolicyByPassphrase && (board.Passphrase == nil || board.Salt == nil) {
		return BoardTemplate{}, errors.New("passphrase or salt may not be empty")
	} else if board.AccessPolicy != types.AccessPolicyByPassphrase && (board.Passphrase != nil || board.Salt != nil) {
		return BoardTemplate{}, errors.New("passphrase or salt should not be set for policies except 'BY_PASSPHRASE'")
	}

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
		Passphrase:      tBoard.Passphrase,
		Salt:            tBoard.Salt,
		CreatedAt:       tBoard.CreatedAt,
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
			Passphrase:      board.Passphrase,
			Salt:            board.Salt,
			CreatedAt:       board.CreatedAt,
			ColumnTemplates: cols,
		}
		templates = append(templates, dbBoardTemplate)
	}

	return templates, err
}

func (d *Database) UpdateBoardTemplate(update BoardTemplateUpdate) (BoardTemplate, error) {
	// General Settings
	query_settings := d.db.NewUpdate().Model(&update)

	if update.Name != nil {
		query_settings.Column("name")
	}

	if update.Description != nil {
		query_settings.Column("description")
	}

	if update.Passphrase != nil {
		query_settings.Column("passphrase")
	}

	if update.AccessPolicy != nil {
		if *update.AccessPolicy == types.AccessPolicyByPassphrase && (update.Passphrase == nil || update.Salt == nil) {
			return BoardTemplate{}, errors.New("passphrase and salt should be set when access policy is updated")
		} else if *update.AccessPolicy != types.AccessPolicyByPassphrase && (update.Passphrase != nil || update.Salt != nil) {
			return BoardTemplate{}, errors.New("passphrase and salt should not be set if access policy is defined as 'BY_PASSPHRASE'")
		}

		if *update.AccessPolicy == types.AccessPolicyByInvite {
			query_settings.Where("access_policy = ?", types.AccessPolicyByInvite)
		} else {
			query_settings.Where("access_policy <> ?", types.AccessPolicyByInvite)
		}

		query_settings.Column("access_policy", "passphrase", "salt")
	}

	var boardTemplate BoardTemplate
	_, err := query_settings.
		Where("id = ?", update.ID).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", d, "Result", &boardTemplate), &boardTemplate)

	if err != nil {
		logger.Get().Errorw("failed to update board template settings", "board", update.ID, "err", err)
		return BoardTemplate{}, err
	}

	// columns
	cols_updated := []ColumnTemplate{}
	for _, col := range update.ColumnTemplates {
		column := ColumnTemplateUpdate{
			ID:            col.ID,
			BoardTemplate: col.BoardTemplate,
			Name:          col.Name,
			Description:   col.Description,
			Color:         col.Color,
			Visible:       col.Visible,
			Index:         col.Index,
		}

		// Update logic
		newIndex := column.Index
		if column.Index < 0 {
			newIndex = 0
		}

		selectPrevious := d.db.NewSelect().Model((*ColumnTemplate)(nil)).Column("board_template", "index").Where("id = ?", column.ID).Where("board_template = ?", column.BoardTemplate)
		maxIndexSelect := d.db.NewSelect().Model((*ColumnTemplate)(nil)).Column("index").Where("board_template = ?", column.BoardTemplate)
		updateOnSmallerIndex := d.db.NewUpdate().
			Model((*ColumnTemplate)(nil)).
			Column("index").
			Set("index = index+1").
			Where("index < (SELECT index FROM \"selectPrevious\")").
			Where("board_template = ?", column.BoardTemplate).
			Where("(SELECT index FROM \"selectPrevious\") > ?", newIndex).
			Where("index >= ?", newIndex)
		updateOnGreaterIndex := d.db.NewUpdate().
			Model((*ColumnTemplate)(nil)).
			Column("index").
			Set("index = index-1").
			Where("index > (SELECT index FROM \"selectPrevious\")").
			Where("board_template = ?", column.BoardTemplate).
			Where("(SELECT index FROM \"selectPrevious\") < ?", newIndex).
			Where("index <= ?", newIndex)

		var c ColumnTemplate
		_, err := d.db.NewUpdate().
			With("selectPrevious", selectPrevious).
			With("maxIndexSelect", maxIndexSelect).
			With("updateOnSmallerIndex", updateOnSmallerIndex).
			With("updateOnGreaterIndex", updateOnGreaterIndex).
			Model(&column).
			Value("index", fmt.Sprintf("LEAST((SELECT COUNT(*) FROM \"maxIndexSelect\")-1, %d)", newIndex)).
			Where("id = ?", column.ID).
			Returning("*").
			Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardTemplateIdentifier, column.BaseModel), &c)

		if err != nil {
			logger.Get().Infow("failed to update column template in updte board template", "board_template", update.ID, "err", err)
			return BoardTemplate{}, err
		}
		cols_updated = append(cols_updated, c)
	}
	boardTemplate.ColumnTemplates = cols_updated

	return boardTemplate, err
}

func (d *Database) DeleteBoardTemplate(templateId uuid.UUID) error {
	_, err := d.db.NewDelete().Model((*BoardTemplate)(nil)).Where("id = ?", templateId).Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardTemplateIdentifier, templateId))
	return err
}
