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
)

//var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

// Create a new note on a board
//
//	@Summary		Create a new note on a board
//	@Description	Create a new note on a board
//	@Tags			notes
//	@Accept			json
//	@Param			Cookie	header	string					true	"jwt token to authenticate"
//	@Param			boardId	path	string					true	"id of the board"
//	@Param			note	body	notes.NoteCreateRequest	true	"note to create"
//	@Produce		json
//	@Header			201	{string}	Location	"Path to the created note"
//	@Success		201	{object}	notes.Note
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/notes [post]
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
	w.Header().Set("Location", s.buildRelativeURL(fmt.Sprintf("/boards/%s/notes/%s", board, note.ID)))
	render.Status(r, http.StatusCreated)
	render.Respond(w, r, note)
}

// Get a note on a board
//
//	@Summary		Create a new note on a board
//	@Description	Create a new note on a board
//	@Tags			notes
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardId	path	string	true	"id of the board"
//	@Param			id		path	string	true	"id of the note"
//	@Produce		json
//	@Success		200	{object}	notes.Note
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/notes/{id} [get]
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

// Get all notes on a board
//
//	@Summary		Get all notes on a board
//	@Description	Get all notes on a board
//	@Tags			notes
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardId	path	string	true	"id of the board"
//	@Produce		json
//	@Success		200	{object}	[]notes.Note
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/notes [get]
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

// Update a note on a board
//
//	@Summary		Update a note on a board
//	@Description	Update a note on a board
//	@Tags			notes
//	@Accept			json
//	@Param			Cookie	header	string					true	"jwt token to authenticate"
//	@Param			boardId	path	string					true	"id of the board"
//	@Param			id		path	string					true	"id of the note"
//	@Param			note	body	notes.NoteUpdateRequest	true	"values to update a note"
//	@Produce		json
//	@Success		200	{object}	notes.Note
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/notes/{id} [put]
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

// Delete a note from a board
//
//	@Summary		Delete a note from a board
//	@Description	Delete a note from a board
//	@Tags			notes
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			boardId	path	string	true	"id of the board"
//	@Param			id		path	string	true	"id of the note"
//	@Produce		json
//	@Success		204
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{boardId}/notes/{id} [delete]
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
