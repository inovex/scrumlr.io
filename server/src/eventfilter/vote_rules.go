package eventfilter

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/technical_helper"
	"scrumlr.io/server/votings"
)

type voteEventRules struct {
}

func NewVoteRuleFilter() FilterRule {
	filterRule := new(voteEventRules)

	return filterRule
}

func (voteRules *voteEventRules) Supports(ctx context.Context, eventType realtime.BoardEventType) bool {
	switch eventType {
	case realtime.BoardEventVotesDeleted:
		return true
	default:
		return false
	}
}

func (voteRules *voteEventRules) Handle(ctx context.Context, event *realtime.BoardEvent, boardId, userId uuid.UUID) (*realtime.BoardEvent, error) {
	switch event.Type {
	case realtime.BoardEventVotesDeleted:
		return voteRules.votesDeleted(ctx, event, userId)
	default:
		return nil, errors.New("event not supported")
	}
}

func (voteRules *voteEventRules) votesDeleted(ctx context.Context, event *realtime.BoardEvent, userId uuid.UUID) (*realtime.BoardEvent, error) {
	log := logger.FromContext(ctx)

	votes, err := technical_helper.UnmarshalSlice[votings.Vote](event.Data)
	if err != nil {
		log.Errorw("unable to parse deleteVotes in event filter", "err", err)
		return nil, err
	}

	return &realtime.BoardEvent{
		Type: event.Type,
		Data: technical_helper.Filter(votes, func(vote *votings.Vote) bool {
			return vote.User == userId
		}),
	}, nil
}
