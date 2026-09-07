package columntemplates

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel/attribute"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/otel"
)

type ColumnTemplateDatabase interface {
	Create(ctx context.Context, column DatabaseColumnTemplateInsert) (DatabaseColumnTemplate, error)
	Get(ctx context.Context, board, id uuid.UUID) (DatabaseColumnTemplate, error)
	GetAll(ctx context.Context, board uuid.UUID) ([]DatabaseColumnTemplate, error)
	Update(ctx context.Context, column DatabaseColumnTemplateUpdate) (DatabaseColumnTemplate, error)
	Delete(ctx context.Context, board, column uuid.UUID) error
	GetIndex(ctx context.Context, board uuid.UUID) (int, error)
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

	index, err := service.database.GetIndex(ctx, body.BoardTemplate)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get index"))
		return nil, CreateColumnTemplateError(Internal, "failed to get index", err)
	}

	if body.Index == nil {
		body.Index = &index
	} else {
		if *body.Index > index || *body.Index < 0 {
			body.Index = &index
		}
	}

	column, err := service.database.Create(ctx, DatabaseColumnTemplateInsert{
		BoardTemplate: body.BoardTemplate,
		Name:          body.Name,
		Description:   body.Description,
		Color:         body.Color,
		Visible:       body.Visible,
		Index:         body.Index,
	})

	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to create column template"))
		log.Errorw("unable to create column template", "user", body.User, "err", err)
		return nil, CreateColumnTemplateError(Internal, "failed to create column template", err)
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
		if errors.Is(err, sql.ErrNoRows) {
			otel.RecordErrorSpan(span, err, new("no column template found"))
			return nil, CreateColumnTemplateError(NotFound, "no column template found", err)
		}

		otel.RecordErrorSpan(span, err, new("failed to get column template"))
		log.Errorw("unable to get template column", "board", boardTemplate, "err", err)
		return nil, CreateColumnTemplateError(Internal, "unable to get template column", err)
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
		otel.RecordErrorSpan(span, err, new("failed to get column templates"))
		log.Errorw("unable to get template columns", "board", boardTemplate, "err", err)
		return nil, CreateColumnTemplateError(Internal, "unable to get template columns", err)
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

	if body.Index < 0 {
		body.Index = 0
	}

	column, err := service.database.Update(ctx,
		DatabaseColumnTemplateUpdate{
			ID:            body.ID,
			BoardTemplate: body.BoardTemplate,
			Name:          body.Name,
			Description:   body.Description,
			Color:         body.Color,
			Visible:       body.Visible,
			Index:         body.Index,
		},
	)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to update column templates"))
		log.Errorw("unable to update column template", "board", body.BoardTemplate, "column", body.ID, "err", err)
		return nil, CreateColumnTemplateError(Internal, "failed to update column templates", err)
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
		otel.RecordErrorSpan(span, err, new("failed to delete column templates"))
		log.Errorw("unable to delete column template", "board", board, "column", column, "err", err)
		return CreateColumnTemplateError(Internal, "failed to delete column templates", err)
	}

	columnTemplatesDeletedCounter.Add(ctx, 1)
	return err
}
