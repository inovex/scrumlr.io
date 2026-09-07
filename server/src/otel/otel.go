package otel

import (
	"context"
	"errors"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/log/global"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/resource"
	semconv "go.opentelemetry.io/otel/semconv/v1.43.0"
	"go.opentelemetry.io/otel/trace"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"scrumlr.io/server/logger"
)

func SetupOpenTelemetry(ctx context.Context, opts ...OTelOption) (func(context.Context) error, error) {
	var shutdownFuncs []func(context.Context) error
	var err error

	shutdown := func(ctx context.Context) error {
		var err error
		for _, fn := range shutdownFuncs {
			err = errors.Join(err, fn(ctx))
		}
		shutdownFuncs = nil
		return err
	}

	var options options
	for _, opt := range opts {
		err = opt(&options)
		if err != nil {
			return shutdown, err
		}
	}

	handleErr := func(inErr error) {
		err = errors.Join(inErr, shutdown(ctx))
	}

	propagator := newPropagator()
	otel.SetTextMapPropagator(propagator)

	if options.grpcEndpoint != nil {
		grpcConnection, err := initGrpcConnection(*options.grpcEndpoint)
		if err != nil {
			handleErr(err)
			return shutdown, err
		}

		traceProvider, err := newGrpcTraceProvider(ctx, grpcConnection)
		if err != nil {
			handleErr(err)
			return shutdown, err
		}

		shutdownFuncs = append(shutdownFuncs, traceProvider.Shutdown)
		otel.SetTracerProvider(traceProvider)

		meterProvider, err := newGrpcMeterProvider(ctx, grpcConnection)
		if err != nil {
			handleErr(err)
			return shutdown, err
		}

		shutdownFuncs = append(shutdownFuncs, meterProvider.Shutdown)
		otel.SetMeterProvider(meterProvider)

		loggerProvider, err := newGrpcLoggerProvider(ctx, grpcConnection)
		if err != nil {
			handleErr(err)
			return shutdown, err
		}

		shutdownFuncs = append(shutdownFuncs, loggerProvider.Shutdown)
		global.SetLoggerProvider(loggerProvider)
		logger.EnableOtelLogging()

	} else if options.httpEndpoint != nil {
		traceProvider, err := newHttpTraceProvider(ctx, *options.httpEndpoint)
		if err != nil {
			handleErr(err)
			return shutdown, err
		}

		shutdownFuncs = append(shutdownFuncs, traceProvider.Shutdown)
		otel.SetTracerProvider(traceProvider)

		meterProvider, err := newHttpMeterProvider(ctx, *options.httpEndpoint)
		if err != nil {
			handleErr(err)
			return shutdown, err
		}

		shutdownFuncs = append(shutdownFuncs, meterProvider.Shutdown)
		otel.SetMeterProvider(meterProvider)

		loggerProvider, err := newHttpLoggerProvider(ctx, *options.httpEndpoint)
		if err != nil {
			handleErr(err)
			return shutdown, err
		}

		shutdownFuncs = append(shutdownFuncs, loggerProvider.Shutdown)
		global.SetLoggerProvider(loggerProvider)
		logger.EnableOtelLogging()
	}

	return shutdown, err
}

func RecordErrorSpan(span trace.Span, err error, description *string) {
	if description != nil {
		span.SetStatus(codes.Error, *description)
	} else {
		span.SetStatus(codes.Error, err.Error())
	}

	span.RecordError(err)
}

func initGrpcConnection(collectorEndpoint string) (*grpc.ClientConn, error) {
	connection, err := grpc.NewClient(
		collectorEndpoint,
		grpc.WithTransportCredentials(insecure.NewCredentials()),
	)

	if err != nil {
		return nil, err
	}

	return connection, err
}

func newPropagator() propagation.TextMapPropagator {
	return propagation.NewCompositeTextMapPropagator(
		propagation.TraceContext{},
		propagation.Baggage{},
	)
}

func newResource() (*resource.Resource, error) {
	return resource.Merge(
		resource.Default(),
		resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceName("scrumlr"),
			semconv.ServiceVersion("5.3.1"),
		),
	)
}
