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
	readDB   *bun.DB
	writeDB  *bun.DB
	observer []Observer
}

// New creates a new instance of Database
func New(readDB *sql.DB, writeDB *sql.DB, verbose bool) *Database {
	d := new(Database)
	d.readDB = bun.NewDB(readDB, pgdialect.New())
	d.writeDB = bun.NewDB(writeDB, pgdialect.New())
	d.observer = []Observer{}

	// configuration of database
	maxOpenConnections := 4 * runtime.GOMAXPROCS(0)
	d.readDB.SetMaxOpenConns(maxOpenConnections / 2)
	d.readDB.SetMaxIdleConns(maxOpenConnections / 2)
	d.writeDB.SetMaxOpenConns(maxOpenConnections / 2)
	d.writeDB.SetMaxIdleConns(maxOpenConnections / 2)

	if verbose {
		d.readDB.AddQueryHook(bundebug.NewQueryHook(bundebug.WithVerbose(true)))
		d.writeDB.AddQueryHook(bundebug.NewQueryHook(bundebug.WithVerbose(true)))
	}

	return d
}

func (d *Database) Get(id uuid.UUID) (Board, []BoardSessionRequest, []BoardSession, []Column, []Note, []Reaction, []Voting, []Vote, []Assignment, error) {
	var board Board
	var sessions []BoardSession
	var requests []BoardSessionRequest
	var columns []Column
	var notes []Note
	var reactions []Reaction
	var votings []Voting
	var votes []Vote
	var assignments []Assignment
	var err error

	board, err = d.GetBoard(id)
	if err != nil {
		return Board{}, nil, nil, nil, nil, nil, nil, nil, nil, err
	}

	requests, err = d.GetBoardSessionRequests(id)
	if err != nil {
		return Board{}, nil, nil, nil, nil, nil, nil, nil, nil, err
	}

	sessions, err = d.GetBoardSessions(id)
	if err != nil {
		return Board{}, nil, nil, nil, nil, nil, nil, nil, nil, err
	}

	columns, err = d.GetColumns(id)
	if err != nil {
		return Board{}, nil, nil, nil, nil, nil, nil, nil, nil, err
	}

	notes, err = d.GetNotes(id)
	if err != nil {
		return Board{}, nil, nil, nil, nil, nil, nil, nil, nil, err
	}

	reactions, err = d.GetReactions(id)
	if err != nil {
		return Board{}, nil, nil, nil, nil, nil, nil, nil, nil, err
	}

	votings, votes, err = d.GetVotings(id)
	if err != nil {
		return Board{}, nil, nil, nil, nil, nil, nil, nil, nil, err
	}

	assignments, err = d.GetAssignments(id)
	if err != nil {
		return Board{}, nil, nil, nil, nil, nil, nil, nil, nil, err
	}

	return board, requests, sessions, columns, notes, reactions, votings, votes, assignments, err
}
