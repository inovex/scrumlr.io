package cache

import (
	"errors"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/urfave/cli/v3"
	"scrumlr.io/server/initialize"
)

func TestInitializeCache_Nats(t *testing.T) {
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

	cache, err := InitializeCache(ctx, init)

	assert.NoError(t, err)
	assert.NotNil(t, cache)
	assert.NotNil(t, cache.Con)

	initialize.StopTestNats(container)
}

func TestInitializeCache_Redis(t *testing.T) {
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

	cache, err := InitializeCache(ctx, init)

	assert.NoError(t, err)
	assert.NotNil(t, cache)
	assert.NotNil(t, cache.Con)

	initialize.StopTestRedis(container)
}

func TestInitializeCache_NotConfigured(t *testing.T) {
	ctx := t.Context()

	init := &cli.Command{
		Flags: []cli.Flag{
			&cli.StringFlag{Name: "redis-address"},
			&cli.StringFlag{Name: "redis-username"},
			&cli.StringFlag{Name: "redis-password"},
			&cli.StringFlag{Name: "nats"},
		},
	}

	cache, err := InitializeCache(ctx, init)

	assert.Error(t, err)
	assert.Equal(t, errors.New("no valid cache configuration found"), err)
	assert.Nil(t, cache)
}

func TestInitializeCache_PrefereRedis(t *testing.T) {
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

	cache, err := InitializeCache(ctx, init)

	assert.NoError(t, err)
	assert.NotNil(t, cache)
	assert.NotNil(t, cache.Con)

	initialize.StopTestRedis(container)
}
