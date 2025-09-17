package notes

import (
	"context"
	"database/sql"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/votings"

	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/notes")
var meter metric.Meter = otel.Meter("scrumlr.io/server/notes")

type Service struct {
	database      NotesDatabase
	votingService votings.VotingService
	realtime      *realtime.Broker
}

type NotesDatabase interface {
	CreateNote(ctx context.Context, insert DatabaseNoteInsert) (DatabaseNote, error)
	ImportNote(ctx context.Context, insert DatabaseNoteImport) (DatabaseNote, error)
	Get(ctx context.Context, id uuid.UUID) (DatabaseNote, error)
	GetAll(ctx context.Context, board uuid.UUID, columns ...uuid.UUID) ([]DatabaseNote, error)
	GetChildNotes(ctx context.Context, parentNote uuid.UUID) ([]DatabaseNote, error)
	UpdateNote(ctx context.Context, caller uuid.UUID, update DatabaseNoteUpdate) (DatabaseNote, error)
	DeleteNote(ctx context.Context, caller uuid.UUID, board uuid.UUID, id uuid.UUID, deleteStack bool) error
	GetStack(ctx context.Context, noteID uuid.UUID) ([]DatabaseNote, error)
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
	ctx, span := tracer.Start(ctx, "scrumlr.notes.service.create")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.notes.service.create.board", body.Board.String()),
		attribute.String("scrumlr.notes.service.create.user", body.User.String()),
		attribute.String("scrumlr.notes.service.create.column", body.Column.String()),
	)
	note, err := service.database.CreateNote(ctx, DatabaseNoteInsert{Author: body.User, Board: body.Board, Column: body.Column, Text: body.Text})
	if err != nil {
		span.SetStatus(codes.Error, "failed to create note")
		span.RecordError(err)
		log.Errorw("unable to create note", "board", body.Board, "user", body.User, "error", err)
		return nil, common.InternalServerError
	}

	service.updatedNotes(ctx, body.Board)

	notesCreatedCounter.Add(ctx, 1)
	return new(Note).From(note), err
}

func (service *Service) Import(ctx context.Context, body NoteImportRequest) (*Note, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.notes.service.import")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.notes.service.import.board", body.Board.String()),
		attribute.String("scrumlr.notes.service.import.user", body.User.String()),
		attribute.String("scrumlr.notes.service.import.column", body.Position.Column.String()),
	)

	note, err := service.database.ImportNote(ctx, DatabaseNoteImport{
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
		span.SetStatus(codes.Error, "failed to import note")
		span.RecordError(err)
		log.Errorw("Could not import notes", "err", err)
		return nil, err
	}

	notesImportCounter.Add(ctx, 1)
	return new(Note).From(note), err
}

func (service *Service) Update(ctx context.Context, user uuid.UUID, body NoteUpdateRequest) (*Note, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.notes.service.update")
	defer span.End()

	var positionUpdate *NoteUpdatePosition
	edited := body.Text != nil
	if body.Position != nil {
		positionUpdate = &NoteUpdatePosition{
			Column: body.Position.Column,
			Rank:   body.Position.Rank,
			Stack:  body.Position.Stack,
		}

		span.SetAttributes(
			attribute.String("scrumlr.notes.service.update.position.column", body.Position.Column.String()),
			attribute.Int("scrumlr.notes.service.update.position.rank", body.Position.Rank),
			attribute.String("scrumlr.notes.service.update.position.stack", body.Position.Stack.UUID.String()),
		)
	}

	span.SetAttributes(
		attribute.String("scrumlr.notes.service.update.note", body.ID.String()),
		attribute.String("scrumlr.notes.service.update.board", body.Board.String()),
	)
	note, err := service.database.UpdateNote(ctx, user, DatabaseNoteUpdate{
		ID:       body.ID,
		Board:    body.Board,
		Text:     body.Text,
		Position: positionUpdate,
		Edited:   edited,
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to update note")
		span.RecordError(err)
		log.Errorw("unable to update note", "error", err, "note", body.ID)
		return nil, common.InternalServerError
	}

	service.updatedNotes(ctx, body.Board)
	return new(Note).From(note), err
}

func (service *Service) Delete(ctx context.Context, user uuid.UUID, body NoteDeleteRequest) error {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.notes.service.delete")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.notes.service.delete.note", body.ID.String()),
		attribute.String("scrumlr.notes.service.delete.board", body.Board.String()),
		attribute.String("scrumlr.notes.service.delete.user", user.String()),
		attribute.Bool("scrumlr.notes.service.delete.stack", body.DeleteStack),
	)

	votes, err := service.votingService.GetVotes(ctx, filter.VoteFilter{
		Note: &body.ID,
	})
	if err != nil {
		span.SetStatus(codes.Error, "failed to get votes")
		span.RecordError(err)
		return err
	}

	for _, vote := range votes {
		err = service.votingService.RemoveVote(ctx, votings.VoteRequest{
			Note: vote.Note,
			User: vote.User,
		})
	}

	if err != nil {
		span.SetStatus(codes.Error, "failed to remove votes")
		span.RecordError(err)
		return err
	}

	err = service.database.DeleteNote(ctx, user, body.Board, body.ID, body.DeleteStack)
	if err != nil {
		span.SetStatus(codes.Error, "failed to delete note")
		span.RecordError(err)
		log.Errorw("unable to delete note", "note", body, "err", err)
		return err
	}

	service.deletedNote(ctx, body.Board, body.ID, votes, body.DeleteStack)
	notesDeletedCounter.Add(ctx, 1)
	return nil
}

func (service *Service) Get(ctx context.Context, id uuid.UUID) (*Note, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.notes.service.get")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.notes.service.get.note", id.String()),
	)

	note, err := service.database.Get(ctx, id)
	if err != nil {
		if err == sql.ErrNoRows {
			span.SetStatus(codes.Error, "note not found")
			span.RecordError(err)
			return nil, common.NotFoundError
		}

		span.SetStatus(codes.Error, "failed to get note")
		span.RecordError(err)
		log.Errorw("unable to get note", "note", id, "error", err)
		return nil, common.InternalServerError
	}
	return new(Note).From(note), err
}

func (service *Service) GetAll(ctx context.Context, boardID uuid.UUID, columnID ...uuid.UUID) ([]*Note, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.notes.service.get.all")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.notes.service.get.all.board", boardID.String()),
	)
	notes, err := service.database.GetAll(ctx, boardID, columnID...)
	if err != nil {
		if err == sql.ErrNoRows {
			span.SetStatus(codes.Error, "notes not found")
			span.RecordError(err)
			return nil, common.NotFoundError
		}

		span.SetStatus(codes.Error, "failed to get notes")
		span.RecordError(err)
		log.Errorw("unable to get notes", "board", boardID, "error", err)
	}
	return Notes(notes), err
}

func (service *Service) GetStack(ctx context.Context, note uuid.UUID) ([]*Note, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.notes.service.get.stack")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.notes.service.get.stack.note", note.String()),
	)

	notes, err := service.database.GetStack(ctx, note)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get note stack")
		span.RecordError(err)
		log.Errorw("unable to get stack", "note", note, "err", err)
		return nil, err
	}

	return Notes(notes), err
}

func (service *Service) updatedNotes(ctx context.Context, board uuid.UUID) {
	ctx, span := tracer.Start(ctx, "scrumlr.notes.service.update")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.notes.service.update.board", board.String()),
	)

	notes, err := service.database.GetAll(ctx, board)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get all notes")
		span.RecordError(err)
		logger.Get().Errorw("unable to retrieve notes in UpdatedNotes call", "boardID", board, "err", err)
	}

	eventNotes := make([]Note, 0, len(notes))
	for _, note := range notes {
		eventNotes = append(eventNotes, *new(Note).From(note))
	}

	_ = service.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
		Type: realtime.BoardEventNotesUpdated,
		Data: eventNotes,
	})
}

func (service *Service) deletedNote(ctx context.Context, board, note uuid.UUID, deletedVotes []*votings.Vote, deleteStack bool) {
	ctx, span := tracer.Start(ctx, "scrumlr.notes.service.delete")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.notes.service.delete.board", board.String()),
		attribute.String("scrumlr.notes.service.delete.note", note.String()),
		attribute.Bool("scrumlr.notes.service.delete.stack", deleteStack),
	)

	_ = service.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
		Type: realtime.BoardEventNoteDeleted,
		Data: struct {
			Note        uuid.UUID `json:"note"`
			DeleteStack bool      `json:"deleteStack"`
		}{
			Note:        note,
			DeleteStack: deleteStack,
		},
	})

	_ = service.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
		Type: realtime.BoardEventVotesDeleted,
		Data: deletedVotes,
	})
}
