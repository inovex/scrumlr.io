package technical_helper

import (
	"context"
	"github.com/coder/websocket"
	"github.com/coder/websocket/wsjson"
	"net/http"
)

func AcceptWebSocket(w http.ResponseWriter, r *http.Request, checkOrigin bool) (*websocket.Conn, error) {
	return websocket.Accept(w, r, &websocket.AcceptOptions{
		InsecureSkipVerify: !checkOrigin,
	})
}

func IsNormalClose(err error) bool {
	if err == nil {
		return false
	}
	status := websocket.CloseStatus(err)
	return status == websocket.StatusNormalClosure || status == websocket.StatusGoingAway
}

func WriteJSON(ctx context.Context, conn *websocket.Conn, data interface{}) error {
	return wsjson.Write(ctx, conn, data)
}

func CloseWebSocket(conn *websocket.Conn, reason string) error {
	return conn.Close(websocket.StatusNormalClosure, reason)
}

func ReadWebSocket(ctx context.Context, conn *websocket.Conn) (websocket.MessageType, []byte, error) {
	return conn.Read(ctx)
}
