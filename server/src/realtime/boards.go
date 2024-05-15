package realtime

import (
	"fmt"

	"github.com/google/uuid"

	"scrumlr.io/server/logger"
)

type BoardEventType string
type SessionChannel string

const (
	BoardEventInit                  BoardEventType = "INIT"
	BoardEventBoardUpdated          BoardEventType = "BOARD_UPDATED"
	BoardEventBoardDeleted          BoardEventType = "BOARD_DELETED"
	BoardEventColumnsUpdated        BoardEventType = "COLUMNS_UPDATED"
	BoardEventColumnDeleted         BoardEventType = "COLUMN_DELETED"
	BoardEventNotesUpdated          BoardEventType = "NOTES_UPDATED"
	BoardEventNoteDeleted           BoardEventType = "NOTE_DELETED"
	BoardEventNotesSync             BoardEventType = "NOTES_SYNC"
	BoardEventReactionAdded         BoardEventType = "REACTION_ADDED"
	BoardEventReactionDeleted       BoardEventType = "REACTION_DELETED"
	BoardEventReactionUpdated       BoardEventType = "REACTION_UPDATED"
	BoardEventVotesUpdated          BoardEventType = "VOTES_UPDATED"
	BoardEventSessionRequestCreated BoardEventType = "REQUEST_CREATED"
	BoardEventSessionRequestUpdated BoardEventType = "REQUEST_UPDATED"
	BoardEventParticipantCreated    BoardEventType = "PARTICIPANT_CREATED"
	BoardEventParticipantUpdated    BoardEventType = "PARTICIPANT_UPDATED"
	BoardEventParticipantsUpdated   BoardEventType = "PARTICIPANTS_UPDATED"
	BoardEventVotingCreated         BoardEventType = "VOTING_CREATED"
	BoardEventVotingUpdated         BoardEventType = "VOTING_UPDATED"
	BoardEventBoardTimerUpdated     BoardEventType = "BOARD_TIMER_UPDATED"
	BoardEventBoardReactionAdded    BoardEventType = "BOARD_REACTION_ADDED"

	SessionChannelModerator   SessionChannel = "moderator"
	SessionChannelParticipant SessionChannel = "participant"
)

type BoardEvent struct {
	Type BoardEventType `json:"type"`
	Data interface{}    `json:"data,omitempty"`
}

func (b *Broker) BroadcastToBoard(boardID uuid.UUID, channels []SessionChannel, msg BoardEvent) error {
	logger.Get().Debugw("broadcasting to board", "board", boardID, "msg", msg.Type)
	var err error
	for _, channel := range channels {
		err = b.con.Publish(boardsSubject(boardID, channel), msg)
	}
	return err
}

func (b *Broker) GetBoardChannel(boardID uuid.UUID, channel SessionChannel) chan *BoardEvent {
	c, err := b.con.SubscribeToBoardEvents(boardsSubject(boardID, channel))
	if err != nil {
		// TODO: Bubble up this error, so the caller can retry to establish this subscription
		logger.Get().Errorw("failed to subscribe to BoardChannel", "err", err)
	}
	return c
}

func boardsSubject(boardID uuid.UUID, channel SessionChannel) string {
	return fmt.Sprintf("board.%s.%s", boardID, channel)
}
