package database

import (
	"context"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Assignment struct {
	bun.BaseModel `bun:"table:assignments"`
	Board         uuid.UUID
	Note          uuid.UUID
	Name          string `bun:"name,notnull"`
	Id            uuid.UUID
}

type AssignmentInsert struct {
	bun.BaseModel `bun:"table:assignments"`
	Board         uuid.UUID
	Note          uuid.UUID
	Name          string `bun:"name,notnull"`
}

func (d *Database) CreateAssignment(insert AssignmentInsert) (Assignment, error) {
  var assignment Assignment
  _, err := d.db.NewInsert().Model(&insert).Returning("*").Exec(context.Background(), &assignment)
  return assignment, err
}

func (d *Database) DeleteAssignment(id uuid.UUID) (error) {
  _, err := d.db.NewDelete().Model((*Assignment)(nil)).Where("id = ?", id).Exec(context.Background())
  return err

}
func (d *Database) GetAssignments(board uuid.UUID) ([]Assignment, error) {
  assignmentQuery := d.db.NewSelect().Model((*Assignment)(nil)).Where("board = ?", board)

  var assignments []Assignment
  err := assignmentQuery.Scan(context.Background(), &assignments)

  return assignments, err
}

