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
		log.Errorw("unable to create board", "creator", body.Creator, "policy", body.AccessPolicy, "err", err)
		return nil, err
	}

	return new(dto.BoardTemplate).From(b), nil
}

func (s *BoardTemplateService) Get(ctx context.Context, id uuid.UUID) (*dto.BoardTemplate, error) {
	log := logger.FromContext(ctx)
	boardTemplate, err := s.database.GetBoardTemplate(id)
	if err != nil {
		log.Errorw("unable to get board template", "board", id, "err", err)
		return nil, err
	}

	boardDto := dto.BoardTemplate{
		ID:           boardTemplate.ID,
		Creator:      boardTemplate.Creator,
		Name:         boardTemplate.Name,
		Description:  boardTemplate.Description,
		AccessPolicy: boardTemplate.AccessPolicy,
		Favourite:    boardTemplate.Favourite,
	}

	return &boardDto, err
}

func (s *BoardTemplateService) List(ctx context.Context, user uuid.UUID) ([]*dto.BoardTemplate, error) {
	log := logger.FromContext(ctx)
	templates, err := s.database.GetBoardTemplates(user)
	if err != nil {
		log.Errorw("unable to list board templates", "user", user, "err", err)
		return []*dto.BoardTemplate{}, err
	}

	var templatesDto []*dto.BoardTemplate
	for _, board := range templates {
		boardDto := dto.BoardTemplate{
			ID:           board.ID,
			Creator:      board.Creator,
			Name:         board.Name,
			Description:  board.Description,
			AccessPolicy: board.AccessPolicy,
			Favourite:    board.Favourite,
		}
		templatesDto = append(templatesDto, &boardDto)
	}

	return templatesDto, err
}

func (s *BoardTemplateService) Update(ctx context.Context, body dto.BoardTemplateUpdateRequest) (*dto.BoardTemplate, error) {
	log := logger.FromContext(ctx)
	// parse req update to db update
	updateBoard := database.BoardTemplateUpdate{
		ID:           body.ID,
		Name:         body.Name,
		Description:  body.Description,
		AccessPolicy: body.AccessPolicy,
		Favourite:    body.Favourite,
	}

	updatedTemplate, err := s.database.UpdateBoardTemplate(updateBoard)
	if err != nil {
		log.Errorw("unable to update board template", "board", body.ID, "err", err)
		return &dto.BoardTemplate{}, err
	}

	boardDto := dto.BoardTemplate{
		ID:           updatedTemplate.ID,
		Creator:      updatedTemplate.Creator,
		Name:         updatedTemplate.Name,
		Description:  updatedTemplate.Description,
		AccessPolicy: updatedTemplate.AccessPolicy,
		Favourite:    updatedTemplate.Favourite,
	}

	return &boardDto, err
}

func (s *BoardTemplateService) Delete(ctx context.Context, templateId uuid.UUID) error {
	log := logger.FromContext(ctx)
	err := s.database.DeleteBoardTemplate(templateId)
	if err != nil {
		log.Errorw("unable to delete board template", "board", templateId, "err", err)
		return err
	}
	return err
}
