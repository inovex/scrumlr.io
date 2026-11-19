package eventfilter

import (
	"errors"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/technical_helper"
	"scrumlr.io/server/votings"
)

func TestVoteRuleSupportDeletedEvent(t *testing.T) {
	ctx := t.Context()

	filterRule := NewVoteRuleFilter()

	supports := filterRule.Supports(ctx, realtime.BoardEventVotesDeleted)

	assert.True(t, supports)
}

func TestVoteRuleSupportCreatedEvent(t *testing.T) {
	ctx := t.Context()

	filterRule := NewVoteRuleFilter()

	supports := filterRule.Supports(ctx, realtime.BoardEventVotingCreated)

	assert.False(t, supports)
}

func TestVoteRuleHandleDeletedEvent(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()
	votingId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventVotesDeleted,
		Data: []votings.Vote{
			{Voting: votingId, Note: uuid.New(), User: userId},
			{Voting: votingId, Note: uuid.New(), User: uuid.New()},
			{Voting: votingId, Note: uuid.New(), User: userId},
			{Voting: votingId, Note: uuid.New(), User: uuid.New()},
			{Voting: votingId, Note: uuid.New(), User: userId},
			{Voting: votingId, Note: uuid.New(), User: uuid.New()},
		},
	}

	voteFilter := NewVoteRuleFilter()

	filteredEvent, err := voteFilter.Handle(ctx, event, boardId, userId)

	assert.NoError(t, err)
	assert.NotNil(t, filteredEvent)

	filteredVotes, err := technical_helper.UnmarshalSlice[votings.Vote](filteredEvent.Data)
	assert.NoError(t, err)
	assert.Len(t, filteredVotes, 3)
}

func TestVoteRuleHandleCreatedEvent(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventVotingCreated,
		Data: uuid.New(),
	}

	voteFilter := NewVoteRuleFilter()

	filteredEvent, err := voteFilter.Handle(ctx, event, boardId, userId)

	assert.Error(t, err)
	assert.Equal(t, errors.New("event not supported"), err)
	assert.Nil(t, filteredEvent)
}

func TestVoteRuleHandleDeletedEventUnmarshalError(t *testing.T) {
	ctx := t.Context()
	boardId := uuid.New()
	userId := uuid.New()

	event := &realtime.BoardEvent{
		Type: realtime.BoardEventVotesDeleted,
		Data: uuid.New(),
	}

	voteFilter := NewVoteRuleFilter()

	filteredEvent, err := voteFilter.Handle(ctx, event, boardId, userId)

	assert.Error(t, err)
	assert.Nil(t, filteredEvent)
}
