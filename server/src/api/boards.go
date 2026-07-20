package api

import (
	"encoding/csv"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/hash"
	"scrumlr.io/server/sessions"

	"scrumlr.io/server/boards"
	"scrumlr.io/server/votings"

	"scrumlr.io/server/notes"

	"scrumlr.io/server/identifiers"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
)

const boardParticipantsPath = "/boards/%s/participants/%s"
const boardsRequestsPath = "/boards/%s/requests/%s"

//var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

// Create a new board
//
//	@Summary		Create a new board
//	@Description	Create a new board
//	@Tags			boards
//	@Accept			json
//	@Param			Cookie	header	string						true	"jwt token to authenticate"
//	@Param			board	body	boards.CreateBoardRequest	true	"board to create"
//	@Produce		json
//	@Header			201	{string}	Location	"Path to the created board"
//	@Success		201	{object}	boards.Board
//	@Failure		400	{object}	common.APIError
//	@Router			/boards [post]
func (s *Server) createBoard(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.boards.api.create")
	defer span.End()
	log := logger.FromContext(ctx)

	owner := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)
	// parse request
	var body boards.CreateBoardRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "failed to decode body")
		span.RecordError(err)
		log.Errorw("Unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Owner = owner

	b, err := s.boards.Create(ctx, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create board")
		span.RecordError(err)
		log.Errorw("failed to create board", "err", err)
		common.Throw(w, r, mapError(err))
		return
	}

	// build the response
	w.Header().Set("Location", s.buildRelativeURL(fmt.Sprintf("/boards/%s", b.ID)))
	render.Status(r, http.StatusCreated)
	render.Respond(w, r, b)
}

// Delete a board
//
//	@Summary		Delete a board
//	@Description	Delete a board
//	@Tags			boards
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			id		path	string	true	"id of the board to delete"
//	@Produce		json
//	@Success		204
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{id} [delete]
func (s *Server) deleteBoard(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.boards.api.delete")
	defer span.End()
	log := logger.FromContext(ctx)

	board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	err := s.boards.Delete(ctx, board)
	if err != nil {
		span.SetStatus(codes.Error, "failed to create board")
		span.RecordError(err)
		log.Errorw("failed to delete board", "err", err)
		http.Error(w, "failed to delete board", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}

// Get all boards
//
//	@Summary		Delete a board
//	@Description	Delete a board
//	@Tags			boards
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Produce		json
//	@Success		200	{object}	boards.BoardOverview
//	@Failure		400	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards [get]
func (s *Server) getBoards(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.boards.api.get.all")
	defer span.End()
	log := logger.FromContext(ctx)

	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	boardIDs, err := s.boards.GetBoards(ctx, user)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get boards")
		span.RecordError(err)
		log.Errorw("failed to get boards", "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	OverviewBoards, err := s.boards.BoardOverview(ctx, boardIDs, user)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get board overview")
		span.RecordError(err)
		log.Errorw("failed to get board overview", "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}
	render.Status(r, http.StatusOK)
	render.Respond(w, r, OverviewBoards)
}

// Get a board by its id
//
//	@Summary		Get a board
//	@Description	Get a board
//	@Tags			boards
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			id		path	string	true	"id of the board to get"
//	@Produce		json
//	@Success		200	{object}	boards.Board
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{id} [get]
func (s *Server) getBoard(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.boards.api.get")
	defer span.End()
	log := logger.FromContext(ctx)

	boardId := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	if len(r.Header["Upgrade"]) > 0 && r.Header["Upgrade"][0] == "websocket" {
		s.openBoardSocket(w, r)
		return
	}

	board, err := s.boards.Get(ctx, boardId)
	if err != nil {
		mappedErr := mapError(err)
		if errors.Is(mappedErr, common.NotFoundError) {
			span.SetStatus(codes.Error, "board not found")
		} else {
			span.SetStatus(codes.Error, "failed to get board")
		}
		span.RecordError(err)
		log.Errorw("unable to access board", "err", err)
		common.Throw(w, r, mappedErr)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, board)
}

// Join a board
//
//	@Summary		Join an existing board
//	@Description	Join an existing board
//	@Tags			boards
//	@Accept			json
//	@Param			Cookie	header	string					true	"jwt token to authenticate"
//	@Param			id		path	string					true	"id of the board to join"
//	@Param			join	body	boards.JoinBoardRequest	false	"join request for the board"
//	@Produce		json
//	@Header			201	{string}	Location	"Path to the created session"
//	@Success		303
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		429
//	@Failure		500	{object}	common.APIError
//	@Router			/boards/{id}/participants [post]
func (s *Server) joinBoard(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.boards.api.join")
	defer span.End()
	log := logger.FromContext(ctx)

	boardParam := chi.URLParam(r, "id")
	board, err := uuid.Parse(boardParam)
	if err != nil {
		span.SetStatus(codes.Error, "failed to parse board id")
		span.RecordError(err)
		log.Errorw("Wrong board id", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	sessionExists, err := s.sessions.Exists(ctx, board, user)
	if err != nil {
		span.SetStatus(codes.Error, "failed to check session")
		span.RecordError(err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	if sessionExists {
		banned, err := s.sessions.IsParticipantBanned(ctx, board, user)
		if err != nil {
			span.SetStatus(codes.Error, "failed to check if participant is banned")
			span.RecordError(err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if banned {
			err := errors.New("participant is currently banned from this session")
			span.SetStatus(codes.Error, "participant is banned")
			span.RecordError(err)
			common.Throw(w, r, common.ForbiddenError(err))
			return
		}

		http.Redirect(w, r, s.buildRelativeURL(fmt.Sprintf(boardParticipantsPath, board, user)), http.StatusSeeOther)
		return
	}

	b, err := s.boards.Get(ctx, board)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get board")
		span.RecordError(err)
		common.Throw(w, r, common.NotFoundError)
		return
	}

	if b.AccessPolicy == boards.Public {
		_, err := s.sessions.Create(ctx, sessions.BoardSessionCreateRequest{Board: board, User: user, Role: common.ParticipantRole})
		if err != nil {
			span.SetStatus(codes.Error, "failed to create session")
			span.RecordError(err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		w.Header().Set("Location", s.buildRelativeURL(fmt.Sprintf(boardParticipantsPath, board, user)))
		w.WriteHeader(http.StatusCreated)
		return
	}

	if b.AccessPolicy == boards.ByPassphrase {
		var body boards.JoinBoardRequest
		err := render.Decode(r, &body)
		if err != nil {
			span.SetStatus(codes.Error, "failed to decode body")
			span.RecordError(err)
			log.Errorw("Unable to decode body", "err", err)
			common.Throw(w, r, common.BadRequestError(errors.New("unable to parse request body")))
			return
		}

		if body.Passphrase == "" {
			err := errors.New("missing passphrase")
			span.SetStatus(codes.Error, "no passphrase provided")
			span.RecordError(err)
			common.Throw(w, r, common.BadRequestError(err))
			return
		}

		encodedPassphrase := hash.NewHashSha512().HashBySalt(body.Passphrase, *b.Salt)
		if encodedPassphrase == *b.Passphrase {
			_, err := s.sessions.Create(ctx, sessions.BoardSessionCreateRequest{Board: board, User: user, Role: common.ParticipantRole})
			if err != nil {
				span.SetStatus(codes.Error, "failed to create session")
				span.RecordError(err)
				common.Throw(w, r, common.InternalServerError)
				return
			}

			w.Header().Set("Location", s.buildRelativeURL(fmt.Sprintf(boardParticipantsPath, board, user)))
			w.WriteHeader(http.StatusCreated)
			return

		} else {
			err := errors.New("wrong passphrase")
			span.SetStatus(codes.Error, "wrong passphrase provided")
			span.RecordError(err)
			common.Throw(w, r, common.BadRequestError(err))
			return
		}
	}

	if b.AccessPolicy == boards.ByInvite {
		sessionRequestExists, err := s.sessionRequests.Exists(ctx, board, user)
		if err != nil {
			span.SetStatus(codes.Error, "failed to check session requests")
			span.RecordError(err)
			http.Error(w, "failed to check for existing board session request", http.StatusInternalServerError)
			return
		}

		if sessionRequestExists {
			w.Header().Set("Location", s.buildRelativeURL(fmt.Sprintf(boardsRequestsPath, board, user)))
			w.WriteHeader(http.StatusSeeOther)
			return
		}

		_, err = s.sessionRequests.Create(ctx, board, user)
		if err != nil {
			span.SetStatus(codes.Error, "failed to create session request")
			span.RecordError(err)
			http.Error(w, "failed to create board session request", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Location", s.buildRelativeURL(fmt.Sprintf(boardsRequestsPath, board, user)))
		w.WriteHeader(http.StatusSeeOther)
		return
	}

	w.WriteHeader(http.StatusBadRequest)
}

// Update a board
//
//	@Summary		Update a board
//	@Description	Update a board
//	@Tags			boards
//	@Accept			json
//	@Param			Cookie	header	string						true	"jwt token to authenticate"
//	@Param			id		path	string						true	"id of the board to update"
//	@Param			board	body	boards.BoardUpdateRequest	true	"values to update the board"
//	@Produce		json
//	@Success		200	{object}	boards.Board
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards{id} [put]
func (s *Server) updateBoard(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.boards.api.get.all")
	defer span.End()
	log := logger.FromContext(ctx)

	boardId := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	var body boards.BoardUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "failed to decode body")
		span.RecordError(err)
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.ID = boardId
	board, err := s.boards.Update(ctx, body)
	if err != nil {
		span.SetStatus(codes.Error, "failed to update board")
		span.RecordError(err)
		log.Errorw("Unable to update board", "err", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, board)
}

// Set a new timer for a board
//
//	@Summary		Set a new timer for a board
//	@Description	Set a new timer for a board
//	@Tags			boards
//	@Accept			json
//	@Param			Cookie	header	string					true	"jwt token to authenticate"
//	@Param			id		path	string					true	"id of the board to set the timer"
//	@Param			timer	body	boards.SetTimerRequest	true	"timer request"
//	@Produce		json
//	@Success		200	{object}	boards.Board
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards{id}/timer [post]
func (s *Server) setTimer(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.boards.api.timer.set")
	defer span.End()
	log := logger.FromContext(ctx)

	boardId := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	var body boards.SetTimerRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "failed to decode body")
		span.RecordError(err)
		log.Errorw("Unable to decode body", "err", err)
		common.Throw(w, r, err)
		return
	}

	board, err := s.boards.SetTimer(ctx, boardId, body.Minutes)
	if err != nil {
		span.SetStatus(codes.Error, "failed to set board timer")
		span.RecordError(err)
		log.Errorw("Unable to set board timer", "err", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, board)
}

// Delete a timer for a board
//
//	@Summary		Delete a timer for a board
//	@Description	Delete a timer for a board
//	@Tags			boards
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			id		path	string	true	"id of the board to delete the timer from"
//	@Produce		json
//	@Success		200	{object}	boards.Board
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards{id}/timer [delete]
func (s *Server) deleteTimer(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.boards.api.timer.delete")
	defer span.End()
	log := logger.FromContext(ctx)

	boardId := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	board, err := s.boards.DeleteTimer(ctx, boardId)
	if err != nil {
		span.SetStatus(codes.Error, "failed to delete board timer")
		span.RecordError(err)
		log.Errorw("Unable to delete board timer", "err", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, board)
}

// Increment a timer for a board
//
//	@Summary		Increment a timer for a board
//	@Description	Increment a timer for a board by one minute
//	@Tags			boards
//	@Accept			json
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			id		path	string	true	"id of the board to increment the timer"
//	@Produce		json
//	@Success		200	{object}	boards.Board
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/boards{id}/timer/increment [post]
func (s *Server) incrementTimer(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.boards.api.timer.increment")
	defer span.End()
	log := logger.FromContext(ctx)

	boardId := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	board, err := s.boards.IncrementTimer(ctx, boardId)
	if err != nil {
		span.SetStatus(codes.Error, "failed to increment board timer")
		span.RecordError(err)
		log.Errorw("Unable to increment board timer", "err", err)
		common.Throw(w, r, mapError(err))
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, board)
}

// Export a board
//
//	@Summary		Export a board
//	@Description	Export a board
//	@Tags			boards
//	@Accept			json text/csv
//	@Param			Cookie	header	string	true	"jwt token to authenticate"
//	@Param			id		path	string	true	"id of the board to export"
//	@Produce		json text/csv
//	@Success		200	{object}	boards.Board
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		404	{object}	common.APIError
//	@Failure		406
//	@Failure		500	{object}	common.APIError
//	@Router			/boards{id}/export [get]
func (s *Server) exportBoard(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.boards.api.export")
	defer span.End()
	log := logger.FromContext(ctx)

	boardId := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	fullBoard, err := s.boards.FullBoard(ctx, boardId)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get full board")
		span.RecordError(err)
		common.Throw(w, r, mapError(err))
		return
	}

	visibleColumns := make([]*columns.Column, 0, len(fullBoard.Columns))
	for _, column := range fullBoard.Columns {
		if column.Visible {
			visibleColumns = append(visibleColumns, column)
		}
	}

	visibleNotes := make([]*notes.Note, 0, len(fullBoard.Notes))
	for _, note := range fullBoard.Notes {
		for _, column := range visibleColumns {
			if note.Position.Column == column.ID {
				visibleNotes = append(visibleNotes, note)
			}
		}
	}

	if r.Header.Get("Accept") == "" || r.Header.Get("Accept") == "*/*" || r.Header.Get("Accept") == "application/json" {
		render.Status(r, http.StatusOK)
		render.Respond(w, r, struct {
			Board        *boards.Board            `json:"board"`
			Participants []*sessions.BoardSession `json:"participants"`
			Columns      []*columns.Column        `json:"columns"`
			Notes        []*notes.Note            `json:"notes"`
			Votings      []*votings.Voting        `json:"votings"`
		}{
			Board:        fullBoard.Board,
			Participants: fullBoard.BoardSessions,
			Columns:      visibleColumns,
			Notes:        visibleNotes,
			Votings:      fullBoard.Votings,
		})
		return
	} else if r.Header.Get("Accept") == "text/csv" {
		header := []string{"note_id", "author_id", "author", "text", "column_id", "column", "rank", "stack"}
		for index, closedVoting := range fullBoard.Votings {
			if closedVoting.Status == votings.Closed {
				header = append(header, fmt.Sprintf("voting_%d", index))
			}
		}
		records := [][]string{header}

		for _, note := range visibleNotes {
			stack := "null"
			if note.Position.Stack.Valid {
				stack = note.Position.Stack.UUID.String()
			}

			author := note.Author.String()
			for _, session := range fullBoard.BoardSessions {
				if session.UserID == note.Author {
					user, err := s.users.Get(ctx, session.UserID)
					if err != nil {
						span.SetStatus(codes.Error, "failed to get note author user")
						span.RecordError(err)
						common.Throw(w, r, err)
						return
					}
					author = user.Name
				}
			}

			column := note.Position.Column.String()
			for _, c := range visibleColumns {
				if c.ID == note.Position.Column {
					column = c.Name
				}
			}

			resultOnNote := []string{
				note.ID.String(),
				note.Author.String(),
				author,
				note.Text,
				note.Position.Column.String(),
				column,
				strconv.Itoa(note.Position.Rank),
				stack,
			}

			for _, closedVoting := range fullBoard.Votings {
				if closedVoting.Status == votings.Closed {
					if closedVoting.VotingResults != nil {
						resultOnNote = append(resultOnNote, strconv.Itoa(closedVoting.VotingResults.Votes[note.ID].Total))
					} else {
						resultOnNote = append(resultOnNote, "0")
					}
				}
			}

			records = append(records, resultOnNote)
		}

		render.Status(r, http.StatusOK)
		csvWriter := csv.NewWriter(w)
		err := csvWriter.WriteAll(records)
		if err != nil {
			span.SetStatus(codes.Error, "failed to respond with csv")
			span.RecordError(err)
			log.Errorw("failed to respond with csv", "err", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}
		return
	}

	render.Status(r, http.StatusNotAcceptable)
	render.Respond(w, r, nil)
}

// Import a board
//
//	@Summary		Import a board
//	@Description	Import a board
//	@Tags			boards
//	@Accept			json
//	@Param			Cookie	header	string						true	"jwt token to authenticate"
//	@Param			board	body	boards.ImportBoardRequest	true	"board to import"
//	@Produce		json
//	@Success		201	{object}	boards.Board
//	@Failure		400	{object}	common.APIError
//	@Failure		403	{object}	common.APIError
//	@Failure		500	{object}	common.APIError
//	@Router			/import [post]
func (s *Server) importBoard(w http.ResponseWriter, r *http.Request) {
	ctx, span := tracer.Start(r.Context(), "scrumlr.boards.api.import")
	defer span.End()
	log := logger.FromContext(ctx)

	owner := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)

	var body boards.ImportBoardRequest
	if err := render.Decode(r, &body); err != nil {
		span.SetStatus(codes.Error, "failed to decode body")
		span.RecordError(err)
		log.Errorw("Could not read body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Board.Owner = owner
	importColumns := make([]columns.ColumnRequest, 0, len(body.Columns))

	for _, column := range body.Columns {
		importColumns = append(importColumns, columns.ColumnRequest{
			Name:        column.Name,
			Description: column.Description,
			Color:       column.Color,
			Visible:     &column.Visible,
			Index:       &column.Index,
		})
	}
	b, err := s.boards.Create(ctx, boards.CreateBoardRequest{
		Name:         body.Board.Name,
		Description:  body.Board.Description,
		AccessPolicy: body.Board.AccessPolicy,
		Passphrase:   body.Board.Passphrase,
		Columns:      importColumns,
		Owner:        owner,
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to import board")
		span.RecordError(err)
		log.Errorw("Could not import board", "err", err)
		common.Throw(w, r, mapError(err))
		return
	}

	cols, err := s.columns.GetAll(ctx, b.ID)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get columns from imported board")
		span.RecordError(err)
		_ = s.boards.Delete(ctx, b.ID)
	}

	type ParentChildNotes struct {
		Parent   notes.Note
		Children []notes.Note
	}
	parentNotes := make(map[uuid.UUID]notes.Note)
	childNotes := make(map[uuid.UUID][]notes.Note)

	for _, note := range body.Notes {
		if !note.Position.Stack.Valid {
			parentNotes[note.ID] = note
		} else {
			childNotes[note.Position.Stack.UUID] = append(childNotes[note.Position.Stack.UUID], note)
		}
	}

	var organizedNotes []ParentChildNotes
	for parentID, parentNote := range parentNotes {
		for i, column := range body.Columns {
			if parentNote.Position.Column == column.ID {

				note, err := s.notes.Import(ctx, notes.NoteImportRequest{
					Text: parentNote.Text,
					Position: notes.NotePosition{
						Column: cols[i].ID,
						Stack:  uuid.NullUUID{},
						Rank:   0,
					},
					Board: b.ID,
					User:  parentNote.Author,
				})
				if err != nil {
					span.SetStatus(codes.Error, "failed to import notes")
					span.RecordError(err)
					_ = s.boards.Delete(ctx, b.ID)
					common.Throw(w, r, mapError(err))
					return
				}
				parentNote = *note
			}
		}
		organizedNotes = append(organizedNotes, ParentChildNotes{
			Parent:   parentNote,
			Children: childNotes[parentID],
		})
	}

	for _, node := range organizedNotes {
		for _, note := range node.Children {
			_, err := s.notes.Import(ctx, notes.NoteImportRequest{
				Text:  note.Text,
				Board: b.ID,
				User:  note.Author,
				Position: notes.NotePosition{
					Column: node.Parent.Position.Column,
					Rank:   note.Position.Rank,
					Stack: uuid.NullUUID{
						UUID:  node.Parent.ID,
						Valid: true,
					},
				},
			})
			if err != nil {
				span.SetStatus(codes.Error, "failed to import note")
				span.RecordError(err)
				_ = s.boards.Delete(ctx, b.ID)
				common.Throw(w, r, mapError(err))
				return
			}
		}
	}

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, b)
}
