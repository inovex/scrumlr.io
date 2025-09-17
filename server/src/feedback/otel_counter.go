package feedback

import "go.opentelemetry.io/otel/metric"

var feedbackCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.feedback.created.counter",
	metric.WithDescription("Number of created feedback"),
	metric.WithUnit("feedback"),
)
