package events

import (
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/metric"
)

var tracer = otel.Tracer("scrumlr.io/server/events")
var meter = otel.Meter("scrumlr.io/server/events")

var websocketOpenedCounter, _ = meter.Int64Counter(
	"scrumlr.events.websocket.opened.counter",
	metric.WithDescription("Number of opened websockets"),
	metric.WithUnit("websockets"),
)
