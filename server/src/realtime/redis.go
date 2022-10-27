package realtime

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/go-redis/redis/v8"
)

func NewRedis(url string) (*Broker, error) {
	return &Broker{con: connectRedis(url)}, nil
}

type redisClient struct {
	con *redis.Client
}

func connectRedis(redisURL string) *redisClient {
	rdb := redis.NewClient(&redis.Options{
		Addr:     redisURL,
		Password: "", // no password set
		DB:       0,  // use default DB
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
	switch event.(type) {
	case *redis.Message:
		var boardEvent BoardSessionRequestEventType
		err := decodeEvent(event.(*redis.Message).Payload, &boardEvent)
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
	switch event.(type) {
	case *redis.Message:
		var boardEvent BoardEvent
		err := decodeEvent(event.(*redis.Message).Payload, &boardEvent)
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
