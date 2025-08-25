package votings

import "go.opentelemetry.io/otel/metric"

var votingCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.votings.created.counter",
	metric.WithDescription("Number of created votings"),
	metric.WithUnit("votings"),
)

var voteCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.vote.created.counter",
	metric.WithDescription("Number of created votes"),
	metric.WithUnit("votes"),
)

var voteDeletedCounter, _ = meter.Int64Counter(
	"scrumlr.vote.deleted.counter",
	metric.WithDescription("Number of deleted votes"),
	metric.WithUnit("votes"),
)
