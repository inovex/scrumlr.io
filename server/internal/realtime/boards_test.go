package realtime_test

import (
	"context"
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"

	"scrumlr.io/server/internal/realtime"
)

func testRealtimeGetBoardChannelWithBroker(t *testing.T, rt *realtime.Broker) {
	ctx, cancelFunc := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelFunc()

	testBoard := uuid.New()

	testEvents := []realtime.BoardEvent{
		{
			Type: realtime.BoardEventInit,
			Data: nil,
		},
		{
			Type: realtime.BoardEventInit,
			Data: "not nil string data",
		},
		{
			Type: realtime.BoardEventNotesUpdated,
			Data: struct {
				More    string
				Complex float64
				Data    map[int]bool
			}{
				More:    "foo",
				Complex: 2.0,
				Data:    map[int]bool{1: false, 3: true},
			},
		},
	}

	// TODO: The current datastructures doesn't respect the types, because
	// an empty interface can be anything.
	expectedEvents := []realtime.BoardEvent{
		testEvents[0],
		testEvents[1],
		{
			Type: realtime.BoardEventNotesUpdated,
			Data: map[string]interface{}{
				"Complex": 2.0,
				"More":    "foo",
				"Data": map[string]interface{}{
					// Mapping int to string here, because JSON stuff.
					"1": false,
					"3": true,
				},
			},
		},
	}

	const clients = 10
	eventChannels := [clients]chan *realtime.BoardEvent{}
	for i := range eventChannels {
		eventChannels[i] = rt.GetBoardChannel(testBoard)
	}
	readEvents := [clients][]realtime.BoardEvent{}
	wg := sync.WaitGroup{}

	for i := range readEvents {
		client := i
		go func() {
			for {
				select {
				case ev := <-eventChannels[client]:
					assert.NotNil(t, ev)
					readEvents[client] = append(readEvents[client], *ev)
					wg.Done()
				case <-ctx.Done():
					return
				}
			}
		}()
	}

	for _, ev := range testEvents {
		wg.Add(1 * clients)
		err := rt.BroadcastToBoard(testBoard, ev)
		assert.Nil(t, err)
	}

	go func() {
		wg.Wait()
		cancelFunc()
	}()

	<-ctx.Done()

	for i := 0; i < clients; i++ {
		assert.Equal(t, expectedEvents, readEvents[i])
	}
}

func TestRealtime_GetBoardChannel(t *testing.T) {
	t.Run("with nats", func(t *testing.T) {
		rt, err := realtime.NewNats(SetupNatsContainer(t))
		assert.Nil(t, err)
		testRealtimeGetBoardChannelWithBroker(t, rt)
	})

	t.Run("with redis", func(t *testing.T) {
		rt, err := realtime.NewRedis(SetupRedisContainer(t))
		assert.Nil(t, err)
		testRealtimeGetBoardChannelWithBroker(t, rt)
	})
}
