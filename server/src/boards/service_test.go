package boards

import (
  "context"
  "errors"
  "github.com/stretchr/testify/mock"
  "github.com/uptrace/bun"
  "scrumlr.io/server/columns"
  "scrumlr.io/server/notes"
  "scrumlr.io/server/reactions"
  "scrumlr.io/server/sessionrequests"
  "scrumlr.io/server/sessions"
  "scrumlr.io/server/votings"
  "testing"
  "time"

  "github.com/google/uuid"
  "github.com/stretchr/testify/assert"
  "github.com/stretchr/testify/require"
  "scrumlr.io/server/realtime"
)

func TestGet(t *testing.T) {
  ctx := context.Background()
  boardMock := NewMockBoardDatabase(t)
  sessionsMock := sessions.NewMockSessionService(t)
  sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
  noteMock := notes.NewMockNotesService(t)
  reactionMock := reactions.NewMockReactionService(t)
  votingMock := votings.NewMockVotingService(t)

  mockRealtime := new(realtime.Broker)

  service := NewBoardService(boardMock, mockRealtime, sessionRequestMock, sessionsMock, noteMock, reactionMock, votingMock)

  boardID := uuid.New()
  mockBoard := DatabaseBoard{ID: boardID}

  boardMock.EXPECT().GetBoard(boardID).Return(mockBoard, nil)

  result, err := service.Get(ctx, boardID)
  require.NoError(t, err)
  require.NotNil(t, result)
  assert.Equal(t, boardID, result.ID)
}

func TestGetError(t *testing.T) {
  ctx := context.Background()
  boardMock := NewMockBoardDatabase(t)
  sessionsMock := sessions.NewMockSessionService(t)
  sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
  noteMock := notes.NewMockNotesService(t)
  reactionMock := reactions.NewMockReactionService(t)
  votingMock := votings.NewMockVotingService(t)

  mockRealtime := new(realtime.Broker)

  service := NewBoardService(boardMock, mockRealtime, sessionRequestMock, sessionsMock, noteMock, reactionMock, votingMock)

  boardID := uuid.New()
  boardMock.EXPECT().GetBoard(boardID).Return(DatabaseBoard{}, errors.New("db error"))

  result, err := service.Get(ctx, boardID)
  require.Error(t, err)
  assert.Nil(t, result)
}

func TestCreate(t *testing.T) {
  ctx := context.Background()
  boardMock := NewMockBoardDatabase(t)
  sessionsMock := sessions.NewMockSessionService(t)
  sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
  noteMock := notes.NewMockNotesService(t)
  reactionMock := reactions.NewMockReactionService(t)
  votingMock := votings.NewMockVotingService(t)

  mockRealtime := new(realtime.Broker)

  service := NewBoardService(boardMock, mockRealtime, sessionRequestMock, sessionsMock, noteMock, reactionMock, votingMock)

  boardID := uuid.New()
  userID := uuid.New()

  boardName := "Test Board"
  boardDescription := "A test board"

  req := CreateBoardRequest{
    Name:         &boardName,
    Description:  &boardDescription,
    Owner:        userID,
    AccessPolicy: Public,
    Columns: []columns.ColumnRequest{{
      Name:        boardName,
      Description: boardDescription,
      Color:       columns.ColorGoalGreen,
      Visible:     nil,
      Index:       nil,
      Board:       boardID,
      User:        userID,
    }},
  }

  expectedBoard := DatabaseBoard{ID: boardID}
  boardMock.EXPECT().CreateBoard(userID, mock.Anything, mock.Anything).Return(expectedBoard, nil)

  result, err := service.Create(ctx, req)
  require.NoError(t, err)
  require.NotNil(t, result)
  assert.Equal(t, boardID, result.ID)
}

func TestCreate_ByPassphraseMissing(t *testing.T) {
  ctx := context.Background()
  boardMock := NewMockBoardDatabase(t)
  sessionsMock := sessions.NewMockSessionService(t)
  sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
  noteMock := notes.NewMockNotesService(t)
  reactionMock := reactions.NewMockReactionService(t)
  votingMock := votings.NewMockVotingService(t)

  mockRealtime := new(realtime.Broker)

  service := NewBoardService(boardMock, mockRealtime, sessionRequestMock, sessionsMock, noteMock, reactionMock, votingMock)

  userID := uuid.New()

  boardName := "Test Board"
  boardDescription := "A test board"

  req := CreateBoardRequest{
    Name:         &boardName,
    Description:  &boardDescription,
    Owner:        userID,
    AccessPolicy: ByPassphrase,
    Columns:      nil,
    Passphrase:   nil,
  }

  boardMock.EXPECT().CreateBoard(userID, mock.Anything, mock.Anything).Return(DatabaseBoard{}, errors.New("passphrase is required"))

  result, err := service.Create(ctx, req)
  require.Error(t, err)
  assert.Nil(t, result)
}

func TestDelete(t *testing.T) {
  ctx := context.Background()
  boardMock := NewMockBoardDatabase(t)
  sessionsMock := sessions.NewMockSessionService(t)
  sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
  noteMock := notes.NewMockNotesService(t)
  reactionMock := reactions.NewMockReactionService(t)
  votingMock := votings.NewMockVotingService(t)

  mockRealtime := new(realtime.Broker)

  service := NewBoardService(boardMock, mockRealtime, sessionRequestMock, sessionsMock, noteMock, reactionMock, votingMock)

  boardID := uuid.New()
  boardMock.EXPECT().DeleteBoard(boardID).Return(nil)

  err := service.Delete(ctx, boardID)
  require.NoError(t, err)
}

func TestUpdate(t *testing.T) {
  ctx := context.Background()
  boardMock := NewMockBoardDatabase(t)
  sessionsMock := sessions.NewMockSessionService(t)
  sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
  noteMock := notes.NewMockNotesService(t)
  reactionMock := reactions.NewMockReactionService(t)
  votingMock := votings.NewMockVotingService(t)

  mockRealtime := new(realtime.Broker)

  service := NewBoardService(boardMock, mockRealtime, sessionRequestMock, sessionsMock, noteMock, reactionMock, votingMock)

  boardID := uuid.New()
  updatedName := "Updated Board Name"

  updateReq := BoardUpdateRequest{
    ID:   boardID,
    Name: &updatedName,
  }

  expectedBoard := DatabaseBoard{
    ID:   boardID,
    Name: &updatedName,
  }
  boardMock.EXPECT().UpdateBoard(updateReq).Return(expectedBoard, nil)

  result, err := service.Update(ctx, updateReq)
  require.NoError(t, err)
  assert.Equal(t, boardID, result.ID)
}

func TestSetTimer(t *testing.T) {
  ctx := context.Background()
  boardMock := NewMockBoardDatabase(t)
  sessionsMock := sessions.NewMockSessionService(t)
  sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
  noteMock := notes.NewMockNotesService(t)
  reactionMock := reactions.NewMockReactionService(t)
  votingMock := votings.NewMockVotingService(t)

  mockRealtime := new(realtime.Broker)

  service := NewBoardService(boardMock, mockRealtime, sessionRequestMock, sessionsMock, noteMock, reactionMock, votingMock)

  boardID := uuid.New()

  timerStart := time.Now().Local()
  timerEnd := timerStart.Add(time.Minute * time.Duration(5))

  boardMock.EXPECT().UpdateBoardTimer(DatabaseBoardTimerUpdate{
    BaseModel:  bun.BaseModel{},
    ID:         boardID,
    TimerStart: &timerStart,
    TimerEnd:   &timerEnd,
  }).Return(DatabaseBoard{ID: boardID, TimerEnd: &timerEnd}, nil)

  result, err := service.SetTimer(ctx, boardID, 5)
  require.NoError(t, err)
  require.NotNil(t, result)
  assert.Equal(t, boardID, result.ID)
}

func TestDeleteTimer(t *testing.T) {
  ctx := context.Background()
  boardMock := NewMockBoardDatabase(t)
  sessionsMock := sessions.NewMockSessionService(t)
  sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
  noteMock := notes.NewMockNotesService(t)
  reactionMock := reactions.NewMockReactionService(t)
  votingMock := votings.NewMockVotingService(t)

  mockRealtime := new(realtime.Broker)

  service := NewBoardService(boardMock, mockRealtime, sessionRequestMock, sessionsMock, noteMock, reactionMock, votingMock)

  boardID := uuid.New()
  boardMock.EXPECT().UpdateBoardTimer(DatabaseBoardTimerUpdate{
    BaseModel:  bun.BaseModel{},
    ID:         boardID,
    TimerStart: nil,
    TimerEnd:   nil,
  }).Return(DatabaseBoard{ID: boardID}, nil)

  result, err := service.DeleteTimer(ctx, boardID)
  require.NoError(t, err)
  assert.Equal(t, boardID, result.ID)
  assert.Equal(t, (*time.Time)(nil), result.TimerStart)
  assert.Equal(t, (*time.Time)(nil), result.TimerEnd)
}

func TestIncrementTimer(t *testing.T) {
  ctx := context.Background()
  boardMock := NewMockBoardDatabase(t)
  sessionsMock := sessions.NewMockSessionService(t)
  sessionRequestMock := sessionrequests.NewMockSessionRequestService(t)
  noteMock := notes.NewMockNotesService(t)
  reactionMock := reactions.NewMockReactionService(t)
  votingMock := votings.NewMockVotingService(t)

  mockRealtime := new(realtime.Broker)

  service := NewBoardService(boardMock, mockRealtime, sessionRequestMock, sessionsMock, noteMock, reactionMock, votingMock)

  boardID := uuid.New()
  now := time.Now()

  updatedTimer := now.Add(1 * time.Minute)

  mockBoard := DatabaseBoard{
    ID:         boardID,
    TimerStart: &now,
    TimerEnd:   &updatedTimer,
  }
  updatedTimerEnd := updatedTimer.Add(time.Minute * 1)
  boardMock.EXPECT().GetBoard(boardID).Return(mockBoard, nil)
  boardMock.EXPECT().UpdateBoardTimer(DatabaseBoardTimerUpdate{
    BaseModel:  bun.BaseModel{},
    ID:         boardID,
    TimerStart: &now,
    TimerEnd:   &updatedTimerEnd,
  }).Return(mockBoard, nil)

  result, err := service.IncrementTimer(ctx, boardID)
  require.NoError(t, err)
  assert.Equal(t, boardID, result.ID)
  assert.Equal(t, updatedTimerEnd, *result.TimerEnd)
}
