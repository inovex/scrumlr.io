package boards

import (
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/votings"
	"time"
)

// Board is the response for all board requests.
type Board struct {
	ID uuid.UUID `json:"id"`

	// The board name
	Name *string `json:"name,omitempty"`

	// Description of the board
	Description *string `json:"description"`

	// The access policy
	AccessPolicy AccessPolicy `json:"accessPolicy"`

	// The show authors
	ShowAuthors bool `json:"showAuthors"`

	// The show notes
	ShowNotesOfOtherUsers bool `json:"showNotesOfOtherUsers"`

	// show note reactions
	ShowNoteReactions bool `json:"showNoteReactions"`

	AllowStacking bool `json:"allowStacking"`

	IsLocked bool `json:"isLocked"`

	TimerStart *time.Time `json:"timerStart,omitempty"`
	TimerEnd   *time.Time `json:"timerEnd,omitempty"`

	// The id of a note to share with other users.
	// FIXME omitempty works only with nil in combination with pointers
	SharedNote uuid.NullUUID `json:"sharedNote,omitempty"`

	ShowVoting uuid.NullUUID `json:"showVoting,omitempty"`

	Passphrase *string `json:"-"`
	Salt       *string `json:"-"`
}

func (b *Board) From(board DatabaseBoard) *Board {
	b.ID = board.ID
	b.Name = board.Name
	b.Description = board.Description
	b.AccessPolicy = board.AccessPolicy
	b.ShowAuthors = board.ShowAuthors
	b.ShowNotesOfOtherUsers = board.ShowNotesOfOtherUsers
	b.ShowNoteReactions = board.ShowNoteReactions
	b.AllowStacking = board.AllowStacking
	b.IsLocked = board.IsLocked
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

	// Description of the board
	Description *string `json:"description"`

	AccessPolicy AccessPolicy `json:"accessPolicy"`

	// The passphrase must be set if access policy is defined as by passphrase.
	Passphrase *string `json:"passphrase"`

	// The columns to create for the board.
	Columns []columns.ColumnRequest `json:"columns"`

	Owner uuid.UUID `json:"-"`
}

type SetTimerRequest struct {
	Minutes uint8 `json:"minutes"`
}

// BoardUpdateRequest represents the request to update a board.
type BoardUpdateRequest struct {
	// The name of the board.
	Name *string `json:"name"`

	//Description of the board
	Description *string `json:"description"`

	// The new access policy of the board.
	AccessPolicy *AccessPolicy `json:"accessPolicy"`

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

	// Set whether changes to board should be allowed to all users or only moderators.
	IsLocked *bool `json:"isLocked"`

	// Set the timer start.
	TimerStart *time.Time `json:"timerStart"`
	// Set the timer end.
	TimerEnd *time.Time `json:"timerEnd"`

	// Set the note id of the note to share with other users.
	SharedNote uuid.NullUUID `json:"sharedNote"`

	ShowVoting uuid.NullUUID `json:"showVoting"`

	ID uuid.UUID `json:"-"`
}

type BoardOverview struct {
	Board        *Board    `json:"board"`
	Columns      int       `json:"columnsNumber"`
	CreatedAt    time.Time `json:"createdAt"`
	Participants int       `json:"participants"`
}

type ImportBoardRequest struct {
	Board   *CreateBoardRequest `json:"board"`
	Columns []columns.Column    `json:"columns"`
	Notes   []notes.Note        `json:"notes"`
	Votings []votings.Voting    `json:"votings"`
}

type FullBoard struct {
	Board                *Board                                 `json:"board"`
	BoardSessionRequests []*sessionrequests.BoardSessionRequest `json:"requests"`
	BoardSessions        []*sessions.BoardSession               `json:"participants"`
	Columns              []*columns.Column                      `json:"columns"`
	Notes                []*notes.Note                          `json:"notes"`
	Reactions            []*reactions.Reaction                  `json:"reactions"`
	Votings              []*votings.Voting                      `json:"votings"`
	Votes                []*votings.Vote                        `json:"votes"`
}

func (dtoFullBoard *FullBoard) From(dbFullBoard DatabaseFullBoard) *FullBoard {
	dtoFullBoard.Board = new(Board).From(dbFullBoard.Board)
	dtoFullBoard.BoardSessionRequests = sessionrequests.BoardSessionRequests(dbFullBoard.BoardSessionRequests)
	dtoFullBoard.BoardSessions = sessions.BoardSessions(dbFullBoard.BoardSessions)
	dtoFullBoard.Columns = columns.Columns(dbFullBoard.Columns)
	dtoFullBoard.Notes = notes.Notes(dbFullBoard.Notes)
	dtoFullBoard.Reactions = reactions.Reactions(dbFullBoard.Reactions)
	dtoFullBoard.Votings = votings.Votings(dbFullBoard.Votings, dbFullBoard.Votes)
	dtoFullBoard.Votes = votings.Votes(dbFullBoard.Votes)
	return dtoFullBoard
}
