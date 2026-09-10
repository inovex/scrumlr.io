package users

import (
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/users")
var meter metric.Meter = otel.Meter("scrumlr.io/server/users")

var userCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.users.created.counter",
	metric.WithDescription("Number of created users"),
	metric.WithUnit("users"),
)

var anonymousUserCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.users.anonymous.created.counter",
	metric.WithDescription("Number of anonymous users created"),
	metric.WithUnit("users"),
)

var appleUserCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.users.aplle.created.counter",
	metric.WithDescription("Number of apple users created"),
	metric.WithUnit("users"),
)

var azureAdUserCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.users.azuread.created.counter",
	metric.WithDescription("Number of azuread users created"),
	metric.WithUnit("users"),
)

var githubUserCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.users.github.created.counter",
	metric.WithDescription("Number of github users created"),
	metric.WithUnit("users"),
)

var googleUserCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.users.google.created.counter",
	metric.WithDescription("Number of google users created"),
	metric.WithUnit("users"),
)

var microsoftUserCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.users.microsoft.created.counter",
	metric.WithDescription("Number of anonymous users created"),
	metric.WithUnit("users"),
)

var oicdUserCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.users.oicd.created.counter",
	metric.WithDescription("Number of anonymous users created"),
	metric.WithUnit("users"),
)

var deletedUserCounter, _ = meter.Int64Counter(
	"scrumlr.users.deleted.counter",
	metric.WithDescription("Number of deleted users"),
	metric.WithUnit("users"),
)
