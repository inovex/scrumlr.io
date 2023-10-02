package boards

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/realtime"

	"scrumlr.io/server/database"
	"scrumlr.io/server/logger"
)

func (s *BoardService) CreateColumn(_ context.Context, body dto.ColumnRequest) (*dto.WrappedColumn, error) {
	result, err := s.database.CreateColumn(database.ColumnInsert{Board: body.Board, Name: body.Name, Color: body.Color, Visible: body.Visible}, body.Index)
	var column *dto.WrappedColumn
	if err == nil {
		column = new(dto.WrappedColumn).From(result)
		defer s.CreatedColumn(body.Board, *column)
	} else {
		logger.Get().Warnw("failed to create column", "request", body, "error", err)
	}
	return column, err
}

func (s *BoardService) DeleteColumn(_ context.Context, board, column uuid.UUID) error {
	err := s.database.DeleteColumn(board, column)
	if err == nil {
		defer s.DeletedColumn(board, column)
	} else {
		logger.Get().Warnw("failed to delete column", "board", board, "column", column, "error", err)
	}
	return err
}

func (s *BoardService) UpdateColumn(_ context.Context, body dto.ColumnUpdateRequest) (*dto.WrappedColumn, error) {
	result, err := s.database.UpdateColumn(database.ColumnUpdate{ID: body.ID, Board: body.Board, Name: body.Name, Color: body.Color, Visible: body.Visible}, body.Index)
	var column *dto.WrappedColumn
	if err == nil {
		column = new(dto.WrappedColumn).From(result)
		defer s.UpdatedColumn(body.Board, *column)
	} else {
		logger.Get().Warnw("failed to update column", "request", body, "error", err)
	}
	return column, err
}

func (s *BoardService) GetColumn(ctx context.Context, boardID, columnID uuid.UUID) (*dto.WrappedColumn, error) {
	log := logger.FromContext(ctx)
	column, err := s.database.GetColumn(boardID, columnID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, common.NotFoundError
		}
		log.Errorw("unable to get column", "board", boardID, "column", columnID, "error", err)
		return nil, fmt.Errorf("unable to get column: %w", err)
	}
	return new(dto.WrappedColumn).From(column), err
}

func (s *BoardService) ListColumns(ctx context.Context, boardID uuid.UUID) (*dto.WrappedColumns, error) {
	log := logger.FromContext(ctx)
	columns, err := s.database.GetColumns(boardID)
	if err != nil {
		log.Errorw("unable to get columns", "board", boardID, "error", err)
		return nil, fmt.Errorf("unable to get columns: %w", err)
	}
	return dto.WrapColumns(columns), err
}

func (s *BoardService) CreatedColumn(board uuid.UUID, column dto.WrappedColumn) {
	err := s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventColumnCreated,
		Data: column,
	})
	if err != nil {
		logger.Get().Errorw("unable to broadcast created column", "err", err)
	}
}

func (s *BoardService) UpdatedColumn(board uuid.UUID, column dto.WrappedColumn) {
	err := s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventColumnUpdated,
		Data: column,
	})
	if err != nil {
		logger.Get().Errorw("unable to broadcast updated column", "err", err)
	}
}
func (s *BoardService) DeletedColumn(board, column uuid.UUID) {
	err := s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventColumnDeleted,
		Data: column,
	})
	if err != nil {
		logger.Get().Errorw("unable to broadcast updated columns", "err", err)
	}
}
