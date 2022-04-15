package realtime

import (
	"fmt"

	"github.com/google/uuid"
	"scrumlr.io/server/logger"
)

type BoardEventType string

const (
	BoardEventInit                  BoardEventType = "INIT"
	BoardEventBoardUpdated          BoardEventType = "BOARD_UPDATED"
	BoardEventBoardDeleted          BoardEventType = "BOARD_DELETED"
	BoardEventColumnsUpdated        BoardEventType = "COLUMNS_UPDATED"
	BoardEventNotesUpdated          BoardEventType = "NOTES_UPDATED"
	BoardEventSessionRequestCreated BoardEventType = "REQUEST_CREATED"
	BoardEventSessionRequestUpdated BoardEventType = "REQUEST_UPDATED"
	BoardEventParticipantCreated    BoardEventType = "PARTICIPANT_CREATED"
	BoardEventParticipantUpdated    BoardEventType = "PARTICIPANT_UPDATED"
	BoardEventParticipantsUpdated   BoardEventType = "PARTICIPANTS_UPDATED"
	BoardEventVotingCreated         BoardEventType = "VOTING_CREATED"
	BoardEventVotingUpdated         BoardEventType = "VOTING_UPDATED"
	BoardEventBoardTimerUpdated     BoardEventType = "BOARD_TIMER_UPDATED"
)

type BoardEvent struct {
	Type BoardEventType `json:"type"`
	Data interface{}    `json:"data,omitempty"`
}

func (r *Realtime) BroadcastToBoard(boardID uuid.UUID, msg BoardEvent) error {
	logger.Get().Debugw("broadcasting to board", "board", boardID, "msg", msg.Type)
	return r.con.Publish(fmt.Sprintf("board.%s", boardID), msg)
}

func (r *Realtime) GetBoardChannel(boardID uuid.UUID) chan *BoardEvent {
	receiverChan := make(chan *BoardEvent)
	r.con.BindRecvChan(fmt.Sprintf("board.%s", boardID), receiverChan)
	return receiverChan
}
