package database

import (
	"context"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common/filter"
)

type Assign struct {
	bun.BaseModel `bun:"table:assignings"`
	Board         uuid.UUID
	Note          uuid.UUID
	Name          string `bun:"name,notnull"`
	Id            uuid.UUID
}

func (d *Database) AddAssign(board uuid.UUID, note uuid.UUID, name string, id uuid.UUID) (Assign, error) {
	
	values := d.db.NewSelect().
		ColumnExpr("uuid(?) as board", board).
		ColumnExpr("uuid(?) as note", note).
		ColumnExpr("string(?) as \"name\"", name).
		ColumnExpr("uuid(?) as id", id)

	var result Assign
	insert := Assign{Board: board, Note: note, Name: name, Id: id}
	_, err := d.db.NewInsert().
		With("_values", values).
		Model(&insert).
		TableExpr("_values").
		Column("board", "voting", "note", "name", "id").
		Returning("*").
		Exec(context.Background(), &result)

	return result, err
}

func (d *Database) RemoveAssign(board uuid.UUID, note uuid.UUID, name string, id uuid.UUID) error {

	deleteQuery := Assign{Board: board, Note: note, Name: name, Id: id}
	_, err := d.db.NewDelete().
		Model(&deleteQuery).
		Exec(context.Background())

	return err
}

func (d *Database) GetAssignings(f filter.AssignFilter) ([]Assign, error) {
	assignQuery := d.db.NewSelect().Model((*Assign)(nil)).Where("board = ?", f.Board)

	if f.Note != nil {
		assignQuery = assignQuery.Where("note = ?", *f.Note)
	}
	if f.Name != "" {
		assignQuery = assignQuery.Where("\"name\" = ?", *&f.Name)
	}
	if f.Id != nil {
		assignQuery = assignQuery.Where("\"id\" = ?", *&f.Id)
	}

	var assignings []Assign
	err := assignQuery.Scan(context.Background(), &assignings)

	return assignings, err
}
