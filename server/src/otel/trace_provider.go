package otel

import (
	"context"

	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/sdk/trace"
	"google.golang.org/grpc"
)

func newGrpcTraceProvider(ctx context.Context, connection *grpc.ClientConn) (*trace.TracerProvider, error) {
	res, err := newResource()
	if err != nil {
		return nil, err
	}

	traceExporter, err := otlptracegrpc.New(ctx, otlptracegrpc.WithGRPCConn(connection))
	if err != nil {
		return nil, err
	}

	traceProvider := trace.NewTracerProvider(
		trace.WithBatcher(traceExporter),
		trace.WithResource(res),
	)

	return traceProvider, nil
}

func newHttpTraceProvider(ctx context.Context, httpEndpoint string) (*trace.TracerProvider, error) {
	res, err := newResource()
	if err != nil {
		return nil, err
	}

	traceExporter, err := otlptracehttp.New(ctx, otlptracehttp.WithEndpoint(httpEndpoint))
	if err != nil {
		return nil, err
	}

	traceProvider := trace.NewTracerProvider(
		trace.WithBatcher(traceExporter),
		trace.WithResource(res),
	)

	return traceProvider, nil
}
