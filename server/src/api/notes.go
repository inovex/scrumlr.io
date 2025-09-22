package api

import (
	"fmt"
	"net/http"

	"github.com/go-chi/render"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
)

//var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

// createNote creates a new note
func (s *Server) createNote(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.notes.api.create")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	var body notes.NoteCreateRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "failed to decode body")
		span.RecordError(err)
		log.Errorw("unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Board = board
	body.User = user

	note, err := s.notes.Create(ctx, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create note")
		span.RecordError(err)
		log.Warnw("unable to create note", "err", err)
		common.Throw(w, r, err)
		return
	}
	if s.basePath == "/" {
		w.Header().Set("Location", fmt.Sprintf("%s://%s/boards/%s/notes/%s", common.GetProtocol(r), r.Host, board, note.ID))
	} else {
		w.Header().Set("Location", fmt.Sprintf("%s://%s%s/boards/%s/notes/%s", common.GetProtocol(r), r.Host, s.basePath, board, note.ID))
	}
	render.Status(r, http.StatusCreated)
	render.Respond(w, r, note)
}

// getNote get a note
func (s *Server) getNote(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.notes.api.get")
	defer span.End()
	log := logger.FromContext(ctx)

	id := ctx.Value(identifiers.NoteIdentifier).(uuid.UUID)

	note, err := s.notes.Get(ctx, id)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get node")
		span.RecordError(err)
		log.Warnw("unable to get note", "err", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, note)
}

// getNotes get all notes
func (s *Server) getNotes(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.notes.api.get.all")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	notes, err := s.notes.GetAll(ctx, board)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get all notes")
		span.RecordError(err)
		log.Warnw("unable to get nodes for board", "board", board, "err", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, notes)
}

// updateNote updates a note
func (s *Server) updateNote(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.notes.api.update")
	defer span.End()
	log := logger.FromContext(ctx)

	boardID := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
	noteID := ctx.Value(identifiers.NoteIdentifier).(uuid.UUID)
	userId := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	var body notes.NoteUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "failed to decode body")
		span.RecordError(err)
		log.Errorw("unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.ID = noteID
	body.Board = boardID
	note, err := s.notes.Update(ctx, userId, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update note")
		span.RecordError(err)
		log.Warnw("unable to update node", "note", note, "err", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, note)
}

// deleteNote deletes a note
func (s *Server) deleteNote(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.notes.api.delete")
	defer span.End()
	log := logger.FromContext(ctx)

	note := ctx.Value(identifiers.NoteIdentifier).(uuid.UUID)
	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)
	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	var body notes.NoteDeleteRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "failed to decode body")
		span.RecordError(err)
		log.Errorw("unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.ID = note
	body.Board = board

	if err := s.notes.Delete(ctx, user, body); err != nil {
		span.SetStatus(codes.Error, "failed to delete note")
		span.RecordError(err)
		log.Warnw("unable to delete node", "note", note, "err", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}

type NoteDragStateRequest struct {
	Dragging bool `json:"dragging"`
}

// updateNoteDragState updates the drag state of a note
func (s *Server) updateNoteDragState(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	boardID := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	noteID := r.Context().Value(identifiers.NoteIdentifier).(uuid.UUID)
	userID := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

	var body NoteDragStateRequest
	if err := render.Decode(r, &body); err != nil {
		log.Errorw("unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	// Handle drag state with lock management
	var eventType realtime.BoardEventType
	var success bool

	if body.Dragging {
		// Try to acquire the lock
		success = s.dragLocks.AcquireLock(noteID, userID, boardID)
		if !success {
			// Note is already locked by another user
			render.Status(r, http.StatusConflict)
			render.Respond(w, r, map[string]string{"error": "Note is currently being dragged by another user"})
			return
		}
		eventType = realtime.BoardEventNoteDragStart
	} else {
		// Release the lock
		success = s.dragLocks.ReleaseLock(noteID, userID)
		if !success {
			log.Warnw("attempted to release lock not owned by user", "noteId", noteID, "userId", userID)
		}
		eventType = realtime.BoardEventNoteDragEnd
	}

	// Broadcast drag state change event
	_ = s.realtime.BroadcastToBoard(r.Context(), boardID, realtime.BoardEvent{
		Type: eventType,
		Data: map[string]string{
			"noteId": noteID.String(),
			"userId": userID.String(),
		},
	})

	render.Status(r, http.StatusOK)
	render.Respond(w, r, nil)
}
