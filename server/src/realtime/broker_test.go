package realtime

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/urfave/cli/v3"
	"scrumlr.io/server/initialize"
)

func TestInitializeRealtime_Nats(t *testing.T) {
	ctx := t.Context()
	container, connection := initialize.StartTestNats()

	init := &cli.Command{
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "redis-address"},
			&cli.StringFlag{Name: "redis-username"},
			&cli.StringFlag{Name: "redis-password"},
			&cli.StringFlag{Name: "nats"},
		},
	}

	err := init.Set("nats", connection)
	assert.NoError(t, err)

	broker, err := InitializeRealtime(ctx, init)

	assert.NoError(t, err)
	assert.NotNil(t, broker)
	assert.NotNil(t, broker.Con)

	initialize.StopTestNats(container)
}

func TestInitializeRealtime_Redis(t *testing.T) {
	ctx := t.Context()
	container, connection := initialize.StartTestRedis()

	init := &cli.Command{
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "redis-address"},
			&cli.StringFlag{Name: "redis-username"},
			&cli.StringFlag{Name: "redis-password"},
			&cli.StringFlag{Name: "nats"},
		},
	}

	err := init.Set("redis-address", connection)
	assert.NoError(t, err)

	broker, err := InitializeRealtime(ctx, init)

	assert.NoError(t, err)
	assert.NotNil(t, broker)
	assert.NotNil(t, broker.Con)

	initialize.StopTestRedis(container)
}

func TestInitializeRealtime_NotConfigured(t *testing.T) {
	ctx := t.Context()

	init := &cli.Command{
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "redis-address"},
			&cli.StringFlag{Name: "redis-username"},
			&cli.StringFlag{Name: "redis-password"},
			&cli.StringFlag{Name: "nats"},
		},
	}

	broker, err := InitializeRealtime(ctx, init)

	assert.Error(t, err)
	assert.Equal(t, errors.New("no valid message broker configuration found"), err)
	assert.Nil(t, broker)
}

func TestInitializeRealtime_PrefereRedis(t *testing.T) {
	ctx := t.Context()

	container, connection := initialize.StartTestRedis()

	init := &cli.Command{
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "redis-address"},
			&cli.StringFlag{Name: "redis-username"},
			&cli.StringFlag{Name: "redis-password"},
			&cli.StringFlag{Name: "nats"},
		},
	}

	err := init.Set("redis-address", connection)
	assert.NoError(t, err)
	err = init.Set("nats", "not valide connection")
	assert.NoError(t, err)

	broker, err := InitializeRealtime(ctx, init)

	assert.NoError(t, err)
	assert.NotNil(t, broker)
	assert.NotNil(t, broker.Con)

	initialize.StopTestRedis(container)
}
