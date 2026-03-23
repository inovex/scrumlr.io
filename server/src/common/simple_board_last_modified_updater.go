package common

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type BoardLastModifiedUpdater interface {
	UpdateLastModified(ctx context.Context, boardID uuid.UUID, time time.Time) error
}

type SimpleBoardLastModifiedUpdater struct {
	db *bun.DB
}

func NewSimpleBoardLastModifiedUpdater(db *bun.DB) BoardLastModifiedUpdater {
	return &SimpleBoardLastModifiedUpdater{db: db}
}

func (u *SimpleBoardLastModifiedUpdater) UpdateLastModified(ctx context.Context, boardID uuid.UUID, time time.Time) error {
	_, err := u.db.NewUpdate().
		Model((*DatabaseBoard)(nil)).
		Set("last_modified_at = ?", time).
		Where("id = ?", boardID).
		Exec(ctx)
	return err
}
