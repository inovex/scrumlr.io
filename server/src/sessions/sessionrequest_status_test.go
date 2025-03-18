package sessions

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestBoardSessionRequestStatusEnum(t *testing.T) {
	values := []BoardSessionRequestStatus{RequestStatusAccepted, RequestStatusRejected, RequestStatusPending}
	for _, value := range values {
		var boardSessionRequestStatus BoardSessionRequestStatus
		err := boardSessionRequestStatus.UnmarshalJSON([]byte(fmt.Sprintf("\"%s\"", value)))
		assert.Nil(t, err)
		assert.Equal(t, value, boardSessionRequestStatus)
	}
}

func TestUnmarshalBoardSessionRequestStatusNil(t *testing.T) {
	var boardSessionRequestStatus BoardSessionRequestStatus
	err := boardSessionRequestStatus.UnmarshalJSON(nil)
	assert.NotNil(t, err)
}

func TestUnmarshalBoardSessionRequestStatusEmptyString(t *testing.T) {
	var boardSessionRequestStatus BoardSessionRequestStatus
	err := boardSessionRequestStatus.UnmarshalJSON([]byte(""))
	assert.NotNil(t, err)
}

func TestUnmarshalBoardSessionRequestStatusEmptyStringWithQuotation(t *testing.T) {
	var boardSessionRequestStatus BoardSessionRequestStatus
	err := boardSessionRequestStatus.UnmarshalJSON([]byte("\"\""))
	assert.NotNil(t, err)
}

func TestUnmarshalBoardSessionRequestStatusRandomValue(t *testing.T) {
	var boardSessionRequestStatus BoardSessionRequestStatus
	err := boardSessionRequestStatus.UnmarshalJSON([]byte("\"SOME_RANDOM_VALUE\""))
	assert.NotNil(t, err)
}
