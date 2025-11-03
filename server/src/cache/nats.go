package cache

import (
	"context"
	"encoding/json"
	"errors"
	"fmt"
	"time"

	"github.com/nats-io/nats.go"
	"github.com/nats-io/nats.go/jetstream"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/logger"
)

type natsClient struct {
	store jetstream.KeyValue
}

func NewNats(url string, bucket string) (*Cache, error) {
	nc, err := nats.Connect(url)
	if err != nil {
		return nil, fmt.Errorf("unable to connect to nats server %s: %w", url, err)
	}

	js, err := jetstream.New(nc)
	if err != nil {
		return nil, fmt.Errorf("unable to connect to nats jetstream on nats server %s: %w", url, err)
	}

	config := jetstream.KeyValueConfig{
		Bucket:  bucket,
		TTL:     time.Second * 10,
		Storage: jetstream.MemoryStorage,
	}
	kv, err := js.CreateOrUpdateKeyValue(context.Background(), config)
	if err != nil {
		return nil, fmt.Errorf("unable to create key value store on nats server %s: %w", url, err)
	}

	return &Cache{
		Con: &natsClient{store: kv},
	}, nil
}

func (n *natsClient) Create(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	ctx, span := tracer.Start(ctx, "scrumlr.cache.nats.create")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.cache.nats.create.key", key),
	)

	data, err := json.Marshal(value)
	if err != nil {
		span.SetStatus(codes.Error, "failed to marshal value")
		span.RecordError(err)
		log.Errorw("unable to marshal value in create", "key", key, "value", value, "err", err)
		return err
	}

	// setting the ttl for a single entry does currently not work and throws an 400 error
	// the ttl is still set through the bucket ttl
	_, err = n.store.Create(ctx, key, data) //jetstream.KeyTTL(ttl)
	if errors.As(err, &jetstream.ErrKeyExists) {
		return &KeyAlreadyExists{err}
	}

	return err
}

func (n *natsClient) Put(ctx context.Context, key string, value interface{}) error {
	ctx, span := tracer.Start(ctx, "scrumlr.cache.nats.put")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.cache.nats.put.key", key),
	)

	data, err := json.Marshal(value)
	if err != nil {
		span.SetStatus(codes.Error, "failed to marshal value")
		span.RecordError(err)
		log.Errorw("unable to marshal value in put", "key", key, "value", value, "err", err)
		return err
	}

	_, err = n.store.Put(ctx, key, data)
	return err
}

func (n *natsClient) Get(ctx context.Context, key string) ([]byte, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.cache.nats.get")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.cache.nats.get.key", key),
	)

	val, err := n.store.Get(ctx, key)
	if err != nil {
		if errors.As(err, &jetstream.ErrKeyNotFound) {
			span.SetStatus(codes.Error, "key does not exists")
			span.RecordError(err)
			log.Errorw("key does not exist", "key", key, "error", err)
			return nil, &KeyNotFound{err}
		}

		span.SetStatus(codes.Error, "failed to get value for key")
		span.RecordError(err)
		log.Errorw("unable to get value for key", "key", key, "error", err)
		return nil, err
	}

	return val.Value(), nil
}

func (n *natsClient) Delete(ctx context.Context, key string) error {
	ctx, span := tracer.Start(ctx, "scrumlr.cache.nats.delete")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.cache.nats.delete.key", key),
	)

	return n.store.Purge(ctx, key)
}
