package notes

import (
	"context"
	"database/sql"

	"scrumlr.io/server/common"
	"scrumlr.io/server/services"

	"github.com/google/uuid"

	"scrumlr.io/server/common/dto"
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
	Observer
	CreateNote(insert database.NoteInsert) (database.Note, error)
	GetNote(id uuid.UUID) (database.Note, error)
	GetNotes(board uuid.UUID, columns ...uuid.UUID) ([]database.Note, error)
	UpdateNote(caller uuid.UUID, update database.NoteUpdate) (database.Note, error)
	DeleteNote(caller uuid.UUID, board uuid.UUID, body bool, id uuid.UUID) error
}

func NewNoteService(db DB, rt *realtime.Broker) services.Notes {
	b := new(NoteService)
	b.database = db
	b.realtime = rt
	b.database.AttachObserver((database.NotesObserver)(b))
	return b
}

func (s *NoteService) Create(ctx context.Context, body dto.NoteCreateRequest) (*dto.Note, error) {
	log := logger.FromContext(ctx)
	note, err := s.database.CreateNote(database.NoteInsert{Author: body.User, Board: body.Board, Column: body.Column, Text: body.Text})
	if err != nil {
		log.Errorw("unable to create note", "board", body.Board, "user", body.User, "error", err)
		return nil, common.InternalServerError
	}
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

func (s *NoteService) List(_ context.Context, boardID uuid.UUID) ([]*dto.Note, error) {
	notes, err := s.database.GetNotes(boardID)
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
	note, err := s.database.UpdateNote(ctx.Value("User").(uuid.UUID), database.NoteUpdate{
		ID:       body.ID,
		Board:    body.Board,
		Text:     body.Text,
		Position: positionUpdate,
	})
	if err != nil {
		log.Errorw("unable to update note", "error", err, "note", body.ID)
		return nil, common.InternalServerError
	}

	return new(dto.Note).From(note), err
}

func (s *NoteService) Delete(ctx context.Context, body dto.NoteDeleteRequest, id uuid.UUID) error {
	return s.database.DeleteNote(ctx.Value("User").(uuid.UUID), ctx.Value("Board").(uuid.UUID), body.DeleteStack, id)
}

func (s *NoteService) UpdatedNotes(board uuid.UUID, notes []database.Note) {
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
func (s *NoteService) DeletedNote(user, board, note uuid.UUID, votes []database.Vote) {
	err := s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventNoteDeleted,
		Data: note,
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
