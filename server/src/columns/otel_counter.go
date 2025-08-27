package columns

import "go.opentelemetry.io/otel/metric"

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
