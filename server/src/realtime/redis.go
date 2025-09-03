package realtime

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/redis/go-redis/extra/redisotel/v9"
	"github.com/redis/go-redis/v9"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/logger"
)

type redisClient struct {
	con *redis.Client
}

type RedisServer struct {
	Addr     string
	Password string
	Username string
}

func NewRedis(server RedisServer) (*Broker, error) {
	connection, err := connectRedis(server)
	return &Broker{Con: connection}, err
}

func connectRedis(server RedisServer) (*redisClient, error) {
	rdb := redis.NewClient(&redis.Options{
		Addr:     server.Addr,
		Username: server.Username,
		Password: server.Password,
		DB:       0, // use default DB
	})

	err := redisotel.InstrumentTracing(rdb)
	if err != nil {
		return nil, err
	}

	err = redisotel.InstrumentMetrics(rdb)
	if err != nil {
		return nil, err
	}

	return &redisClient{con: rdb}, err
}

func encodeEvent(event interface{}) (string, error) {
	data, err := json.Marshal(event)
	if err != nil {
		return "", fmt.Errorf("failed to marshal event: %w", err)
	}
	return string(data), nil
}

func decodeEvent(data string, into interface{}) error {
	err := json.Unmarshal([]byte(data), into)
	if err != nil {
		return fmt.Errorf("failed to unmarshal event: %w", err)
	}
	return nil
}

func (r *redisClient) Publish(ctx context.Context, subject string, event interface{}) error {
	ctx, span := tracer.Start(ctx, "scrumlr.realtime.redis.publish")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.realtime.redis.publish.subject", subject),
	)

	payload, err := encodeEvent(event)
	if err != nil {
		span.SetStatus(codes.Error, "failed to encode event")
		span.RecordError(err)
		log.Errorw("failed to encode event", "err", err)
		return fmt.Errorf("failed to encode event: %w", err)
	}

	_, err = r.con.Publish(ctx, subject, payload).Result()
	if err != nil {
		span.SetStatus(codes.Error, "failed to encode event")
		span.RecordError(err)
		log.Errorw("failed to encode event", "err", err)
		return fmt.Errorf("failed to publish event: %w", err)
	}
	return nil
}

func (r *redisClient) SubscribeToBoardSessionEvents(ctx context.Context, subject string) (chan *BoardSessionRequestEventType, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.realtime.redis.subscribe.session")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.realtime.redis.subscribe.session.subject", subject),
	)

	pubsub := r.con.Subscribe(ctx, subject)
	retChannel := make(chan *BoardSessionRequestEventType)
	event, err := pubsub.Receive(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "failed to subscribe")
		span.RecordError(err)
		log.Errorw("failed to subscribe", "err", err)
		return nil, fmt.Errorf("failed to subscribe: %w", err)
	}
	switch event := event.(type) {
	case *redis.Message:
		var boardEvent BoardSessionRequestEventType
		err := decodeEvent(event.Payload, &boardEvent)
		if err == nil {
			retChannel <- &boardEvent
		}
	default:
		// do nothing
	}
	c := pubsub.Channel(redis.WithChannelHealthCheckInterval(10 * time.Second))

	go func() {
		for {
			select {
			case msg := <-c:
				var event BoardSessionRequestEventType
				err := decodeEvent(msg.Payload, &event)
				if err == nil {
					retChannel <- &event
				}
			case <-ctx.Done():
				close(retChannel)
			}
		}
	}()
	return retChannel, nil
}

func (r *redisClient) SubscribeToBoardEvents(ctx context.Context, subject string) (chan *BoardEvent, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.realtime.redis.subscribe.board")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.realtime.redis.subscribe.board.subject", subject),
	)

	retChannel := make(chan *BoardEvent)
	pubsub := r.con.Subscribe(ctx, subject)
	event, err := pubsub.Receive(ctx)
	if err != nil {
		span.SetStatus(codes.Error, "failed to subscribe")
		span.RecordError(err)
		log.Errorw("failed to subscribe", "err", err)
		return nil, fmt.Errorf("failed to subscribe: %w", err)
	}
	switch event := event.(type) {
	case *redis.Message:
		var boardEvent BoardEvent
		err := decodeEvent(event.Payload, &boardEvent)
		if err == nil {
			retChannel <- &boardEvent
		}
	default:
		// do nothing
	}
	c := pubsub.Channel(redis.WithChannelHealthCheckInterval(10 * time.Second))
	go func() {
		for {
			select {
			case msg := <-c:
				var event BoardEvent
				err := decodeEvent(msg.Payload, &event)
				if err == nil {
					retChannel <- &event
				}
			case <-ctx.Done():
				close(retChannel)
			}
		}
	}()
	return retChannel, nil
}
