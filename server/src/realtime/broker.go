package realtime

import (
	"context"

	"github.com/google/uuid"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/realtime")

//var meter metric.Meter = otel.Meter("scrumlr.io/server/realtime")

// Client can publish data to an external queue and receive events from
// that external queue
type Client interface {
	// Publish an event to the queue
	Publish(ctx context.Context, subject string, event any) error

	// SubscribeToBoardSessionEvents subscribes to the given topic and return a channel
	// with the received BoardSessionRequestEventType
	SubscribeToBoardSessionEvents(ctx context.Context, subject string) (chan *BoardSessionRequestEventType, error)

	// SubscribeToBoardEvents subscribes to the given topic and return a channel
	//	// with the received BoardEvent
	SubscribeToBoardEvents(ctx context.Context, subject string) (chan *BoardEvent, error)
}

// The Broker enables a user to broadcast and receive events
type Broker struct {
	Con Client
}

// BrokerInterface describes the subset of Broker functionality used by callers.
// Defined as an interface so tests can inject mocks.
type BrokerInterface interface {
	GetBoardChannel(ctx context.Context, boardID uuid.UUID) (chan *BoardEvent, error)
	GetBoardSessionRequestChannel(ctx context.Context, board, user uuid.UUID) (chan *BoardSessionRequestEventType, error)
}
