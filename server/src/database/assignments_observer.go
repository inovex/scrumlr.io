package database

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type AssignmentsObserver interface {
  Observer

  UpdatedAssignments(board uuid.UUID, assignments []Assignment)
}

var _ bun.AfterInsertHook = (*AssignmentInsert)(nil)
var _ bun.AfterDeleteHook = (*Assignment)(nil)

func (*AssignmentInsert) AfterInsert(ctx context.Context, _ *bun.InsertQuery) error {
  return notifyAssignmentsUpdated(ctx)
}

func (*Assignment) AfterDelete(ctx context.Context, _ *bun.DeleteQuery) error {
  return notifyAssignmentsUpdated(ctx)
}

func notifyAssignmentsUpdated(ctx context.Context) error {
  fmt.Println("notifyAssignmentsUpdated")
	return nil
}
