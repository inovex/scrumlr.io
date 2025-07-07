package boards

import (
  "context"
  "database/sql"
  "encoding/csv"
  "errors"
  "fmt"
  "github.com/go-chi/chi/v5"
  "github.com/go-chi/render"
  "github.com/google/uuid"
  "net/http"
  "scrumlr.io/server/columns"
  "scrumlr.io/server/common"
  "scrumlr.io/server/identifiers"
  "scrumlr.io/server/logger"
  "scrumlr.io/server/notes"
  "scrumlr.io/server/sessionrequests"
  "scrumlr.io/server/sessions"
  "scrumlr.io/server/votings"
  "strconv"
)

type BoardService interface {
  Create(ctx context.Context, body CreateBoardRequest) (*Board, error)
  Get(ctx context.Context, id uuid.UUID) (*Board, error)
  Update(ctx context.Context, body BoardUpdateRequest) (*Board, error)
  Delete(ctx context.Context, id uuid.UUID) error

  SetTimer(ctx context.Context, id uuid.UUID, minutes uint8) (*Board, error)
  DeleteTimer(ctx context.Context, id uuid.UUID) (*Board, error)
  IncrementTimer(ctx context.Context, id uuid.UUID) (*Board, error)

  FullBoard(ctx context.Context, boardID uuid.UUID) (*FullBoard, error)
  BoardOverview(ctx context.Context, boardIDs []uuid.UUID, user uuid.UUID) ([]*BoardOverview, error)
  GetBoards(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error)
}

type API struct {
  service         BoardService
  sessionService  sessions.SessionService
  sessionRequests sessionrequests.SessionRequestService
  userService     sessions.UserService
  notesService    notes.NotesService
  columnService   columns.ColumnService
  basePath        string
}

func (a API) Create(w http.ResponseWriter, r *http.Request) {
  log := logger.FromRequest(r)
  owner := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)
  // parse request
  var body CreateBoardRequest
  if err := render.Decode(r, &body); err != nil {
    log.Errorw("Unable to decode body", "err", err)
    common.Throw(w, r, common.BadRequestError(err))
    return
  }

  body.Owner = owner

  b, err := a.service.Create(r.Context(), body)
  if err != nil {
    common.Throw(w, r, err)
    return
  }

  // build the response
  if a.basePath == "/" {
    w.Header().Set("Location", fmt.Sprintf("%s://%s/boards/%s", common.GetProtocol(r), r.Host, b.ID))
  } else {
    w.Header().Set("Location", fmt.Sprintf("%s://%s%s/boards/%s", common.GetProtocol(r), r.Host, a.basePath, b.ID))
  }
  render.Status(r, http.StatusCreated)
  render.Respond(w, r, b)
}

func (a API) Get(w http.ResponseWriter, r *http.Request) {
  log := logger.FromRequest(r)
  boardId := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

  if len(r.Header["Upgrade"]) > 0 && r.Header["Upgrade"][0] == "websocket" {
    //todo: create connection to openBoardSocket!
    a.openBoardSocket(w, r)
    return
  }

  board, err := a.service.Get(r.Context(), boardId)
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

func (a API) GetAll(w http.ResponseWriter, r *http.Request) {
  user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

  boardIDs, err := a.service.GetBoards(r.Context(), user)
  if err != nil {
    common.Throw(w, r, common.InternalServerError)
    return
  }
  OverviewBoards, err := a.service.BoardOverview(r.Context(), boardIDs, user)
  if err != nil {
    common.Throw(w, r, common.InternalServerError)
    return
  }
  render.Status(r, http.StatusOK)
  render.Respond(w, r, OverviewBoards)
}

func (a API) Update(w http.ResponseWriter, r *http.Request) {
  log := logger.FromRequest(r)
  boardId := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

  var body BoardUpdateRequest
  if err := render.Decode(r, &body); err != nil {
    log.Errorw("Unable to decode body", "err", err)
    http.Error(w, "unable to parse request body", http.StatusBadRequest)
    return
  }

  body.ID = boardId
  board, err := a.service.Update(r.Context(), body)
  if err != nil {
    common.Throw(w, r, err)
    return
  }

  render.Status(r, http.StatusOK)
  render.Respond(w, r, board)
}

func (a API) Delete(w http.ResponseWriter, r *http.Request) {
  board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

  err := a.service.Delete(r.Context(), board)
  if err != nil {
    http.Error(w, "failed to delete board", http.StatusInternalServerError)
    return
  }

  render.Status(r, http.StatusNoContent)
  render.Respond(w, r, nil)
}

type JoinBoardRequest struct {
  //todo: move into dto
  // The passphrase challenge if the access policy is 'BY_PASSPHRASE'.
  Passphrase string `json:"passphrase"`
}

func (a API) Join(w http.ResponseWriter, r *http.Request) {
  log := logger.FromRequest(r)

  boardParam := chi.URLParam(r, "id")
  board, err := uuid.Parse(boardParam)
  if err != nil {
    log.Errorw("Wrong board id", "err", err)
    common.Throw(w, r, common.BadRequestError(err))
    return
  }
  user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

  exists, err := a.sessionService.Exists(r.Context(), board, user)
  if err != nil {
    common.Throw(w, r, common.InternalServerError)
    return
  }

  if exists {
    banned, err := a.sessionService.IsParticipantBanned(r.Context(), board, user)
    if err != nil {
      common.Throw(w, r, common.InternalServerError)
      return
    }

    if banned {
      common.Throw(w, r, common.ForbiddenError(errors.New("participant is currently banned from this session")))
      return
    }

    if a.basePath == "/" {
      http.Redirect(w, r, fmt.Sprintf("%s://%s/boards/%s/participants/%s", common.GetProtocol(r), r.Host, board, user), http.StatusSeeOther)
    } else {
      http.Redirect(w, r, fmt.Sprintf("%s://%s%s/boards/%s/participants/%s", common.GetProtocol(r), r.Host, a.basePath, board, user), http.StatusSeeOther)
    }
    return
  }

  b, err := a.service.Get(r.Context(), board)

  if err != nil {
    common.Throw(w, r, common.NotFoundError)
    return
  }

  if b.AccessPolicy == Public {
    _, err := a.sessionService.Create(r.Context(), board, user)
    if err != nil {
      common.Throw(w, r, common.InternalServerError)
      return
    }
    if a.basePath == "/" {
      w.Header().Set("Location", fmt.Sprintf("%s://%s/boards/%s/participants/%s", common.GetProtocol(r), r.Host, board, user))
    } else {
      w.Header().Set("Location", fmt.Sprintf("%s://%s%s/boards/%s/participants/%s", common.GetProtocol(r), r.Host, a.basePath, board, user))
    }
    w.WriteHeader(http.StatusCreated)
    return
  }

  if b.AccessPolicy == ByPassphrase {
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
      _, err := a.sessionService.Create(r.Context(), board, user)
      if err != nil {
        common.Throw(w, r, common.InternalServerError)
        return
      }
      if a.basePath == "/" {
        w.Header().Set("Location", fmt.Sprintf("%s://%s/boards/%s/participants/%s", common.GetProtocol(r), r.Host, board, user))
      } else {
        w.Header().Set("Location", fmt.Sprintf("%s://%s%s/boards/%s/participants/%s", common.GetProtocol(r), r.Host, a.basePath, board, user))
      }
      w.WriteHeader(http.StatusCreated)
      return
    } else {
      common.Throw(w, r, common.BadRequestError(errors.New("wrong passphrase")))
      return
    }
  }

  if b.AccessPolicy == ByInvite {
    sessionExists, err := a.sessionRequests.Exists(r.Context(), board, user)
    if err != nil {
      http.Error(w, "failed to check for existing board session request", http.StatusInternalServerError)
      return
    }

    if sessionExists {
      if a.basePath == "/" {
        w.Header().Set("Location", fmt.Sprintf("%s://%s/boards/%s/requests/%s", common.GetProtocol(r), r.Host, board, user))
      } else {
        w.Header().Set("Location", fmt.Sprintf("%s://%s%s/boards/%s/requests/%s", common.GetProtocol(r), r.Host, a.basePath, board, user))
      }
      w.WriteHeader(http.StatusSeeOther)
      return
    }

    _, err = a.sessionRequests.Create(r.Context(), board, user)
    if err != nil {
      http.Error(w, "failed to create board session request", http.StatusInternalServerError)
      return
    }
    if a.basePath == "/" {
      w.Header().Set("Location", fmt.Sprintf("%s://%s/boards/%s/requests/%s", common.GetProtocol(r), r.Host, board, user))
    } else {
      w.Header().Set("Location", fmt.Sprintf("%s://%s%s/boards/%s/requests/%s", common.GetProtocol(r), r.Host, a.basePath, board, user))
    }
    w.WriteHeader(http.StatusSeeOther)
    return
  }

  w.WriteHeader(http.StatusBadRequest)
}

func (a API) SetTimer(w http.ResponseWriter, r *http.Request) {
  log := logger.FromRequest(r)
  boardId := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

  var body SetTimerRequest
  if err := render.Decode(r, &body); err != nil {
    log.Errorw("Unable to decode body", "err", err)
    common.Throw(w, r, err)
    return
  }

  board, err := a.service.SetTimer(r.Context(), boardId, body.Minutes)
  if err != nil {
    common.Throw(w, r, err)
    return
  }

  render.Status(r, http.StatusOK)
  render.Respond(w, r, board)
}

func (a API) DeleteTimer(w http.ResponseWriter, r *http.Request) {
  boardId := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
  board, err := a.service.DeleteTimer(r.Context(), boardId)
  if err != nil {
    common.Throw(w, r, err)
    return
  }
  render.Status(r, http.StatusOK)
  render.Respond(w, r, board)
}

func (a API) IncrementTimer(w http.ResponseWriter, r *http.Request) {
  boardId := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
  board, err := a.service.IncrementTimer(r.Context(), boardId)
  if err != nil {
    common.Throw(w, r, err)
    return
  }
  render.Status(r, http.StatusOK)
  render.Respond(w, r, board)
}

func (a API) Export(w http.ResponseWriter, r *http.Request) {
  log := logger.FromRequest(r)

  boardId := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

  fullBoard, err := a.service.FullBoard(r.Context(), boardId)
  if err != nil {
    common.Throw(w, r, err)
    return
  }

  visibleColumns := make([]*columns.Column, 0)
  for _, column := range fullBoard.Columns {
    if column.Visible {
      visibleColumns = append(visibleColumns, column)
    }
  }

  visibleNotes := make([]*notes.Note, 0)
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
      Board        *Board                   `json:"board"`
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
          user, _ := a.userService.Get(r.Context(), session.User.ID) // TODO handle error
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

func (a API) Import(w http.ResponseWriter, r *http.Request) {
  log := logger.FromRequest(r)
  owner := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)
  var body ImportBoardRequest
  if err := render.Decode(r, &body); err != nil {
    log.Errorw("Could not read body", "err", err)
    common.Throw(w, r, common.BadRequestError(err))
    return
  }

  body.Board.Owner = owner

  importColumns := make([]columns.ColumnRequest, 0, len(body.Notes))

  for _, column := range body.Columns {
    importColumns = append(importColumns, columns.ColumnRequest{
      Name:    column.Name,
      Color:   column.Color,
      Visible: &column.Visible,
      Index:   &column.Index,
    })
  }
  b, err := a.service.Create(r.Context(), CreateBoardRequest{
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

  cols, err := a.columnService.GetAll(r.Context(), b.ID)
  if err != nil {
    _ = a.service.Delete(r.Context(), b.ID)

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

        note, err := a.notesService.Import(r.Context(), notes.NoteImportRequest{
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
          _ = a.service.Delete(r.Context(), b.ID)
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
      _, err := a.notesService.Import(r.Context(), notes.NoteImportRequest{
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
        _ = a.service.Delete(r.Context(), b.ID)
        common.Throw(w, r, err)
        return
      }

    }
  }

  render.Status(r, http.StatusCreated)
  render.Respond(w, r, b)
}

func NewBoardAPI(service BoardService, basePath string) BoardAPI {
  api := &API{service: service, basePath: basePath}
  return api
}
