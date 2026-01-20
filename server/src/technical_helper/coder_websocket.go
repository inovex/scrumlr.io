package technical_helper

import (
	"context"
	"net/http"

	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
)

type coderConnection struct {
	conn *websocket.Conn
}

func (c *coderConnection) WriteJSON(ctx context.Context, data interface{}) error {
	return wsjson.Write(ctx, c.conn, data)
}

func (c *coderConnection) Read(ctx context.Context) (MessageType, []byte, error) {
	msgType, data, err := c.conn.Read(ctx)
	return MessageType(msgType), data, err
}

func (c *coderConnection) Close(reason string) error {
	return c.conn.Close(websocket.StatusNormalClosure, reason)
}

type coderWebSocketService struct{}

func NewCoderWebSocketService() WebSocketService {
	return &coderWebSocketService{}
}

func (c *coderWebSocketService) Accept(w http.ResponseWriter, r *http.Request, checkOrigin bool) (Connection, error) {
	conn, err := websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify: !checkOrigin,
	})
	if err != nil {
		return nil, err
	}
	return &coderConnection{conn: conn}, nil
}

func (c *coderWebSocketService) IsNormalClose(err error) bool {
	if err == nil {
		return false
	}
	status := websocket.CloseStatus(err)
	return status == websocket.StatusNormalClosure || status == websocket.StatusGoingAway
}
