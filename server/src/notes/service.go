package notes

import (
  "context"
  "database/sql"
  "github.com/google/uuid"
  "net/http"
  "scrumlr.io/server/columns"
  "scrumlr.io/server/common"
  "scrumlr.io/server/common/dto"
  "scrumlr.io/server/identifiers"
  "scrumlr.io/server/logger"
  "scrumlr.io/server/realtime"
  "scrumlr.io/server/technical_helper"
)

type NoteService struct {
  database NotesDatabase
  realtime realtime.Broker
}
type NotesDatabase interface {
  CreateNote(insert NoteInsert) (NoteDB, error)
  ImportNote(insert NoteImport) (NoteDB, error)
  GetNote(id uuid.UUID) (NoteDB, error)
  GetNotes(board uuid.UUID, columns ...uuid.UUID) ([]NoteDB, error)
  UpdateNote(caller uuid.UUID, update NoteUpdate) (NoteDB, error)
  DeleteNote(caller uuid.UUID, board uuid.UUID, id uuid.UUID, deleteStack bool) error
  GetChildNotes(parentNote uuid.UUID) ([]NoteDB, error)
}

func NewNoteService(db NotesDatabase) NotesService {
  s := &NoteService{database: db}
  return s
}

func (s *NoteService) Create(ctx context.Context, body NoteCreateRequest) (*Note, error) {
  log := logger.FromContext(ctx)
  note, err := s.database.CreateNote(NoteInsert{Author: body.User, Board: body.Board, Column: body.Column, Text: body.Text})
  if err != nil {
    log.Errorw("unable to create note", "board", body.Board, "user", body.User, "error", err)
    return nil, common.InternalServerError
  }
  s.updatedNotes(body.Board)
  return new(Note).From(note), err
}

func (s *NoteService) Import(ctx context.Context, body NoteImportRequest) (*Note, error) {
  log := logger.FromContext(ctx)

  note, err := s.database.ImportNote(NoteImport{
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

func (s *NoteService) Get(ctx context.Context, id uuid.UUID) (*Note, error) {
  log := logger.FromContext(ctx)
  note, err := s.database.GetNote(id)
  if err != nil {
    if err == sql.ErrNoRows {
      return nil, common.NotFoundError
    }
    log.Errorw("unable to get note", "note", id, "error", err)
    return nil, common.InternalServerError
  }
  return new(Note).From(note), err
}

func (s *NoteService) GetStack(ctx context.Context, id uuid.UUID) ([]*Note, error) {
  log := logger.FromContext(ctx)
  var notes []NoteDB
  parent, err := s.database.GetNote(id)
  if err != nil {
    log.Errorw("unable to get note", "note", id, "error", err)
    return nil, common.InternalServerError
  }
  notes = append(notes, parent)
  children, err := s.database.GetChildNotes(id)
  if err != nil {
    log.Errorw("unable to get children notes", "note", id, "error", err)
    return nil, common.InternalServerError
  }
  notes = append(notes, children...)
  return Notes(notes), err
}

func (s *NoteService) Update(ctx context.Context, body NoteUpdateRequest) (*Note, error) {
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

  note, err := s.database.UpdateNote(ctx.Value(identifiers.UserIdentifier).(uuid.UUID), NoteUpdate{
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
  s.updatedNotes(body.Board)
  return new(Note).From(note), err
}

func (s *NoteService) List(ctx context.Context, boardID uuid.UUID) ([]*Note, error) {
  log := logger.FromContext(ctx)
  notes, err := s.database.GetNotes(boardID)
  if err != nil {
    if err == sql.ErrNoRows {
      return nil, common.NotFoundError
    }
    log.Errorw("unable to get notes", "board", boardID, "error", err)
  }
  return Notes(notes), err
}

func (s *NoteService) Delete(ctx context.Context, body NoteDeleteRequest, noteID uuid.UUID, votes []*dto.Vote) error {
  log := logger.FromContext(ctx)
  user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)
  board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)

  err := s.database.DeleteNote(user, board, noteID, body.DeleteStack)
  if err != nil {
    log.Errorw("unable to delete note", "note", body, "err", err)
    return err
  }

  s.deletedNote(board, noteID, body.DeleteStack, votes)
  return err
}

func (n NoteSlice) FilterNotesByBoardSettingsOrAuthorInformation(userID uuid.UUID, showNotesOfOtherUsers bool, showAuthors bool, columnSlice columns.ColumnSlice) NoteSlice {

  visibleNotes := technical_helper.Filter[*Note](n, func(note *Note) bool {
    for _, column := range columnSlice {
      if (note.Position.Column == column.ID) && column.Visible {
        // BoardSettings -> Remove other participant cards
        if showNotesOfOtherUsers {
          return true
        } else if userID == note.Author {
          return true
        }
      }
    }
    return false
  })

  n.hideOtherAuthors(userID, showAuthors, visibleNotes)

  return visibleNotes
}

func (*Note) Render(_ http.ResponseWriter, _ *http.Request) error {
  return nil
}

func (n NoteSlice) hideOtherAuthors(userID uuid.UUID, showAuthors bool, visibleNotes []*Note) {
  for _, note := range visibleNotes {
    if !showAuthors && note.Author != userID {
      note.Author = uuid.Nil
    }
  }
}

func (s *NoteService) updatedNotes(board uuid.UUID) {
  notes, err := s.database.GetNotes(board)
  if err != nil {
    logger.Get().Errorw("unable to retrieve notes in UpdatedNotes call", "boardID", board, "err", err)
  }

  eventNotes := make([]Note, len(notes))
  for index, note := range notes {
    eventNotes[index] = *new(Note).From(note)
  }

  _ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
    Type: realtime.BoardEventNotesUpdated,
    Data: eventNotes,
  })
}

func (s *NoteService) deletedNote(board, note uuid.UUID, deleteStack bool, votes []*dto.Vote) {
  noteData := map[string]interface{}{
    "note":        note,
    "deleteStack": deleteStack,
  }
  _ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
    Type: realtime.BoardEventNoteDeleted,
    Data: noteData,
  })

  _ = s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
    Type: realtime.BoardEventVotesDeleted,
    Data: votes,
  })
}
