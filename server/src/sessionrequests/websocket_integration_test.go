package sessionrequests

import (
	"context"
	"sync"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/websocket"
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

type SessionRequestWebsocketTestSuite struct {
	suite.Suite
}

func TestSessionRequestWebsocketTestSuite(t *testing.T) {
	suite.Run(t, new(SessionRequestWebsocketTestSuite))
}

// TestListenOnBoardSessionRequestConcurrentFirstConnections is a regression test that can find race conditions when the -race flag is set.
func (suite *SessionRequestWebsocketTestSuite) TestListenOnBoardSessionRequestConcurrentFirstConnections() {
	boardID := uuid.New()

	for range 200 {
		eventChan := make(chan *realtime.BoardSessionRequestEventType)
		mockRealtimeClient := realtime.NewMockClient(suite.T())
		mockRealtimeClient.EXPECT().SubscribeToBoardSessionEvents(mock.Anything, mock.Anything).Return(eventChan, nil)

		socket := &sessionRequestWebsocket{
			realtime:                         &realtime.Broker{Con: mockRealtimeClient},
			boardSessionRequestSubscriptions: make(map[uuid.UUID]*BoardSessionRequestSubscription),
		}

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

				socket.listenOnBoardSessionRequest(boardID, userID, conn)
			}()
		}

		ready.Wait()
		close(start)
		done.Wait()

		bs := socket.boardSessionRequestSubscriptions[boardID]
		suite.Require().NotNil(bs)
		bs.mu.RLock()
		suite.Len(bs.clients, 2)
		suite.Len(bs.subscriptions, 2)
		bs.mu.RUnlock()

		close(eventChan)
	}
}
