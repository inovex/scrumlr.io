package notes

import (
	"context"
	"database/sql"
	"encoding/json"
	"errors"
	"time"

	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"

	"github.com/google/uuid"
	"scrumlr.io/server/cache"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/otel"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/websocket"
)

const DefaultTTL = 10 * time.Second

type Service struct {
	database                 NotesDatabase
	realtime                 *realtime.Broker
	boardLastModifiedUpdater BoardLastModifiedUpdater
	cache                    *cache.Cache
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
	GetPrecondition(ctx context.Context, id uuid.UUID, board uuid.UUID, caller uuid.UUID) (Precondition, error)
	GetByUserAndBoard(ctx context.Context, userID uuid.UUID, boardID uuid.UUID) ([]DatabaseNote, error)
}

type BoardLastModifiedUpdater interface {
	UpdateLastModified(ctx context.Context, boardID uuid.UUID, time time.Time) error
}

func NewNotesService(
	db NotesDatabase,
	rt *realtime.Broker,
	cache *cache.Cache,
	boardLastModifiedUpdater BoardLastModifiedUpdater,
) NotesService {
	service := new(Service)
	service.database = db
	service.realtime = rt
	service.cache = cache
	service.boardLastModifiedUpdater = boardLastModifiedUpdater

	return service
}

const errUnableToUpdateLastModified = "unable to update last modified"

func (service *Service) Create(ctx context.Context, body NoteCreateRequest) (*Note, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.notes.service.create")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.notes.service.create.board", body.Board.String()),
		attribute.String("scrumlr.notes.service.create.user", body.User.String()),
		attribute.String("scrumlr.notes.service.create.column", body.Column.String()),
	)

	if body.Text == "" {
		err := errors.New("cannot create note with empty text")
		otel.RecordErrorSpan(span, err, nil)
		return nil, CreateNoteError(BadRequest, "cannot create note with empty text", err)
	}

	note, err := service.database.CreateNote(ctx, DatabaseNoteInsert{Author: body.User, Board: body.Board, Column: body.Column, Text: body.Text})
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to create note"))
		log.Errorw("unable to create note", "board", body.Board, "user", body.User, "error", err)
		return nil, CreateNoteError(Internal, "failed to create note", err)
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

	if body.Text == "" {
		err := errors.New("cannot import note with empty text")
		otel.RecordErrorSpan(span, err, nil)
		return nil, CreateNoteError(BadRequest, "cannot import note with empty text", err)
	}

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
		otel.RecordErrorSpan(span, err, new("failed to import note"))
		log.Errorw("Could not import notes", "err", err)
		return nil, CreateNoteError(Internal, "failed to import note", err)
	}

	notesImportCounter.Add(ctx, 1)
	err = service.boardLastModifiedUpdater.UpdateLastModified(ctx, body.Board, time.Now())
	if err != nil {
		log.Warnw(errUnableToUpdateLastModified, "board", body.Board, "err", err)
	}

	return new(Note).From(note), nil
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
		if errors.Is(err, sql.ErrNoRows) {
			otel.RecordErrorSpan(span, err, new("note not found"))
			return nil, CreateNoteError(NotFound, "note not found", err)
		}

		otel.RecordErrorSpan(span, err, new("failed to get note"))
		log.Errorw("unable to get note", "note", id, "error", err)
		return nil, CreateNoteError(Internal, "failed to get note", err)
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
		otel.RecordErrorSpan(span, err, new("failed to get notes"))
		log.Errorw("unable to get notes", "board", boardID, "error", err)
		return nil, CreateNoteError(Internal, "failed to get notes", err)
	}
	return Notes(notes), nil
}

func (service *Service) GetByUserAndBoard(ctx context.Context, userID uuid.UUID, boardID uuid.UUID) ([]*Note, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.notes.service.get.by_user_and_board")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.notes.service.get.by_user_and_board.user", userID.String()),
		attribute.String("scrumlr.notes.service.get.by_user_and_board.board", boardID.String()),
	)

	notes, err := service.database.GetByUserAndBoard(ctx, userID, boardID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			otel.RecordErrorSpan(span, err, new("notes not found"))
			return nil, CreateNoteError(NotFound, "note not found", err)
		}

		otel.RecordErrorSpan(span, err, new("failed to get notes"))
		log.Errorw("unable to get notes", "error", err)
		return nil, CreateNoteError(Internal, "failed to get notes", err)
	}
	return Notes(notes), nil
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
		otel.RecordErrorSpan(span, err, new("failed to get note stack"))
		log.Errorw("unable to get stack", "note", note, "err", err)
		return nil, CreateNoteError(Internal, "failed to get note stack", err)
	}

	return Notes(notes), err
}

func (service *Service) Update(ctx context.Context, user uuid.UUID, body NoteUpdateRequest) (*Note, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.notes.service.update")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.notes.service.update.note", body.ID.String()),
		attribute.String("scrumlr.notes.service.update.board", body.Board.String()),
	)

	precondition, err := service.database.GetPrecondition(ctx, body.ID, body.Board, user)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get preconditions"))
		return nil, CreateNoteError(Internal, "failed to get preconditions", err)
	}

	if user != precondition.Author && !precondition.CallerRole.CanChangeNoteText() && body.Text != nil {
		err := errors.New("not allowed to change text of note")
		otel.RecordErrorSpan(span, err, nil)
		return nil, CreateNoteError(Forbidden, "not allowed to change note text", err)
	}

	lock, err := service.GetLock(ctx, body.ID)
	if err != nil {
		if _, ok := errors.AsType[*cache.KeyNotFound](err); !ok {
			otel.RecordErrorSpan(span, err, new("failed to get lock"))
			return nil, CreateNoteError(Internal, "failed to get lock", err)
		}
	}

	// lock can be nil, if no lock exists and a KeyNotFound error was returned
	if lock != nil && lock.UserID != user {
		err := errors.New("note is currently locked")
		otel.RecordErrorSpan(span, err, nil)
		return nil, CreateNoteError(Conflict, "note is currently locked", err)
	}

	var positionUpdate *NoteUpdatePosition
	edited := body.Text != nil || body.Edited
	if body.Position != nil {
		if !precondition.StackingAllowed && body.Position.Stack.Valid {
			err := errors.New("not allowed to stack notes")
			otel.RecordErrorSpan(span, err, nil)
			return nil, CreateNoteError(Forbidden, "not allowed to stack notes", err)
		}

		if body.Position.Stack.Valid && body.Position.Stack.UUID == body.ID {
			err := errors.New("not allowed to stack a note on self")
			otel.RecordErrorSpan(span, err, nil)
			return nil, CreateNoteError(Forbidden, "not allowed to stack a note on self", err)
		}

		if body.Position.Rank < 0 {
			body.Position.Rank = 0
		}

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

	note, err := service.database.UpdateNote(ctx, user, DatabaseNoteUpdate{
		ID:       body.ID,
		Board:    body.Board,
		Text:     body.Text,
		Position: positionUpdate,
		Edited:   edited,
	})

	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to update note"))
		log.Errorw("unable to update note", "error", err, "note", body.ID)
		return nil, CreateNoteError(Internal, "failed to update note", err)
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

	preconditions, err := service.database.GetPrecondition(ctx, body.ID, body.Board, user)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get preconditions"))
		return CreateNoteError(Internal, "failed to get preconditions", err)
	}

	if preconditions.Author != user && !preconditions.CallerRole.CanDeleteNote() {
		err := errors.New("not allowed to delete note from other user")
		otel.RecordErrorSpan(span, err, nil)
		return CreateNoteError(Forbidden, "not allowed to delete other user's note", err)
	}

	lock, err := service.GetLock(ctx, body.ID)
	if err != nil {
		if _, ok := errors.AsType[*cache.KeyNotFound](err); !ok {
			span.SetStatus(codes.Error, "failed to get lock")
			span.RecordError(err)
			return CreateNoteError(Internal, "failed to get lock", err)
		}
	}

	// lock can be nil, if no lock exists and a KeyNotFound error was returned
	if lock != nil {
		if lock.UserID != user {
			err := errors.New("note is currently locked")
			otel.RecordErrorSpan(span, err, nil)
			return CreateNoteError(Conflict, "note is currently locked", err)
		}
	}

	stackIds := []uuid.UUID{body.ID}
	if body.DeleteStack {
		stack, err := service.GetStack(ctx, body.ID)
		if err != nil {
			otel.RecordErrorSpan(span, err, new("failed to get note stack"))
			return err
		}

		for _, s := range stack {
			if s.ID == body.ID {
				continue
			}
			stackIds = append(stackIds, s.ID)
		}
	}

	err = service.database.DeleteNote(ctx, user, body.Board, body.ID, body.DeleteStack)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to delete note"))
		log.Errorw("unable to delete note", "note", body, "err", err)
		return CreateNoteError(Internal, "failed to delete note", err)
	}

	service.deletedNote(ctx, body.Board, stackIds...)

	notesDeletedCounter.Add(ctx, 1)
	return nil
}

func (service *Service) DeleteUserNotesFromBoard(ctx context.Context, userID uuid.UUID, boardID uuid.UUID) error {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "notest.service.delete_user_notes")
	defer span.End()

	span.SetAttributes(
		attribute.String("board_id", boardID.String()),
		attribute.String("user_id", userID.String()),
	)

	userNotes, err := service.GetByUserAndBoard(ctx, userID, boardID)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to fetch notes"))
		log.Errorw("failed to get all user notes for board during user deletion", "board", boardID, "user", userID, "err", err)
		return err
	}

	for _, note := range userNotes {

		req := NoteDeleteRequest{
			ID:          note.ID,
			Board:       boardID,
			DeleteStack: false,
		}

		err := service.Delete(ctx, userID, req)
		if err != nil {
			otel.RecordErrorSpan(span, err, new("failed to delete note"))
			log.Errorw("failed to delete note during user deletion", "note", note.ID, "user", userID, "err", err)
		}
	}

	return nil
}

func (service *Service) AcquireLock(ctx context.Context, noteID uuid.UUID, userID uuid.UUID, boardID uuid.UUID) bool {
	ctx, span := tracer.Start(ctx, "scrumlr.notes.service.acquire")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.draglock.service.acquire.noteid", noteID.String()),
		attribute.String("scrumlr.draglock.service.acquire.userid", userID.String()),
	)

	notes, err := service.GetStack(ctx, noteID)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get stack"))
		log.Errorw("failed to get stack", "err", err)
		return false
	}

	for _, note := range notes {
		err = service.cache.Con.Create(ctx, note.ID.String(), userID.String(), DefaultTTL)
		if err != nil {
			log.Infow("lock already exists")
			return false
		}
	}

	service.acquireLock(ctx, boardID, noteID, userID)
	return true
}

func (service *Service) ReleaseLock(ctx context.Context, noteID uuid.UUID, userID uuid.UUID, boardID uuid.UUID) bool {
	ctx, span := tracer.Start(ctx, "scrumlr.draglock.service.release")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.draglock.service.acquire.noteid", noteID.String()),
	)

	notes, err := service.GetStack(ctx, noteID)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get stack"))
		log.Errorw("failed to get stack", "err", err)
		return false
	}

	for _, note := range notes {
		err := service.cache.Con.Delete(ctx, note.ID.String())
		if err != nil {
			otel.RecordErrorSpan(span, err, new("failed to release lock"))
			log.Errorw("failed to release lock", "note", note.ID, "err", err)
			return false
		}
	}

	service.releaseLock(ctx, boardID, noteID, userID)
	return true
}

func (service *Service) GetLock(ctx context.Context, noteID uuid.UUID) (*DragLock, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.notes.service.get_lock")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.notes.service.get_lock.noteid", noteID.String()),
	)

	val, err := service.cache.Con.Get(ctx, noteID.String())
	if err != nil {
		span.SetStatus(codes.Ok, "failed to get lock")
		span.RecordError(err)
		log.Infow("failed to get lock", "err", err)
		return nil, err
	}

	var lock DragLock
	err = json.Unmarshal(val, &lock)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to unmarschal lock data"))
		return nil, err
	}

	return &lock, err
}

func (service *Service) IsLocked(ctx context.Context, noteID uuid.UUID) bool {
	ctx, span := tracer.Start(ctx, "scrumlr.notes.service.islocked")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.notes.service.islocked.noteid", noteID.String()),
	)

	notes, err := service.GetStack(ctx, noteID)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get stack"))
		log.Errorw("failed to get stack", "err", err)
		return false
	}

	for _, note := range notes {
		// if an error occured the lock is not found -> note not locked
		_, err := service.cache.Con.Get(ctx, note.ID.String())
		if err == nil {
			return true
		}
	}

	return false
}

func (service *Service) HandleWebSocketMessage(ctx context.Context, boardID, userID uuid.UUID, conn websocket.Connection, data json.RawMessage) {
	ctx, span := tracer.Start(ctx, "scrumlr.notes.handler")
	defer span.End()
	log := logger.FromContext(ctx)

	var message DragLockMessage
	if err := json.Unmarshal(data, &message); err != nil {
		otel.RecordErrorSpan(span, err, new("failed to unmarschal lock message"))
		log.Errorw("failed to unmarshal drag lock message", "error", err, "data", string(data))

		response := DragLockResponse{
			Type:    WebSocketMessageTypeDragLock,
			Action:  "ERROR",
			Success: false,
			Error:   "Invalid message format",
		}

		err = conn.WriteJSON(ctx, response)
		if err != nil {
			log.Errorw("failed to send drag lock response", "error", err, "response", response)
		}

		return
	}

	switch message.Action {
	case DragLockActionAcquire:
		service.handleAcquire(ctx, message.NoteID, boardID, userID, conn)
	case DragLockActionRelease:
		service.handleRelease(ctx, message.NoteID, boardID, userID, conn)
	default:
		log.Warnw("unknown drag lock action", "action", message.Action, "userId", userID)
		response := DragLockResponse{
			Type:    WebSocketMessageTypeDragLock,
			Action:  message.Action,
			NoteID:  message.NoteID,
			Success: false,
			Error:   "Unknown action",
		}

		err := conn.WriteJSON(ctx, response)
		if err != nil {
			log.Errorw("failed to send drag lock response", "error", err, "response", response)
		}
	}
}

func (service *Service) updatedNotes(ctx context.Context, board uuid.UUID) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.notes.service.update")
	defer span.End()

	err := service.boardLastModifiedUpdater.UpdateLastModified(ctx, board, time.Now())
	if err != nil {
		log.Warnw(errUnableToUpdateLastModified, "board", board, "err", err)
	}

	span.SetAttributes(
		attribute.String("scrumlr.notes.service.update.board", board.String()),
	)

	notes, err := service.database.GetAll(ctx, board)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get all notes"))
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

func (service *Service) deletedNote(ctx context.Context, board uuid.UUID, notes ...uuid.UUID) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.notes.service.delete")
	defer span.End()

	err := service.boardLastModifiedUpdater.UpdateLastModified(ctx, board, time.Now())
	if err != nil {
		log.Warnw(errUnableToUpdateLastModified, "board", board, "err", err)
	}

	span.SetAttributes(
		attribute.String("scrumlr.notes.service.delete.board", board.String()),
	)

	_ = service.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
		Type: realtime.BoardEventNoteDeleted,
		Data: notes,
	})
}

func (service *Service) acquireLock(ctx context.Context, boardID uuid.UUID, noteID uuid.UUID, userID uuid.UUID) {
	ctx, span := tracer.Start(ctx, "scrumlr.notes.service.acquire_lock")
	defer span.End()
	log := logger.FromContext(ctx)

	err := service.realtime.BroadcastToBoard(ctx, boardID, realtime.BoardEvent{
		Type: realtime.BoardEventNoteDragStart,
		Data: map[string]string{
			"noteId": noteID.String(),
			"userId": userID.String(),
		},
	})

	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to broadcast acquire lock"))
		log.Errorw("failed to send note drag event", "err", err)
	}
}

func (service *Service) releaseLock(ctx context.Context, boardID uuid.UUID, noteID uuid.UUID, userID uuid.UUID) {
	ctx, span := tracer.Start(ctx, "scrumlr.notes.service.release_lock")
	defer span.End()
	log := logger.FromContext(ctx)

	err := service.realtime.BroadcastToBoard(ctx, boardID, realtime.BoardEvent{
		Type: realtime.BoardEventNoteDragEnd,
		Data: map[string]string{
			"noteId": noteID.String(),
			"userId": userID.String(),
		},
	})

	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to broadcast release lock"))
		log.Errorw("failed to send note drag event", "err", err)
	}
}

func (service *Service) handleAcquire(ctx context.Context, noteID, boardID, userID uuid.UUID, conn websocket.Connection) {
	ctx, span := tracer.Start(ctx, "scrumlr.notes.handler.acquire")
	defer span.End()
	log := logger.FromContext(ctx)

	success := service.AcquireLock(ctx, noteID, userID, boardID)

	response := DragLockResponse{
		Type:    WebSocketMessageTypeDragLock,
		Action:  DragLockActionAcquire,
		NoteID:  noteID,
		Success: success,
	}

	if !success {
		response.Error = "Note is currently being dragged by another user"
	}

	err := conn.WriteJSON(ctx, response)
	if err != nil {
		log.Errorw("failed to send drag lock response", "error", err, "response", response)
	}
}

func (service *Service) handleRelease(ctx context.Context, noteID, boardID, userID uuid.UUID, conn websocket.Connection) {
	ctx, span := tracer.Start(ctx, "scrumlr.notes.handler.release")
	defer span.End()
	log := logger.FromContext(ctx)

	success := service.ReleaseLock(ctx, noteID, userID, boardID)

	response := DragLockResponse{
		Type:    WebSocketMessageTypeDragLock,
		Action:  DragLockActionRelease,
		NoteID:  noteID,
		Success: success,
	}

	if !success {
		response.Error = "Lock not owned by user or already released"
	}

	err := conn.WriteJSON(ctx, response)
	if err != nil {
		log.Errorw("failed to send drag lock response", "error", err, "response", response)
	}
}
