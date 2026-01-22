package websocket

import (
	"context"
	"net/http"
)

type MessageType int

const (
	MessageText   MessageType = 1
	MessageBinary MessageType = 2
)

// Connection abstracts a WebSocket connection
type Connection interface {
	WriteJSON(ctx context.Context, data interface{}) error
	Read(ctx context.Context) (MessageType, []byte, error)
	Close(reason string) error
}

type WebSocketInterface interface {
	Accept(w http.ResponseWriter, r *http.Request, checkOrigin bool) (Connection, error)
	IsNormalClose(err error) bool
}
