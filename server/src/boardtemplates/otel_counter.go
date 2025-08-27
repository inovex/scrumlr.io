package boardtemplates

import "go.opentelemetry.io/otel/metric"

var boardTemplatesCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.board_templates.created.counter",
	metric.WithDescription("Number of created board templates"),
	metric.WithUnit("board templates"),
)

var boardTemplatesDeletedCounter, _ = meter.Int64Counter(
	"scrumlr.board_templates.deleted.counter",
	metric.WithDescription("Number of deleted board templates"),
	metric.WithUnit("board templates"),
)
