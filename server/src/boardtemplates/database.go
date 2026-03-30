package boardtemplates

import (
	"context"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/columntemplates"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
)

type DB struct {
	db *bun.DB
}

func NewBoardTemplateDatabase(database *bun.DB) BoardTemplateDatabase {
	db := new(DB)
	db.db = database

	return db
}

func (db *DB) Create(ctx context.Context, board DatabaseBoardTemplateInsert) (DatabaseBoardTemplate, error) {
	var template DatabaseBoardTemplate
	_, err := db.db.NewInsert().
		Model(&board).
		Returning("*").
		Exec(ctx, &template)

	return template, err
}

func (db *DB) Get(ctx context.Context, id uuid.UUID) (DatabaseBoardTemplate, error) {
	var tBoard DatabaseBoardTemplate

	// Get settings
	err := db.db.NewSelect().
		Model(&tBoard).
		Where("id = ?", id).
		Scan(context.Background())

	return tBoard, err
}

func (db *DB) GetAll(ctx context.Context, user uuid.UUID) ([]DatabaseBoardTemplateFull, error) {
	var tBoards []DatabaseBoardTemplate

	err := db.db.NewSelect().
		Model(&tBoards).
		Where("creator = ?", user).
		Order("created_at ASC").
		Scan(ctx)

	if err != nil {
		return []DatabaseBoardTemplateFull{}, err
	}

	var templates []DatabaseBoardTemplateFull
	for _, board := range tBoards {
		var cols []columntemplates.DatabaseColumnTemplate
		err = db.db.NewSelect().
			Model(&cols).
			Where("board_template = ?", board.ID).
			Scan(ctx)

		if err != nil {
			return []DatabaseBoardTemplateFull{}, err
		}

		dbBoardTemplate := DatabaseBoardTemplateFull{
			Template:        board,
			ColumnTemplates: cols,
		}
		templates = append(templates, dbBoardTemplate)
	}

	return templates, err
}

func (db *DB) Update(ctx context.Context, board DatabaseBoardTemplateUpdate) (DatabaseBoardTemplate, error) {
	// General Settings
	query_settings := db.db.NewUpdate().Model(&board)

	if board.Name != nil {
		query_settings.Column("name")
	}

	if board.Description != nil {
		query_settings.Column("description")
	}

	if board.Favourite != nil {
		query_settings.Column("favourite")
	}

	var boardTemplate DatabaseBoardTemplate
	_, err := query_settings.
		Where("id = ?", board.ID).
		Returning("*").
		Exec(common.ContextWithValues(ctx, "Database", db, "Result", &boardTemplate), &boardTemplate)

	return boardTemplate, err
}

func (db *DB) Delete(ctx context.Context, templateId uuid.UUID) error {
	_, err := db.db.NewDelete().
		Model((*DatabaseBoardTemplate)(nil)).
		Where("id = ?", templateId).
		Exec(common.ContextWithValues(ctx, "Database", db, identifiers.BoardTemplateIdentifier, templateId))

	return err
}
