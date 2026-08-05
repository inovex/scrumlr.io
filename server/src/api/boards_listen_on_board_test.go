package api

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/boards"
	"scrumlr.io/server/realtime"
)

func (suite *BoardsListenIntegrationTestSuite) TestListenOnBoard_RetriesOnFailure() {
	t := suite.T()

	boardID := uuid.New()
	userID := uuid.New()
	conn := &mockConnection{}

	fullBoard := boards.FullBoard{
		Board: &boards.Board{ID: boardID},
	}

	successChan := make(chan *realtime.BoardEvent, 1)
	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockBroker.EXPECT().SubscribeToBoardEvents(mock.Anything, fmt.Sprintf("board.%s", boardID)).
		Return(nil, errors.New("network timeout")).Times(3)
	mockBroker.EXPECT().SubscribeToBoardEvents(mock.Anything, fmt.Sprintf("board.%s", boardID)).
		Return(successChan, nil).Once()

	s := &Server{
		boardSubscriptions: make(map[uuid.UUID]*BoardSubscription),
		realtime:           broker,
	}

	retryDelay := time.Millisecond * 10
	s.listenOnBoard(context.Background(), boardID, userID, conn, fullBoard, retryDelay)

	savedSubscription := s.boardSubscriptions[boardID].subscription
	assert.Equal(t, successChan, savedSubscription, "The successful channel should be stored after retrying")
}

func (suite *BoardsListenIntegrationTestSuite) TestListenOnBoard_FailsAfterMaxRetries() {
	t := suite.T()

	boardID := uuid.New()
	userID := uuid.New()
	conn := &mockConnection{}

	fullBoard := boards.FullBoard{
		Board: &boards.Board{ID: boardID},
	}

	mockBroker := realtime.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockBroker.EXPECT().SubscribeToBoardEvents(mock.Anything, fmt.Sprintf("board.%s", boardID)).
		Return(nil, errors.New("network timeout")).Times(MaxRetries)

	s := &Server{
		boardSubscriptions: make(map[uuid.UUID]*BoardSubscription),
		realtime:           broker,
	}

	retryDelay := time.Millisecond * 10
	s.listenOnBoard(context.Background(), boardID, userID, conn, fullBoard, retryDelay)

	savedSubscription := s.boardSubscriptions[boardID].subscription
	assert.Nil(t, savedSubscription, "No subscription should be stored if all retries fail")
}
