package database

import (
	"context"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type AssignmentsObserver interface {
  Observer

  UpdatedAssignments(board uuid.UUID, assignments []Assignment)
  DeletedAssignment(board uuid.UUID, assignment uuid.UUID)
}

var _ bun.AfterInsertHook = (*AssignmentInsert)(nil)
var _ bun.AfterDeleteHook = (*Assignment)(nil)

func (*AssignmentInsert) AfterInsert(ctx context.Context, _ *bun.InsertQuery) error {
  return notifyAssignmentsUpdated(ctx)
}

func (*Assignment) AfterDelete(ctx context.Context, _ *bun.DeleteQuery) error {
  return notifyAssignmentDeleted(ctx)
}

func notifyAssignmentsUpdated(ctx context.Context) error {
  if ctx.Value("Database") == nil {
    return nil
  }
  d := ctx.Value("Database").(*Database)
  if len(d.observer) > 0 {
    board := ctx.Value("Board").(uuid.UUID)
    assignments, err := d.GetAssignments(board)
    if err != nil {
      return err
    }
    for _, observer := range d.observer {
      if o, ok := observer.(AssignmentsObserver); ok {
        o.UpdatedAssignments(board, assignments)
        return nil
      }
    }
  }
	return nil
}

func notifyAssignmentDeleted(ctx context.Context) error {
  if ctx.Value("Database") == nil {
    return nil
  }
  d := ctx.Value("Database").(*Database)
  if len(d.observer) > 0 {
    board := ctx.Value("Board").(uuid.UUID)
    assignment := ctx.Value("Assignment").(uuid.UUID)
    for _, observer := range d.observer {
      if o, ok := observer.(AssignmentsObserver); ok {
        o.DeletedAssignment(board, assignment)
        return nil
      }
    }
  }
  return nil
}
