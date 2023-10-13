package api

import (
	"database/sql"
	"encoding/csv"
	"errors"
	"fmt"
	"net/http"
	"strconv"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/logger"
)

// createBoard creates a new board
func (s *Server) createBoard(w http.ResponseWriter, r *http.Request) {
	owner := r.Context().Value("User").(uuid.UUID)

	// parse request
	var body dto.CreateBoardRequest
	if err := render.Decode(r, &body); err != nil {
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Owner = owner

	b, err := s.boards.Create(r.Context(), body)
	if err != nil {
		common.Throw(w, r, common.BadRequestError(err))
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
	board := r.Context().Value("Board").(uuid.UUID)

	err := s.boards.Delete(r.Context(), board)
	if err != nil {
		http.Error(w, "failed to delete board", http.StatusInternalServerError)
		return
	}

	render.Status(r, http.StatusNoContent)
	render.Respond(w, r, nil)
}

func (s *Server) getUserBoards(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	user := r.Context().Value("User").(uuid.UUID)

	boards, err := s.boards.GetUserBoards(r.Context(), user)
	if err != nil {
		log.Errorw("unable to get boards for this user", "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, boards)
}

// getBoard get a board
func (s *Server) getBoard(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	boardId := r.Context().Value("Board").(uuid.UUID)

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
		common.Throw(w, r, common.BadRequestError(err))
		return
	}
	user := r.Context().Value("User").(uuid.UUID)

	exists, err := s.sessions.SessionExists(r.Context(), board, user)
	if err != nil {
		log.Errorw("unable to check preexisting sessions", "err", err)
		common.Throw(w, r, common.InternalServerError)
		return
	}

	if exists {
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

	if b.AccessPolicy == types.AccessPolicyPublic {
		_, err := s.sessions.Create(r.Context(), board, user)
		if err != nil {
			log.Errorw("unable to add participant", "err", err)
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

	if b.AccessPolicy == types.AccessPolicyByPassphrase {
		var body JoinBoardRequest
		err := render.Decode(r, &body)
		if err != nil {
			http.Error(w, "unable to parse request body", http.StatusBadRequest)
			return
		}

		encodedPassphrase := common.Sha512BySalt(body.Passphrase, *b.Salt)
		if encodedPassphrase == *b.Passphrase {
			_, err := s.sessions.Create(r.Context(), board, user)
			if err != nil {
				log.Errorw("unable to create board session", "err", err)
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
			common.Throw(w, r, common.ForbiddenError(errors.New("wrong passphrase")))
			return
		}
	}

	if b.AccessPolicy == types.AccessPolicyByInvite {
		sessionExists, err := s.sessions.SessionRequestExists(r.Context(), board, user)
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

		_, err = s.sessions.CreateSessionRequest(r.Context(), board, user)
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
	boardId := r.Context().Value("Board").(uuid.UUID)

	var body dto.BoardUpdateRequest
	if err := render.Decode(r, &body); err != nil {
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
	boardId := r.Context().Value("Board").(uuid.UUID)

	var body dto.SetTimerRequest
	if err := render.Decode(r, &body); err != nil {
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
	boardId := r.Context().Value("Board").(uuid.UUID)
	board, err := s.boards.DeleteTimer(r.Context(), boardId)
	if err != nil {
		common.Throw(w, r, err)
		return
	}
	render.Status(r, http.StatusOK)
	render.Respond(w, r, board)
}

func (s *Server) exportBoard(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)

	boardId := r.Context().Value("Board").(uuid.UUID)

	board, _, sessions, columns, notes, votings, _, _, err := s.boards.FullBoard(r.Context(), boardId)
	if err != nil {
		common.Throw(w, r, err)
		return
	}

	visibleColumns := []*dto.Column{}
	for _, column := range columns {
		if column.Visible {
			visibleColumns = append(visibleColumns, column)
		}
	}

	visibleNotes := []*dto.Note{}
	for _, note := range notes {
		for _, column := range visibleColumns {
			if note.Position.Column == column.ID {
				visibleNotes = append(visibleNotes, note)
			}
		}
	}

	if r.Header.Get("Accept") == "" || r.Header.Get("Accept") == "*/*" || r.Header.Get("Accept") == "application/json" {
		render.Status(r, http.StatusOK)
		render.Respond(w, r, struct {
			Board        *dto.Board          `json:"board"`
			Participants []*dto.BoardSession `json:"participants"`
			Columns      []*dto.Column       `json:"columns"`
			Notes        []*dto.Note         `json:"notes"`
			Votings      []*dto.Voting       `json:"votings"`
		}{
			Board:        board,
			Participants: sessions,
			Columns:      visibleColumns,
			Notes:        visibleNotes,
			Votings:      votings,
		})
		return
	} else if r.Header.Get("Accept") == "text/csv" {
		header := []string{"note_id", "author_id", "author", "text", "column_id", "column", "rank", "stack"}
		for index, voting := range votings {
			if voting.Status == types.VotingStatusClosed {
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
			for _, session := range sessions {
				if session.User.ID == note.Author {
					author = session.User.Name
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

			for _, voting := range votings {
				if voting.Status == types.VotingStatusClosed {
					if voting.VotingResults != nil {
						resultOnNote = append(resultOnNote, strconv.Itoa(voting.VotingResults.Votes[note.ID].Total))
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
