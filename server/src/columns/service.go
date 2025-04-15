package columns

import (
	"context"
	"database/sql"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/database"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/notes"
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
	database ColumnDatabase
	realtime *realtime.Broker
}

func NewColumnService(db ColumnDatabase, rt *realtime.Broker) ColumnService {
	service := new(Service)
	service.database = db
	service.realtime = rt

	return service
}

func (service *Service) Create(ctx context.Context, body ColumnRequest) (*Column, error) {
	log := logger.FromContext(ctx)
	column, err := service.database.Create(DatabaseColumnInsert{Board: body.Board, Name: body.Name, Description: body.Description, Color: body.Color, Visible: body.Visible, Index: body.Index})
	if err != nil {
		log.Errorw("unable to create column", "err", err)
		return nil, err
	}

	service.updatedColumns(body.Board)

	return new(Column).From(column), err
}

func (service *Service) Delete(ctx context.Context, board, column, user uuid.UUID) error {
	log := logger.FromContext(ctx)

	voting, err := service.database.GetOpenVoting(board)
	var toBeDeletedVotes []database.Vote
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			log.Errorw("unable to get open voting", "board", board, "err", err)
			return err
		}
	} else {
		toBeDeletedVotes, err = service.database.GetVotes(filter.VoteFilter{Board: board, Voting: &voting.ID})
		if err != nil {
			logger.Get().Errorw("unable to retrieve votes in deleted column", "err", err, "board", board, "column", column)
			return err
		}
	}

	err = service.database.Delete(board, column, user)
	if err != nil {
		log.Errorw("unable to delete column", "err", err)
		return err
	}

	service.deletedColumn(user, board, column, toBeDeletedVotes)
	return err
}

func (service *Service) Update(ctx context.Context, body ColumnUpdateRequest) (*Column, error) {
	log := logger.FromContext(ctx)
	column, err := service.database.Update(DatabaseColumnUpdate{ID: body.ID, Board: body.Board, Name: body.Name, Description: body.Description, Color: body.Color, Visible: body.Visible, Index: body.Index})
	if err != nil {
		log.Errorw("unable to update column", "err", err)
		return nil, err
	}

	service.updatedColumns(body.Board)

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

func (service *Service) updatedColumns(board uuid.UUID) {
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
	err_msg, err = service.syncNotesOnColumnChange(board)
	if err != nil {
		logger.Get().Errorw(err_msg, "err", err)
	}
}

func (service *Service) syncNotesOnColumnChange(boardID uuid.UUID) (string, error) {
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

	notes, err := service.database.GetNotes(boardID, columnsID...)
	if err != nil {
		err_msg = "unable to retrieve notes, following a updated columns call"
		return err_msg, err
	}

	err = service.realtime.BroadcastToBoard(boardID, realtime.BoardEvent{
		Type: realtime.BoardEventNotesSync,
		Data: notes.Notes(notes),
	})

	if err != nil {
		err_msg = "unable to broadcast notes, following a updated columns call"
		return err_msg, err
	}

	return "", err
}

func (service *Service) deletedColumn(user, board, column uuid.UUID, toBeDeletedVotes []database.Vote) {
	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventColumnDeleted,
		Data: column,
	})

	dbNotes, err := service.database.GetNotes(board)
	if err != nil {
		logger.Get().Errorw("unable to retrieve notes in deleted column", "err", err)
		return
	}

	eventNotes := make([]notes.Note, len(dbNotes))
	for index, note := range dbNotes {
		eventNotes[index] = *new(notes.Note).From(note)
	}

	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: eventNotes,
	})

	if len(toBeDeletedVotes) > 0 {
		_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
			Type: realtime.BoardEventVotesDeleted,
			Data: toBeDeletedVotes,
		})
	}
}
