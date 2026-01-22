package websocket

import (
	"context"
	"net/http"

	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
)

type webSocketConnection struct {
	conn *websocket.Conn
}

func (c *webSocketConnection) WriteJSON(ctx context.Context, data interface{}) error {
	return wsjson.Write(ctx, c.conn, data)
}

func (c *webSocketConnection) Read(ctx context.Context) (MessageType, []byte, error) {
	msgType, data, err := c.conn.Read(ctx)
	return MessageType(msgType), data, err
}

func (c *webSocketConnection) Close(reason string) error {
	return c.conn.Close(websocket.StatusNormalClosure, reason)
}

type webSocketService struct{}

func NewWebSocketService() WebSocketInterface {
	return &webSocketService{}
}

func (c *webSocketService) Accept(w http.ResponseWriter, r *http.Request, checkOrigin bool) (Connection, error) {
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify: !checkOrigin,
		CompressionMode:    websocket.CompressionContextTakeover,
	})
	if err != nil {
		return nil, err
	}
	return &webSocketConnection{conn: conn}, nil
}

func (c *webSocketService) IsNormalClose(err error) bool {
	if err == nil {
		return false
	}
	status := websocket.CloseStatus(err)
	return status == websocket.StatusNormalClosure || status == websocket.StatusGoingAway
}
