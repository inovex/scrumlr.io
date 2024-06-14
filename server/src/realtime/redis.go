package realtime

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
)

func NewRedis(server RedisServer) (*Broker, error) {
	return &Broker{Con: connectRedis(server)}, nil
}

type redisClient struct {
	con *redis.Client
}

type RedisServer struct {
	Addr     string
	Password string
	Username string
}

func connectRedis(server RedisServer) *redisClient {
	rdb := redis.NewClient(&redis.Options{
		Addr:     server.Addr,
		Username: server.Username,
		Password: server.Password,
		DB:       0, // use default DB
	})
	return &redisClient{con: rdb}
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

func (r *redisClient) Publish(subject string, event interface{}) error {
	payload, err := encodeEvent(event)
	if err != nil {
		return fmt.Errorf("failed to encode event: %w", err)
	}

	_, err = r.con.Publish(context.Background(), subject, payload).Result()
	if err != nil {
		return fmt.Errorf("failed to publish event: %w", err)
	}
	return nil
}

func (r *redisClient) SubscribeToBoardSessionEvents(subject string) (chan *BoardSessionRequestEventType, error) {
	ctx := context.Background()
	pubsub := r.con.Subscribe(ctx, subject)
	retChannel := make(chan *BoardSessionRequestEventType)
	event, err := pubsub.Receive(ctx)
	if err != nil {
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

func (r *redisClient) SubscribeToBoardEvents(subject string) (chan *BoardEvent, error) {
	ctx := context.Background()
	retChannel := make(chan *BoardEvent)
	pubsub := r.con.Subscribe(ctx, subject)
	event, err := pubsub.Receive(ctx)
	if err != nil {
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
