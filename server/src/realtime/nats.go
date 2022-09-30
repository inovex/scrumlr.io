package realtime

import (
	"fmt"

	"github.com/nats-io/nats.go"
)

type Realtime struct {
	con *nats.EncodedConn
}

func New(url string) (*Realtime, error) {
	r := new(Realtime)

	// Connect to a server
	nc, err := nats.Connect(url)
	if err != nil {
		return nil, fmt.Errorf("unable to connect to nats server %s: %w", url, err)
	}
	c, err := nats.NewEncodedConn(nc, nats.JSON_ENCODER)
	if err != nil {
		return nil, fmt.Errorf("unable to open encoded connection: %w", err)
	}

	r.con = c

	return r, nil
}
