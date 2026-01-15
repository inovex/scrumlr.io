package api

import (
	"context"
	"github.com/coder/websocket"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/boards"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessions"
	"testing"
	"time"
)

type BoardsListenIntegrationTestSuite struct {
	suite.Suite
}

func TestBoardsListenIntegrationTestSuite(t *testing.T) {
	suite.Run(t, new(BoardsListenIntegrationTestSuite))
}

func (suite *BoardsListenIntegrationTestSuite) TestListenOnBoardCreatesNewSubscription() {
	boardID := uuid.New()
	userID := uuid.New()
	eventChan := make(chan *realtime.BoardEvent, 1)
	s := &Server{
		boardSubscriptions: make(map[uuid.UUID]*BoardSubscription),
	}
	fullBoard := boards.FullBoard{
		Board: &boards.Board{
			ID:           boardID,
			AccessPolicy: boards.Public,
		},
		BoardSessions: []*sessions.BoardSession{
			{UserID: userID, Role: "PARTICIPANT"},
		},
		Columns:   []*columns.Column{},
		Notes:     []*notes.Note{},
		Reactions: []*reactions.Reaction{},
	}
	conn := &websocket.Conn{}
	s.boardSubscriptions[boardID] = &BoardSubscription{
		clients:      make(map[uuid.UUID]*websocket.Conn),
		subscription: eventChan,
	}
	s.listenOnBoard(context.Background(), boardID, userID, conn, fullBoard)
	assert.NotNil(suite.T(), s.boardSubscriptions[boardID])
	assert.Equal(suite.T(), conn, s.boardSubscriptions[boardID].clients[userID])
	assert.Equal(suite.T(), fullBoard.Board, s.boardSubscriptions[boardID].boardSettings)
	assert.Equal(suite.T(), fullBoard.BoardSessions, s.boardSubscriptions[boardID].boardParticipants)
	assert.Equal(suite.T(), fullBoard.Columns, s.boardSubscriptions[boardID].boardColumns)
	assert.Equal(suite.T(), fullBoard.Notes, s.boardSubscriptions[boardID].boardNotes)
	assert.Equal(suite.T(), fullBoard.Reactions, s.boardSubscriptions[boardID].boardReactions)
}

func (suite *BoardsListenIntegrationTestSuite) TestListenOnBoardAddsClientToExistingSubscription() {
	boardID := uuid.New()
	userID1 := uuid.New()
	userID2 := uuid.New()
	eventChan := make(chan *realtime.BoardEvent, 1)
	conn1 := &websocket.Conn{}
	s := &Server{
		boardSubscriptions: map[uuid.UUID]*BoardSubscription{
			boardID: {
				clients:      map[uuid.UUID]*websocket.Conn{userID1: conn1},
				subscription: eventChan,
			},
		},
	}
	fullBoard := boards.FullBoard{
		Board: &boards.Board{ID: boardID},
	}
	conn2 := &websocket.Conn{}
	s.listenOnBoard(context.Background(), boardID, userID2, conn2, fullBoard)
	assert.Len(suite.T(), s.boardSubscriptions[boardID].clients, 2)
	assert.Equal(suite.T(), conn1, s.boardSubscriptions[boardID].clients[userID1])
	assert.Equal(suite.T(), conn2, s.boardSubscriptions[boardID].clients[userID2])
}

func (suite *BoardsListenIntegrationTestSuite) TestStartListeningOnBoardBroadcastsEvents() {
	eventChan := make(chan *realtime.BoardEvent, 10)
	client1ID := uuid.New()
	client2ID := uuid.New()
	bs := &BoardSubscription{
		subscription: eventChan,
		clients:      make(map[uuid.UUID]*websocket.Conn),
		boardSettings: &boards.Board{
			ShowNotesOfOtherUsers: true,
		},
		boardParticipants: []*sessions.BoardSession{
			{UserID: client1ID, Role: "OWNER"},
			{UserID: client2ID, Role: "OWNER"},
		},
		boardColumns: []*columns.Column{},
		boardNotes:   []*notes.Note{},
	}
	testEvent := &realtime.BoardEvent{
		Type: realtime.BoardEventBoardUpdated,
		Data: &boards.Board{
			ID:           uuid.New(),
			AccessPolicy: boards.Public,
		},
	}
	eventChan <- testEvent
	close(eventChan)
	go bs.startListeningOnBoard()
	time.Sleep(100 * time.Millisecond)
	assert.NotNil(suite.T(), bs)
}

func (suite *BoardsListenIntegrationTestSuite) TestCloseBoardSocketCallsSessionDisconnect() {
	boardID := uuid.New()
	userID := uuid.New()
	mockSessionService := sessions.NewMockSessionService(suite.T())
	mockSessionService.EXPECT().Disconnect(mock.Anything, boardID, userID).Return(nil)
	s := &Server{
		sessions: mockSessionService,
	}
	err := s.sessions.Disconnect(context.Background(), boardID, userID)
	assert.Nil(suite.T(), err)
	mockSessionService.AssertExpectations(suite.T())
}

func (suite *BoardsListenIntegrationTestSuite) TestBoardSubscriptionManagesMultipleClients() {
	subscription := &BoardSubscription{
		clients:      make(map[uuid.UUID]*websocket.Conn),
		subscription: make(chan *realtime.BoardEvent, 1),
	}
	userID1 := uuid.New()
	userID2 := uuid.New()
	userID3 := uuid.New()
	conn1 := &websocket.Conn{}
	conn2 := &websocket.Conn{}
	conn3 := &websocket.Conn{}
	subscription.clients[userID1] = conn1
	subscription.clients[userID2] = conn2
	subscription.clients[userID3] = conn3
	assert.Len(suite.T(), subscription.clients, 3)
	delete(subscription.clients, userID2)
	assert.Len(suite.T(), subscription.clients, 2)
	assert.Nil(suite.T(), subscription.clients[userID2])
	assert.NotNil(suite.T(), subscription.clients[userID1])
	assert.NotNil(suite.T(), subscription.clients[userID3])
}

func (suite *BoardsListenIntegrationTestSuite) TestBoardSubscriptionStoresFullBoardData() {
	boardID := uuid.New()
	subscription := &BoardSubscription{
		clients: make(map[uuid.UUID]*websocket.Conn),
	}
	testBoard := &boards.Board{
		ID:                    boardID,
		AccessPolicy:          boards.Public,
		ShowNotesOfOtherUsers: true,
	}
	testSessions := []*sessions.BoardSession{
		{UserID: uuid.New(), Role: "OWNER"},
	}
	testColumns := []*columns.Column{
		{ID: uuid.New(), Name: "Column 1"},
	}
	testNotes := []*notes.Note{
		{ID: uuid.New(), Text: "Test Note"},
	}
	testReactions := []*reactions.Reaction{
		{ID: uuid.New()},
	}
	subscription.boardSettings = testBoard
	subscription.boardParticipants = testSessions
	subscription.boardColumns = testColumns
	subscription.boardNotes = testNotes
	subscription.boardReactions = testReactions
	assert.Equal(suite.T(), testBoard, subscription.boardSettings)
	assert.Equal(suite.T(), testSessions, subscription.boardParticipants)
	assert.Equal(suite.T(), testColumns, subscription.boardColumns)
	assert.Equal(suite.T(), testNotes, subscription.boardNotes)
	assert.Equal(suite.T(), testReactions, subscription.boardReactions)
}
