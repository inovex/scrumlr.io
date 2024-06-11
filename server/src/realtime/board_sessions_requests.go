package realtime

import (
	"fmt"

	"github.com/google/uuid"

	"scrumlr.io/server/logger"
)

type BoardSessionRequestEventType string

const (
	RequestAccepted BoardSessionRequestEventType = "SESSION_ACCEPTED"
	RequestRejected BoardSessionRequestEventType = "SESSION_REJECTED"
)

func (b *Broker) BroadcastUpdateOnBoardSessionRequest(board, user uuid.UUID, msg BoardSessionRequestEventType) error {
	logger.Get().Debugw("broadcasting to board session request", "board", board, "user", user, "msg", msg)
	return b.Con.Publish(requestSubject(board, user), msg)
}

func (b *Broker) GetBoardSessionRequestChannel(board, user uuid.UUID) chan *BoardSessionRequestEventType {
	c, err := b.Con.SubscribeToBoardSessionEvents(requestSubject(board, user))
	if err != nil {
		// TODO: Bubble up this error, so the caller can retry to establish this subscription
		logger.Get().Errorw("failed to subscribe to BoardSessionRequestChannel", "err", err)
	}
	return c
}

func requestSubject(board, user uuid.UUID) string {
	return fmt.Sprintf("request.%s.%s", board, user)
}
