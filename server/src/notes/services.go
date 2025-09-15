package notes

import (
	"context"
	"database/sql"

	"scrumlr.io/server/votings"

	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

type Service struct {
	database      NotesDatabase
	votingService votings.VotingService
	realtime      *realtime.Broker
}

type NotesDatabase interface {
	CreateNote(insert DatabaseNoteInsert) (DatabaseNote, error)
	ImportNote(insert DatabaseNoteImport) (DatabaseNote, error)
	Get(id uuid.UUID) (DatabaseNote, error)
	GetAll(board uuid.UUID, columns ...uuid.UUID) ([]DatabaseNote, error)
	GetChildNotes(parentNote uuid.UUID) ([]DatabaseNote, error)
	UpdateNote(caller uuid.UUID, update DatabaseNoteUpdate) (DatabaseNote, error)
	DeleteNote(caller uuid.UUID, board uuid.UUID, id uuid.UUID, deleteStack bool) error
	GetStack(noteID uuid.UUID) ([]DatabaseNote, error)
}

func NewNotesService(db NotesDatabase, rt *realtime.Broker, votingService votings.VotingService) NotesService {
	service := new(Service)
	service.database = db
	service.realtime = rt
	service.votingService = votingService

	return service
}

func (service *Service) Create(ctx context.Context, body NoteCreateRequest) (*Note, error) {
	log := logger.FromContext(ctx)
	note, err := service.database.CreateNote(DatabaseNoteInsert{Author: body.User, Board: body.Board, Column: body.Column, Text: body.Text})
	if err != nil {
		log.Errorw("unable to create note", "board", body.Board, "user", body.User, "error", err)
		return nil, common.InternalServerError
	}

	service.updatedNotes(body.Board)
	return new(Note).From(note), err
}

func (service *Service) Import(ctx context.Context, body NoteImportRequest) (*Note, error) {

	log := logger.FromContext(ctx)

	note, err := service.database.ImportNote(DatabaseNoteImport{
		Author: body.User,
		Board:  body.Board,
		Position: &NoteUpdatePosition{
			Column: body.Position.Column,
			Rank:   body.Position.Rank,
			Stack:  body.Position.Stack,
		},
		Text: body.Text,
	})
	if err != nil {
		log.Errorw("Could not import notes", "err", err)
		return nil, err
	}
	return new(Note).From(note), err
}

func (service *Service) Update(ctx context.Context, user uuid.UUID, body NoteUpdateRequest) (*Note, error) {
	log := logger.FromContext(ctx)
	var positionUpdate *NoteUpdatePosition
	edited := body.Text != nil
	if body.Position != nil {
		positionUpdate = &NoteUpdatePosition{
			Column: body.Position.Column,
			Rank:   body.Position.Rank,
			Stack:  body.Position.Stack,
		}
	}

	note, err := service.database.UpdateNote(user, DatabaseNoteUpdate{
		ID:       body.ID,
		Board:    body.Board,
		Text:     body.Text,
		Position: positionUpdate,
		Edited:   edited,
	})

	if err != nil {
		log.Errorw("unable to update note", "error", err, "note", body.ID)
		return nil, common.InternalServerError
	}

	service.updatedNotes(body.Board)
	return new(Note).From(note), err
}

func (service *Service) Delete(ctx context.Context, user uuid.UUID, body NoteDeleteRequest) error {
	log := logger.FromContext(ctx)

	votes, err := service.votingService.GetVotes(ctx, filter.VoteFilter{
		Note: &body.ID,
	})
	if err != nil {
		return err
	}
	for _, vote := range votes {
		err = service.votingService.RemoveVote(ctx, votings.VoteRequest{
			Note: vote.Note,
			User: vote.User,
		})
	}

	if err != nil {
		return err
	}

	err = service.database.DeleteNote(user, body.Board, body.ID, body.DeleteStack)
	if err != nil {
		log.Errorw("unable to delete note", "note", body, "err", err)
		return err
	}

	service.deletedNote(body.Board, body.ID, votes, body.DeleteStack)
	return nil
}

func (service *Service) Get(ctx context.Context, id uuid.UUID) (*Note, error) {
	log := logger.FromContext(ctx)
	note, err := service.database.Get(id)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.NotFoundError
		}
		log.Errorw("unable to get note", "note", id, "error", err)
		return nil, common.InternalServerError
	}
	return new(Note).From(note), err
}

func (service *Service) GetAll(ctx context.Context, boardID uuid.UUID, columnID ...uuid.UUID) ([]*Note, error) {
	log := logger.FromContext(ctx)
	notes, err := service.database.GetAll(boardID, columnID...)
	if err != nil {
		if err == sql.ErrNoRows {
			return nil, common.NotFoundError
		}
		log.Errorw("unable to get notes", "board", boardID, "error", err)
	}
	return Notes(notes), err
}

func (service *Service) GetStack(ctx context.Context, note uuid.UUID) ([]*Note, error) {
	log := logger.FromContext(ctx)
	notes, err := service.database.GetStack(note)
	if err != nil {
		log.Errorw("unable to get stack", "note", note, "err", err)
		return nil, err
	}

	return Notes(notes), err
}

func (service *Service) updatedNotes(board uuid.UUID) {
	notes, err := service.database.GetAll(board)
	if err != nil {
		logger.Get().Errorw("unable to retrieve notes in UpdatedNotes call", "boardID", board, "err", err)
	}

	eventNotes := make([]Note, 0, len(notes))
	for _, note := range notes {
		eventNotes = append(eventNotes, *new(Note).From(note))
	}

	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: eventNotes,
	})
}

func (service *Service) deletedNote(board, note uuid.UUID, deletedVotes []*votings.Vote, deleteStack bool) {
	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventNoteDeleted,
		Data: struct {
			Note        uuid.UUID `json:"note"`
			DeleteStack bool      `json:"deleteStack"`
		}{
			Note:        note,
			DeleteStack: deleteStack,
		},
	})

	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventVotesDeleted,
		Data: deletedVotes,
	})
}
