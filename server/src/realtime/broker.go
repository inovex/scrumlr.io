package realtime

// Client can publish data to an external queue and receive events from
// that external queue
type Client interface {
	// Publish an event to the queue
	Publish(subject string, event interface{}) error

	// SubscribeToBoardSessionEvents subscribes to the given topic and return a channel
	// with the received BoardSessionRequestEventType
	SubscribeToBoardSessionEvents(subject string) (chan *BoardSessionRequestEventType, error)

	// SubscribeToBoardEvents subscribes to the given topic and return a channel
	//	// with the received BoardEvent
	SubscribeToBoardEvents(subject string) (chan *BoardEvent, error)
}

// The Broker enables a user to broadcast and receive events
type Broker struct {
	Con Client
}
