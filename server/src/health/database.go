package health

import (
	"context"

	"github.com/uptrace/bun"
)

type DB struct {
	db *bun.DB
}

func NewHealthDatabase(database *bun.DB) HealthDatabase {
	db := new(DB)
	db.db = database

	return db
}

func (db *DB) IsHealthy() bool {
	var result int
	err := db.db.NewSelect().
		Model((*DatabaseHealth)(nil)).
		ModelTableExpr("").
		ColumnExpr("1").
		Scan(context.Background(), &result)

	return err == nil
}
