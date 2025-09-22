package initialize

import (
	"context"
	"errors"

	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploggrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlplog/otlploghttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetricgrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlpmetric/otlpmetrichttp"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracegrpc"
	"go.opentelemetry.io/otel/exporters/otlp/otlptrace/otlptracehttp"
	"go.opentelemetry.io/otel/log/global"
	"go.opentelemetry.io/otel/propagation"
	"go.opentelemetry.io/otel/sdk/log"
	"go.opentelemetry.io/otel/sdk/metric"
	"go.opentelemetry.io/otel/sdk/resource"
	"go.opentelemetry.io/otel/sdk/trace"
	semconv "go.opentelemetry.io/otel/semconv/v1.37.0"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"scrumlr.io/server/logger"
)

func SetupOTelSDK(ctx context.Context, otelGrpcEndpoint string, otelHttpEndpoint string) (shutdown func(context.Context) error, err error) {
	var shutdownFuncs []func(context.Context) error

	shutdown = func(ctx context.Context) error {
		var err error
		for _, fn := range shutdownFuncs {
			err = errors.Join(err, fn(ctx))
		}
		shutdownFuncs = nil
		return err
	}

	handleErr := func(inErr error) {
		err = errors.Join(inErr, shutdown(ctx))
	}

	propagator := newPropagator()
	otel.SetTextMapPropagator(propagator)

	if otelGrpcEndpoint != "" {
		grpcConnection, ex := initConnection(otelGrpcEndpoint)
		if ex != nil {
			handleErr(ex)
			return
		}

		traceProvider, ex := newGrpcTraceProvider(ctx, grpcConnection)
		if ex != nil {
			handleErr(ex)
			return
		}

		shutdownFuncs = append(shutdownFuncs, traceProvider.Shutdown)
		otel.SetTracerProvider(traceProvider)

		meterProvider, ex := newGrpcMeterProvider(ctx, grpcConnection)
		if ex != nil {
			handleErr(ex)
			return
		}

		shutdownFuncs = append(shutdownFuncs, meterProvider.Shutdown)
		otel.SetMeterProvider(meterProvider)

		loggerProvider, ex := newGrpcLoggerProvider(ctx, grpcConnection)
		if ex != nil {
			handleErr(ex)
			return
		}

		shutdownFuncs = append(shutdownFuncs, loggerProvider.Shutdown)
		global.SetLoggerProvider(loggerProvider)
		logger.EnableOtelLogging()

	} else if otelHttpEndpoint != "" {
		traceProvider, ex := newHttpTraceProvider(ctx, otelHttpEndpoint)
		if ex != nil {
			handleErr(ex)
			return
		}

		shutdownFuncs = append(shutdownFuncs, traceProvider.Shutdown)
		otel.SetTracerProvider(traceProvider)

		meterProvider, ex := newHttpMeterProvider(ctx, otelHttpEndpoint)
		if ex != nil {
			handleErr(ex)
			return
		}

		shutdownFuncs = append(shutdownFuncs, meterProvider.Shutdown)
		otel.SetMeterProvider(meterProvider)

		loggerProvider, ex := newHttpLoggerProvider(ctx, otelHttpEndpoint)
		if ex != nil {
			handleErr(ex)
			return
		}

		shutdownFuncs = append(shutdownFuncs, loggerProvider.Shutdown)
		global.SetLoggerProvider(loggerProvider)
		logger.EnableOtelLogging()
	}

	return
}

func initConnection(collectorEndpoint string) (*grpc.ClientConn, error) {
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

func newGrpcTraceProvider(ctx context.Context, connection *grpc.ClientConn) (*trace.TracerProvider, error) {
	traceExporter, err := otlptracegrpc.New(ctx, otlptracegrpc.WithGRPCConn(connection))
	if err != nil {
		return nil, err
	}

	res, err := newResource()
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
	traceExporter, err := otlptracehttp.New(ctx, otlptracehttp.WithEndpoint(httpEndpoint))
	if err != nil {
		return nil, err
	}

	res, err := newResource()
	if err != nil {
		return nil, err
	}

	traceProvider := trace.NewTracerProvider(
		trace.WithBatcher(traceExporter),
		trace.WithResource(res),
	)

	return traceProvider, nil
}

func newGrpcMeterProvider(ctx context.Context, grpcConnection *grpc.ClientConn) (*metric.MeterProvider, error) {
	metricExporter, err := otlpmetricgrpc.New(ctx, otlpmetricgrpc.WithGRPCConn(grpcConnection))
	if err != nil {
		return nil, err
	}

	res, err := newResource()
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
	metricExporter, err := otlpmetrichttp.New(ctx, otlpmetrichttp.WithEndpoint(httpEndpoint))
	if err != nil {
		return nil, err
	}

	res, err := newResource()
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

func newGrpcLoggerProvider(ctx context.Context, grpcConnection *grpc.ClientConn) (*log.LoggerProvider, error) {
	logExporter, err := otlploggrpc.New(ctx, otlploggrpc.WithGRPCConn(grpcConnection))
	if err != nil {
		return nil, err
	}

	res, err := newResource()
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
	logExporter, err := otlploghttp.New(ctx, otlploghttp.WithEndpoint(httpEndpoint))
	if err != nil {
		return nil, err
	}

	res, err := newResource()
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

func newResource() (*resource.Resource, error) {
	return resource.Merge(
		resource.Default(),
		resource.NewWithAttributes(
			semconv.SchemaURL,
			semconv.ServiceName("scrumlr"),
			semconv.ServiceVersion("4.0.0"),
		),
	)
}
