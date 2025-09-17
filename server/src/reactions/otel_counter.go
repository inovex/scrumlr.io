package reactions

import "go.opentelemetry.io/otel/metric"

var reactionCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.reactions.created.counter",
	metric.WithDescription("Number of created reactions"),
	metric.WithUnit("reactions"),
)

var reactionRemovedCounter, _ = meter.Int64Counter(
	"scrumlr.reactions.removed.counter",
	metric.WithDescription("Number of removed reactions"),
	metric.WithUnit("reactions"),
)

var reactionUpdatedCounter, _ = meter.Int64Counter(
	"scrumlr.reactions.updated.counter",
	metric.WithDescription("Number of updated reactions"),
	metric.WithUnit("reactions"),
)
