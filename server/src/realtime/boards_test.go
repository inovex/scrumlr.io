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

func TestRealtime_GetBoardChannel(t *testing.T) {

	ctx, cancelFunc := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancelFunc()
	rt, err := realtime.NewNats(SetupNatsContainer(t))
	assert.Nil(t, err)
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

	eventChannel := rt.GetBoardChannel(testBoard)
	readEvents := []realtime.BoardEvent{}
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
		err := rt.BroadcastToBoard(testBoard, ev)
		assert.Nil(t, err)
		wg.Add(1)
	}

	go func() {
		wg.Wait()
		cancelFunc()
	}()

	<-ctx.Done()

	assert.Equal(t, expectedEvents, readEvents)

}
