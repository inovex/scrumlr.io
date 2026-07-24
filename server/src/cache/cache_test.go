package cache

import (
	"errors"
	"flag"
	"testing"

	"github.com/stretchr/testify/assert"
	"github.com/urfave/cli/v2"
	"scrumlr.io/server/initialize"
)

func TestInitializerealtime_Nats(t *testing.T) {
	container, connection := initialize.StartTestNats()

	flagset := flag.NewFlagSet("scrumlr-tests", flag.ExitOnError)
	flagset.String("redis-address", "", "")
	flagset.String("redis-usernamet", "", "")
	flagset.String("redis-password", "", "")
	flagset.String("nats", "", "")
	init := cli.NewContext(nil, flagset, nil)

	err := init.Set("nats", connection)
	assert.NoError(t, err)

	cache, err := InitializeCache(init)

	assert.NoError(t, err)
	assert.NotNil(t, cache)
	assert.NotNil(t, cache.Con)

	initialize.StopTestNats(container)
}

func TestInitializeRealtime_Redis(t *testing.T) {
	container, connection := initialize.StartTestRedis()

	flagset := flag.NewFlagSet("scrumlr-tests", flag.ExitOnError)
	flagset.String("redis-address", "", "")
	flagset.String("redis-usernamet", "", "")
	flagset.String("redis-password", "", "")
	flagset.String("nats", "", "")
	init := cli.NewContext(nil, flagset, nil)

	err := init.Set("redis-address", connection)
	assert.NoError(t, err)

	cache, err := InitializeCache(init)

	assert.NoError(t, err)
	assert.NotNil(t, cache)
	assert.NotNil(t, cache.Con)

	initialize.StopTestRedis(container)
}

func TestInitializeRealtime_NotConfigured(t *testing.T) {
	flagset := flag.NewFlagSet("scrumlr-tests", flag.ExitOnError)
	flagset.String("redis-address", "", "")
	flagset.String("redis-usernamet", "", "")
	flagset.String("redis-password", "", "")
	flagset.String("nats", "", "")
	init := cli.NewContext(nil, flagset, nil)

	cache, err := InitializeCache(init)

	assert.Error(t, err)
	assert.Equal(t, errors.New("no valid cache configuration found"), err)
	assert.Nil(t, cache)
}

func TestInitializerealtime_PrefereRedis(t *testing.T) {
	container, connection := initialize.StartTestRedis()

	flagset := flag.NewFlagSet("scrumlr-tests", flag.ExitOnError)
	flagset.String("redis-address", "", "")
	flagset.String("redis-usernamet", "", "")
	flagset.String("redis-password", "", "")
	flagset.String("nats", "", "")
	init := cli.NewContext(nil, flagset, nil)

	err := init.Set("redis-address", connection)
	assert.NoError(t, err)
	err = init.Set("nats", "not valide connection")
	assert.NoError(t, err)

	cache, err := InitializeCache(init)

	assert.NoError(t, err)
	assert.NotNil(t, cache)
	assert.NotNil(t, cache.Con)

	initialize.StopTestRedis(container)
}
