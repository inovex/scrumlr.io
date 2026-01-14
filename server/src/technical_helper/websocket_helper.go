package technical_helper

import (
  "github.com/coder/websocket"
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
