package otel

import (
	"context"
	"errors"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/log/global"
	"go.opentelemetry.io/otel/sdk/trace"
	"go.opentelemetry.io/otel/sdk/trace/tracetest"
)

func TestSetupOpenTelemetryHttpEndpoint(t *testing.T) {
	ctx := t.Context()

	shutdown, err := SetupOpenTelemetry(ctx, WithHttpEndpoint("localhost:4318"))

	assert.NoError(t, err)
	assert.NotNil(t, shutdown)

	traceProvider := otel.GetTracerProvider()
	assert.NotNil(t, traceProvider)

	meterProvider := otel.GetMeterProvider()
	assert.NotNil(t, meterProvider)

	loggerProvider := global.GetLoggerProvider()
	assert.NotNil(t, loggerProvider)

	propagator := otel.GetTextMapPropagator()
	assert.NotNil(t, propagator)

	shutdownCtx, cancel := context.WithTimeout(ctx, 100*time.Millisecond)
	defer cancel()

	err = shutdown(shutdownCtx)
	// An error is expected since otel cannot connect to the endpoint
	assert.Error(t, err)
}

func TestSetupOpenTelemetryGrpcEndpoint(t *testing.T) {
	ctx := t.Context()

	shutdown, err := SetupOpenTelemetry(ctx, WithGrpcEndpoint("localhost:4317"))

	assert.NoError(t, err)
	assert.NotNil(t, shutdown)

	traceProvider := otel.GetTracerProvider()
	assert.NotNil(t, traceProvider)

	meterProvider := otel.GetMeterProvider()
	assert.NotNil(t, meterProvider)

	loggerProvider := global.GetLoggerProvider()
	assert.NotNil(t, loggerProvider)

	propagator := otel.GetTextMapPropagator()
	assert.NotNil(t, propagator)

	shutdownCtx, cancel := context.WithTimeout(ctx, 100*time.Millisecond)
	defer cancel()

	err = shutdown(shutdownCtx)
	// An error is expected since otel cannot connect to the endpoint
	assert.Error(t, err)
}

func TestSetupOpenTelemetryNoEndpoint(t *testing.T) {
	ctx := t.Context()

	shutdown, err := SetupOpenTelemetry(ctx)

	assert.NoError(t, err)
	assert.NotNil(t, shutdown)

	propagator := otel.GetTextMapPropagator()
	assert.NotNil(t, propagator)

	err = shutdown(ctx)
	assert.NoError(t, err)
}

func TestRecordErrorSpan(t *testing.T) {
	ctx := t.Context()

	exporter := tracetest.NewInMemoryExporter()
	traceProvider := trace.NewTracerProvider(trace.WithSyncer(exporter))
	tracer := traceProvider.Tracer("test")

	_, span := tracer.Start(ctx, "scrumlr.otel.test")
	testError := errors.New("This is a test error")

	RecordErrorSpan(span, testError, nil)
	span.End()

	spans := exporter.GetSpans()
	assert.Len(t, spans, 1)

	receivedSpan := spans[0]

	assert.Equal(t, codes.Error, receivedSpan.Status.Code)
	assert.Equal(t, "This is a test error", receivedSpan.Status.Description)

	assert.Len(t, receivedSpan.Events, 1)
	assert.Equal(t, "exception", receivedSpan.Events[0].Name)
}

func TestRecordErrorSpanWithDescription(t *testing.T) {
	ctx := t.Context()

	exporter := tracetest.NewInMemoryExporter()
	traceProvider := trace.NewTracerProvider(trace.WithSyncer(exporter))
	tracer := traceProvider.Tracer("test")

	_, span := tracer.Start(ctx, "scrumlr.otel.test")
	testError := errors.New("This is a test error")
	description := "This is the error description"

	RecordErrorSpan(span, testError, &description)
	span.End()

	spans := exporter.GetSpans()
	assert.Len(t, spans, 1)

	receivedSpan := spans[0]

	assert.Equal(t, codes.Error, receivedSpan.Status.Code)
	assert.Equal(t, description, receivedSpan.Status.Description)

	assert.Len(t, receivedSpan.Events, 1)
	assert.Equal(t, "exception", receivedSpan.Events[0].Name)
}
