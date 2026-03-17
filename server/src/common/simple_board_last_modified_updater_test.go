package common

import (
	"context"
	"errors"
	"fmt"
	"testing"

	"github.com/DATA-DOG/go-sqlmock"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/uptrace/bun"
	"github.com/uptrace/bun/dialect/pgdialect"
)

func TestNewSimpleBoardLastModifiedUpdater(t *testing.T) {
	sqlDB, mock, err := sqlmock.New()
	require.NoError(t, err)

	db := bun.NewDB(sqlDB, pgdialect.New())
	t.Cleanup(func() {
		mock.ExpectClose()
		require.NoError(t, db.Close())
		require.NoError(t, mock.ExpectationsWereMet())
	})

	updater := NewSimpleBoardLastModifiedUpdater(db)
	require.NotNil(t, updater)
	_, ok := updater.(*SimpleBoardLastModifiedUpdater)
	assert.True(t, ok)
}

func TestSimpleBoardLastModifiedUpdater_UpdateLastModified(t *testing.T) {
	tests := map[string]struct {
		prepareMock func(mock sqlmock.Sqlmock, boardID uuid.UUID)
		wantErr     error
	}{
		"successfully updates board last_modified_at": {
			prepareMock: func(mock sqlmock.Sqlmock, boardID uuid.UUID) {
				mock.ExpectExec(fmt.Sprintf(`UPDATE "boards" AS "board" SET last_modified_at = '.*' WHERE \(id = '%s'\)`, boardID)).
					WillReturnResult(sqlmock.NewResult(0, 1))
			},
		},
		"returns database error": {
			wantErr: errors.New("update failed"),
			prepareMock: func(mock sqlmock.Sqlmock, boardID uuid.UUID) {
				mock.ExpectExec(fmt.Sprintf(`UPDATE "boards" AS "board" SET last_modified_at = '.*' WHERE \(id = '%s'\)`, boardID)).
					WillReturnError(errors.New("update failed"))
			},
		},
	}

	for name, test := range tests {
		test := test
		t.Run(name, func(t *testing.T) {
			sqlDB, mock, err := sqlmock.New()
			require.NoError(t, err)

			db := bun.NewDB(sqlDB, pgdialect.New())
			t.Cleanup(func() {
				mock.ExpectClose()
				require.NoError(t, db.Close())
				require.NoError(t, mock.ExpectationsWereMet())
			})

			updater := &SimpleBoardLastModifiedUpdater{db: db}
			boardID := uuid.New()

			test.prepareMock(mock, boardID)

			err = updater.UpdateLastModified(context.Background(), boardID)
			if test.wantErr != nil {
				require.Error(t, err)
				assert.Equal(t, test.wantErr.Error(), err.Error())
			} else {
				require.NoError(t, err)
			}
		})
	}
}
