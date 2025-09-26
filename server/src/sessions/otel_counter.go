package sessions

import "go.opentelemetry.io/otel/metric"

var sessionCreatedCounter, _ = meter.Int64Counter(
	"scrumlr.sessions.created.counter",
	metric.WithDescription("Number of created sessions"),
	metric.WithUnit("sessions"),
)

var connectedSessions, _ = meter.Int64UpDownCounter(
	"scrumlr.sessions.connected",
	metric.WithDescription("Number of connected sessions"),
	metric.WithUnit("sessions"),
)

var bannedSessionsCounter, _ = meter.Int64Counter(
	"scrumlr.sessions.banned.counter",
	metric.WithDescription("Number of banned sessions"),
	metric.WithUnit("sessions"),
)

//var userCreatedCounter, _ = userMeter.Int64Counter(
//	"scrumlr.users.created.counter",
//	metric.WithDescription("Number of created users"),
//	metric.WithUnit("users"),
//)
//
//var anonymousUserCreatedCounter, _ = userMeter.Int64Counter(
//	"scrumlr.users.anonymous.created.counter",
//	metric.WithDescription("Number of anonymous users created"),
//	metric.WithUnit("users"),
//)
//
//var appleUserCreatedCounter, _ = userMeter.Int64Counter(
//	"scrumlr.users.aplle.created.counter",
//	metric.WithDescription("Number of apple users created"),
//	metric.WithUnit("users"),
//)
//
//var azureAdUserCreatedCounter, _ = userMeter.Int64Counter(
//	"scrumlr.users.azuread.created.counter",
//	metric.WithDescription("Number of azuread users created"),
//	metric.WithUnit("users"),
//)
//
//var githubUserCreatedCounter, _ = userMeter.Int64Counter(
//	"scrumlr.users.github.created.counter",
//	metric.WithDescription("Number of github users created"),
//	metric.WithUnit("users"),
//)
//
//var googleUserCreatedCounter, _ = userMeter.Int64Counter(
//	"scrumlr.users.google.created.counter",
//	metric.WithDescription("Number of google users created"),
//	metric.WithUnit("users"),
//)
//
//var microsoftUserCreatedCounter, _ = userMeter.Int64Counter(
//	"scrumlr.users.microsoft.created.counter",
//	metric.WithDescription("Number of anonymous users created"),
//	metric.WithUnit("users"),
//)
//
//var oicdUserCreatedCounter, _ = userMeter.Int64Counter(
//	"scrumlr.users.oicd.created.counter",
//	metric.WithDescription("Number of anonymous users created"),
//	metric.WithUnit("users"),
//)
