package columntemplates

import (
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/columntemplates")
var meter metric.Meter = otel.Meter("scrumlr.io/server/columntemplates")

var columnTemplatesCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.column_templates.created.counter",
	metric.WithDescription("Number of created column templates"),
	metric.WithUnit("column templates"),
)

var columnTemplatesDeletedCounter, _ = meter.Int64Counter(
	"scrumlr.column_templates.deleted.counter",
	metric.WithDescription("Number of deleted column templates"),
	metric.WithUnit("column templates"),
)
