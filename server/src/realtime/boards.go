package realtime

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel/codes"

	"scrumlr.io/server/logger"
)

type BoardEventType string

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
	BoardEventVotesDeleted          BoardEventType = "VOTES_DELETED"
	BoardEventSessionRequestCreated BoardEventType = "REQUEST_CREATED"
	BoardEventSessionRequestUpdated BoardEventType = "REQUEST_UPDATED"
	BoardEventParticipantCreated    BoardEventType = "PARTICIPANT_CREATED"
	BoardEventParticipantUpdated    BoardEventType = "PARTICIPANT_UPDATED"
	BoardEventParticipantsUpdated   BoardEventType = "PARTICIPANTS_UPDATED"
	BoardEventUserDeleted           BoardEventType = "USER_DELETED"
	BoardEventVotingCreated         BoardEventType = "VOTING_CREATED"
	BoardEventVotingUpdated         BoardEventType = "VOTING_UPDATED"
	BoardEventBoardTimerUpdated     BoardEventType = "BOARD_TIMER_UPDATED"
	BoardEventBoardReactionAdded    BoardEventType = "BOARD_REACTION_ADDED"
	BoardEventNoteDragStart         BoardEventType = "NOTE_DRAG_START"
	BoardEventNoteDragEnd           BoardEventType = "NOTE_DRAG_END"
)

type BoardEvent struct {
	Type BoardEventType `json:"type"`
	Data interface{}    `json:"data,omitempty"`
}

func (b *Broker) BroadcastToBoard(ctx context.Context, boardID uuid.UUID, msg BoardEvent) error {
	ctx, span := tracer.Start(ctx, "scrumlr.realtime.board.broadcast")
	defer span.End()
	log := logger.FromContext(ctx)

	log.Debugw("broadcasting to board", "board", boardID, "msg", msg.Type)
	return b.Con.Publish(ctx, boardsSubject(boardID), msg)
}

func (b *Broker) GetBoardChannel(ctx context.Context, boardID uuid.UUID) chan *BoardEvent {
	ctx, span := tracer.Start(ctx, "scrumlr.realtime.board.subscribe")
	defer span.End()
	log := logger.FromContext(ctx)

	c, err := b.Con.SubscribeToBoardEvents(ctx, boardsSubject(boardID))
	if err != nil {
		// TODO: Bubble up this error, so the caller can retry to establish this subscription
		span.SetStatus(codes.Error, "failed to subscribe to board channel")
		span.RecordError(err)
		log.Errorw("failed to subscribe to BoardChannel", "err", err)
	}
	return c
}

func boardsSubject(boardID uuid.UUID) string {
	return fmt.Sprintf("board.%s", boardID)
}
