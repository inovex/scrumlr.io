package boards

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	columns2 "scrumlr.io/server/columns"
	notes2 "scrumlr.io/server/notes"

	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/realtime"

	"scrumlr.io/server/database"
	"scrumlr.io/server/logger"
)

func (s *BoardService) CreateColumn(ctx context.Context, body dto.ColumnRequest) (*columns2.Column, error) {
	log := logger.FromContext(ctx)
	column, err := s.database.CreateColumn(database.ColumnInsert{Board: body.Board, Name: body.Name, Description: body.Description, Color: body.Color, Visible: body.Visible, Index: body.Index})
	if err != nil {
		log.Errorw("unable to create column", "err", err)
		return nil, err
	}
	s.database.
		s.UpdatedColumns(body.Board)
	return new(columns2.Column).From(column), err
}

func (s *BoardService) DeleteColumn(ctx context.Context, board, column, user uuid.UUID) error {
	log := logger.FromContext(ctx)

	voting, err := s.database.GetOpenVoting(board)
	var toBeDeletedVotes []database.Vote
	if err != nil {
		if !errors.Is(err, sql.ErrNoRows) {
			log.Errorw("unable to get open voting", "board", board, "err", err)
			return err
		}
	} else {
		toBeDeletedVotes, err = s.database.GetVotes(filter.VoteFilter{Board: board, Voting: &voting.ID})
		if err != nil {
			logger.Get().Errorw("unable to retrieve votes in deleted column", "err", err, "board", board, "column", column)
			return err
		}
	}

	err = s.database.DeleteColumn(board, column, user)
	if err != nil {
		log.Errorw("unable to delete column", "err", err)
		return err
	}
	s.DeletedColumn(user, board, column, toBeDeletedVotes)
	return err
}

func (s *BoardService) UpdateColumn(ctx context.Context, body dto.ColumnUpdateRequest) (*columns2.Column, error) {
	log := logger.FromContext(ctx)
	column, err := s.database.UpdateColumn(database.ColumnUpdate{ID: body.ID, Board: body.Board, Name: body.Name, Description: body.Description, Color: body.Color, Visible: body.Visible, Index: body.Index})
	if err != nil {
		log.Errorw("unable to update column", "err", err)
		return nil, err
	}
	s.UpdatedColumns(body.Board)
	return new(columns2.Column).From(column), err
}

func (s *BoardService) GetColumn(ctx context.Context, boardID, columnID uuid.UUID) (*columns2.Column, error) {
	log := logger.FromContext(ctx)
	column, err := s.database.GetColumn(boardID, columnID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.NotFoundError
		}
		log.Errorw("unable to get column", "board", boardID, "column", columnID, "error", err)
		return nil, fmt.Errorf("unable to get column: %w", err)
	}
	return new(columns2.Column).From(column), err
}

func (s *BoardService) ListColumns(ctx context.Context, boardID uuid.UUID) ([]*columns2.Column, error) {
	log := logger.FromContext(ctx)
	columns, err := s.database.GetColumns(boardID)
	if err != nil {
		log.Errorw("unable to get columns", "board", boardID, "error", err)
		return nil, fmt.Errorf("unable to get columns: %w", err)
	}
	return columns2.Columns(columns), err
}

func (s *BoardService) UpdatedColumns(board uuid.UUID) {
	dbColumns, err := s.database.GetColumns(board)
	if err != nil {
		logger.Get().Errorw("unable to retrieve columns in updated notes", "err", err)
		return
	}
	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: columns2.Columns(dbColumns),
	})

	var err_msg string
	err_msg, err = s.SyncNotesOnColumnChange(board)
	if err != nil {
		logger.Get().Errorw(err_msg, "err", err)
	}
}

func (s *BoardService) SyncNotesOnColumnChange(boardID uuid.UUID) (string, error) {
	var err_msg string
	columns, err := s.database.GetColumns(boardID)
	if err != nil {
		err_msg = "unable to retrieve columns, following a updated columns call"
		return err_msg, err
	}

	var columnsID []uuid.UUID
	for _, column := range columns {
		columnsID = append(columnsID, column.ID)
	}
	notes, err := s.database.GetNotes(boardID, columnsID...)
	if err != nil {
		err_msg = "unable to retrieve notes, following a updated columns call"
		return err_msg, err
	}

	err = s.realtime.BroadcastToBoard(boardID, realtime.BoardEvent{
		Type: realtime.BoardEventNotesSync,
		Data: notes2.Notes(notes),
	})
	if err != nil {
		err_msg = "unable to broadcast notes, following a updated columns call"
		return err_msg, err
	}
	return "", err
}

func (s *BoardService) DeletedColumn(user, board, column uuid.UUID, toBeDeletedVotes []database.Vote) {
	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventColumnDeleted,
		Data: column,
	})

	dbNotes, err := s.database.GetNotes(board)
	if err != nil {
		logger.Get().Errorw("unable to retrieve notes in deleted column", "err", err)
		return
	}
	eventNotes := make([]notes2.Note, len(dbNotes))
	for index, note := range dbNotes {
		eventNotes[index] = *new(notes2.Note).From(note)
	}
	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: eventNotes,
	})
	if len(toBeDeletedVotes) > 0 {
		_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
			Type: realtime.BoardEventVotesDeleted,
			Data: toBeDeletedVotes,
		})
	}
}
