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
	db       *bun.DB
	observer []Observer
}

// New creates a new instance of Database
func New(db *sql.DB, verbose bool) *Database {
	d := new(Database)
	d.db = bun.NewDB(db, pgdialect.New())
	d.observer = []Observer{}

	// configuration of database
	maxOpenConnections := 4 * runtime.GOMAXPROCS(0)
	d.db.SetMaxOpenConns(maxOpenConnections)
	d.db.SetMaxIdleConns(maxOpenConnections)

	if verbose {
		d.db.AddQueryHook(bundebug.NewQueryHook(bundebug.WithVerbose(true)))
	}

	return d
}

func (d *Database) Get(id uuid.UUID) (Board, []BoardSessionRequest, []BoardSession, []Column, []Note, []Voting, []Vote, error) {
	var board Board
	var sessions []BoardSession
	var requests []BoardSessionRequest
	var columns []Column
	var notes []Note
	var votings []Voting
	var votes []Vote
	var err error

	board, err = d.GetBoard(id)
	if err != nil {
		return Board{}, nil, nil, nil, nil, nil, nil, err
	}

	requests, err = d.GetBoardSessionRequests(id)
	if err != nil {
		return Board{}, nil, nil, nil, nil, nil, nil, err
	}

	sessions, err = d.GetBoardSessions(id)
	if err != nil {
		return Board{}, nil, nil, nil, nil, nil, nil, err
	}

	columns, err = d.GetColumns(id)
	if err != nil {
		return Board{}, nil, nil, nil, nil, nil, nil, err
	}

	notes, err = d.GetNotes(id)
	if err != nil {
		return Board{}, nil, nil, nil, nil, nil, nil, err
	}

	votings, votes, err = d.GetVotings(id)
	if err != nil {
		return Board{}, nil, nil, nil, nil, nil, nil, err
	}

	return board, requests, sessions, columns, notes, votings, votes, err
}
