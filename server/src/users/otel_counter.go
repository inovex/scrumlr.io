package users

import "go.opentelemetry.io/otel/metric"

var userCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.users.created.counter",
	metric.WithDescription("Number of created users"),
	metric.WithUnit("users"),
)

var deletedUserCounter, _ = meter.Int64Counter(
	"scrumlr.users.deleted.counter",
	metric.WithDescription("Number of deleted users"),
	metric.WithUnit("users"),
)
