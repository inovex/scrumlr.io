package events

import "go.opentelemetry.io/otel/metric"

var websocketOpenedCounter, _ = meter.Int64Counter(
	"scrumlr.events.websocket.opened.counter",
	metric.WithDescription("Number of opened websockets"),
	metric.WithUnit("websockets"),
)
