package cache

import (
	"context"
	"time"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/trace"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/cache")

type Client interface {
	Create(ctx context.Context, key string, value interface{}, ttl time.Duration) error
	Put(ctx context.Context, key string, value interface{}) error
	Get(ctx context.Context, key string) ([]byte, error)
	Delete(ctx context.Context, key string) error
}

type Cache struct {
	Con Client
}
