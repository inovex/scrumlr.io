package database

import (
	"context"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
)

type Assignment struct {
	bun.BaseModel `bun:"table:assignments"`
	Board         uuid.UUID
	Note          uuid.UUID
	Name          string `bun:"name,notnull"`
	ID            uuid.UUID
}

type AssignmentInsert struct {
	bun.BaseModel `bun:"table:assignments"`
	Board         uuid.UUID
	Note          uuid.UUID
	Name          string `bun:"name,notnull"`
}

func (d *Database) CreateAssignment(insert AssignmentInsert) (Assignment, error) {
	var assignment Assignment
	_, err := d.writeDB.NewInsert().Model(&insert).Returning("*").Exec(common.ContextWithValues(context.Background(), "Database", d, "Board", insert.Board), &assignment)
	return assignment, err
}

func (d *Database) DeleteAssignment(board, assignment uuid.UUID) error {
	_, err := d.writeDB.NewDelete().Model((*Assignment)(nil)).Where("id = ?", assignment).Exec(common.ContextWithValues(context.Background(), "Database", d, "Board", board, "Assignment", assignment))
	return err

}
func (d *Database) GetAssignments(board uuid.UUID) ([]Assignment, error) {
	assignmentQuery := d.readDB.NewSelect().Model((*Assignment)(nil)).Where("board = ?", board)

	var assignments []Assignment
	err := assignmentQuery.Scan(context.Background(), &assignments)

	return assignments, err
}
