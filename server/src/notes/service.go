package notes

import (
  "context"
  "database/sql"
  "github.com/google/uuid"
  "scrumlr.io/server/common"
  "scrumlr.io/server/common/filter"
  "scrumlr.io/server/database"
  "scrumlr.io/server/identifiers"
  "scrumlr.io/server/logger"
  "scrumlr.io/server/realtime"
)

type NoteService struct {
  database        NotesDatabase
  generalDatabase *database.Database
  realtime        *realtime.Broker
}

type NotesDatabase interface {
  CreateNote(insert NoteInsertDB) (NoteDB, error)
  ImportNote(insert NoteImportDB) (NoteDB, error)
  GetNote(id uuid.UUID) (NoteDB, error)
  GetNotes(board uuid.UUID, columns ...uuid.UUID) ([]NoteDB, error)
  GetChildNotes(parentNote uuid.UUID) ([]NoteDB, error)
  UpdateNote(caller uuid.UUID, update NoteUpdateDB) (NoteDB, error)
  DeleteNote(caller uuid.UUID, board uuid.UUID, id uuid.UUID, deleteStack bool) error
}

func (s *NoteService) Create(ctx context.Context, body NoteCreateRequest) (*Note, error) {
  log := logger.FromContext(ctx)
  note, err := s.database.CreateNote(NoteInsertDB{Author: body.User, Board: body.Board, Column: body.Column, Text: body.Text})
  if err != nil {
    log.Errorw("unable to create note", "board", body.Board, "user", body.User, "error", err)
    return nil, common.InternalServerError
  }
  s.updatedNotes(body.Board)
  return new(Note).From(note), err
}

func (s *NoteService) Import(ctx context.Context, body NoteImportRequest) (*Note, error) {

  log := logger.FromContext(ctx)

  note, err := s.database.ImportNote(NoteImportDB{
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

  note, err := s.database.UpdateNote(ctx.Value(identifiers.UserIdentifier).(uuid.UUID), NoteUpdateDB{
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

func (s *NoteService) List(ctx context.Context, boardID uuid.UUID, columnID ...uuid.UUID) ([]*Note, error) {
  log := logger.FromContext(ctx)
  notes, err := s.database.GetNotes(boardID, columnID...)
  if err != nil {
    if err == sql.ErrNoRows {
      return nil, common.NotFoundError
    }
    log.Errorw("unable to get notes", "board", boardID, "error", err)
  }
  return Notes(notes), err
}

func (s *NoteService) Delete(ctx context.Context, body NoteDeleteRequest, id uuid.UUID) error {
  log := logger.FromContext(ctx)
  user := ctx.Value(identifiers.UserIdentifier).(uuid.UUID)
  board := ctx.Value(identifiers.BoardIdentifier).(uuid.UUID)
  note := ctx.Value(identifiers.NoteIdentifier).(uuid.UUID)
  voteFilter := filter.VoteFilter{
    Board: board,
    Note:  &note,
  }
  deletedVotes, err := s.generalDatabase.GetVotes(voteFilter)
  if body.DeleteStack {
    stackedVotes, _ := s.database.GetChildNotes(note)
    for _, n := range stackedVotes {
      votes, err := s.generalDatabase.GetVotes(filter.VoteFilter{
        Board: board,
        Note:  &n.ID,
      })
      if err != nil {
        log.Errorw("unable to get votes of stacked notes", "note", n, "error", err)
        return err
      }
      deletedVotes = append(deletedVotes, votes...)
    }
  }

  if err != nil {
    log.Errorw("unable to retrieve votes for a note delete", "err", err)
  }

  err = s.database.DeleteNote(user, board, id, body.DeleteStack)
  if err != nil {
    log.Errorw("unable to delete note", "note", body, "err", err)
    return err
  }

  s.deletedNote(user, board, note, deletedVotes, body.DeleteStack)
  return err
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

func (s *NoteService) deletedNote(user, board, note uuid.UUID, deletedVotes []database.Vote, deleteStack bool) {
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
    Data: deletedVotes,
  })

}

func NewNotesService(db *NotesDatabase, rt *realtime.Broker) NotesService {
  b := new(NoteService)
  b.database = *db
  b.realtime = rt
  return b
}
