package technical_helper

import (
	"database/sql"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
	"github.com/uptrace/bun/extra/bundebug"
	"runtime"
)

type Database struct {
	db *bun.DB
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
