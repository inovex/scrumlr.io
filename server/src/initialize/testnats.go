package initialize

import (
	"context"
	"log"

	"github.com/testcontainers/testcontainers-go"
	"github.com/testcontainers/testcontainers-go/modules/nats"
)

const NATS_IMAGE = "nats:2.11.7-alpine"

func StartTestNats() (*nats.NATSContainer, string) {
	ctx := context.Background()
	natscontainer, err := nats.Run(
		ctx,
		NATS_IMAGE,
	)

	if err != nil {
		log.Fatalf("Failed to start container: %s", err)
	}

	connectionString, err := natscontainer.ConnectionString(ctx)
	if err != nil {
		log.Fatalf("Failed to get connection string %s", err)
	}

	return natscontainer, connectionString
}

func StopTestNats(container *nats.NATSContainer) {
	if err := testcontainers.TerminateContainer(container); err != nil {
		log.Fatalf("Failed to terminate container: %s", err)
	}
}
