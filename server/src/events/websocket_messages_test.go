package events

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestUnmarshalWebsocketMessageType(t *testing.T) {
	values := []WebSocketMessageType{NoteDragLock}

	for _, value := range values {
		var messageType WebSocketMessageType

		err := messageType.UnmarshalJSON(fmt.Appendf(nil, "\"%s\"", value))

		assert.Nil(t, err)
		assert.Equal(t, value, messageType)
	}
}

func TestUnmarshalWebsocketMessageTypeNil(t *testing.T) {
	var messageType WebSocketMessageType

	err := messageType.UnmarshalJSON(nil)

	assert.Error(t, err)
}

func TestUnmarshalWebsocketMessageTypeEmptyString(t *testing.T) {
	var messageType WebSocketMessageType

	err := messageType.UnmarshalJSON([]byte(""))

	assert.Error(t, err)
}

func TestUnmarshalWebsocketMessageTypeEmptyStringWithQuotation(t *testing.T) {
	var messageType WebSocketMessageType

	err := messageType.UnmarshalJSON([]byte("\"\""))

	assert.Error(t, err)
}

func TestUnmarshalWebsocketMessageTypeInvalidString(t *testing.T) {
	var messageType WebSocketMessageType

	err := messageType.UnmarshalJSON([]byte("\"invalid string\""))

	assert.Error(t, err)
}
