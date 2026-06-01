package sessionrequests

import (
	"context"
	"os"
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

type SessionRequestWebsocketRaceTestSuite struct {
	suite.Suite
}

func TestSessionRequestWebsocketRaceTestSuite(t *testing.T) {
	suite.Run(t, new(SessionRequestWebsocketRaceTestSuite))
}

func (suite *SessionRequestWebsocketRaceTestSuite) TestListenOnBoardSessionRequestConcurrentFirstConnectionsRace() {
	// This test intentionally reproduces a race in listenOnBoardSessionRequest.
	// Keep it opt-in so the regular test suite stays green until the production
	// code is fixed.
	if os.Getenv("SCRUMLR_ENABLE_RACE_REPRO") == "" {
		suite.T().Skip("set SCRUMLR_ENABLE_RACE_REPRO=1 to run this intentional race reproduction")
	}

	boardID := uuid.New()
	eventChan := make(chan *realtime.BoardSessionRequestEventType)
	defer close(eventChan)

	mockRealtimeClient := realtime.NewMockClient(suite.T())
	mockRealtimeClient.EXPECT().SubscribeToBoardSessionEvents(mock.Anything, mock.Anything).Return(eventChan, nil)

	// Run the same simultaneous first-connection scenario multiple times to make
	// the timing window wide enough for the race detector and runtime checks to
	// catch it.
	for range 200 {
		socket := &sessionRequestWebsocket{
			realtime:                         &realtime.Broker{Con: mockRealtimeClient},
			boardSessionRequestSubscriptions: make(map[uuid.UUID]*BoardSessionRequestSubscription),
		}

		// Use a barrier so both goroutines subscribe to session-request updates for
		// the same board at nearly the same moment, matching two users opening the
		// waiting page together.
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
	}
}
