package database

import "context"

func (d *Database) IsHealthy() bool {
	var result int
	err := d.db.NewSelect().Model((*Board)(nil)).ModelTableExpr("").ColumnExpr("1").Scan(context.Background(), &result)
	if err != nil {
		return false
	}
	return true
}
