package feedback

import (
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/feedback")
var meter metric.Meter = otel.Meter("scrumlr.io/server/feedback")

var feedbackCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.feedback.created.counter",
	metric.WithDescription("Number of created feedback"),
	metric.WithUnit("feedback"),
)
