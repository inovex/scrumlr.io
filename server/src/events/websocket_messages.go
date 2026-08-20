package events

import (
	"encoding/json"
	"errors"
)

type WebSocketMessageType string

const (
	NoteDragLock WebSocketMessageType = "DRAG_LOCK_MESSAGE"
)

type WebsocketMessage struct {
	Type WebSocketMessageType `json:"type"`
	Data json.RawMessage      `json:"data"`
}

func (messageType *WebSocketMessageType) UnmarshalJSON(b []byte) error {
	var t string
	err := json.Unmarshal(b, &t)
	if err != nil {
		return err
	}

	unmarshalledMessageType := WebSocketMessageType(t)
	switch unmarshalledMessageType {
	case NoteDragLock:
		*messageType = unmarshalledMessageType
		return nil
	}

	return errors.New("invalid websocket message type")
}
