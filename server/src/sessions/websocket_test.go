package sessions

import (
	"net/http"
	"testing"

	websocket "github.com/gorilla/websocket"
	httpMock "scrumlr.io/server/mocks/net/http"
	brokerMock "scrumlr.io/server/mocks/realtime"
	"scrumlr.io/server/realtime"
)

func TestOpenBoardSessionRequestSocket(t *testing.T) {
	mockBroker := brokerMock.NewMockClient(t)
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	mockResponseWriter := httpMock.NewMockResponseWriter(t)
	mockRequest := new(http.Request)
	mockUpgrader := websocket.Upgrader{}

	websocket := NewWebsocket(mockUpgrader, broker)
	websocket.OpenBoardSessionRequestSocket(mockResponseWriter, mockRequest)
}
