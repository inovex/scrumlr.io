package otel

import (
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestOptionWithHttpEndpoint(t *testing.T) {
	var options options

	httpEndpoint := "http://localhost:4318"
	httpOption := WithHttpEndpoint(httpEndpoint)

	err := httpOption(&options)

	assert.NoError(t, err)
	assert.Equal(t, httpEndpoint, *options.httpEndpoint)
}

func TestOptionWithHttpEndpointEmpty(t *testing.T) {
	var options options

	httpEndpoint := ""
	httpOption := WithHttpEndpoint(httpEndpoint)

	err := httpOption(&options)

	assert.NoError(t, err)
	assert.Nil(t, options.httpEndpoint)
}

func TestOptionWithGrpcEndpoint(t *testing.T) {
	var options options

	grpcEndpoint := "http://localhost:4317"
	grpcOption := WithGrpcEndpoint(grpcEndpoint)

	err := grpcOption(&options)

	assert.NoError(t, err)
	assert.Equal(t, grpcEndpoint, *options.grpcEndpoint)
}

func TestOptionWithGrpcEndpointEmpty(t *testing.T) {
	var options options

	grpcEndpoint := ""
	grpcOption := WithGrpcEndpoint(grpcEndpoint)

	err := grpcOption(&options)

	assert.NoError(t, err)
	assert.Nil(t, options.grpcEndpoint)
}
