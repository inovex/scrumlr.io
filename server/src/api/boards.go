package api

import (
	"database/sql"
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

//var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/api")

// createBoard creates a new board
func (s *Server) createBoard(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.boards.api.create")
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
		common.Throw(w, r, err)
		return
	}

	// build the response
	if s.basePath == "/" {
		w.Header().Set("Location", fmt.Sprintf("%s://%s/boards/%s", common.GetProtocol(r), r.Host, b.ID))
	} else {
		w.Header().Set("Location", fmt.Sprintf("%s://%s%s/boards/%s", common.GetProtocol(r), r.Host, s.basePath, b.ID))
	}
	render.Status(r, http.StatusCreated)
	render.Respond(w, r, b)
}

// deleteBoard deletes a board
func (s *Server) deleteBoard(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.boards.api.delete")
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

func (s *Server) getBoards(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.boards.api.get.all")
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

// getBoard get a board
func (s *Server) getBoard(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.boards.api.get")
	defer span.End()
	log := logger.FromContext(ctx)

	boardId := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	if len(r.Header["Upgrade"]) > 0 && r.Header["Upgrade"][0] == "websocket" {
		s.openBoardSocket(w, r)
		return
	}

	board, err := s.boards.Get(ctx, boardId)
	if err != nil {
		if err == sql.ErrNoRows {
			span.SetStatus(codes.Error, "no board found")
			span.RecordError(err)
			common.Throw(w, r, common.NotFoundError)
			return
		}

		span.SetStatus(codes.Error, "failed to get board")
		span.RecordError(err)
		log.Errorw("unable to access board", "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, board)
}

// JoinBoardRequest represents the request to create a new participant of a board.
type JoinBoardRequest struct {

	// The passphrase challenge if the access policy is 'BY_PASSPHRASE'.
	Passphrase string `json:"passphrase"`
}

// joinBoard create a new participant
func (s *Server) joinBoard(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.boards.api.join")
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

	exists, err := s.sessions.Exists(ctx, board, user)
	if err != nil {
		span.SetStatus(codes.Error, "failed to check session")
		span.RecordError(err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	if exists {
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

		if s.basePath == "/" {
			http.Redirect(w, r, fmt.Sprintf("%s://%s/boards/%s/participants/%s", common.GetProtocol(r), r.Host, board, user), http.StatusSeeOther)
		} else {
			http.Redirect(w, r, fmt.Sprintf("%s://%s%s/boards/%s/participants/%s", common.GetProtocol(r), r.Host, s.basePath, board, user), http.StatusSeeOther)
		}
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

		if s.basePath == "/" {
			w.Header().Set("Location", fmt.Sprintf("%s://%s/boards/%s/participants/%s", common.GetProtocol(r), r.Host, board, user))
		} else {
			w.Header().Set("Location", fmt.Sprintf("%s://%s%s/boards/%s/participants/%s", common.GetProtocol(r), r.Host, s.basePath, board, user))
		}
		w.WriteHeader(http.StatusCreated)
		return
	}

	if b.AccessPolicy == boards.ByPassphrase {
		var body JoinBoardRequest
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

			if s.basePath == "/" {
				w.Header().Set("Location", fmt.Sprintf("%s://%s/boards/%s/participants/%s", common.GetProtocol(r), r.Host, board, user))
			} else {
				w.Header().Set("Location", fmt.Sprintf("%s://%s%s/boards/%s/participants/%s", common.GetProtocol(r), r.Host, s.basePath, board, user))
			}
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
		sessionExists, err := s.sessionRequests.Exists(ctx, board, user)
		if err != nil {
			span.SetStatus(codes.Error, "failed to check session requests")
			span.RecordError(err)
			http.Error(w, "failed to check for existing board session request", http.StatusInternalServerError)
			return
		}

		if sessionExists {
			if s.basePath == "/" {
				w.Header().Set("Location", fmt.Sprintf("%s://%s/boards/%s/requests/%s", common.GetProtocol(r), r.Host, board, user))
			} else {
				w.Header().Set("Location", fmt.Sprintf("%s://%s%s/boards/%s/requests/%s", common.GetProtocol(r), r.Host, s.basePath, board, user))
			}
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
		if s.basePath == "/" {
			w.Header().Set("Location", fmt.Sprintf("%s://%s/boards/%s/requests/%s", common.GetProtocol(r), r.Host, board, user))
		} else {
			w.Header().Set("Location", fmt.Sprintf("%s://%s%s/boards/%s/requests/%s", common.GetProtocol(r), r.Host, s.basePath, board, user))
		}
		w.WriteHeader(http.StatusSeeOther)
		return
	}

	w.WriteHeader(http.StatusBadRequest)
}

// updateBoard updates a board
func (s *Server) updateBoard(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.boards.api.get.all")
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

func (s *Server) setTimer(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.boards.api.timer.set")
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

func (s *Server) deleteTimer(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.boards.api.timer.delete")
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

func (s *Server) incrementTimer(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.boards.api.timer.increment")
	defer span.End()
	log := logger.FromContext(ctx)

	boardId := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	board, err := s.boards.IncrementTimer(ctx, boardId)
	if err != nil {
		span.SetStatus(codes.Error, "failed to increment board timer")
		span.RecordError(err)
		log.Errorw("Unable to increment board timer", "err", err)
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, board)
}

func (s *Server) exportBoard(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.boards.api.export")
	defer span.End()
	log := logger.FromContext(ctx)

	boardId := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

	fullBoard, err := s.boards.FullBoard(ctx, boardId)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get full board")
		span.RecordError(err)
		common.Throw(w, r, err)
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
					user, _ := s.users.Get(ctx, session.UserID) // TODO handle error
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

func (s *Server) importBoard(w http.ResponseWriter, r *http.Request) {
	ctx, span := Tracer.Start(r.Context(), "scrumlr.boards.api.import")
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
			Name:    column.Name,
			Color:   column.Color,
			Visible: &column.Visible,
			Index:   &column.Index,
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
		common.Throw(w, r, err)
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
					common.Throw(w, r, err)
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
				common.Throw(w, r, err)
				return
			}
		}
	}

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, b)
}
