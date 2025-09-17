package reactions

import (
	"context"
	"database/sql"
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/common"
	"scrumlr.io/server/realtime"
)

func TestGetReaction(t *testing.T) {
	id := uuid.New()
	noteId := uuid.New()
	userId := uuid.New()
	reactionType := Like

	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().Get(mock.Anything, id).Return(DatabaseReaction{ID: id, Note: noteId, User: userId, ReactionType: reactionType}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	reaction, err := service.Get(context.Background(), id)

	assert.Nil(t, err)
	assert.NotNil(t, reaction)
	assert.Equal(t, id, reaction.ID)
	assert.Equal(t, noteId, reaction.Note)
	assert.Equal(t, userId, reaction.User)
	assert.Equal(t, reactionType, reaction.ReactionType)
}

func TestGetReaction_NotFound(t *testing.T) {
	id := uuid.New()
	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().Get(mock.Anything, id).Return(DatabaseReaction{}, sql.ErrNoRows)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	reaction, err := service.Get(context.Background(), id)

	assert.Nil(t, reaction)
	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func TestGetReaction_DatabaseError(t *testing.T) {
	id := uuid.New()
	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().Get(mock.Anything, id).Return(DatabaseReaction{}, errors.New("database error"))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	reaction, err := service.Get(context.Background(), id)

	assert.Nil(t, reaction)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func TestGetAllReactions(t *testing.T) {
	boardId := uuid.New()
	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().GetAll(mock.Anything, boardId).Return([]DatabaseReaction{
		{ID: uuid.New(), User: uuid.New(), Note: uuid.New(), ReactionType: Heart},
		{ID: uuid.New(), User: uuid.New(), Note: uuid.New(), ReactionType: Joy},
	}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	reactions, err := service.GetAll(context.Background(), boardId)

	assert.Nil(t, err)
	assert.NotNil(t, reactions)
	assert.Len(t, reactions, 2)
}

func TestGetAllReactions_NotFound(t *testing.T) {
	boardId := uuid.New()
	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().GetAll(mock.Anything, boardId).Return([]DatabaseReaction{}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	reactions, err := service.GetAll(context.Background(), boardId)

	assert.Nil(t, err)
	assert.NotNil(t, reactions)
	assert.Len(t, reactions, 0)
}

func TestGetAllReactions_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().GetAll(mock.Anything, boardId).Return(nil, errors.New("database error"))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	_, err := service.GetAll(context.Background(), boardId)

	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func TestCreateReaction(t *testing.T) {
	id := uuid.New()
	boardId := uuid.New()
	noteId := uuid.New()
	userId := uuid.New()
	reactionType := Like

	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().GetAllForNote(mock.Anything, noteId).
		Return([]DatabaseReaction{{ID: uuid.New(), Note: noteId, User: uuid.New(), ReactionType: Heart}}, nil)
	mockReactionDb.EXPECT().Create(mock.Anything, boardId, DatabaseReactionInsert{Note: noteId, User: userId, ReactionType: reactionType}).
		Return(DatabaseReaction{ID: id, Note: noteId, User: userId, ReactionType: reactionType}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	reaction, err := service.Create(context.Background(), ReactionCreateRequest{
		Board:        boardId,
		Note:         noteId,
		User:         userId,
		ReactionType: reactionType,
	})

	assert.Nil(t, err)
	assert.NotNil(t, reaction)
	assert.Equal(t, id, reaction.ID)
	assert.Equal(t, noteId, reaction.Note)
	assert.Equal(t, userId, reaction.User)
	assert.Equal(t, reactionType, reaction.ReactionType)
}

func TestCreateReaction_Multiple(t *testing.T) {
	boardId := uuid.New()
	noteId := uuid.New()
	userId := uuid.New()
	reactionType := Poop

	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().GetAllForNote(mock.Anything, noteId).
		Return([]DatabaseReaction{{ID: uuid.New(), Note: noteId, User: userId, ReactionType: Heart}}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	reaction, err := service.Create(context.Background(), ReactionCreateRequest{
		Board:        boardId,
		Note:         noteId,
		User:         userId,
		ReactionType: reactionType,
	})

	assert.Nil(t, reaction)
	assert.NotNil(t, err)
	assert.Equal(t, common.ConflictError(errors.New("cannot make multiple reactions on the same note by the same user")), err)
}

func TestCreateReaction_Failed(t *testing.T) {
	boardId := uuid.New()
	noteId := uuid.New()
	userId := uuid.New()
	reactionType := Like

	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().GetAllForNote(mock.Anything, noteId).
		Return([]DatabaseReaction{{ID: uuid.New(), Note: noteId, User: uuid.New(), ReactionType: Heart}}, nil)
	mockReactionDb.EXPECT().Create(mock.Anything, boardId, DatabaseReactionInsert{Note: noteId, User: userId, ReactionType: reactionType}).
		Return(DatabaseReaction{}, errors.New("database error"))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	reaction, err := service.Create(context.Background(), ReactionCreateRequest{Board: boardId, Note: noteId, User: userId, ReactionType: reactionType})

	assert.Nil(t, reaction)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func TestCreateReaction_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	noteId := uuid.New()
	userId := uuid.New()
	reactionType := Like

	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().GetAllForNote(mock.Anything, noteId).
		Return([]DatabaseReaction{}, errors.New("databse error"))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	reaction, err := service.Create(context.Background(), ReactionCreateRequest{Board: boardId, Note: noteId, User: userId, ReactionType: reactionType})

	assert.Nil(t, reaction)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func TestDeleteReaction(t *testing.T) {
	Id := uuid.New()
	boardId := uuid.New()
	userId := uuid.New()
	noteId := uuid.New()
	reactionType := Dislike

	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().Get(mock.Anything, Id).
		Return(DatabaseReaction{ID: Id, Note: noteId, User: userId, ReactionType: reactionType}, nil)
	mockReactionDb.EXPECT().Delete(mock.Anything, Id).Return(nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	err := service.Delete(context.Background(), boardId, userId, Id)

	assert.Nil(t, err)
}

func TestDeleteReaction_NotFound(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	reactionId := uuid.New()

	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().Get(mock.Anything, reactionId).
		Return(DatabaseReaction{}, sql.ErrNoRows)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	err := service.Delete(context.Background(), boardId, userId, reactionId)

	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func TestDeleteReaction_Forbidden(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	noteId := uuid.New()
	reactionId := uuid.New()

	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().Get(mock.Anything, reactionId).
		Return(DatabaseReaction{ID: reactionId, User: uuid.New(), Note: noteId, ReactionType: Celebration}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	err := service.Delete(context.Background(), boardId, userId, reactionId)

	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("forbidden")), err)
}

func TestDeleteReaction_DatabaseError(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	noteId := uuid.New()
	reactionId := uuid.New()

	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().Get(mock.Anything, reactionId).
		Return(DatabaseReaction{ID: reactionId, User: userId, Note: noteId, ReactionType: Celebration}, nil)
	mockReactionDb.EXPECT().Delete(mock.Anything, reactionId).
		Return(errors.New("database error"))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	err := service.Delete(context.Background(), boardId, userId, reactionId)

	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}

func TestUpdateReaction(t *testing.T) {
	Id := uuid.New()
	boardId := uuid.New()
	userId := uuid.New()
	noteId := uuid.New()
	reactionType := Like

	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().Get(mock.Anything, Id).
		Return(DatabaseReaction{ID: Id, User: userId, Note: noteId, ReactionType: Poop}, nil)
	mockReactionDb.EXPECT().Update(mock.Anything, Id, DatabaseReactionUpdate{ReactionType: reactionType}).
		Return(DatabaseReaction{ID: Id, User: userId, Note: noteId, ReactionType: reactionType}, nil)

	mockBroker := realtime.NewMockClient(t)
	mockBroker.EXPECT().Publish(mock.Anything, mock.AnythingOfType("string"), mock.Anything).Return(nil)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	reaction, err := service.Update(context.Background(), boardId, userId, Id, ReactionUpdateTypeRequest{ReactionType: reactionType})

	assert.Nil(t, err)
	assert.NotNil(t, reaction)
	assert.Equal(t, Id, reaction.ID)
	assert.Equal(t, noteId, reaction.Note)
	assert.Equal(t, userId, reaction.User)
	assert.Equal(t, reactionType, reaction.ReactionType)
}

func TestUpdateReaction_NotFound(t *testing.T) {
	boardId := uuid.New()
	userId := uuid.New()
	reactionId := uuid.New()

	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().Get(mock.Anything, reactionId).
		Return(DatabaseReaction{}, sql.ErrNoRows)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	reaction, err := service.Update(context.Background(), boardId, userId, reactionId, ReactionUpdateTypeRequest{ReactionType: Like})

	assert.Nil(t, reaction)
	assert.NotNil(t, err)
	assert.Equal(t, common.NotFoundError, err)
}

func TestUpdateReaction_Forbidden(t *testing.T) {
	Id := uuid.New()
	boardId := uuid.New()
	userId := uuid.New()
	noteId := uuid.New()

	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().Get(mock.Anything, Id).
		Return(DatabaseReaction{ID: Id, Note: noteId, User: uuid.New(), ReactionType: Dislike}, nil)

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	reaction, err := service.Update(context.Background(), boardId, userId, Id, ReactionUpdateTypeRequest{ReactionType: Like})

	assert.Nil(t, reaction)
	assert.NotNil(t, err)
	assert.Equal(t, common.ForbiddenError(errors.New("forbidden")), err)
}

func TestUpdateReaction_DatabaseError(t *testing.T) {
	Id := uuid.New()
	boardId := uuid.New()
	userId := uuid.New()
	noteId := uuid.New()

	mockReactionDb := NewMockReactionDatabase(t)
	mockReactionDb.EXPECT().Get(mock.Anything, Id).
		Return(DatabaseReaction{ID: Id, Note: noteId, User: userId, ReactionType: Dislike}, nil)
	mockReactionDb.EXPECT().Update(mock.Anything, Id, DatabaseReactionUpdate{ReactionType: Poop}).
		Return(DatabaseReaction{}, errors.New("database error"))

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewReactionService(mockReactionDb, broker)
	reaction, err := service.Update(context.Background(), boardId, userId, Id, ReactionUpdateTypeRequest{ReactionType: Poop})

	assert.Nil(t, reaction)
	assert.NotNil(t, err)
	assert.Equal(t, common.InternalServerError, err)
}
