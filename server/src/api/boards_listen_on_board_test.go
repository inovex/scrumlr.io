package api

import (
  "context"
  "testing"

  "github.com/coder/websocket"
  "github.com/google/uuid"
  "github.com/stretchr/testify/assert"
  "github.com/stretchr/testify/mock"
  "github.com/stretchr/testify/suite"
  "scrumlr.io/server/boards"
  "scrumlr.io/server/columns"
  "scrumlr.io/server/common"
  "scrumlr.io/server/notes"
  "scrumlr.io/server/reactions"
  "scrumlr.io/server/realtime"
  "scrumlr.io/server/sessions"
)

type BoardsListenTestSuite struct {
  suite.Suite
}

func TestBoardsListenTestSuite(t *testing.T) {
  suite.Run(t, new(BoardsListenTestSuite))
}

func (suite *BoardsListenTestSuite) TestListenOnBoardCreatesNewSubscription() {
  boardID := uuid.New()
  userID := uuid.New()

  s := &Server{
    boardSubscriptions: make(map[uuid.UUID]*BoardSubscription),
  }

  fullBoard := boards.FullBoard{
    Board: &boards.Board{
      ID:           boardID,
      AccessPolicy: boards.Public,
    },
    BoardSessions: []*sessions.BoardSession{},
    Columns:       []*columns.Column{},
    Notes:         []*notes.Note{},
    Reactions:     []*reactions.Reaction{},
  }

  conn := &websocket.Conn{}
  s.listenOnBoard(context.Background(), boardID, userID, conn, fullBoard)

  assert.NotNil(suite.T(), s.boardSubscriptions[boardID])
  assert.NotNil(suite.T(), s.boardSubscriptions[boardID].clients[userID])
  assert.Equal(suite.T(), conn, s.boardSubscriptions[boardID].clients[userID])
  assert.Equal(suite.T(), fullBoard.BoardSessions, s.boardSubscriptions[boardID].boardParticipants)
  assert.Equal(suite.T(), fullBoard.Board, s.boardSubscriptions[boardID].boardSettings)
  assert.Equal(suite.T(), fullBoard.Columns, s.boardSubscriptions[boardID].boardColumns)
  assert.Equal(suite.T(), fullBoard.Notes, s.boardSubscriptions[boardID].boardNotes)
  assert.Equal(suite.T(), fullBoard.Reactions, s.boardSubscriptions[boardID].boardReactions)
}

func (suite *BoardsListenTestSuite) TestListenOnBoardAddsClientToExistingSubscription() {
  boardID := uuid.New()
  userID1 := uuid.New()
  userID2 := uuid.New()

  existingConn := &websocket.Conn{}
  existingSubscription := &BoardSubscription{
    clients:      map[uuid.UUID]*websocket.Conn{userID1: existingConn},
    subscription: make(chan *realtime.BoardEvent, 1),
  }

  s := &Server{
    boardSubscriptions: map[uuid.UUID]*BoardSubscription{
      boardID: existingSubscription,
    },
  }

  fullBoard := boards.FullBoard{
    Board: &boards.Board{ID: boardID},
  }

  newConn := &websocket.Conn{}
  s.listenOnBoard(context.Background(), boardID, userID2, newConn, fullBoard)

  assert.Len(suite.T(), s.boardSubscriptions[boardID].clients, 2)
  assert.Equal(suite.T(), existingConn, s.boardSubscriptions[boardID].clients[userID1])
  assert.Equal(suite.T(), newConn, s.boardSubscriptions[boardID].clients[userID2])
}

func (suite *BoardsListenTestSuite) TestCloseBoardSocketDisconnectsSession() {
  boardID := uuid.New()
  userID := uuid.New()

  mockSessionService := sessions.NewMockSessionService(suite.T())
  mockSessionService.EXPECT().Disconnect(mock.Anything, boardID, userID).Return(nil)

  s := &Server{
    sessions: mockSessionService,
  }

  conn := &websocket.Conn{}
  s.closeBoardSocket(context.Background(), boardID, userID, conn, "test reason")

  mockSessionService.AssertExpectations(suite.T())
}

func (suite *BoardsListenTestSuite) TestEventFilterFiltersForParticipant() {
  participantID := uuid.New()
  moderatorID := uuid.New()

  participantSession := &sessions.BoardSession{
    UserID: participantID,
    Role:   common.ParticipantRole,
  }
  moderatorSession := &sessions.BoardSession{
    UserID: moderatorID,
    Role:   common.ModeratorRole,
  }

  visibleColumn := &columns.Column{
    ID:      uuid.New(),
    Visible: true,
  }
  hiddenColumn := &columns.Column{
    ID:      uuid.New(),
    Visible: false,
  }

  participantNote := &notes.Note{
    ID:     uuid.New(),
    Author: participantID,
    Position: notes.NotePosition{
      Column: visibleColumn.ID,
    },
  }
  moderatorNote := &notes.Note{
    ID:     uuid.New(),
    Author: moderatorID,
    Position: notes.NotePosition{
      Column: visibleColumn.ID,
    },
  }

  bs := &BoardSubscription{
    boardParticipants: []*sessions.BoardSession{participantSession, moderatorSession},
    boardColumns:      []*columns.Column{visibleColumn, hiddenColumn},
    boardNotes:        []*notes.Note{participantNote, moderatorNote},
    boardSettings: &boards.Board{
      ShowNotesOfOtherUsers: false,
    },
  }

  event := &realtime.BoardEvent{
    Type: realtime.BoardEventNotesUpdated,
    Data: []*notes.Note{participantNote, moderatorNote},
  }

  filteredEvent := bs.eventFilter(event, participantID)

  filteredNotes := filteredEvent.Data.([]*notes.Note)
  assert.Len(suite.T(), filteredNotes, 1)
  assert.Equal(suite.T(), participantNote.ID, filteredNotes[0].ID)
}

func (suite *BoardsListenTestSuite) TestEventFilterDoesNotFilterForModerator() {
  participantID := uuid.New()
  moderatorID := uuid.New()

  participantSession := &sessions.BoardSession{
    UserID: participantID,
    Role:   common.ParticipantRole,
  }
  moderatorSession := &sessions.BoardSession{
    UserID: moderatorID,
    Role:   common.ModeratorRole,
  }

  visibleColumn := &columns.Column{
    ID:      uuid.New(),
    Visible: true,
  }

  participantNote := &notes.Note{
    ID:     uuid.New(),
    Author: participantID,
    Position: notes.NotePosition{
      Column: visibleColumn.ID,
    },
  }
  moderatorNote := &notes.Note{
    ID:     uuid.New(),
    Author: moderatorID,
    Position: notes.NotePosition{
      Column: visibleColumn.ID,
    },
  }

  bs := &BoardSubscription{
    boardParticipants: []*sessions.BoardSession{participantSession, moderatorSession},
    boardColumns:      []*columns.Column{visibleColumn},
    boardNotes:        []*notes.Note{participantNote, moderatorNote},
    boardSettings: &boards.Board{
      ShowNotesOfOtherUsers: false,
    },
  }

  event := &realtime.BoardEvent{
    Type: realtime.BoardEventNotesUpdated,
    Data: []*notes.Note{participantNote, moderatorNote},
  }

  filteredEvent := bs.eventFilter(event, moderatorID)

  filteredNotes := filteredEvent.Data.([]*notes.Note)
  assert.Len(suite.T(), filteredNotes, 2)
}

func (suite *BoardsListenTestSuite) TestEventInitFilterFiltersColumnsForParticipant() {
  participantID := uuid.New()

  visibleColumn := columns.Column{
    ID:      uuid.New(),
    Visible: true,
    Name:    "Visible",
  }
  hiddenColumn := columns.Column{
    ID:      uuid.New(),
    Visible: false,
    Name:    "Hidden",
  }

  fullBoard := boards.FullBoard{
    Board: &boards.Board{ID: uuid.New()},
    BoardSessions: []*sessions.BoardSession{
      {UserID: participantID, Role: common.ParticipantRole},
    },
    Columns: []*columns.Column{&visibleColumn, &hiddenColumn},
    Notes:   []*notes.Note{},
  }

  initEvent := InitEvent{
    Type: realtime.BoardEventInit,
    Data: fullBoard,
  }

  filteredEvent := eventInitFilter(initEvent, participantID)

  assert.Len(suite.T(), filteredEvent.Data.Columns, 1)
  assert.Equal(suite.T(), visibleColumn.ID, filteredEvent.Data.Columns[0].ID)
}

func (suite *BoardsListenTestSuite) TestEventInitFilterDoesNotFilterForModerator() {
  moderatorID := uuid.New()

  visibleColumn := columns.Column{
    ID:      uuid.New(),
    Visible: true,
    Name:    "Visible",
  }
  hiddenColumn := columns.Column{
    ID:      uuid.New(),
    Visible: false,
    Name:    "Hidden",
  }

  fullBoard := boards.FullBoard{
    Board: &boards.Board{ID: uuid.New()},
    BoardSessions: []*sessions.BoardSession{
      {UserID: moderatorID, Role: common.ModeratorRole},
    },
    Columns: []*columns.Column{&visibleColumn, &hiddenColumn},
    Notes:   []*notes.Note{},
  }

  initEvent := InitEvent{
    Type: realtime.BoardEventInit,
    Data: fullBoard,
  }

  filteredEvent := eventInitFilter(initEvent, moderatorID)

  assert.Len(suite.T(), filteredEvent.Data.Columns, 2)
}
