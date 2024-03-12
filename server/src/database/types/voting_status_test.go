package types

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestVotingStatusEnum(t *testing.T) {
	values := []VotingStatus{VotingStatusOpen, VotingStatusClosed}
	for _, value := range values {
		var votingStatus VotingStatus
		err := votingStatus.UnmarshalJSON([]byte(fmt.Sprintf("\"%s\"", value)))
		assert.Nil(t, err)
		assert.Equal(t, value, votingStatus)
	}
}

func TestUnmarshalVotingStatusNil(t *testing.T) {
	var votingStatus VotingStatus
	err := votingStatus.UnmarshalJSON(nil)
	assert.NotNil(t, err)
}

func TestUnmarshalVotingStatusEmptyString(t *testing.T) {
	var votingStatus VotingStatus
	err := votingStatus.UnmarshalJSON([]byte(""))
	assert.NotNil(t, err)
}

func TestUnmarshalVotingStatusEmptyStringWithQuotation(t *testing.T) {
	var votingStatus VotingStatus
	err := votingStatus.UnmarshalJSON([]byte("\"\""))
	assert.NotNil(t, err)
}

func TestUnmarshalVotingStatusRandomValue(t *testing.T) {
	var votingStatus VotingStatus
	err := votingStatus.UnmarshalJSON([]byte("\"SOME_RANDOM_VALUE\""))
	assert.NotNil(t, err)
}
