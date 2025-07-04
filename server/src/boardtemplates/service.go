package boardtemplates

import (
	"context"

	"github.com/google/uuid"
	"scrumlr.io/server/columntemplates"
	"scrumlr.io/server/logger"
)

type BoardTemplateDatabase interface {
	Create(board DatabaseBoardTemplateInsert, columns []columntemplates.DatabaseColumnTemplateInsert) (DatabaseBoardTemplate, error)
	Get(id uuid.UUID) (DatabaseBoardTemplate, error)
	GetAll(user uuid.UUID) ([]DatabaseBoardTemplateFull, error)
	Update(board DatabaseBoardTemplateUpdate) (DatabaseBoardTemplate, error)
	Delete(templateId uuid.UUID) error
}

type Service struct {
	database BoardTemplateDatabase
}

func NewBoardTemplateService(db BoardTemplateDatabase) BoardTemplateService {
	service := new(Service)
	service.database = db

	return service
}

func (service *Service) Create(ctx context.Context, body CreateBoardTemplateRequest) (*BoardTemplate, error) {
	log := logger.FromContext(ctx)
	// map request on board object to insert into database
	board := DatabaseBoardTemplateInsert{
		Creator:     body.Creator,
		Name:        body.Name,
		Description: body.Description,
		Favourite:   body.Favourite,
	}

	// map request column templates to db column template inserts
	columns := make([]columntemplates.DatabaseColumnTemplateInsert, 0, len(body.Columns))
	for index, value := range body.Columns {
		var currentIndex = index
		columns = append(columns, columntemplates.DatabaseColumnTemplateInsert{
			Name:        value.Name,
			Description: value.Description,
			Color:       value.Color,
			Visible:     value.Visible,
			Index:       &currentIndex,
		})
	}

	// create the board template
	b, err := service.database.Create(board, columns)
	if err != nil {
		log.Errorw("unable to create board template", "creator", body.Creator, "policy", "err", err)
		return nil, err
	}

	return new(BoardTemplate).From(b), nil
}

func (service *Service) Get(ctx context.Context, id uuid.UUID) (*BoardTemplate, error) {
	log := logger.FromContext(ctx)
	boardTemplate, err := service.database.Get(id)
	if err != nil {
		log.Errorw("unable to get board template", "board", id, "err", err)
		return nil, err
	}

	return new(BoardTemplate).From(boardTemplate), err
}

func (service *Service) GetAll(ctx context.Context, user uuid.UUID) ([]*BoardTemplateFull, error) {
	log := logger.FromContext(ctx)
	templates, err := service.database.GetAll(user)
	if err != nil {
		log.Errorw("unable to list board templates", "user", user, "err", err)
		return nil, err
	}

	var templatesDto []*BoardTemplateFull
	for _, template := range templates {
		templatesDto = append(templatesDto, new(BoardTemplateFull).From(template))
	}

	return templatesDto, err
}

func (service *Service) Update(ctx context.Context, body BoardTemplateUpdateRequest) (*BoardTemplate, error) {
	log := logger.FromContext(ctx)
	// parse req update to db update
	updateBoard := DatabaseBoardTemplateUpdate{
		ID:          body.ID,
		Name:        body.Name,
		Description: body.Description,
		Favourite:   body.Favourite,
	}

	updatedTemplate, err := service.database.Update(updateBoard)
	if err != nil {
		log.Errorw("unable to update board template", "board", body.ID, "err", err)
		return nil, err
	}

	return new(BoardTemplate).From(updatedTemplate), err
}

func (service *Service) Delete(ctx context.Context, templateId uuid.UUID) error {
	log := logger.FromContext(ctx)
	err := service.database.Delete(templateId)
	if err != nil {
		log.Errorw("unable to delete board template", "board", templateId, "err", err)
		return err
	}

	return err
}
