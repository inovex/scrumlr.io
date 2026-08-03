package api

import (
	"context"
	"errors"
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
	mockBroker := new(realtime.MockBrokerInterface)

	mockBroker.EXPECT().GetBoardChannel(mock.Anything, boardID).Return(nil, errors.New("network timeout")).Times(3)
	mockBroker.EXPECT().GetBoardChannel(mock.Anything, boardID).Return(successChan, nil).Once()

	s := &Server{
		boardSubscriptions: make(map[uuid.UUID]*BoardSubscription),
		realtime:           mockBroker,
	}

  retryDelay := time.Millisecond * 10
	s.listenOnBoard(context.Background(), boardID, userID, conn, fullBoard, retryDelay)

	mockBroker.AssertExpectations(t)
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

	mockBroker := new(realtime.MockBrokerInterface)

	mockBroker.EXPECT().GetBoardChannel(mock.Anything, boardID).Return(nil, errors.New("network timeout")).Times(MaxRetries)

	s := &Server{
		boardSubscriptions: make(map[uuid.UUID]*BoardSubscription),
		realtime:           mockBroker,
	}

  retryDelay := time.Millisecond * 10
	s.listenOnBoard(context.Background(), boardID, userID, conn, fullBoard, retryDelay)

	mockBroker.AssertExpectations(t)
	savedSubscription := s.boardSubscriptions[boardID].subscription
	assert.Nil(t, savedSubscription, "No subscription should be stored if all retries fail")
}
