package otel

import (
	"context"

	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/sdk/metric"
	"google.golang.org/grpc"
)

func newGrpcMeterProvider(ctx context.Context, grpcConnection *grpc.ClientConn) (*metric.MeterProvider, error) {
	res, err := newResource()
	if err != nil {
		return nil, err
	}

	metricExporter, err := otlpmetricgrpc.New(ctx, otlpmetricgrpc.WithGRPCConn(grpcConnection))
	if err != nil {
		return nil, err
	}

	meterProvider := metric.NewMeterProvider(
		metric.WithResource(res),
		metric.WithReader(
			metric.NewPeriodicReader(metricExporter),
		),
	)

	return meterProvider, nil
}

func newHttpMeterProvider(ctx context.Context, httpEndpoint string) (*metric.MeterProvider, error) {
	res, err := newResource()
	if err != nil {
		return nil, err
	}

	metricExporter, err := otlpmetrichttp.New(ctx, otlpmetrichttp.WithEndpoint(httpEndpoint))
	if err != nil {
		return nil, err
	}

	meterProvider := metric.NewMeterProvider(
		metric.WithResource(res),
		metric.WithReader(
			metric.NewPeriodicReader(metricExporter),
		),
	)

	return meterProvider, nil
}
