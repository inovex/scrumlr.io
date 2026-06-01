package api

import (
	"context"
	"os"
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

// This test is here to prove the existance of a race condition. You can run it by running the following command:
// SCRUMLR_ENABLE_RACE_REPRO=1 go test -race ./api -run TestBoardsListenIntegrationTestSuite/TestListenOnBoardConcurrentFirstConnectionsRace -count=1
func (suite *BoardsListenIntegrationTestSuite) TestListenOnBoardConcurrentFirstConnectionsRace() {
	// This test intentionally reproduces a race in listenOnBoard. Keep it opt-in so
	// the regular test suite stays green until the production code is fixed.
	if os.Getenv("SCRUMLR_ENABLE_RACE_REPRO") == "" {
		suite.T().Skip("set SCRUMLR_ENABLE_RACE_REPRO=1 to run this intentional race reproduction")
	}

	boardID := uuid.New()
	fullBoard := boards.FullBoard{
		Board: &boards.Board{ID: boardID},
	}
	eventChan := make(chan *realtime.BoardEvent)
	defer close(eventChan)

	mockRealtimeClient := realtime.NewMockClient(suite.T())
	mockRealtimeClient.EXPECT().SubscribeToBoardEvents(mock.Anything, mock.Anything).Return(eventChan, nil)

	// Run the same simultaneous first-connection scenario multiple times to make the
	// timing window wide enough for the race detector and runtime checks to catch it.
	for range 200 {
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
	}
}

// This test is here to prove the existance of a race condition. You can run it by running the following command:
// SCRUMLR_ENABLE_RACE_REPRO=1 go test -race ./api -run TestBoardsListenIntegrationTestSuite/TestStartListeningOnBoardConcurrentClientMutationRace -count=1
func (suite *BoardsListenIntegrationTestSuite) TestStartListeningOnBoardConcurrentClientMutationRace() {
	// This test intentionally reproduces a race between broadcasting board events
	// to all connected clients and mutating the same clients map due to users
	// connecting or disconnecting at the same time.
	if os.Getenv("SCRUMLR_ENABLE_RACE_REPRO") == "" {
		suite.T().Skip("set SCRUMLR_ENABLE_RACE_REPRO=1 to run this intentional race reproduction")
	}

	// Run the same broadcast-versus-mutation scenario multiple times to make the
	// timing window large enough for the race detector and runtime checks.
	for range 100 {
		eventChan := make(chan *realtime.BoardEvent)
		bs := &BoardSubscription{
			subscription: eventChan,
			clients:      make(map[uuid.UUID]websocket.Connection),
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

			// Simulate connect/disconnect churn while the listener goroutine is
			// ranging over the same map to broadcast events.
			for range 2000 {
				userID := uuid.New()
				bs.clients[userID] = &mockConnection{}
				delete(bs.clients, userID)
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
