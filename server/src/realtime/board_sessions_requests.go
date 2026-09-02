package realtime

import (
	"context"
	"fmt"

	"github.com/google/uuid"

	"scrumlr.io/server/logger"
	"scrumlr.io/server/otel"
)

type BoardSessionRequestEventType string

const (
	RequestAccepted BoardSessionRequestEventType = "SESSION_ACCEPTED"
	RequestRejected BoardSessionRequestEventType = "SESSION_REJECTED"
)

func (b *Broker) BroadcastUpdateOnBoardSessionRequest(ctx context.Context, board, user uuid.UUID, msg BoardSessionRequestEventType) error {
	ctx, span := tracer.Start(ctx, "board-session-broadcast")
	defer span.End()
	log := logger.FromContext(ctx)

	log.Debugw("broadcasting to board session request", "board", board, "user", user, "msg", msg)
	return b.Con.Publish(ctx, requestSubject(board, user), msg)
}

func (b *Broker) GetBoardSessionRequestChannel(ctx context.Context, board, user uuid.UUID) (chan *BoardSessionRequestEventType, error) {
	ctx, span := tracer.Start(ctx, "board-session-subscribe")
	defer span.End()
	log := logger.FromContext(ctx)

	c, err := b.Con.SubscribeToBoardSessionEvents(ctx, requestSubject(board, user))
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to subscribe to board session channel"))
		log.Errorw("failed to subscribe to BoardSessionRequestChannel", "err", err)

		return nil, err
	}
	return c, nil
}

func requestSubject(board, user uuid.UUID) string {
	return fmt.Sprintf("request.%s.%s", board, user)
}
