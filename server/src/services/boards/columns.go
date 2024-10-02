package boards

import (
	"context"
	"database/sql"
	"fmt"

	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/realtime"

	"scrumlr.io/server/database"
	"scrumlr.io/server/logger"
)

func (s *BoardService) CreateColumn(ctx context.Context, body dto.ColumnRequest) (*dto.Column, error) {
	log := logger.FromContext(ctx)
	column, err := s.database.CreateColumn(database.ColumnInsert{Board: body.Board, Name: body.Name, Description: body.Description, Color: body.Color, Visible: body.Visible, Index: body.Index})
	if err != nil {
		log.Errorw("unable to create column", "err", err)
		return nil, err
	}
	s.UpdatedColumns(body.Board)
	return new(dto.Column).From(column), err
}

func (s *BoardService) DeleteColumn(ctx context.Context, board, column, user uuid.UUID) error {
	log := logger.FromContext(ctx)
	err := s.database.DeleteColumn(board, column, user)
	if err != nil {
		log.Errorw("unable to delete column", "err", err)
		return err
	}
	s.DeletedColumn(user, board, column)
	return err
}

func (s *BoardService) UpdateColumn(ctx context.Context, body dto.ColumnUpdateRequest) (*dto.Column, error) {
	log := logger.FromContext(ctx)
	column, err := s.database.UpdateColumn(database.ColumnUpdate{ID: body.ID, Board: body.Board, Name: body.Name, Description: body.Description, Color: body.Color, Visible: body.Visible, Index: body.Index})
	if err != nil {
		log.Errorw("unable to update column", "err", err)
		return nil, err
	}
	s.UpdatedColumns(body.Board)
	return new(dto.Column).From(column), err
}

func (s *BoardService) GetColumn(ctx context.Context, boardID, columnID uuid.UUID) (*dto.Column, error) {
	log := logger.FromContext(ctx)
	column, err := s.database.GetColumn(boardID, columnID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.NotFoundError
		}
		log.Errorw("unable to get column", "board", boardID, "column", columnID, "error", err)
		return nil, fmt.Errorf("unable to get column: %w", err)
	}
	return new(dto.Column).From(column), err
}

func (s *BoardService) ListColumns(ctx context.Context, boardID uuid.UUID) ([]*dto.Column, error) {
	log := logger.FromContext(ctx)
	columns, err := s.database.GetColumns(boardID)
	if err != nil {
		log.Errorw("unable to get columns", "board", boardID, "error", err)
		return nil, fmt.Errorf("unable to get columns: %w", err)
	}
	return dto.Columns(columns), err
}

func (s *BoardService) UpdatedColumns(board uuid.UUID) {
	dbColumns, err := s.database.GetColumns(board)
	if err != nil {
		logger.Get().Errorw("unable to retrieve columns in updated notes", "err", err)
		return
	}
	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: dto.Columns(dbColumns),
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
		Data: dto.Notes(notes),
	})
	if err != nil {
		err_msg = "unable to broadcast notes, following a updated columns call"
		return err_msg, err
	}
	return "", err
}

func (s *BoardService) DeletedColumn(user, board, column uuid.UUID) {
	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventColumnDeleted,
		Data: column,
	})

	dbNotes, err := s.database.GetNotes(board)
	if err != nil {
		logger.Get().Errorw("unable to retrieve notes in deleted column", "err", err)
		return
	}
	eventNotes := make([]dto.Note, len(dbNotes))
	for index, note := range dbNotes {
		eventNotes[index] = *new(dto.Note).From(note)
	}
	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: eventNotes,
	})

	boardVotes, err := s.database.GetVotes(filter.VoteFilter{Board: board})
	if err != nil {
		logger.Get().Errorw("unable to retrieve votes in deleted column", "err", err)
		return
	}
	personalVotes := []*dto.Vote{}
	for _, vote := range boardVotes {
		if vote.User == user {
			personalVotes = append(personalVotes, new(dto.Vote).From(vote))
		}
	}
	_ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventVotesUpdated,
		Data: personalVotes,
	})
}
