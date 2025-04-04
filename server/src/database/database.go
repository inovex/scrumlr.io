package database

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/sessions"
)

// Database is the main class within this package and will be extended by several receiver functions
type Database struct {
	db          *bun.DB
	reactionsDb reactions.ReactionDatabase
	notesDB     notes.NotesDatabase
	votingsDB   votes.VotingDatabase
}

type FullBoard struct {
	Board                Board
	BoardSessions        []sessions.DatabaseBoardSession
	BoardSessionRequests []sessionrequests.DatabaseBoardSessionRequest
	Columns              []Column
	Notes                []notes.NoteDB
	Reactions            []reactions.DatabaseReaction
	Votings              []Voting
	Votes                []Vote
}

// New creates a new instance of Database
func New(db *bun.DB) *Database {
	d := new(Database)
	d.db = db
	d.reactionsDb = reactions.NewReactionsDatabase(db) //TODO remove
	d.votingsDB = votes.NewVotingDatabase(db)
	d.notesDB = notes.NewNotesDatabase(db)
	return d
}

func (d *Database) Get(id uuid.UUID) (FullBoard, error) {
	var (
		board     Board
		sessions  []BoardSession
		requests  []BoardSessionRequest
		columns   []Column
		notes     []notes.NoteDB
		reactions []reactions.DatabaseReaction
		votings   []Voting
		votes     []Vote
		err       error
	)
	type dataBaseOperation int

	/* The following const can be compared to an enum in Java
	iota allows for an automatic increment in Go */
	const (
		getBoard dataBaseOperation = iota
		getRequests
		getSessions
		getColumns
		getNotes
		getReactions
		getVotings
	)

	for op := getBoard; op <= getVotings; op++ {
		switch op {
		case getBoard:
			board, err = d.GetBoard(id)
		case getRequests:
			requests, err = d.sessionRequestDb.Gets(id)
		case getSessions:
			sessions, err = d.sessionDb.Gets(id)
		case getColumns:
			columns, err = d.GetColumns(id)
		case getNotes:
			notes, err = d.notesDB.GetNotes(id)
		case getReactions:
			reactions, err = d.reactionsDb.GetReactions(id)
		case getVotings:
			votings, votes, err = d.GetVotings(id)
		}
		if err != nil {
			return FullBoard{}, err
		}
	}
	return FullBoard{board, sessions, requests, columns, reactions, votings, votes}, nil
}
