package realtime

import (
	"fmt"

	"github.com/google/uuid"

	"scrumlr.io/server/logger"
)

type BoardEventType string
type ModerationEventType string

const (
	BoardEventInit                  BoardEventType = "INIT"
	BoardEventBoardUpdated          BoardEventType = "BOARD_UPDATED"
	BoardEventBoardDeleted          BoardEventType = "BOARD_DELETED"
	BoardEventColumnsUpdated        BoardEventType = "COLUMNS_UPDATED"
	BoardEventColumnDeleted         BoardEventType = "COLUMN_DELETED"
	BoardEventNotesUpdated          BoardEventType = "NOTES_UPDATED"
	BoardEventNoteDeleted           BoardEventType = "NOTE_DELETED"
	BoardEventVotesUpdated          BoardEventType = "VOTES_UPDATED"
	BoardEventSessionRequestCreated BoardEventType = "REQUEST_CREATED"
	BoardEventSessionRequestUpdated BoardEventType = "REQUEST_UPDATED"
	BoardEventParticipantCreated    BoardEventType = "PARTICIPANT_CREATED"
	BoardEventParticipantUpdated    BoardEventType = "PARTICIPANT_UPDATED"
	BoardEventParticipantsUpdated   BoardEventType = "PARTICIPANTS_UPDATED"
	BoardEventVotingCreated         BoardEventType = "VOTING_CREATED"
	BoardEventVotingUpdated         BoardEventType = "VOTING_UPDATED"
	BoardEventBoardTimerUpdated     BoardEventType = "BOARD_TIMER_UPDATED"

  // Create some events only receivable by moderators
  ModerationEventInit        ModerationEventType = "MODERATION_INIT"
  ModerationEventVotesUpdated ModerationEventType = "MODERATION_VOTES_UPDATED"
)

type BoardEvent struct {
	Type BoardEventType `json:"type"`
	Data interface{}    `json:"data,omitempty"`
}

type ModerationEvent struct {
  Type ModerationEventType `json:"type"`
  Data interface{} `json:"data,omitempty"`
}

func (b *Broker) BroadcastToBoard(boardID uuid.UUID, msg BoardEvent) error {
	logger.Get().Debugw("broadcasting to board", "board", boardID, "msg", msg.Type)
	return b.con.Publish(boardsSubject(boardID), msg)
}

func (b *Broker) BroadcastToModeration(boardID uuid.UUID, msg ModerationEvent) error {
	logger.Get().Debugw("broadcasting to moderation", "board", boardID, "msg", msg.Type)
	return b.con.Publish(boardsModerationSubject(boardID), msg)
}

func (b *Broker) GetBoardChannel(boardID uuid.UUID) chan *BoardEvent {
	c, err := b.con.SubscribeToBoardEvents(boardsSubject(boardID))
	if err != nil {
		// TODO: Bubble up this error, so the caller can retry to establish this subscription
		logger.Get().Errorw("failed to subscribe to BoardChannel", "err", err)
	}
	return c
}

func (b *Broker) GetBoardModerationChannel(boardId uuid.UUID) chan *BoardEvent {
  c, err := b.con.SubscribeToBoardEvents(boardsModerationSubject(boardId))
	if err != nil {
		// TODO: Bubble up this error, so the caller can retry to establish this subscription
		logger.Get().Errorw("failed to subscribe to BoardChannel", "err", err)
	}
	return c
}

func boardsSubject(boardID uuid.UUID) string {
	return fmt.Sprintf("board.%s", boardID)
}

func boardsModerationSubject(boardId uuid.UUID) string {
  return fmt.Sprintf("board.moderation.%s", boardId)
}
