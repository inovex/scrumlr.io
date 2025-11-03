package cache

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"github.com/redis/go-redis/extra/redisotel/v9"
	"github.com/redis/go-redis/v9"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"scrumlr.io/server/logger"
)

type redisClient struct {
	store *redis.Client
}

type RedisServer struct {
	Addr     string
	Password string
	Username string
}

func NewRedis(server RedisServer) (*Cache, error) {
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

	return &Cache{
		Con: &redisClient{store: rdb},
	}, err
}

// Create the entry with the given value
// If the key exists return an error
func (r *redisClient) Create(ctx context.Context, key string, value interface{}, ttl time.Duration) error {
	ctx, span := tracer.Start(ctx, "scrumlr.cache.redis.create")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.cache.redis.create.key", key),
	)

	data, err := json.Marshal(value)
	if err != nil {
		span.SetStatus(codes.Error, "failed to marshal value")
		span.RecordError(err)
		log.Errorw("unable to marshal value in create", "key", key, "value", value, "err", err)
		return err
	}
	status := r.store.SetArgs(ctx, key, string(data), redis.SetArgs{Mode: "NX", TTL: ttl})
	if errors.Is(status.Err(), redis.Nil) {
		return &KeyAlreadyExists{status.Err()}
	}

	return status.Err()
}

func (r *redisClient) Put(ctx context.Context, key string, value interface{}) error {
	ctx, span := tracer.Start(ctx, "scrumlr.cache.redis.put")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.cache.redis.put.key", key),
	)

	data, err := json.Marshal(value)
	if err != nil {
		span.SetStatus(codes.Error, "failed to marshal value")
		span.RecordError(err)
		log.Errorw("unable to marshal value in put", "key", key, "value", value, "err", err)
		return err
	}

	return r.store.SetArgs(ctx, key, string(data), redis.SetArgs{KeepTTL: true}).Err()
}

func (r *redisClient) Get(ctx context.Context, key string) ([]byte, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.cache.redis.get")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.cache.redis.get.key", key),
	)

	val, err := r.store.Get(ctx, key).Result()
	if err != nil {
		if errors.Is(err, redis.Nil) {
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

	return []byte(val), nil
}

func (r *redisClient) Delete(ctx context.Context, key string) error {
	ctx, span := tracer.Start(ctx, "scrumlr.cache.redis.delete")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.cache.redis.delete.key", key),
	)

	return r.store.Del(ctx, key).Err()
}
