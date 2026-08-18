package cache

import (
	"context"
	"errors"
	"time"

	"github.com/urfave/cli/v2"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/logger"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/cache")

type Client interface {
	Create(ctx context.Context, key string, value any, ttl time.Duration) error
	Put(ctx context.Context, key string, value any) error
	Get(ctx context.Context, key string) ([]byte, error)
	Delete(ctx context.Context, key string) error
}

type Cache struct {
	Con Client
}

func InitializeCache(ctx *cli.Context) (*Cache, error) {
	log := logger.FromContext(ctx.Context)

	var cache *Cache

	if ctx.String("redis-address") != "" {
		redis := RedisServer{
			Addr:     ctx.String("redis-address"),
			Username: ctx.String("redis-username"),
			Password: ctx.String("redis-password"),
		}

		log.Infof("Connecting to redis at %v as cache", redis.Addr)

		cache, err := NewRedis(redis)
		return cache, err
	}

	if ctx.String("nats") != "" {
		address := ctx.String("nats")

		log.Infof("Connecting to nats at %v as cache", address)

		cache, err := NewNats(address, "scrumlr")
		return cache, err
	}

	return cache, errors.New("no valid cache configuration found")
}
