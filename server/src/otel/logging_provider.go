package otel

import (
	"context"

	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
	"go.opentelemetry.io/otel/sdk/log"
	"google.golang.org/grpc"
)

func newGrpcLoggerProvider(ctx context.Context, grpcConnection *grpc.ClientConn) (*log.LoggerProvider, error) {
	res, err := newResource()
	if err != nil {
		return nil, err
	}

	logExporter, err := otlploggrpc.New(ctx, otlploggrpc.WithGRPCConn(grpcConnection))
	if err != nil {
		return nil, err
	}

	loggerProvider := log.NewLoggerProvider(
		log.WithResource(res),
		log.WithProcessor(
			log.NewBatchProcessor(logExporter),
		),
	)

	return loggerProvider, nil
}

func newHttpLoggerProvider(ctx context.Context, httpEndpoint string) (*log.LoggerProvider, error) {
	res, err := newResource()
	if err != nil {
		return nil, err
	}

	logExporter, err := otlploghttp.New(ctx, otlploghttp.WithEndpoint(httpEndpoint))
	if err != nil {
		return nil, err
	}

	loggerProvider := log.NewLoggerProvider(
		log.WithResource(res),
		log.WithProcessor(
			log.NewBatchProcessor(logExporter),
		),
	)
	return loggerProvider, nil
}
