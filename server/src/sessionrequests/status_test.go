package sessionrequests

import (
	"fmt"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestBoardSessionRequestStatusEnum(t *testing.T) {
	values := []RequestStatus{RequestAccepted, RequestRejected, RequestPending}
	for _, value := range values {
		var boardSessionRequestStatus RequestStatus
		err := boardSessionRequestStatus.UnmarshalJSON([]byte(fmt.Sprintf("\"%s\"", value)))
		assert.Nil(t, err)
		assert.Equal(t, value, boardSessionRequestStatus)
	}
}

func TestUnmarshalBoardSessionRequestStatusNil(t *testing.T) {
	var boardSessionRequestStatus RequestStatus
	err := boardSessionRequestStatus.UnmarshalJSON(nil)
	assert.NotNil(t, err)
}

func TestUnmarshalBoardSessionRequestStatusEmptyString(t *testing.T) {
	var boardSessionRequestStatus RequestStatus
	err := boardSessionRequestStatus.UnmarshalJSON([]byte(""))
	assert.NotNil(t, err)
}

func TestUnmarshalBoardSessionRequestStatusEmptyStringWithQuotation(t *testing.T) {
	var boardSessionRequestStatus RequestStatus
	err := boardSessionRequestStatus.UnmarshalJSON([]byte("\"\""))
	assert.NotNil(t, err)
}

func TestUnmarshalBoardSessionRequestStatusRandomValue(t *testing.T) {
	var boardSessionRequestStatus RequestStatus
	err := boardSessionRequestStatus.UnmarshalJSON([]byte("\"SOME_RANDOM_VALUE\""))
	assert.NotNil(t, err)
}
