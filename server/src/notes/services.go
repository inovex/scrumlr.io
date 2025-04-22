package notes

import (
	"context"
	"database/sql"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/voting"
)

type Service struct {
	database NotesDatabase
	realtime *realtime.Broker
}

type NotesDatabase interface {
	CreateNote(insert NoteInsertDB) (NoteDB, error)
	ImportNote(insert NoteImportDB) (NoteDB, error)
	Get(id uuid.UUID) (NoteDB, error)
	GetAll(board uuid.UUID, columns ...uuid.UUID) ([]NoteDB, error)
	GetChildNotes(parentNote uuid.UUID) ([]NoteDB, error)
	UpdateNote(caller uuid.UUID, update NoteUpdateDB) (NoteDB, error)
	DeleteNote(caller uuid.UUID, board uuid.UUID, id uuid.UUID, deleteStack bool) error
	GetStack(noteID uuid.UUID) ([]NoteDB, error)
}

func (service *Service) Create(ctx context.Context, body NoteCreateRequest) (*Note, error) {
	log := logger.FromContext(ctx)
	note, err := service.database.CreateNote(NoteInsertDB{Author: body.User, Board: body.Board, Column: body.Column, Text: body.Text})
	if err != nil {
		log.Errorw("unable to create note", "board", body.Board, "user", body.User, "error", err)
		return nil, common.InternalServerError
	}
	service.updatedNotes(body.Board)
	return new(Note).From(note), err
}

func (service *Service) Import(ctx context.Context, body NoteImportRequest) (*Note, error) {

	log := logger.FromContext(ctx)

	note, err := service.database.ImportNote(NoteImportDB{
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

func (service *Service) Update(ctx context.Context, body NoteUpdateRequest) (*Note, error) {
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

	note, err := service.database.UpdateNote(ctx.Value(identifiers.UserIdentifier).(uuid.UUID), NoteUpdateDB{
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

func (service *Service) Delete(ctx context.Context, body NoteDeleteRequest, noteID uuid.UUID, deletedVotes []*voting.Vote) error {
	log := logger.FromContext(ctx)
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)
	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	err := service.database.DeleteNote(user, board, noteID, body.DeleteStack)
	if err != nil {
		log.Errorw("unable to delete note", "note", body, "err", err)
		return err
	}

	service.deletedNote(user, board, noteID, deletedVotes, body.DeleteStack)
	return nil
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

	eventNotes := make([]Note, len(notes))
	for index, note := range notes {
		eventNotes[index] = *new(Note).From(note)
	}

	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: eventNotes,
	})
}

func (service *Service) deletedNote(user, board, note uuid.UUID, deletedVotes []*voting.Vote, deleteStack bool) {
	noteData := map[string]interface{}{
		"note":        note,
		"deleteStack": deleteStack,
	}
	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventNoteDeleted,
		Data: noteData,
	})

	_ = service.realtime.BroadcastToBoard(board, realtime.BoardEvent{
		Type: realtime.BoardEventVotesDeleted,
		Data: deletedVotes,
	})

}

func NewNotesService(db NotesDatabase, rt *realtime.Broker) NotesService {
	b := new(Service)
	b.database = db
	b.realtime = rt
	return b
}
