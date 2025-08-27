package boards

import "go.opentelemetry.io/otel/metric"

var boardCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.boards.created.counter",
	metric.WithDescription("Number of created boards"),
	metric.WithUnit("boards"),
)

var boardDeletedCounter, _ = meter.Int64Counter(
	"scrumlr.boards.deleted.counter",
	metric.WithDescription("Number of deleted boards"),
	metric.WithUnit("boards"),
)

var boardTimerSetCounter, _ = meter.Int64Counter(
	"scrumlr.boards.timer.created.counter",
	metric.WithDescription("Number of created board timer"),
	metric.WithUnit("timers"),
)

var boardTimerDeletedCounter, _ = meter.Int64Counter(
	"scrumlr.boards.timer.deleted.counter",
	metric.WithDescription("Number of deleted board timer"),
	metric.WithUnit("timers"),
)
