package columns

import (
	"context"
	"database/sql"
	"fmt"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/notes"

	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"

	"scrumlr.io/server/realtime"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/columns")
var meter metric.Meter = otel.Meter("scrumlr.io/server/columns")

type ColumnDatabase interface {
	Create(ctx context.Context, column DatabaseColumnInsert) (DatabaseColumn, error)
	Update(ctx context.Context, column DatabaseColumnUpdate) (DatabaseColumn, error)
	Delete(ctx context.Context, board, column uuid.UUID) error
	Get(ctx context.Context, board, id uuid.UUID) (DatabaseColumn, error)
	GetAll(ctx context.Context, board uuid.UUID) ([]DatabaseColumn, error)
}

type Service struct {
	database    ColumnDatabase
	realtime    *realtime.Broker
	noteService notes.NotesService
}

func NewColumnService(db ColumnDatabase, rt *realtime.Broker, noteService notes.NotesService) ColumnService {
	service := new(Service)
	service.database = db
	service.realtime = rt
	service.noteService = noteService

	return service
}

func (service *Service) Create(ctx context.Context, body ColumnRequest) (*Column, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.columns.service.create")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.columns.service.create.board", body.Board.String()),
		attribute.String("scrumlr.columns.service.create.user", body.User.String()),
		attribute.String("scrumlr.columns.service.create.color", string(body.Color)),
	)
	column, err := service.database.Create(ctx, DatabaseColumnInsert{Board: body.Board, Name: body.Name, Description: body.Description, Color: body.Color, Visible: body.Visible, Index: body.Index})
	if err != nil {
		span.SetStatus(codes.Error, "failed to create column")
		span.RecordError(err)
		log.Errorw("unable to create column", "err", err)
		return nil, err
	}

	service.updatedColumns(ctx, body.Board)

	columnsCreatedCounter.Add(ctx, 1)
	return new(Column).From(column), err
}

func (service *Service) Delete(ctx context.Context, board, column, user uuid.UUID) error {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.columns.service.delete")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.columns.service.delete.board", board.String()),
		attribute.String("scrumlr.columns.service.delete.column", column.String()),
		attribute.String("scrumlr.columns.service.delete.user", user.String()),
	)
	// todo: call services to delete votes and notes
	// columnService -> calls noteService -> calls votingService delete()
	toBeDeletedNotes, err := service.noteService.GetAll(ctx, board, column)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create columnget notes")
		span.RecordError(err)
		log.Errorw("Unable to get notes", "board", board, "column", column)
		return err
	}

	for _, note := range toBeDeletedNotes {
		err := service.noteService.Delete(ctx, user, notes.NoteDeleteRequest{ID: note.ID, Board: board, DeleteStack: true})
		if err != nil {
			span.SetStatus(codes.Error, "failed to delete notes")
			span.RecordError(err)
			log.Errorw("unable to delete note", "err", err)
			return err
		}
	}

	err = service.database.Delete(ctx, board, column)
	if err != nil {
		span.SetStatus(codes.Error, "failed to delete column")
		span.RecordError(err)
		log.Errorw("unable to delete column", "err", err)
		return err
	}

	service.deletedColumn(ctx, board, column)
	columnsDeletedCounter.Add(ctx, 1)
	return err
}

func (service *Service) Update(ctx context.Context, body ColumnUpdateRequest) (*Column, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.columns.service.update")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.columns.service.update.board", body.Board.String()),
		attribute.String("scrumlr.columns.service.update.column", body.ID.String()),
		attribute.String("scrumlr.columns.service.update.color", string(body.Color)),
		attribute.Bool("scrumlr.columns.service.update.visible", body.Visible),
	)
	column, err := service.database.Update(ctx, DatabaseColumnUpdate{ID: body.ID, Board: body.Board, Name: body.Name, Description: body.Description, Color: body.Color, Visible: body.Visible, Index: body.Index})
	if err != nil {
		span.SetStatus(codes.Error, "failed to update column")
		span.RecordError(err)
		log.Errorw("unable to update column", "err", err)
		return nil, err
	}

	service.updatedColumns(ctx, body.Board)

	return new(Column).From(column), err
}

func (service *Service) Get(ctx context.Context, boardID, columnID uuid.UUID) (*Column, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.columns.service.get")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.columns.service.get.board", boardID.String()),
		attribute.String("scrumlr.columns.service.get.column", columnID.String()),
	)
	column, err := service.database.Get(ctx, boardID, columnID)
	if err != nil {
		if err == sql.ErrNoRows {
			span.SetStatus(codes.Error, "no column found")
			span.RecordError(err)
			return nil, common.NotFoundError
		}

		span.SetStatus(codes.Error, "failed to get column")
		span.RecordError(err)
		log.Errorw("unable to get column", "board", boardID, "column", columnID, "error", err)
		return nil, fmt.Errorf("unable to get column: %w", err)
	}

	return new(Column).From(column), err
}

func (service *Service) GetAll(ctx context.Context, boardID uuid.UUID) ([]*Column, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.columns.service.get.all")
	defer span.End()

	span.SetAttributes(attribute.String("scrumlr.columns.service.get.all.board", boardID.String()))
	columns, err := service.database.GetAll(ctx, boardID)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get columns")
		span.RecordError(err)
		log.Errorw("unable to get columns", "board", boardID, "error", err)
		return nil, fmt.Errorf("unable to get columns: %w", err)
	}

	return Columns(columns), err
}

func (service *Service) updatedColumns(ctx context.Context, board uuid.UUID) {
	ctx, span := tracer.Start(ctx, "scrumlr.columns.service.update")
	defer span.End()

	dbColumns, err := service.database.GetAll(ctx, board)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get columns")
		span.RecordError(err)
		logger.Get().Errorw("unable to retrieve columns in updated notes", "err", err)
		return
	}

	_ = service.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: Columns(dbColumns),
	})

	var err_msg string
	err_msg, err = service.syncNotesOnColumnChange(ctx, board)
	if err != nil {
		span.SetStatus(codes.Error, "failed to sync columns")
		span.RecordError(err)
		logger.Get().Errorw(err_msg, "err", err)
	}
}

func (service *Service) syncNotesOnColumnChange(ctx context.Context, boardID uuid.UUID) (string, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.columns.service.sync")
	defer span.End()

	var err_msg string
	columns, err := service.database.GetAll(ctx, boardID)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get columns")
		span.RecordError(err)
		err_msg = "unable to retrieve columns, following a updated columns call"
		return err_msg, err
	}

	var columnsID []uuid.UUID
	for _, column := range columns {
		columnsID = append(columnsID, column.ID)
	}

	notes, err := service.noteService.GetAll(ctx, boardID, columnsID...)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get notes")
		span.RecordError(err)
		err_msg = "unable to retrieve notes, following a updated columns call"
		return err_msg, err
	}

	err = service.realtime.BroadcastToBoard(ctx, boardID, realtime.BoardEvent{
		Type: realtime.BoardEventNotesSync,
		Data: notes,
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to broadcast notes")
		span.RecordError(err)
		err_msg = "unable to broadcast notes, following a updated columns call"
		return err_msg, err
	}

	return "", err
}

func (service *Service) deletedColumn(ctx context.Context, board, column uuid.UUID) {
	ctx, span := tracer.Start(ctx, "scrumlr.columns.service.delete")
	defer span.End()

	_ = service.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
		Type: realtime.BoardEventColumnDeleted,
		Data: column,
	})

	eventNotes, err := service.noteService.GetAll(ctx, board, column)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get notes")
		span.RecordError(err)
		logger.Get().Errorw("unable to retrieve notes in deleted column", "err", err)
		return
	}

	_ = service.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: eventNotes,
	})

}
