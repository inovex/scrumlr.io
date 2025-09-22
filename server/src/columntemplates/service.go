package columntemplates

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/logger"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/columntemplates")
var meter metric.Meter = otel.Meter("scrumlr.io/server/columntemplates")

type ColumnTemplateDatabase interface {
	Create(ctx context.Context, column DatabaseColumnTemplateInsert) (DatabaseColumnTemplate, error)
	Get(ctx context.Context, board, id uuid.UUID) (DatabaseColumnTemplate, error)
	GetAll(ctx context.Context, board uuid.UUID) ([]DatabaseColumnTemplate, error)
	Update(ctx context.Context, column DatabaseColumnTemplateUpdate) (DatabaseColumnTemplate, error)
	Delete(ctx context.Context, board, column uuid.UUID) error
}

type Service struct {
	database ColumnTemplateDatabase
}

func NewColumnTemplateService(db ColumnTemplateDatabase) ColumnTemplateService {
	service := new(Service)
	service.database = db

	return service
}

func (service *Service) Create(ctx context.Context, body ColumnTemplateRequest) (*ColumnTemplate, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.column_templates.service.create")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.column_templates.service.create.boardtemplate", body.BoardTemplate.String()),
		attribute.String("scrumlr.column_templates.service.create.user", body.User.String()),
		attribute.String("scrumlr.column_templates.service.create.color", string(body.Color)),
	)

	column, err := service.database.Create(ctx, DatabaseColumnTemplateInsert{
		BoardTemplate: body.BoardTemplate,
		Name:          body.Name,
		Description:   body.Description,
		Color:         body.Color,
		Visible:       body.Visible,
		Index:         body.Index,
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to create column template")
		span.RecordError(err)
		log.Errorw("unable to create column template", "user", body.User, "err", err)
		return nil, err
	}

	columnTemplatesCreatedCounter.Add(ctx, 1)
	return new(ColumnTemplate).From(column), err
}

func (service *Service) Get(ctx context.Context, boardTemplate, columnTemplate uuid.UUID) (*ColumnTemplate, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.column_templates.service.get")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.column_templates.service.get.boardtemplate", boardTemplate.String()),
		attribute.String("scrumlr.column_templates.service.get.columntemplate", columnTemplate.String()),
	)

	column, err := service.database.Get(ctx, boardTemplate, columnTemplate)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get column template")
		span.RecordError(err)
		log.Errorw("unable to get template column", "board", boardTemplate, "err", err)
		return nil, fmt.Errorf("unable to get template column: %w", err)
	}

	return new(ColumnTemplate).From(column), err
}

func (service *Service) GetAll(ctx context.Context, boardTemplate uuid.UUID) ([]*ColumnTemplate, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.column_templates.service.get.all")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.column_templates.service.get.all.boardtemplate", boardTemplate.String()),
	)

	columns, err := service.database.GetAll(ctx, boardTemplate)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get column templates")
		span.RecordError(err)
		log.Errorw("unable to get template columns", "board", boardTemplate, "err", err)
		return nil, fmt.Errorf("unable to get template columns: %w", err)
	}

	return ColumnTemplates(columns), err
}

func (service *Service) Update(ctx context.Context, body ColumnTemplateUpdateRequest) (*ColumnTemplate, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.column_templates.service.update")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.column_templates.service.update.boardtemplate", body.BoardTemplate.String()),
		attribute.String("scrumlr.column_templates.service.update.columntemplate", body.ID.String()),
		attribute.String("scrumlr.column_templates.service.update.color", string(body.Color)),
	)

	column, err := service.database.Update(ctx, DatabaseColumnTemplateUpdate{ID: body.ID, BoardTemplate: body.BoardTemplate, Name: body.Name, Description: body.Description, Color: body.Color, Visible: body.Visible, Index: body.Index})
	if err != nil {
		span.SetStatus(codes.Error, "failed to update column templates")
		span.RecordError(err)
		log.Errorw("unable to update column template", "board", body.BoardTemplate, "column", body.ID, "err", err)
		return nil, err
	}

	return new(ColumnTemplate).From(column), err
}

func (service *Service) Delete(ctx context.Context, board, column uuid.UUID) error {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.column_templates.service.delete")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.column_templates.service.delete.boardtemplate", board.String()),
		attribute.String("scrumlr.column_templates.service.delete.columntemplate", column.String()),
	)

	err := service.database.Delete(ctx, board, column)
	if err != nil {
		span.SetStatus(codes.Error, "failed to delete column templates")
		span.RecordError(err)
		log.Errorw("unable to delete column template", "board", board, "column", column, "err", err)
		return err
	}

	columnTemplatesDeletedCounter.Add(ctx, 1)
	return err
}
