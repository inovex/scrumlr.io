package realtime

import (
	"encoding/json"
	"fmt"

	"github.com/nats-io/nats.go"
	"scrumlr.io/server/logger"
)

type natsClient struct {
	con *nats.Conn
}

// Publish the given event to the given subject
func (n *natsClient) Publish(subject string, event interface{}) error {
	data, err := json.Marshal(event)
	if err != nil {
		logger.Get().Errorw("unable to marshal event in publish", "subject", subject, "event", event, "err", err)
	}
	return n.con.Publish(subject, data)
}

// SubscribeToBoardSessionEvents subscribes to the given subject
func (n *natsClient) SubscribeToBoardSessionEvents(subject string) (chan *BoardSessionRequestEventType, error) {
	receiverChan := make(chan *BoardSessionRequestEventType)
	_, err := n.con.Subscribe(subject, func(msg *nats.Msg) {
		var event BoardSessionRequestEventType
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			logger.Get().Errorw("unable to unmarshal board session event in subscribeToBoardSessionEvents", "subject", subject, "err", err)
			return
		}
		receiverChan <- &event
	})
	if err != nil {
		return nil, fmt.Errorf("failed to subscribe to subject %s: %w", subject, err)
	}

	return receiverChan, nil
}

// SubscribeToBoardEvents subscribes to the given subject
func (n *natsClient) SubscribeToBoardEvents(subject string) (chan *BoardEvent, error) {
	receiverChan := make(chan *BoardEvent)
	_, err := n.con.Subscribe(subject, func(msg *nats.Msg) {
		var event BoardEvent
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			logger.Get().Errorw("unable to unmarshal board event in subscribeToBoardEvents", "subject", subject, "err", err)
			return
		}
		receiverChan <- &event
	})
	if err != nil {
		return nil, fmt.Errorf("failed to subscribe to subject %s: %w", subject, err)
	}
	return receiverChan, nil
}

// NewNats returns a new NATs backed Broker
func NewNats(url string) (*Broker, error) {
	// Connect to a server
	nc, err := nats.Connect(url)
	if err != nil {
		return nil, fmt.Errorf("unable to connect to nats server %s: %w", url, err)
	}

	return &Broker{
		Con: &natsClient{con: nc},
	}, nil
}
