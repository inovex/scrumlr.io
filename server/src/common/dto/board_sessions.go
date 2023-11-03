package dto

import (
	"net/http"
	"time"

	"github.com/google/uuid"
	"scrumlr.io/server/database"
	"scrumlr.io/server/database/types"
)

// BoardSession is the response for all participant requests.
type BoardSession struct {
	User User `json:"user"`

	// Flag indicates whether user is online and connected to the board.
	Connected bool `json:"connected"`

	// The configuration of visibility of columns.
	ShowHiddenColumns bool `json:"showHiddenColumns"`

	// Flag indicates whether user is marked as ready.
	Ready bool `json:"ready"`

	// Flag indicates whether user has raised his hand (...virtually).
	RaisedHand bool `json:"raisedHand"`

	// The role of the participant.
	//
	// Can be one of 'PARTICIPANT', 'MODERATOR' or 'OWNER'. Participants
	// can only view data, add notes and votes while the users with the other
	// roles are able to promote users, change board settings, edit columns,
	// start voting sessions etc.
	Role types.SessionRole `json:"role"`

	// Flag indicates whether the user is banned
	Banned bool `json:"banned"`

	CreatedAt time.Time `json:"CreatedAt"`
}

func (b *BoardSession) From(session database.BoardSession) *BoardSession {
	user := User{
		ID:     session.User,
		Name:   session.Name,
		Avatar: session.Avatar,
	}
	b.User = user
	b.Connected = session.Connected
	b.Ready = session.Ready
	b.RaisedHand = session.RaisedHand
	b.ShowHiddenColumns = session.ShowHiddenColumns
	b.Role = session.Role
	b.Banned = session.Banned
	b.CreatedAt = session.CreatedAt
	return b
}

func (*BoardSession) Render(_ http.ResponseWriter, _ *http.Request) error {
	return nil
}

func BoardSessions(sessions []database.BoardSession) []*BoardSession {
	if sessions == nil {
		return nil
	}

	list := make([]*BoardSession, len(sessions))
	for index, session := range sessions {
		list[index] = new(BoardSession).From(session)
	}
	return list
}

// BoardSessionUpdateRequest represents the request to update a single participant.
type BoardSessionUpdateRequest struct {

	// The configuration of visibility of columns.
	ShowHiddenColumns *bool `json:"showHiddenColumns"`

	// The ready state of the participant.
	Ready *bool `json:"ready"`

	// The raised hand state of the participant.
	RaisedHand *bool `json:"raisedHand"`

	// The role of the participant.
	//
	// Can be either 'PARTICIPANT', 'MODERATOR' or 'OWNER'.
	// Only moderators and owners can promote other participants. A regular participant is not
	// allowed to change the role.
	Role *types.SessionRole `json:"role"`

	// The banned state of the participant
	Banned *bool `json:"banned"`

	Board  uuid.UUID `json:"-"`
	User   uuid.UUID `json:"-"`
	Caller uuid.UUID `json:"-"`
}

// BoardSessionsUpdateRequest represents the request to update all participants.
type BoardSessionsUpdateRequest struct {
	// The ready state of the participant.
	Ready *bool `json:"ready"`

	// The raised hand state of the participant.
	RaisedHand *bool `json:"raisedHand"`

	Board uuid.UUID `json:"-"`
}
