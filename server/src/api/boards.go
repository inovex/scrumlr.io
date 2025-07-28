package api

import (
	"database/sql"
	"encoding/csv"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"scrumlr.io/server/sessions"

	"scrumlr.io/server/boards"
	"scrumlr.io/server/votings"

	"scrumlr.io/server/columns"
	"scrumlr.io/server/notes"

	"scrumlr.io/server/identifiers"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
)

// createBoard creates a new board
func (s *Server) createBoard(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	owner := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)
	// parse request
	var body boards.CreateBoardRequest
	if err := render.Decode(r, &body); err != nil {
		log.Errorw("Unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Owner = owner

	b, err := s.boards.Create(r.Context(), body)
	if err != nil {
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
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

	err := s.boards.Delete(r.Context(), board)
	if err != nil {
		http.Error(w, "failed to delete board", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}

func (s *Server) getBoards(w http.ResponseWriter, r *http.Request) {
	user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

	boardIDs, err := s.boards.GetBoards(r.Context(), user)
	if err != nil {
		common.Throw(w, r, common.InternalServerError)
		return
	}
	OverviewBoards, err := s.boards.BoardOverview(r.Context(), boardIDs, user)
	if err != nil {
		common.Throw(w, r, common.InternalServerError)
		return
	}
	render.Status(r, http.StatusOK)
	render.Respond(w, r, OverviewBoards)
}

// getBoard get a board
func (s *Server) getBoard(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	boardId := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

	if len(r.Header["Upgrade"]) > 0 && r.Header["Upgrade"][0] == "websocket" {
		s.openBoardSocket(w, r)
		return
	}

	board, err := s.boards.Get(r.Context(), boardId)
	if err != nil {
		if err == sql.ErrNoRows {
			common.Throw(w, r, common.NotFoundError)
			return
		}
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
	log := logger.FromRequest(r)

	boardParam := chi.URLParam(r, "id")
	board, err := uuid.Parse(boardParam)
	if err != nil {
		log.Errorw("Wrong board id", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}
	user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

	exists, err := s.sessions.Exists(r.Context(), board, user)
	if err != nil {
		common.Throw(w, r, common.InternalServerError)
		return
	}

	if exists {
		banned, err := s.sessions.IsParticipantBanned(r.Context(), board, user)
		if err != nil {
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if banned {
			common.Throw(w, r, common.ForbiddenError(errors.New("participant is currently banned from this session")))
			return
		}

		if s.basePath == "/" {
			http.Redirect(w, r, fmt.Sprintf("%s://%s/boards/%s/participants/%s", common.GetProtocol(r), r.Host, board, user), http.StatusSeeOther)
		} else {
			http.Redirect(w, r, fmt.Sprintf("%s://%s%s/boards/%s/participants/%s", common.GetProtocol(r), r.Host, s.basePath, board, user), http.StatusSeeOther)
		}
		return
	}

	b, err := s.boards.Get(r.Context(), board)

	if err != nil {
		common.Throw(w, r, common.NotFoundError)
		return
	}

	if b.AccessPolicy == boards.Public {
		_, err := s.sessions.Create(r.Context(), board, user)
		if err != nil {
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
			common.Throw(w, r, common.BadRequestError(errors.New("unable to parse request body")))
			return
		}
		if body.Passphrase == "" {
			common.Throw(w, r, common.BadRequestError(errors.New("missing passphrase")))
			return
		}
		encodedPassphrase := common.Sha512BySalt(body.Passphrase, *b.Salt)
		if encodedPassphrase == *b.Passphrase {
			_, err := s.sessions.Create(r.Context(), board, user)
			if err != nil {
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
			common.Throw(w, r, common.BadRequestError(errors.New("wrong passphrase")))
			return
		}
	}

	if b.AccessPolicy == boards.ByInvite {
		sessionExists, err := s.sessionRequests.Exists(r.Context(), board, user)
		if err != nil {
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

		_, err = s.sessionRequests.Create(r.Context(), board, user)
		if err != nil {
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
	log := logger.FromRequest(r)
	boardId := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

	var body boards.BoardUpdateRequest
	if err := render.Decode(r, &body); err != nil {
		log.Errorw("Unable to decode body", "err", err)
		http.Error(w, "unable to parse request body", http.StatusBadRequest)
		return
	}

	body.ID = boardId
	board, err := s.boards.Update(r.Context(), body)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, board)
}

func (s *Server) setTimer(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	boardId := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

	var body boards.SetTimerRequest
	if err := render.Decode(r, &body); err != nil {
		log.Errorw("Unable to decode body", "err", err)
		common.Throw(w, r, err)
		return
	}

	board, err := s.boards.SetTimer(r.Context(), boardId, body.Minutes)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, board)
}

func (s *Server) deleteTimer(w http.ResponseWriter, r *http.Request) {
	boardId := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	board, err := s.boards.DeleteTimer(r.Context(), boardId)
	if err != nil {
		common.Throw(w, r, err)
		return
	}
	render.Status(r, http.StatusOK)
	render.Respond(w, r, board)
}

func (s *Server) incrementTimer(w http.ResponseWriter, r *http.Request) {
	boardId := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	board, err := s.boards.IncrementTimer(r.Context(), boardId)
	if err != nil {
		common.Throw(w, r, err)
		return
	}
	render.Status(r, http.StatusOK)
	render.Respond(w, r, board)
}

func (s *Server) exportBoard(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)

	boardId := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

	fullBoard, err := s.boards.FullBoard(r.Context(), boardId)
	if err != nil {
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
				if session.User.ID == note.Author {
					user, _ := s.users.Get(r.Context(), session.User.ID) // TODO handle error
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
	log := logger.FromRequest(r)
	owner := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)
	var body boards.ImportBoardRequest
	if err := render.Decode(r, &body); err != nil {
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
	b, err := s.boards.Create(r.Context(), boards.CreateBoardRequest{
		Name:         body.Board.Name,
		Description:  body.Board.Description,
		AccessPolicy: body.Board.AccessPolicy,
		Passphrase:   body.Board.Passphrase,
		Columns:      importColumns,
		Owner:        owner,
	})

	if err != nil {
		log.Errorw("Could not import board", "err", err)
		common.Throw(w, r, err)
		return
	}

	cols, err := s.columns.GetAll(r.Context(), b.ID)
	if err != nil {
		_ = s.boards.Delete(r.Context(), b.ID)

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

				note, err := s.notes.Import(r.Context(), notes.NoteImportRequest{
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
					_ = s.boards.Delete(r.Context(), b.ID)
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
			_, err := s.notes.Import(r.Context(), notes.NoteImportRequest{
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
				_ = s.boards.Delete(r.Context(), b.ID)
				common.Throw(w, r, err)
				return
			}

		}
	}

	render.Status(r, http.StatusCreated)
	render.Respond(w, r, b)
}
