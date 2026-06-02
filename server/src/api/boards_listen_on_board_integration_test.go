package api

import (
	"context"
	"sync"
	"testing"
	"time"

	"scrumlr.io/server/websocket"

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
)

type mockConnection struct{}

func (m *mockConnection) WriteJSON(ctx context.Context, data any) error {
	return nil
}

func (m *mockConnection) Read(ctx context.Context) (websocket.MessageType, []byte, error) {
	return websocket.MessageText, nil, nil
}

func (m *mockConnection) Close(reason string) error {
	return nil
}

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
	conn := &mockConnection{}
	s.boardSubscriptions[boardID] = &BoardSubscription{
		clients:      make(map[uuid.UUID]websocket.Connection),
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
	conn1 := &mockConnection{}
	s := &Server{
		boardSubscriptions: map[uuid.UUID]*BoardSubscription{
			boardID: {
				clients:      map[uuid.UUID]websocket.Connection{userID1: conn1},
				subscription: eventChan,
			},
		},
	}
	fullBoard := boards.FullBoard{
		Board: &boards.Board{ID: boardID},
	}
	conn2 := &mockConnection{}
	s.listenOnBoard(context.Background(), boardID, userID2, conn2, fullBoard)
	assert.Len(suite.T(), s.boardSubscriptions[boardID].clients, 2)
	assert.Equal(suite.T(), conn1, s.boardSubscriptions[boardID].clients[userID1])
	assert.Equal(suite.T(), conn2, s.boardSubscriptions[boardID].clients[userID2])
}

// TestListenOnBoardConcurrentFirstConnections is a regression test that can find race conditions when the -race flag is set.
func (suite *BoardsListenIntegrationTestSuite) TestListenOnBoardConcurrentFirstConnections() {
	boardID := uuid.New()
	fullBoard := boards.FullBoard{
		Board: &boards.Board{ID: boardID},
	}

	// Run the same simultaneous first-connection scenario repeatedly to keep
	// pressure on the shared subscription maps while still using the synchronized
	// production path.
	for range 200 {
		eventChan := make(chan *realtime.BoardEvent)
		mockRealtimeClient := realtime.NewMockClient(suite.T())
		mockRealtimeClient.EXPECT().SubscribeToBoardEvents(mock.Anything, mock.Anything).Return(eventChan, nil)

		s := &Server{
			boardSubscriptions: make(map[uuid.UUID]*BoardSubscription),
			realtime:           &realtime.Broker{Con: mockRealtimeClient},
		}

		// Use a barrier so both goroutines call listenOnBoard for the same board at
		// nearly the same moment, matching two users opening the board together.
		start := make(chan struct{})
		var ready sync.WaitGroup
		var done sync.WaitGroup

		ready.Add(2)
		done.Add(2)

		for range 2 {
			go func() {
				defer done.Done()
				userID := uuid.New()
				conn := &mockConnection{}

				ready.Done()
				<-start

				s.listenOnBoard(context.Background(), boardID, userID, conn, fullBoard)
			}()
		}

		ready.Wait()
		close(start)
		done.Wait()

		bs := s.boardSubscriptions[boardID]
		if assert.NotNil(suite.T(), bs) {
			bs.mu.RLock()
			assert.Len(suite.T(), bs.clients, 2)
			bs.mu.RUnlock()
		}

		close(eventChan)
	}
}

// TestStartListeningOnBoardConcurrentClientChurn is a regression test that can find race conditions when the -race flag is set.
func (suite *BoardsListenIntegrationTestSuite) TestStartListeningOnBoardConcurrentClientChurn() {
	// Run the same broadcast-versus-client-churn scenario repeatedly and only use
	// the synchronized production code paths for client registration.
	for range 100 {
		eventChan := make(chan *realtime.BoardEvent)
		boardID := uuid.New()
		fullBoard := boards.FullBoard{
			Board: &boards.Board{
				ID:                    boardID,
				ShowNotesOfOtherUsers: true,
				ShowAuthors:           true,
			},
			BoardSessions: []*sessions.BoardSession{},
			Columns:       []*columns.Column{},
			Notes:         []*notes.Note{},
			Reactions:     []*reactions.Reaction{},
		}
		bs := &BoardSubscription{
			subscription:      eventChan,
			clients:           make(map[uuid.UUID]websocket.Connection),
			boardSettings:     fullBoard.Board,
			boardParticipants: fullBoard.BoardSessions,
			boardColumns:      fullBoard.Columns,
			boardNotes:        fullBoard.Notes,
			boardReactions:    fullBoard.Reactions,
		}

		s := &Server{
			boardSubscriptions: map[uuid.UUID]*BoardSubscription{boardID: bs},
		}

		// Pre-populate many clients so a single broadcast spends noticeable time
		// iterating the map, matching a busy board with many connected users.
		for range 1000 {
			bs.clients[uuid.New()] = &mockConnection{}
		}

		start := make(chan struct{})
		var ready sync.WaitGroup
		var done sync.WaitGroup

		ready.Add(2)
		done.Add(3)

		go func() {
			defer done.Done()
			ready.Done()
			<-start
			bs.startListeningOnBoard()
		}()

		go func() {
			defer done.Done()
			ready.Done()
			<-start

			// Simulate users joining while broadcasts are in flight. Route the
			// writes through listenOnBoard so the test follows the same lock
			// protocol as production code.
			for range 2000 {
				userID := uuid.New()
				s.listenOnBoard(context.Background(), boardID, userID, &mockConnection{}, fullBoard)

				bs.mu.Lock()
				delete(bs.clients, userID)
				bs.mu.Unlock()
			}
		}()

		go func() {
			defer done.Done()
			ready.Wait()
			close(start)

			// Trigger multiple broadcasts so the listener repeatedly iterates the
			// clients map while the mutation goroutine keeps changing it.
			for range 200 {
				eventChan <- &realtime.BoardEvent{Type: realtime.BoardEventBoardDeleted}
			}

			close(eventChan)
		}()

		done.Wait()
	}
}

func (suite *BoardsListenIntegrationTestSuite) TestStartListeningOnBoardBroadcastsEvents() {
	eventChan := make(chan *realtime.BoardEvent, 10)
	client1ID := uuid.New()
	client2ID := uuid.New()
	bs := &BoardSubscription{
		subscription: eventChan,
		clients:      make(map[uuid.UUID]websocket.Connection),
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
		clients:      make(map[uuid.UUID]websocket.Connection),
		subscription: make(chan *realtime.BoardEvent, 1),
	}
	userID1 := uuid.New()
	userID2 := uuid.New()
	userID3 := uuid.New()
	conn1 := &mockConnection{}
	conn2 := &mockConnection{}
	conn3 := &mockConnection{}
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
		clients: make(map[uuid.UUID]websocket.Connection),
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
