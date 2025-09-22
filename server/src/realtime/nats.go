package realtime

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/nats-io/nats.go"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/logger"
)

type natsClient struct {
	con *nats.Conn
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

// Publish the given event to the given subject
func (n *natsClient) Publish(ctx context.Context, subject string, event interface{}) error {
	ctx, span := tracer.Start(ctx, "scrumlr.realtime.nats.publish")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.realtime.nats.publish.subject", subject),
	)

	data, err := json.Marshal(event)
	if err != nil {
		span.SetStatus(codes.Error, "failed to marshal event")
		span.RecordError(err)
		log.Errorw("unable to marshal event in publish", "subject", subject, "event", event, "err", err)
	}

	return n.con.Publish(subject, data)
}

// SubscribeToBoardSessionEvents subscribes to the given subject
func (n *natsClient) SubscribeToBoardSessionEvents(ctx context.Context, subject string) (chan *BoardSessionRequestEventType, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.realtime.nats.subscribe.session")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.realtime.nats.subscribe.session.sbject", subject),
	)

	receiverChan := make(chan *BoardSessionRequestEventType)
	_, err := n.con.Subscribe(subject, func(msg *nats.Msg) {
		var event BoardSessionRequestEventType
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			span.SetStatus(codes.Error, "failed to unmarshal event")
			span.RecordError(err)
			log.Errorw("unable to unmarshal board session event in subscribeToBoardSessionEvents", "subject", subject, "err", err)
			return
		}
		receiverChan <- &event
	})
	if err != nil {
		span.SetStatus(codes.Error, "failed to subcribe to subject")
		span.RecordError(err)
		return nil, fmt.Errorf("failed to subscribe to subject %s: %w", subject, err)
	}

	return receiverChan, nil
}

// SubscribeToBoardEvents subscribes to the given subject
func (n *natsClient) SubscribeToBoardEvents(ctx context.Context, subject string) (chan *BoardEvent, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.realtime.nats.subscribe.board")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.realtime.nats.subscribe.board.sbject", subject),
	)

	receiverChan := make(chan *BoardEvent)
	_, err := n.con.Subscribe(subject, func(msg *nats.Msg) {
		var event BoardEvent
		if err := json.Unmarshal(msg.Data, &event); err != nil {
			span.SetStatus(codes.Error, "failed to unmarshal event")
			span.RecordError(err)
			log.Errorw("unable to unmarshal board event in subscribeToBoardEvents", "subject", subject, "err", err)
			return
		}
		receiverChan <- &event
	})
	if err != nil {
		span.SetStatus(codes.Error, "failed to subcribe to subject")
		span.RecordError(err)
		return nil, fmt.Errorf("failed to subscribe to subject %s: %w", subject, err)
	}
	return receiverChan, nil
}
