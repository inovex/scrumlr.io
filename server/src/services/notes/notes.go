package notes

import (
	"context"
	"database/sql"

	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/services"

	"github.com/google/uuid"

	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/realtime"

	"scrumlr.io/server/database"
	"scrumlr.io/server/logger"
)

type NoteService struct {
	database DB
	realtime *realtime.Broker
}

type Observer interface {
	AttachObserver(observer database.Observer)
}

type DB interface {
	CreateNote(insert database.NoteInsert) (database.Note, error)
	GetNote(id uuid.UUID) (database.Note, error)
	GetNotes(board uuid.UUID, columns ...uuid.UUID) ([]database.Note, error)
	UpdateNote(caller uuid.UUID, update database.NoteUpdate) (database.Note, error)
	DeleteNote(caller uuid.UUID, board uuid.UUID, id uuid.UUID, deleteStack bool) error
	GetVotes(f filter.VoteFilter) ([]database.Vote, error)
}

func NewNoteService(db DB, rt *realtime.Broker) services.Notes {
	b := new(NoteService)
	b.database = db
	b.realtime = rt
	return b
}

func (s *NoteService) Create(ctx context.Context, body dto.NoteCreateRequest) (*dto.Note, error) {
	log := logger.FromContext(ctx)
	note, err := s.database.CreateNote(database.NoteInsert{Author: body.User, Board: body.Board, Column: body.Column, Text: body.Text})
	if err != nil {
		log.Errorw("unable to create note", "board", body.Board, "user", body.User, "error", err)
		return nil, common.InternalServerError
	}
	s.UpdatedNotes(body.Board)
	return new(dto.Note).From(note), err
}

func (s *NoteService) Get(ctx context.Context, id uuid.UUID) (*dto.Note, error) {
	log := logger.FromContext(ctx)
	note, err := s.database.GetNote(id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.NotFoundError
		}
		log.Errorw("unable to get note", "note", id, "error", err)
		return nil, common.InternalServerError
	}
	return new(dto.Note).From(note), err
}

func (s *NoteService) List(ctx context.Context, boardID uuid.UUID) ([]*dto.Note, error) {
	log := logger.FromContext(ctx)
	notes, err := s.database.GetNotes(boardID)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.NotFoundError
		}
		log.Errorw("unable to get notes", "board", boardID, "error", err)
	}
	return dto.Notes(notes), err
}

func (s *NoteService) Update(ctx context.Context, body dto.NoteUpdateRequest) (*dto.Note, error) {
	log := logger.FromContext(ctx)
	var positionUpdate *database.NoteUpdatePosition
	if body.Position != nil {
		positionUpdate = &database.NoteUpdatePosition{
			Column: body.Position.Column,
			Rank:   body.Position.Rank,
			Stack:  body.Position.Stack,
		}
	}
	note, err := s.database.UpdateNote(ctx.Value(identifiers.UserIdentifier).(uuid.UUID), database.NoteUpdate{
		ID:       body.ID,
		Board:    body.Board,
		Text:     body.Text,
		Position: positionUpdate,
	})
	if err != nil {
		log.Errorw("unable to update note", "error", err, "note", body.ID)
		return nil, common.InternalServerError
	}
	s.UpdatedNotes(body.Board)
	return new(dto.Note).From(note), err
}

func (s *NoteService) Delete(ctx context.Context, body dto.NoteDeleteRequest, id uuid.UUID) error {
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)
	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	note := ctx.Value(identifiers.NoteIdentifier).(uuid.UUID)
	voteFilter := filter.VoteFilter{
		User:  &user,
		Board: board,
		Note:  &note,
	}

	votes, vErr := s.database.GetVotes(voteFilter)
	if vErr != nil {
		logger.Get().Errorw("unable to retrieve votes for a note delete", "err", vErr)
	}

	err := s.database.DeleteNote(user, board, id, body.DeleteStack)
	if err != nil {
		return err
	}

	s.DeletedNote(user, board, note, votes, body.DeleteStack)

	return err
}

func (s *NoteService) UpdatedNotes(board uuid.UUID) {
	notes, dbErr := s.database.GetNotes(board)
	if dbErr != nil {
		logger.Get().Errorw("unable to retrieve notes in UpdatedNotes call", "err", dbErr)
	}

	eventNotes := make([]dto.Note, len(notes))
	for index, note := range notes {
		eventNotes[index] = *new(dto.Note).From(note)
	}

	err := s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: eventNotes,
	})
	if err != nil {
		logger.Get().Errorw("unable to broadcast updated notes", "err", err)
	}
}

func (s *NoteService) DeletedNote(user, board, note uuid.UUID, votes []database.Vote, deleteStack bool) {
	noteData := map[string]interface{}{
		"note":        note,
		"deleteStack": deleteStack,
	}
	err := s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventNoteDeleted,
		Data: noteData,
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
