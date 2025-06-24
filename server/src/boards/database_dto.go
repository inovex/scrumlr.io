package boards

import (
	"scrumlr.io/server/sessions"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/votings"
)

type DatabaseBoard struct {
	bun.BaseModel         `bun:"table:boards"`
	ID                    uuid.UUID
	Name                  *string
	Description           *string
	AccessPolicy          AccessPolicy
	Passphrase            *string
	Salt                  *string
	ShowAuthors           bool
	ShowNotesOfOtherUsers bool
	ShowNoteReactions     bool
	AllowStacking         bool
	IsLocked              bool
	CreatedAt             time.Time
	TimerStart            *time.Time
	TimerEnd              *time.Time
	SharedNote            uuid.NullUUID
	ShowVoting            uuid.NullUUID
}

type DatabaseBoardInsert struct {
	bun.BaseModel `bun:"table:boards"`
	Name          *string
	Description   *string
	AccessPolicy  AccessPolicy
	Passphrase    *string
	Salt          *string
}

type DatabaseBoardTimerUpdate struct {
	bun.BaseModel `bun:"table:boards"`
	ID            uuid.UUID
	TimerStart    *time.Time
	TimerEnd      *time.Time
}

type DatabaseBoardUpdate struct {
	bun.BaseModel         `bun:"table:boards"`
	ID                    uuid.UUID
	Name                  *string
	Description           *string
	AccessPolicy          *AccessPolicy
	Passphrase            *string
	Salt                  *string
	ShowAuthors           *bool
	ShowNotesOfOtherUsers *bool
	ShowNoteReactions     *bool
	AllowStacking         *bool
	IsLocked              *bool
	TimerStart            *time.Time
	TimerEnd              *time.Time
	SharedNote            uuid.NullUUID
	ShowVoting            uuid.NullUUID
}

type DatabaseFullBoard struct {
	Board                DatabaseBoard
	BoardSessions        []sessions.DatabaseBoardSession
	BoardSessionRequests []sessionrequests.DatabaseBoardSessionRequest
	Columns              []columns.DatabaseColumn
	Notes                []notes.DatabaseNote
	Reactions            []reactions.DatabaseReaction
	Votings              []votings.DatabaseVoting
	Votes                []votings.DatabaseVote
}
