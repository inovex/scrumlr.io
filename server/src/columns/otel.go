package columns

import (
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/columns")
var meter metric.Meter = otel.Meter("scrumlr.io/server/columns")

var columnsCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.columns.created.counter",
	metric.WithDescription("Number of created columns"),
	metric.WithUnit("columns"),
)

var columnsDeletedCounter, _ = meter.Int64Counter(
	"scrumlr.columns.deleted.counter",
	metric.WithDescription("Number of deleted columns"),
	metric.WithUnit("columns"),
)
