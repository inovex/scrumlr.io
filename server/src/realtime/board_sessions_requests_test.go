package realtime_test

import (
	"context"
	"sync"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"

	"scrumlr.io/server/realtime"
)

func testRealtimeGetBoardSessionRequestChannel(t *testing.T, rt *realtime.Broker) {
	ctx, cancelFunc := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelFunc()
	testBoard := uuid.New()
	testUser := uuid.New()

	testEvents := []realtime.BoardSessionRequestEventType{
		realtime.RequestRejected,
		realtime.RequestAccepted,
		"some undefined event",
	}
	const clients = 10
	eventChannels := [clients]chan *realtime.BoardSessionRequestEventType{}
	for i := range eventChannels {
		eventChannels[i] = rt.GetBoardSessionRequestChannel(testBoard, testUser)
	}
	readEvents := [clients][]realtime.BoardSessionRequestEventType{}
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
		err := rt.BroadcastUpdateOnBoardSessionRequest(testBoard, testUser, ev)
		assert.Nil(t, err)
	}

	go func() {
		wg.Wait()
		cancelFunc()
	}()

	<-ctx.Done()
	for i := 0; i < clients; i++ {
		assert.Equal(t, testEvents, readEvents[i])
	}
}

func TestRealtime_GetBoardSessionRequestChannel(t *testing.T) {

	t.Run("with nats", func(t *testing.T) {
		rt, err := realtime.NewNats(SetupNatsContainer(t))
		assert.Nil(t, err)
		testRealtimeGetBoardSessionRequestChannel(t, rt)
	})

	t.Run("with redis", func(t *testing.T) {
		rt, err := realtime.NewRedis(SetupRedisContainer(t))
		assert.Nil(t, err)
		testRealtimeGetBoardSessionRequestChannel(t, rt)
	})

}
