package cache

import (
	"context"
	"errors"
	"time"

	"github.com/urfave/cli/v3"
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

func InitializeCache(ctx context.Context, cli *cli.Command) (*Cache, error) {
	log := logger.FromContext(ctx)

	var cache *Cache

	if cli.String("redis-address") != "" {
		redis := RedisServer{
			Addr:     cli.String("redis-address"),
			Username: cli.String("redis-username"),
			Password: cli.String("redis-password"),
		}

		log.Infof("Connecting to redis at %v as cache", redis.Addr)

		cache, err := NewRedis(redis)
		return cache, err
	}

	if cli.String("nats") != "" {
		address := cli.String("nats")

		log.Infof("Connecting to nats at %v as cache", address)

		cache, err := NewNats(address, "scrumlr")
		return cache, err
	}

	return cache, errors.New("no valid cache configuration found")
}
