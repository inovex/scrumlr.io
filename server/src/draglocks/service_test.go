package draglocks

import (
	"context"
	"encoding/json"
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/cache"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
)

func TestAcquireLock(t *testing.T) {
	noteId := uuid.New()
	userId := uuid.New()
	boardId := uuid.New()

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Create(mock.Anything, noteId.String(), userId.String(), 10*time.Second).Return(nil)
	c := new(cache.Cache)
	c.Con = mockCache

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetStack(mock.Anything, noteId).
		Return([]*notes.Note{{ID: noteId}}, nil)

	draglockService := NewDragLockService(mockNoteService, c, broker)

	acuired := draglockService.AcquireLock(context.Background(), noteId, userId, boardId)

	assert.True(t, acuired)
}

func TestAcquireLockForStack(t *testing.T) {
	firstNoteId := uuid.New()
	secondNoteId := uuid.New()
	userId := uuid.New()
	boardId := uuid.New()

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Create(mock.Anything, firstNoteId.String(), userId.String(), 10*time.Second).Return(nil)
	mockCache.EXPECT().Create(mock.Anything, secondNoteId.String(), userId.String(), 10*time.Second).Return(nil)
	c := new(cache.Cache)
	c.Con = mockCache

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetStack(mock.Anything, firstNoteId).
		Return([]*notes.Note{{ID: firstNoteId}, {ID: secondNoteId}}, nil)

	draglockService := NewDragLockService(mockNoteService, c, broker)

	acuired := draglockService.AcquireLock(context.Background(), firstNoteId, userId, boardId)

	assert.True(t, acuired)
}

func TestAcquireLockFailed(t *testing.T) {
	firstNoteId := uuid.New()
	secondNoteId := uuid.New()
	userId := uuid.New()
	boardId := uuid.New()

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Create(mock.Anything, firstNoteId.String(), userId.String(), 10*time.Second).Return(nil)
	mockCache.EXPECT().Create(mock.Anything, secondNoteId.String(), userId.String(), 10*time.Second).Return(errors.New("Key already exists"))
	c := new(cache.Cache)
	c.Con = mockCache

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetStack(mock.Anything, firstNoteId).
		Return([]*notes.Note{{ID: firstNoteId}, {ID: secondNoteId}}, nil)

	draglockService := NewDragLockService(mockNoteService, c, broker)

	acuired := draglockService.AcquireLock(context.Background(), firstNoteId, userId, boardId)

	assert.False(t, acuired)
}

func TestAcquireLockLockNoteServicefailure(t *testing.T) {
	noteId := uuid.New()
	userId := uuid.New()
	boardId := uuid.New()

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetStack(mock.Anything, noteId).
		Return(nil, errors.New("Failed to get stack"))

	draglockService := NewDragLockService(mockNoteService, c, broker)

	acuired := draglockService.AcquireLock(context.Background(), noteId, userId, boardId)

	assert.False(t, acuired)
}

func TestReleaseLock(t *testing.T) {
	noteId := uuid.New()
	userId := uuid.New()
	boardId := uuid.New()

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Delete(mock.Anything, noteId.String()).Return(nil)
	c := new(cache.Cache)
	c.Con = mockCache

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetStack(mock.Anything, noteId).
		Return([]*notes.Note{{ID: noteId}}, nil)

	draglockService := NewDragLockService(mockNoteService, c, broker)

	released := draglockService.ReleaseLock(context.Background(), noteId, userId, boardId)

	assert.True(t, released)
}

func TestReleaseLockForStack(t *testing.T) {
	firstNoteId := uuid.New()
	secondNoteId := uuid.New()
	userId := uuid.New()
	boardId := uuid.New()

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Delete(mock.Anything, firstNoteId.String()).Return(nil)
	mockCache.EXPECT().Delete(mock.Anything, secondNoteId.String()).Return(errors.New("cache error"))
	c := new(cache.Cache)
	c.Con = mockCache

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetStack(mock.Anything, firstNoteId).
		Return([]*notes.Note{{ID: firstNoteId}, {ID: secondNoteId}}, nil)

	draglockService := NewDragLockService(mockNoteService, c, broker)

	released := draglockService.ReleaseLock(context.Background(), firstNoteId, userId, boardId)

	assert.False(t, released)
}

func TestReleaseLockFailed(t *testing.T) {
	firstNoteId := uuid.New()
	secondNoteId := uuid.New()
	userId := uuid.New()
	boardId := uuid.New()

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Delete(mock.Anything, firstNoteId.String()).Return(nil)
	mockCache.EXPECT().Delete(mock.Anything, secondNoteId.String()).Return(nil)
	c := new(cache.Cache)
	c.Con = mockCache

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetStack(mock.Anything, firstNoteId).
		Return([]*notes.Note{{ID: firstNoteId}, {ID: secondNoteId}}, nil)

	draglockService := NewDragLockService(mockNoteService, c, broker)

	released := draglockService.ReleaseLock(context.Background(), firstNoteId, userId, boardId)

	assert.True(t, released)
}

func TestRealeaseLockNoteServiceFailed(t *testing.T) {
	noteId := uuid.New()
	userId := uuid.New()
	boardId := uuid.New()

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetStack(mock.Anything, noteId).
		Return(nil, errors.New("Failed to get stack"))

	draglockService := NewDragLockService(mockNoteService, c, broker)

	released := draglockService.ReleaseLock(context.Background(), noteId, userId, boardId)

	assert.False(t, released)
}

func TestGetLock(t *testing.T) {
	noteId := uuid.New()
	userId := uuid.New()
	lockValue, _ := json.Marshal(DragLock{NoteID: noteId, UserID: userId})

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(lockValue, nil)
	c := new(cache.Cache)
	c.Con = mockCache

	mockNoteService := notes.NewMockNotesService(t)

	draglockService := NewDragLockService(mockNoteService, c, broker)

	lock, err := draglockService.GetLock(context.Background(), noteId)

	assert.Nil(t, err)
	assert.Equal(t, noteId, lock.NoteID)
	assert.Equal(t, userId, lock.UserID)
}

func TestIsLocked(t *testing.T) {
	noteId := uuid.New()
	userId := uuid.New()
	lockValue, _ := json.Marshal(DragLock{NoteID: noteId, UserID: userId})

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(lockValue, nil)
	c := new(cache.Cache)
	c.Con = mockCache

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetStack(mock.Anything, noteId).
		Return([]*notes.Note{{ID: noteId}}, nil)

	draglockService := NewDragLockService(mockNoteService, c, broker)

	locked := draglockService.IsLocked(context.Background(), noteId)

	assert.True(t, locked)
}

func TestIsLockedStack(t *testing.T) {
	firstNoteId := uuid.New()
	secondNoteId := uuid.New()
	userId := uuid.New()
	firstLockValue, _ := json.Marshal(DragLock{NoteID: firstNoteId, UserID: userId})
	secondLockValue, _ := json.Marshal(DragLock{NoteID: secondNoteId, UserID: userId})

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, firstNoteId.String()).Return(firstLockValue, nil)
	mockCache.EXPECT().Get(mock.Anything, secondNoteId.String()).Return(secondLockValue, nil)
	c := new(cache.Cache)
	c.Con = mockCache

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetStack(mock.Anything, firstNoteId).
		Return([]*notes.Note{{ID: firstNoteId}, {ID: secondNoteId}}, nil)

	draglockService := NewDragLockService(mockNoteService, c, broker)

	locked := draglockService.IsLocked(context.Background(), firstNoteId)

	assert.True(t, locked)
}

func TestIsNotLocked(t *testing.T) {
	noteId := uuid.New()

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, noteId.String()).Return(nil, errors.New("Key not found"))
	c := new(cache.Cache)
	c.Con = mockCache

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetStack(mock.Anything, noteId).
		Return([]*notes.Note{{ID: noteId}}, nil)

	draglockService := NewDragLockService(mockNoteService, c, broker)

	locked := draglockService.IsLocked(context.Background(), noteId)

	assert.False(t, locked)
}

func TestIsPartialLockedStack(t *testing.T) {
	firstNoteId := uuid.New()
	secondNoteId := uuid.New()
	userId := uuid.New()
	secondLockValue, _ := json.Marshal(DragLock{NoteID: secondNoteId, UserID: userId})

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	mockCache.EXPECT().Get(mock.Anything, firstNoteId.String()).Return(nil, errors.New("Key not found"))
	mockCache.EXPECT().Get(mock.Anything, secondNoteId.String()).Return(secondLockValue, nil)
	c := new(cache.Cache)
	c.Con = mockCache

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetStack(mock.Anything, firstNoteId).
		Return([]*notes.Note{{ID: firstNoteId}, {ID: secondNoteId}}, nil)

	draglockService := NewDragLockService(mockNoteService, c, broker)

	locked := draglockService.IsLocked(context.Background(), firstNoteId)

	assert.True(t, locked)
}

func TestIsLockedNoteServicefailure(t *testing.T) {
	noteId := uuid.New()

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockCache := cache.NewMockClient(t)
	c := new(cache.Cache)
	c.Con = mockCache

	mockNoteService := notes.NewMockNotesService(t)
	mockNoteService.EXPECT().GetStack(mock.Anything, noteId).
		Return(nil, errors.New("Note service failure"))

	draglockService := NewDragLockService(mockNoteService, c, broker)

	locked := draglockService.IsLocked(context.Background(), noteId)

	assert.False(t, locked)
}
