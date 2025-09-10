package reactions

import (
	"context"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/realtime"
)

func TestGetReaction(t *testing.T) {
	id := uuid.New()
	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().Get(id).Return(DatabaseReaction{ID: id, Note: uuid.New(), User: uuid.New(), ReactionType: Like}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	reaction, err := service.Get(context.Background(), id)

	assert.Nil(t, err)
	assert.NotNil(t, reaction)
}

func TestGetReaction_NotFound(t *testing.T) {
	id := uuid.New()
	dbError := "Not found"
	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().Get(id).Return(DatabaseReaction{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	_, err := service.Get(context.Background(), id)

	assert.NotNil(t, err)
	assert.Equal(t, dbError, err.Error())
}

func TestListReactions(t *testing.T) {
	boardId := uuid.New()
	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().GetAll(boardId).Return([]DatabaseReaction{{bun.BaseModel{}, uuid.New(), uuid.New(), uuid.New(), Heart}, {bun.BaseModel{}, uuid.New(), uuid.New(), uuid.New(), Joy}}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	reactions, err := service.GetAll(context.Background(), boardId)

	assert.Nil(t, err)
	assert.NotNil(t, reactions)
}

func TestListReactions_NotFound(t *testing.T) {
	boardId := uuid.New()
	dbError := "Not found"
	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().GetAll(boardId).Return(nil, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	_, err := service.GetAll(context.Background(), boardId)

	assert.NotNil(t, err)
	assert.Equal(t, dbError, err.Error())
}

func TestCreateReaction(t *testing.T) {
	boardId := uuid.New()
	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().Create(boardId, DatabaseReactionInsert{}).Return(DatabaseReaction{}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	reaction, err := service.Create(context.Background(), boardId, ReactionCreateRequest{})

	assert.Nil(t, err)
	assert.NotNil(t, reaction)
}

func TestCreateReaction_Failed(t *testing.T) {
	boardId := uuid.New()
	dbError := "Cannot create reaction"
	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().Create(boardId, DatabaseReactionInsert{}).Return(DatabaseReaction{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	_, err := service.Create(context.Background(), boardId, ReactionCreateRequest{})

	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError.Error(), err.Error())
}

func TestDeleteReaction(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	reactionId := uuid.New()
	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().Delete(boardId, userId, reactionId).Return(nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	err := service.Delete(context.Background(), boardId, userId, reactionId)

	assert.Nil(t, err)
}

func TestDeleteReaction_Failed(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	reactionId := uuid.New()
	dbError := "Cannot delete reaction"
	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().Delete(boardId, userId, reactionId).Return(errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	err := service.Delete(context.Background(), boardId, userId, reactionId)

	assert.NotNil(t, err)
	assert.Equal(t, dbError, err.Error())
}

func TestUpdateReaction(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	reactionId := uuid.New()
	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().Update(boardId, userId, reactionId, DatabaseReactionUpdate{}).Return(DatabaseReaction{}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	reaction, err := service.Update(context.Background(), boardId, userId, reactionId, ReactionUpdateTypeRequest{})

	assert.Nil(t, err)
	assert.NotNil(t, reaction)
}

func TestUpdateReaction_Failed(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	reactionId := uuid.New()
	dbError := "Cannot update reaction"
	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().Update(boardId, userId, reactionId, DatabaseReactionUpdate{}).Return(DatabaseReaction{}, errors.New(dbError))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	_, err := service.Update(context.Background(), boardId, userId, reactionId, ReactionUpdateTypeRequest{})

	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError.Error(), err.Error())
}
