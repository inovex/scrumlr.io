package realtime

import (
	"context"
	"errors"

	"github.com/urfave/cli/v2"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/logger"
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

func InitializeRealtime(ctx *cli.Context) (*Broker, error) {
	log := logger.FromContext(ctx.Context)

	var broker *Broker

	if ctx.String("redis-address") != "" {
		redis := RedisServer{
			Addr:     ctx.String("redis-address"),
			Username: ctx.String("redis-username"),
			Password: ctx.String("redis-password"),
		}

		log.Infof("Connecting to redis at %v as message broker", redis.Addr)

		broker, err := NewRedis(redis)
		return broker, err
	}

	if ctx.String("nats") != "" {
		address := ctx.String("nats")

		log.Infof("Connecting to nats at %v as message broker", address)

		broker, err := NewNats(address)
		return broker, err
	}

	return broker, errors.New("no valid message broker configuration found")
}
