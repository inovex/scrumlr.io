package database

import (
	"database/sql"
	"runtime"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/extra/bundebug"
)

// Database is the main class within this package and will be extended by several receiver functions
type Database struct {
	db *bun.DB
}

type FullBoard struct {
	Board Board
	BoardSessions []BoardSession
	BoardSessionRequests []BoardSessionRequest
	Columns []Column
	Notes []Note
	Reactions []Reaction
	Votings []Voting
	Votes []Vote
}

// New creates a new instance of Database
func New(db *sql.DB, verbose bool) *Database {
	d := new(Database)
	d.db = bun.NewDB(db, pgdialect.New())

	// configuration of database
	maxOpenConnections := 4 * runtime.GOMAXPROCS(0)
	d.db.SetMaxOpenConns(maxOpenConnections)
	d.db.SetMaxIdleConns(maxOpenConnections)

	if verbose {
		d.db.AddQueryHook(bundebug.NewQueryHook(bundebug.WithVerbose(true)))
	}

	return d
}

func (d *Database) Get(id uuid.UUID) (FullBoard, error) {
	var (
		board     Board
		sessions  []BoardSession
		requests  []BoardSessionRequest
		columns   []Column
		notes     []Note
		reactions []Reaction
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
			requests, err = d.GetBoardSessionRequests(id)
		case getSessions:
			sessions, err = d.GetBoardSessions(id)
		case getColumns:
			columns, err = d.GetColumns(id)
		case getNotes:
			notes, err = d.GetNotes(id)
		case getReactions:
			reactions, err = d.GetReactions(id)
		case getVotings:
			votings, votes, err = d.GetVotings(id)
		}
		if err != nil {
			return FullBoard{}, err
		}
	}
	return FullBoard{board, sessions,requests, columns, notes, reactions, votings, votes}, nil
}

