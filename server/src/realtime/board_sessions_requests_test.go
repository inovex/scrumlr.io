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

func TestRealtime_GetBoardSessionRequestChannel(t *testing.T) {

	ctx, cancelFunc := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelFunc()
	rt, err := realtime.NewNats(SetupNatsContainer(t))
	assert.Nil(t, err)
	testBoard := uuid.New()
	testUser := uuid.New()

	testEvents := []realtime.BoardSessionRequestEventType{
		realtime.RequestRejected,
		realtime.RequestAccepted,
		"some undefined event",
	}

	eventChannel := rt.GetBoardSessionRequestChannel(testBoard, testUser)
	readEvents := []realtime.BoardSessionRequestEventType{}
	wg := sync.WaitGroup{}
	go func() {
		for {
			select {
			case ev := <-eventChannel:
				assert.NotNil(t, ev)
				readEvents = append(readEvents, *ev)
				wg.Done()
			case <-ctx.Done():
				return
			}
		}
	}()

	for _, ev := range testEvents {
		err := rt.BroadcastUpdateOnBoardSessionRequest(testBoard, testUser, ev)
		assert.Nil(t, err)
		wg.Add(1)
	}

	go func() {
		wg.Wait()
		cancelFunc()
	}()

	<-ctx.Done()
	assert.Equal(t, testEvents, readEvents)

}
