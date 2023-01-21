package boards

import (
	"context"
	"database/sql"
	"fmt"
	"github.com/google/uuid"
	"scrumlr.io/server/internal/common"
	"scrumlr.io/server/internal/common/dto"
	"scrumlr.io/server/internal/realtime"

	"scrumlr.io/server/internal/database"
	"scrumlr.io/server/internal/logger"
)

func (s *BoardService) CreateColumn(_ context.Context, body dto.ColumnRequest) (*dto.Column, error) {
	column, err := s.database.CreateColumn(database.ColumnInsert{Board: body.Board, Name: body.Name, Color: body.Color, Visible: body.Visible, Index: body.Index})
	return new(dto.Column).From(column), err
}

func (s *BoardService) DeleteColumn(_ context.Context, board, column, user uuid.UUID) error {
	return s.database.DeleteColumn(board, column, user)
}

func (s *BoardService) UpdateColumn(_ context.Context, body dto.ColumnUpdateRequest) (*dto.Column, error) {
	column, err := s.database.UpdateColumn(database.ColumnUpdate{ID: body.ID, Board: body.Board, Name: body.Name, Color: body.Color, Visible: body.Visible, Index: body.Index})
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

func (s *BoardService) UpdatedColumns(board uuid.UUID, columns []database.Column) {
	err := s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventColumnsUpdated,
		Data: dto.Columns(columns),
	})
	if err != nil {
		logger.Get().Errorw("unable to broadcast updated columns", "err", err)
	}
}
func (s *BoardService) DeletedColumn(user, board, column uuid.UUID, notes []database.Note, votes []database.Vote) {
	err := s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventColumnDeleted,
		Data: column,
	})
	if err != nil {
		logger.Get().Errorw("unable to broadcast updated columns", "err", err)
	}

	eventNotes := make([]dto.Note, len(notes))
	for index, note := range notes {
		eventNotes[index] = *new(dto.Note).From(note)
	}
	err = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: eventNotes,
	})
	if err != nil {
		logger.Get().Errorw("unable to broadcast updated notes", "err", err)
	}

	personalVotes := []*dto.Vote{}
	for _, vote := range votes {
		if vote.User == user {
			personalVotes = append(personalVotes, new(dto.Vote).From(vote))
		}
	}
	err = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventVotesUpdated,
		Data: personalVotes,
	})
	if err != nil {
		logger.Get().Errorw("unable to broadcast updated votes", "err", err)
	}

}
