package realtime

import (
	"fmt"
	"github.com/google/uuid"
	"scrumlr.io/server/logger"
)

type BoardSessionRequestEventType string

const (
	RequestAccepted BoardSessionRequestEventType = "SESSION_ACCEPTED"
	RequestRejected                              = "SESSION_REJECTED"
)

func (r *Realtime) BroadcastUpdateOnBoardSessionRequest(board, user uuid.UUID, msg BoardSessionRequestEventType) error {
	logger.Get().Debugw("broadcasting to board session request", "board", board, "user", user, "msg", msg)
	return r.con.Publish(fmt.Sprintf("request.%s.%s", board, user), msg)
}

func (r *Realtime) GetBoardSessionRequestChannel(board, user uuid.UUID) chan *BoardSessionRequestEventType {
	receiverChan := make(chan *BoardSessionRequestEventType)
	r.con.BindRecvChan(fmt.Sprintf("request.%s.%s", board, user), receiverChan)
	return receiverChan
}
