package sessionrequests

import (
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/metric"
)

var tracer = otel.Tracer("scrumlr.io/server/sessionrequests")
var meter = otel.Meter("scrumlr.io/server/sessionrequests")

var sessionRequestsCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.session_requests.created.counter",
	metric.WithDescription("Number of created session requests"),
	metric.WithUnit("session requests"),
)
