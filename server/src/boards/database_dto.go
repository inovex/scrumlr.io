package boards

import (
	"time"

	"uuid"

	"github.com/uptrace/bun"
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
	SharedNote            *uuid.UUID
	ShowVoting            *uuid.UUID
	LastModifiedAt        time.Time
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
	SharedNote            *uuid.UUID
	ShowVoting            *uuid.UUID
	LastModifiedAt        time.Time
}

type DatabaseBoardPassphraseUpdate struct {
	bun.BaseModel `bun:"table:boards"`
	ID            uuid.UUID
	Passphrase    string
	Salt          string
}
