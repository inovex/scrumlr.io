package boardtemplates

import (
	"context"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/columntemplates"
	"scrumlr.io/server/logger"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/boardtemplates")
var meter metric.Meter = otel.Meter("scrumlr.io/server/boardtemplates")

type BoardTemplateDatabase interface {
	Create(ctx context.Context, board DatabaseBoardTemplateInsert) (DatabaseBoardTemplate, error)
	Get(ctx context.Context, id uuid.UUID) (DatabaseBoardTemplate, error)
	GetAll(ctx context.Context, user uuid.UUID) ([]DatabaseBoardTemplateFull, error)
	Update(ctx context.Context, board DatabaseBoardTemplateUpdate) (DatabaseBoardTemplate, error)
	Delete(ctx context.Context, templateId uuid.UUID) error
}

type Service struct {
	database              BoardTemplateDatabase
	columnTemplateService columntemplates.ColumnTemplateService
}

func NewBoardTemplateService(db BoardTemplateDatabase, columnTempalteService columntemplates.ColumnTemplateService) BoardTemplateService {
	service := new(Service)
	service.database = db
	service.columnTemplateService = columnTempalteService

	return service
}

func (service *Service) Create(ctx context.Context, body CreateBoardTemplateRequest) (*BoardTemplate, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.board_templates.service.create")
	defer span.End()

	// map request on board object to insert into database
	board := DatabaseBoardTemplateInsert{
		Creator:     body.Creator,
		Name:        body.Name,
		Description: body.Description,
		Favourite:   body.Favourite,
	}

	span.SetAttributes(
		attribute.String("scrumlr.board_templates.service.create.user", board.Creator.String()),
		attribute.Int("scrumlr.board_templates.service.create.columns.count", len(body.Columns)),
	)

	// create the board template
	b, err := service.database.Create(ctx, board)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create board template")
		span.RecordError(err)
		log.Errorw("unable to create board template", "creator", body.Creator, "policy", "err", err)
		return nil, err
	}

	for index, value := range body.Columns {
		column := columntemplates.ColumnTemplateRequest{BoardTemplate: b.ID, Name: value.Name, Description: value.Description, Color: value.Color, Visible: value.Visible, Index: &index, User: body.Creator}
		_, err := service.columnTemplateService.Create(ctx, column)
		if err != nil {
			span.SetStatus(codes.Error, "failed to create column template")
			span.RecordError(err)
			return nil, err
		}
	}

	boardTemplatesCreatedCounter.Add(ctx, 1)
	return new(BoardTemplate).From(b), nil
}

func (service *Service) Get(ctx context.Context, id uuid.UUID) (*BoardTemplate, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.board_templates.service.get")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.board_templates.service.get.board", id.String()),
	)

	boardTemplate, err := service.database.Get(ctx, id)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get board template")
		span.RecordError(err)
		log.Errorw("unable to get board template", "board", id, "err", err)
		return nil, err
	}

	return new(BoardTemplate).From(boardTemplate), err
}

func (service *Service) GetAll(ctx context.Context, user uuid.UUID) ([]*BoardTemplateFull, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.board_templates.service.get.all")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.board_templates.service.get.all.user", user.String()),
	)

	templates, err := service.database.GetAll(ctx, user)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create board templates")
		span.RecordError(err)
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
	ctx, span := tracer.Start(ctx, "scrumlr.board_templates.service.update")
	defer span.End()

	// parse req update to db update
	updateBoard := DatabaseBoardTemplateUpdate{
		ID:          body.ID,
		Name:        body.Name,
		Description: body.Description,
		Favourite:   body.Favourite,
	}

	span.SetAttributes(
		attribute.String("scrumlr.board_templates.service.update.board", body.ID.String()),
	)

	updatedTemplate, err := service.database.Update(ctx, updateBoard)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update board template")
		span.RecordError(err)
		log.Errorw("unable to update board template", "board", body.ID, "err", err)
		return nil, err
	}

	return new(BoardTemplate).From(updatedTemplate), err
}

func (service *Service) Delete(ctx context.Context, templateId uuid.UUID) error {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.board_templates.service.delete")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.board_templates.service.delete.board", templateId.String()),
	)

	err := service.database.Delete(ctx, templateId)
	if err != nil {
		span.SetStatus(codes.Error, "failed to delete board template")
		span.RecordError(err)
		log.Errorw("unable to delete board template", "board", templateId, "err", err)
		return err
	}

	boardTemplatesDeletedCounter.Add(ctx, 1)
	return err
}
