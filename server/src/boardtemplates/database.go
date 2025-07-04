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

func (db *DB) Create(board DatabaseBoardTemplateInsert, columns []columntemplates.DatabaseColumnTemplateInsert) (DatabaseBoardTemplate, error) {
	boardInsert := db.db.NewInsert().
		Model(&board).
		Returning("*")

	var b DatabaseBoardTemplate
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
		Scan(context.Background(), &b)
	if err != nil {
		return DatabaseBoardTemplate{}, err
	}

	return b, err
}

func (db *DB) Get(id uuid.UUID) (DatabaseBoardTemplate, error) {
	var tBoard DatabaseBoardTemplate

	// Get settings
	err := db.db.NewSelect().
		Model(&tBoard).
		Where("id = ?", id).
		Scan(context.Background())

	if err != nil {
		return DatabaseBoardTemplate{}, err
	}

	return tBoard, err
}

func (db *DB) GetAll(user uuid.UUID) ([]DatabaseBoardTemplateFull, error) {
	var tBoards []DatabaseBoardTemplate

	err := db.db.NewSelect().
		Model(&tBoards).
		Where("creator = ?", user).
		Order("created_at ASC").
		Scan(context.Background())

	if err != nil {
		return []DatabaseBoardTemplateFull{}, err
	}

	var templates []DatabaseBoardTemplateFull
	for _, board := range tBoards {
		var cols []columntemplates.DatabaseColumnTemplate
		err = db.db.NewSelect().
			Model(&cols).
			Where("board_template = ?", board.ID).
			Scan(context.Background())

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

func (db *DB) Update(board DatabaseBoardTemplateUpdate) (DatabaseBoardTemplate, error) {
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
		Exec(common.ContextWithValues(context.Background(), "Database", db, "Result", &boardTemplate), &boardTemplate)

	if err != nil {
		logger.Get().Errorw("failed to update board template settings", "board", board.ID, "err", err)
		return DatabaseBoardTemplate{}, err
	}

	return boardTemplate, err
}

func (db *DB) Delete(templateId uuid.UUID) error {
	_, err := db.db.NewDelete().
		Model((*DatabaseBoardTemplate)(nil)).
		Where("id = ?", templateId).
		Exec(common.ContextWithValues(context.Background(), "Database", db, identifiers.BoardTemplateIdentifier, templateId))

	return err
}
