package columns

import (
	"context"
	"database/sql"
	"fmt"

	"scrumlr.io/server/notes"

	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"

	"scrumlr.io/server/realtime"
)

type ColumnDatabase interface {
	Create(column DatabaseColumnInsert) (DatabaseColumn, error)
	Update(column DatabaseColumnUpdate) (DatabaseColumn, error)
	Delete(board, column, user uuid.UUID) error
	Get(board, id uuid.UUID) (DatabaseColumn, error)
	GetAll(board uuid.UUID) ([]DatabaseColumn, error)
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
	column, err := service.database.Create(DatabaseColumnInsert{Board: body.Board, Name: body.Name, Description: body.Description, Color: body.Color, Visible: body.Visible, Index: body.Index})
	if err != nil {
		log.Errorw("unable to create column", "err", err)
		return nil, err
	}

	service.updatedColumns(ctx, body.Board)

	return new(Column).From(column), err
}

func (service *Service) Delete(ctx context.Context, board, column, user uuid.UUID) error {
	log := logger.FromContext(ctx)

	// todo: call services to delete votes and notes
	// columnService -> calls noteService -> calls votingService delete()
	toBeDeletedNotes, err := service.noteService.GetAll(ctx, board, column)
	for _, note := range toBeDeletedNotes {
		err := service.noteService.Delete(ctx, notes.NoteDeleteRequest{DeleteStack: true}, note.ID)
		if err != nil {
			log.Errorw("unable to delete note", "err", err)
			return err
		}
	}
	err = service.database.Delete(board, column, user)
	if err != nil {
		log.Errorw("unable to delete column", "err", err)
		return err
	}

	service.deletedColumn(ctx, user, board, column)
	return err
}

func (service *Service) Update(ctx context.Context, body ColumnUpdateRequest) (*Column, error) {
	log := logger.FromContext(ctx)
	column, err := service.database.Update(DatabaseColumnUpdate{ID: body.ID, Board: body.Board, Name: body.Name, Description: body.Description, Color: body.Color, Visible: body.Visible, Index: body.Index})
	if err != nil {
		log.Errorw("unable to update column", "err", err)
		return nil, err
	}

	service.updatedColumns(ctx, body.Board)

	return new(Column).From(column), err
}

func (service *Service) Get(ctx context.Context, boardID, columnID uuid.UUID) (*Column, error) {
	log := logger.FromContext(ctx)
	column, err := service.database.Get(boardID, columnID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.NotFoundError
		}

		log.Errorw("unable to get column", "board", boardID, "column", columnID, "error", err)
		return nil, fmt.Errorf("unable to get column: %w", err)
	}

	return new(Column).From(column), err
}

func (service *Service) GetAll(ctx context.Context, boardID uuid.UUID) ([]*Column, error) {
	log := logger.FromContext(ctx)
	columns, err := service.database.GetAll(boardID)
	if err != nil {
		log.Errorw("unable to get columns", "board", boardID, "error", err)
		return nil, fmt.Errorf("unable to get columns: %w", err)
	}

	return Columns(columns), err
}

func (service *Service) updatedColumns(ctx context.Context, board uuid.UUID) {
	dbColumns, err := service.database.GetAll(board)
	if err != nil {
		logger.Get().Errorw("unable to retrieve columns in updated notes", "err", err)
		return
	}

	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: Columns(dbColumns),
	})

	var err_msg string
	err_msg, err = service.syncNotesOnColumnChange(ctx, board)
	if err != nil {
		logger.Get().Errorw(err_msg, "err", err)
	}
}

func (service *Service) syncNotesOnColumnChange(ctx context.Context, boardID uuid.UUID) (string, error) {
	var err_msg string
	columns, err := service.database.GetAll(boardID)
	if err != nil {
		err_msg = "unable to retrieve columns, following a updated columns call"
		return err_msg, err
	}

	var columnsID []uuid.UUID
	for _, column := range columns {
		columnsID = append(columnsID, column.ID)
	}

	notes, err := service.noteService.GetAll(ctx, boardID, columnsID...)
	if err != nil {
		err_msg = "unable to retrieve notes, following a updated columns call"
		return err_msg, err
	}

	err = service.realtime.BroadcastToBoard(boardID, realtime.BoardEvent{
		Type: realtime.BoardEventNotesSync,
		Data: notes,
	})

	if err != nil {
		err_msg = "unable to broadcast notes, following a updated columns call"
		return err_msg, err
	}

	return "", err
}

func (service *Service) deletedColumn(ctx context.Context, user, board, column uuid.UUID) {
	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventColumnDeleted,
		Data: column,
	})

	eventNotes, err := service.noteService.GetAll(ctx, board, column)
	if err != nil {
		logger.Get().Errorw("unable to retrieve notes in deleted column", "err", err)
		return
	}

	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: eventNotes,
	})
}

func (service *Service) UpdateEvent(event *realtime.BoardEvent, userID, boardID uuid.UUID, isMod bool) (*realtime.BoardEvent, bool) {
	var updateColumns ColumnSlice
	updateColumns, err := UnmarshallColumnData(event.Data)

	if err != nil {
		logger.Get().Errorw("unable to parse columnUpdated in event filter", "board", boardID, "session", userID, "err", err)
		return nil, false
	}

	if isMod {
		//bs.boardColumns = updateColumns
		return event, true
	} else {
		return &realtime.BoardEvent{
			Type: event.Type,
			Data: updateColumns.FilterVisibleColumns(),
		}, true
	}
}
