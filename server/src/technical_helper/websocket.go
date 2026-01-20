package technical_helper

import (
	"context"
	"net/http"
)

type MessageType int

const (
	MessageText MessageType = 1
)

// Connection abstracts a WebSocket connection
type Connection interface {
	WriteJSON(ctx context.Context, data interface{}) error
	Read(ctx context.Context) (MessageType, []byte, error)
	Close(reason string) error
}

type WebSocketService interface {
	Accept(w http.ResponseWriter, r *http.Request, checkOrigin bool) (Connection, error)
	IsNormalClose(err error) bool
}
