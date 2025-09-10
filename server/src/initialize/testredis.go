package initialize

import (
	"context"
	"log"
	"strings"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/redis"
	"github.com/testcontainers/testcontainers-go/wait"
)

const REDIS_IMAGE = "redis:8.2.1-alpine"

func StartTestRedis() (*redis.RedisContainer, string) {
	ctx := context.Background()
	redisContainer, err := redis.Run(
		ctx,
		REDIS_IMAGE,
		testcontainers.WithAdditionalWaitStrategy(
			wait.ForLog("Ready to accept connections tcp"),
		),
	)

	if err != nil {
		log.Fatalf("Failed to start container: %s", err)
	}

	connectionString, err := redisContainer.ConnectionString(ctx)
	if err != nil {
		log.Fatalf("Failed to get connection string %s", err)
	}
	connectionString = strings.TrimPrefix(connectionString, "redis://")

	return redisContainer, connectionString
}

func StopTestRedis(container *redis.RedisContainer) {
	if err := testcontainers.TerminateContainer(container); err != nil {
		log.Fatalf("Failed to terminate container: %s", err)
	}
}
