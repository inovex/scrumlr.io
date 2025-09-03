package boardtemplates

import (
	"context"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/columntemplates"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
)

type DB struct {
	db *bun.DB
}

func NewBoardTemplateDatabase(database *bun.DB) BoardTemplateDatabase {
	db := new(DB)
	db.db = database

	return db
}

func (db *DB) Create(ctx context.Context, board DatabaseBoardTemplateInsert, columns []columntemplates.DatabaseColumnTemplateInsert) (DatabaseBoardTemplate, error) {
	boardInsert := db.db.NewInsert().
		Model(&board).
		Returning("*")

	var template DatabaseBoardTemplate
	query := db.db.NewSelect().
		With("createdBoardTemplate", boardInsert)

	if len(columns) > 0 {
		for index := range columns {
			newColumnIndex := index
			columns[index].Index = &newColumnIndex
		}

		// create columns
		query = query.With("createdColumns", db.db.NewInsert().
			Model(&columns).
			Value("board_template", "(SELECT id FROM \"createdBoardTemplate\")"))
	}

	err := query.Table("createdBoardTemplate").
		Column("*").
		Scan(ctx, &template)

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

	if err != nil {
		logger.Get().Errorw("failed to update board template settings", "board", board.ID, "err", err)
		return DatabaseBoardTemplate{}, err
	}

	return boardTemplate, err
}

func (db *DB) Delete(ctx context.Context, templateId uuid.UUID) error {
	_, err := db.db.NewDelete().
		Model((*DatabaseBoardTemplate)(nil)).
		Where("id = ?", templateId).
		Exec(common.ContextWithValues(ctx, "Database", db, identifiers.BoardTemplateIdentifier, templateId))

	return err
}
