package board_templates

import (
	"context"

	"github.com/google/uuid"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/database"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/services"
)

type BoardTemplateService struct {
	database database.Database
}

func NewBoardTemplateService(db *database.Database) services.BoardTemplates {
	s := new(BoardTemplateService)
	s.database = *db

	return s
}

func (s *BoardTemplateService) Create(ctx context.Context, body dto.CreateBoardTemplateRequest) (*dto.BoardTemplate, error) {
	log := logger.FromContext(ctx)
	// map request on board object to insert into database
	board := database.BoardTemplateInsert{
		Creator:      body.Creator,
		Name:         body.Name,
		Description:  body.Description,
		AccessPolicy: body.AccessPolicy,
		Favourite:    body.Favourite,
	}

	// map request on column objects to insert into database
	columns := make([]database.ColumnTemplateInsert, 0, len(body.Columns))
	for index, value := range body.Columns {
		var currentIndex = index
		columns = append(columns, database.ColumnTemplateInsert{Name: value.Name, Description: value.Description, Color: value.Color, Visible: value.Visible, Index: &currentIndex})
	}

	// create the board template
	b, err := s.database.CreateBoardTemplate(board, columns)
	if err != nil {
		log.Errorw("unable to create board", "creator", body.Creator, "policy", body.AccessPolicy, "error", err)
		return nil, err
	}
	return new(dto.BoardTemplate).From(b), nil
}

func (s *BoardTemplateService) Get(_ context.Context, id uuid.UUID) (*dto.BoardTemplate, error) {
	boardTemplate, err := s.database.GetBoardTemplate(id)
	if err != nil {
		return nil, err
	}

	// convert database cols to dto cols
	cols := boardTemplate.ColumnTemplates
	var new_cols []*dto.ColumnTemplate
	for _, x := range cols {
		new_cols = append(new_cols, new(dto.ColumnTemplate).From(x))
	}

	boardDto := dto.BoardTemplate{
		ID:              boardTemplate.ID,
		Creator:         boardTemplate.Creator,
		Name:            boardTemplate.Name,
		Description:     boardTemplate.Description,
		AccessPolicy:    boardTemplate.AccessPolicy,
		Favourite:       boardTemplate.Favourite,
		ColumnTemplates: new_cols,
	}

	return &boardDto, err
}

func (s *BoardTemplateService) List(ctx context.Context, user uuid.UUID) ([]*dto.BoardTemplate, error) {
	templates, err := s.database.GetBoardTemplates(user)
	if err != nil {
		return []*dto.BoardTemplate{}, err
	}

	var templatesDto []*dto.BoardTemplate
	for _, board := range templates {
		// convert database cols to dto cols
		cols := board.ColumnTemplates
		var new_cols []*dto.ColumnTemplate
		for _, x := range cols {
			new_cols = append(new_cols, new(dto.ColumnTemplate).From(x))
		}

		boardDto := dto.BoardTemplate{
			ID:              board.ID,
			Creator:         board.Creator,
			Name:            board.Name,
			Description:     board.Description,
			AccessPolicy:    board.AccessPolicy,
			Favourite:       board.Favourite,
			ColumnTemplates: new_cols,
		}
		templatesDto = append(templatesDto, &boardDto)
	}

	return templatesDto, err
}

func (s *BoardTemplateService) Update(ctx context.Context, body dto.BoardTemplateUpdateRequest) (*dto.BoardTemplate, error) {
	// parse dto cols to db cols
	req_cols := []database.ColumnTemplate{}
	for _, col := range body.ColumnTemplates {
		new_col := database.ColumnTemplate{
			ID:            col.ID,
			BoardTemplate: col.BoardTemplate,
			Name:          col.Name,
			Description:   col.Description,
			Color:         col.Color,
			Visible:       col.Visible,
			Index:         col.Index,
		}
		req_cols = append(req_cols, new_col)
	}

	// parse req update to db update
	update := database.BoardTemplateUpdate{
		ID:              body.ID,
		Name:            body.Name,
		Description:     body.Description,
		AccessPolicy:    body.AccessPolicy,
		Favourite:       body.Favourite,
		ColumnTemplates: req_cols,
	}

	updatedTemplate, err := s.database.UpdateBoardTemplate(update)
	if err != nil {
		return &dto.BoardTemplate{}, err
	}

	// convert database cols to dto cols
	cols := updatedTemplate.ColumnTemplates
	var new_cols []*dto.ColumnTemplate
	for _, x := range cols {
		new_cols = append(new_cols, new(dto.ColumnTemplate).From(x))
	}

	boardDto := dto.BoardTemplate{
		ID:              updatedTemplate.ID,
		Creator:         updatedTemplate.Creator,
		Name:            updatedTemplate.Name,
		Description:     updatedTemplate.Description,
		AccessPolicy:    updatedTemplate.AccessPolicy,
		Favourite:       updatedTemplate.Favourite,
		ColumnTemplates: new_cols,
	}

	return &boardDto, err
}

func (s *BoardTemplateService) Delete(ctx context.Context, templateId uuid.UUID) error {
	err := s.database.DeleteBoardTemplate(templateId)
	if err != nil {
		logger.Get().Errorw("unable to delete board template", "err", err)
	}
	return err
}
