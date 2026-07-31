package events

import "encoding/json"

type WebsocketMessage struct {
	Type string          `json:"type"`
	Data json.RawMessage `json:"data"`
}
