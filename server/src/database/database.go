package database

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/voting"

	"scrumlr.io/server/reactions"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/sessions"
)

// Database is the main class within this package and will be extended by several receiver functions
type Database struct {
	db               *bun.DB
	reactionsDb      reactions.ReactionDatabase
	sessionDb        sessions.SessionDatabase
	sessionRequestDb sessionrequests.SessionRequestDatabase
	votingDB         voting.VotingDatabase
}

type FullBoard struct {
	Board                Board
	BoardSessions        []sessions.DatabaseBoardSession
	BoardSessionRequests []sessionrequests.DatabaseBoardSessionRequest
	Columns              []Column
	Notes                []Note
	Reactions            []reactions.DatabaseReaction
	Votings              []voting.VotingDB
	Votes                []voting.VoteDB
}

// New creates a new instance of Database
func New(db *bun.DB) *Database {
	d := new(Database)
	d.db = db
	// TODO Remove these databases.
	// These need to exists for now because we still need full access to all tables
	d.reactionsDb = reactions.NewReactionsDatabase(db)
	d.sessionDb = sessions.NewSessionDatabase(db)
	d.sessionRequestDb = sessionrequests.NewSessionRequestDatabase(db)
	d.votingDB = voting.NewVotingDatabase(db) //todo remove? since we initialize in Initialize package

	return d
}

func (d *Database) Get(id uuid.UUID) (FullBoard, error) {
	var (
		board     Board
		sessions  []sessions.DatabaseBoardSession
		requests  []sessionrequests.DatabaseBoardSessionRequest
		columns   []Column
		notes     []Note
		reactions []reactions.DatabaseReaction
		votings   []voting.VotingDB
		votes     []voting.VoteDB
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
			notes, err = d.GetNotes(id)
		case getReactions:
			reactions, err = d.reactionsDb.GetAll(id)
		case getVotings:
			votings, votes, err = d.votingDB.GetVotings(id)
		}
		if err != nil {
			return FullBoard{}, err
		}
	}
	return FullBoard{board, sessions, requests, columns, notes, reactions, votings, votes}, nil
}
