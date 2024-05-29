package realtime

import (
	"fmt"

	"github.com/nats-io/nats.go"
)

type natsClient struct {
	con *nats.EncodedConn
}

// Publish the given event to the given subject
func (n *natsClient) Publish(subject string, event interface{}) error {
	return n.con.Publish(subject, event)
}

// SubscribeToBoardSessionEvents subscribes to the given subject
func (n *natsClient) SubscribeToBoardSessionEvents(subject string) (chan *BoardSessionRequestEventType, error) {
	receiverChan := make(chan *BoardSessionRequestEventType)
	_, err := n.con.BindRecvChan(subject, receiverChan)
	if err != nil {
		return receiverChan, fmt.Errorf("failed to bind to subject %s: %w", subject, err)
	}
	return receiverChan, nil
}

// SubscribeToBoardEvents subscribes to the given subject
func (n *natsClient) SubscribeToBoardEvents(subject string) (chan *BoardEvent, error) {
	receiverChan := make(chan *BoardEvent)
	_, err := n.con.BindRecvChan(subject, receiverChan)
	if err != nil {
		return receiverChan, fmt.Errorf("failed to bind to subject %s: %w", subject, err)
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
	c, err := nats.NewEncodedConn(nc, nats.JSON_ENCODER)
	if err != nil {
		return nil, fmt.Errorf("unable to open encoded connection: %w", err)
	}

	return &Broker{
		Con: &natsClient{con: c},
	}, nil
}
