package votings

import (
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/votings")
var meter metric.Meter = otel.Meter("scrumlr.io/server/votings")

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
