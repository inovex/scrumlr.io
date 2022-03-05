package realtime

import (
	"github.com/nats-io/nats.go"
	"scrumlr.io/server/logger"
)

type Realtime struct {
	con *nats.EncodedConn
}

func New(url string) *Realtime {
	r := new(Realtime)

	// Connect to a server
	nc, err := nats.Connect(url)
	if err != nil {
		logger.Get().Fatalw("unable to connect to nats server", "url", url, "err", err)
	}
	c, err := nats.NewEncodedConn(nc, nats.JSON_ENCODER)
	if err != nil {
		logger.Get().Fatalw("unable to open encoded connection", "err", err)
	}

	r.con = c

	return r
}
