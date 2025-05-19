package common

import (
	"github.com/uptrace/bun"
)

type DatabaseBoard struct {
	bun.BaseModel `bun:"table:boards"`
}

type DatabaseBoardInsert struct {
	bun.BaseModel `bun:"table:boards"`
}

type DatabaseBoardTimerUpdate struct {
	bun.BaseModel `bun:"table:boards"`
}

type DatabaseBoardUpdate struct {
	bun.BaseModel `bun:"table:boards"`
}

type DatabaseBoardTemplate struct {
	bun.BaseModel `bun:"table:board_templates"`
}

type DatabaseBoardTemplateFull struct {
	bun.BaseModel `bun:"table:board_templates"`
}

type DatabaseBoardTemplateInsert struct {
	bun.BaseModel `bun:"table:board_templates"`
}

type DatabaseBoardTemplateUpdate struct {
	bun.BaseModel `bun:"table:board_templates"`
}

type DatabaseColumn struct {
	bun.BaseModel `bun:"table:columns"`
}

// ColumnInsert the insert model for a new Column
type DatabaseColumnInsert struct {
	bun.BaseModel `bun:"table:columns"`
}

// ColumnUpdate the update model for a new Column
type DatabaseColumnUpdate struct {
	bun.BaseModel `bun:"table:columns"`
}

type DatabaseColumnTemplate struct {
	bun.BaseModel `bun:"table:column_templates"`
}

// ColumnTemplateInsert the insert model for a new column template
type DatabaseColumnTemplateInsert struct {
	bun.BaseModel `bun:"table:column_templates"`
}

// ColumnTemplateUpdated the update model for a new column template
type DatabaseColumnTemplateUpdate struct {
	bun.BaseModel `bun:"table:column_templates"`
}

type NoteDB struct {
	bun.BaseModel `bun:"table:notes"`
}

type NoteInsertDB struct {
	bun.BaseModel `bun:"table:notes"`
}

type NoteImportDB struct {
	bun.BaseModel `bun:"table:notes"`
}

type NoteUpdateDB struct {
	bun.BaseModel `bun:"table:notes"`
}

type DatabaseReaction struct {
	bun.BaseModel `bun:"table:reactions,alias:reaction"`
}

type DatabaseReactionInsert struct {
	bun.BaseModel `bun:"table:reactions,alias:reaction"`
}

type DatabaseReactionUpdate struct {
	bun.BaseModel `bun:"table:reactions,alias:reaction"`
}

// BoardSessionRequest is the model for a board session request
type DatabaseBoardSessionRequest struct {
	bun.BaseModel `bun:"table:board_session_requests"`
}

// BoardSessionRequestInsert is the model for board session requests inserts
type DatabaseBoardSessionRequestInsert struct {
	bun.BaseModel `bun:"table:board_session_requests"`
}

// BoardSessionRequestUpdate is the model for a board session request update
type DatabaseBoardSessionRequestUpdate struct {
	bun.BaseModel `bun:"table:board_session_requests"`
}

type DatabaseBoardSession struct {
	bun.BaseModel `bun:"table:board_sessions"`
}

type DatabaseBoardSessionInsert struct {
	bun.BaseModel `bun:"table:board_sessions"`
}

type DatabaseBoardSessionUpdate struct {
	bun.BaseModel `bun:"table:board_sessions"`
}

// User model of the application
type DatabaseUser struct {
	bun.BaseModel `bun:"table:users"`
}

// UserInsert the insert type for a new User
type DatabaseUserInsert struct {
	bun.BaseModel `bun:"table:users"`
}

type DatabaseUserUpdate struct {
	bun.BaseModel `bun:"table:users"`
}

type VotingDB struct {
	bun.BaseModel `bun:"table:votings"`
}

type VotingInsert struct {
	bun.BaseModel `bun:"table:votings"`
}

type VotingUpdate struct {
	bun.BaseModel `bun:"table:votings"`
}

type VoteDB struct {
	bun.BaseModel `bun:"table:votes"`
}
