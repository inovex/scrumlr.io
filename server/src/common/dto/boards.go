package dto

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"scrumlr.io/server/database"
	"scrumlr.io/server/database/types"
)

// Board is the response for all board requests.
type Board struct {
	ID uuid.UUID `json:"id"`

	// The board name
	Name *string `json:"name,omitempty"`

	// The access policy
	AccessPolicy types.AccessPolicy `json:"accessPolicy"`

	// The show authors
	ShowAuthors bool `json:"showAuthors"`

	// The show notes
	ShowNotesOfOtherUsers bool `json:"showNotesOfOtherUsers"`

	// show note reactions
	ShowNoteReactions bool `json:"showNoteReactions"`

	AllowStacking bool `json:"allowStacking"`

	TimerStart *time.Time `json:"timerStart,omitempty"`
	TimerEnd   *time.Time `json:"timerEnd,omitempty"`

	// The id of a note to share with other users.
	// FIXME omitempty works only with nil in combination with pointers
	SharedNote uuid.NullUUID `json:"sharedNote,omitempty"`

	ShowVoting uuid.NullUUID `json:"showVoting,omitempty"`

	Passphrase *string `json:"-"`
	Salt       *string `json:"-"`
}

func (b *Board) From(board database.Board) *Board {
	b.ID = board.ID
	b.Name = board.Name
	b.AccessPolicy = board.AccessPolicy
	b.ShowAuthors = board.ShowAuthors
	b.ShowNotesOfOtherUsers = board.ShowNotesOfOtherUsers
	b.ShowNoteReactions = board.ShowNoteReactions
	b.AllowStacking = board.AllowStacking
	b.SharedNote = board.SharedNote
	b.ShowVoting = board.ShowVoting
	b.TimerStart = board.TimerStart
	b.TimerEnd = board.TimerEnd
	b.Passphrase = board.Passphrase
	b.Salt = board.Salt
	return b
}

func (*Board) Render(_ http.ResponseWriter, _ *http.Request) error {
	return nil
}

// CreateBoardRequest represents the request to create a new board.
type CreateBoardRequest struct {
	// The name of the board.
	Name *string `json:"name"`

	AccessPolicy types.AccessPolicy `json:"accessPolicy"`

	// The passphrase must be set if access policy is defined as by passphrase.
	Passphrase *string `json:"passphrase"`

	// The columns to create for the board.
	Columns []ColumnRequest `json:"columns"`

	Owner uuid.UUID `json:"-"`
}

type SetTimerRequest struct {
	Minutes uint8 `json:"minutes"`
}

// BoardUpdateRequest represents the request to update a board.
type BoardUpdateRequest struct {
	// The name of the board.
	Name *string `json:"name"`

	// The new access policy of the board.
	AccessPolicy *types.AccessPolicy `json:"accessPolicy"`

	// The passphrase of the board.
	Passphrase *string `json:"passphrase"`

	// Set whether authors of notes should be shown to all users.
	ShowAuthors *bool `json:"showAuthors"`

	// Set whether notes of other users should be visible for everyone else.
	ShowNotesOfOtherUsers *bool `json:"showNotesOfOtherUsers"`

	// Set whether note reactions should be shown to all users.
	ShowNoteReactions *bool `json:"showNoteReactions"`

	// Set whether stacking should be allowed to all users or only moderators.
	AllowStacking *bool `json:"allowStacking"`

	// Set the timer start.
	TimerStart *time.Time `json:"timerStart"`
	// Set the timer end.
	TimerEnd *time.Time `json:"timerEnd"`

	// Set the note id of the note to share with other users.
	SharedNote uuid.NullUUID `json:"sharedNote"`

	ShowVoting uuid.NullUUID `json:"showVoting"`

	ID uuid.UUID `json:"-"`
}

type BoardWithDetails struct {
	Board        *Board    `json:"board"`
	Columns      []*Column `json:"columns"`
	CreatedAt    time.Time `json:"createdAt"`
	Participants int       `json:"participants"`
}
