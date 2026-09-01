package sessionrequests

import "go.opentelemetry.io/otel/metric"

var sessionRequestsCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.session_requests.created.counter",
	metric.WithDescription("Number of created session requests"),
	metric.WithUnit("session requests"),
)
