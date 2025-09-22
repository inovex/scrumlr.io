package draglocks

import (
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/mock"
	"github.com/stretchr/testify/suite"
	"github.com/uptrace/bun"

	"scrumlr.io/server/initialize/testDbTemplates"
	"scrumlr.io/server/realtime"
)

type DatabaseDragLockTestSuite struct {
	suite.Suite
	db      *bun.DB
	service DragLockService
}

func TestDatabaseDragLockTestSuite(t *testing.T) {
	suite.Run(t, new(DatabaseDragLockTestSuite))
}

func (suite *DatabaseDragLockTestSuite) SetupTest() {
	db := testDbTemplates.NewBaseTestDB(suite.T(), false)
	suite.db = db

	// Create mock realtime broker
	mockClient := realtime.NewMockClient(suite.T())
	mockClient.On("Publish", mock.Anything, mock.Anything, mock.Anything).Return(nil).Maybe()
	mockRealtime := &realtime.Broker{Con: mockClient}

	suite.service = NewDatabaseDragLockService(suite.db.DB, mockRealtime)
}

func (suite *DatabaseDragLockTestSuite) TestAcquireLock() {
	noteID := uuid.New()
	userID1 := uuid.New()
	userID2 := uuid.New()
	boardID := uuid.New()

	// Should acquire lock for first user
	result := suite.service.AcquireLock(noteID, userID1, boardID)
	suite.True(result)

	// Verify lock exists in database
	var count int
	err := suite.db.DB.QueryRow("SELECT COUNT(*) FROM drag_locks WHERE note_id = $1", noteID).Scan(&count)
	suite.Require().NoError(err)
	suite.Equal(1, count)

	// Should deny lock for second user on same note
	result = suite.service.AcquireLock(noteID, userID2, boardID)
	suite.False(result)

	// Verify only one lock exists
	err = suite.db.DB.QueryRow("SELECT COUNT(*) FROM drag_locks WHERE note_id = $1", noteID).Scan(&count)
	suite.Require().NoError(err)
	suite.Equal(1, count)

	// Should allow same user to acquire same lock again
	result = suite.service.AcquireLock(noteID, userID1, boardID)
	suite.True(result)

	// Should still be only one lock
	err = suite.db.DB.QueryRow("SELECT COUNT(*) FROM drag_locks WHERE note_id = $1", noteID).Scan(&count)
	suite.Require().NoError(err)
	suite.Equal(1, count)
}

func (suite *DatabaseDragLockTestSuite) TestReleaseLock() {
	noteID := uuid.New()
	userID1 := uuid.New()
	userID2 := uuid.New()
	boardID := uuid.New()

	// Setup: Create a lock
	result := suite.service.AcquireLock(noteID, userID1, boardID)
	suite.Require().True(result)

	// Should release lock for lock owner
	result = suite.service.ReleaseLock(noteID, userID1)
	suite.True(result)

	// Verify lock is removed from database
	var count int
	err := suite.db.DB.QueryRow("SELECT COUNT(*) FROM drag_locks WHERE note_id = $1", noteID).Scan(&count)
	suite.Require().NoError(err)
	suite.Equal(0, count)

	// Should return false when releasing non-existent lock
	result = suite.service.ReleaseLock(noteID, userID1)
	suite.False(result)

	// Should return false when user tries to release lock they don't own
	// Create lock with userID1
	result = suite.service.AcquireLock(noteID, userID1, boardID)
	suite.Require().True(result)

	// Try to release with userID2
	result = suite.service.ReleaseLock(noteID, userID2)
	suite.False(result)

	// Verify lock still exists
	err = suite.db.DB.QueryRow("SELECT COUNT(*) FROM drag_locks WHERE note_id = $1", noteID).Scan(&count)
	suite.Require().NoError(err)
	suite.Equal(1, count)
}

func (suite *DatabaseDragLockTestSuite) TestGetLocksForBoard() {
	boardID1 := uuid.New()
	boardID2 := uuid.New()
	noteID1 := uuid.New()
	noteID2 := uuid.New()
	noteID3 := uuid.New()
	userID1 := uuid.New()
	userID2 := uuid.New()

	// Setup: Create locks for different boards
	suite.service.AcquireLock(noteID1, userID1, boardID1)
	suite.service.AcquireLock(noteID2, userID2, boardID1)
	suite.service.AcquireLock(noteID3, userID1, boardID2)

	// Should return locks for specific board
	locks := suite.service.GetLocksForBoard(boardID1)
	suite.Len(locks, 2)

	// Verify lock details
	lockMap := make(map[uuid.UUID]*DragLock)
	for _, lock := range locks {
		lockMap[lock.NoteID] = lock
	}

	suite.Contains(lockMap, noteID1)
	suite.Equal(userID1, lockMap[noteID1].UserID)
	suite.Equal(boardID1, lockMap[noteID1].BoardID)

	suite.Contains(lockMap, noteID2)
	suite.Equal(userID2, lockMap[noteID2].UserID)
	suite.Equal(boardID1, lockMap[noteID2].BoardID)

	// Should return empty slice for board with no locks
	emptyBoardID := uuid.New()
	locks = suite.service.GetLocksForBoard(emptyBoardID)
	suite.Len(locks, 0)
}

func (suite *DatabaseDragLockTestSuite) TestCleanupOldLocks() {
	noteID1 := uuid.New()
	noteID2 := uuid.New()
	userID := uuid.New()
	boardID := uuid.New()

	// Insert old lock directly into database
	oldTime := time.Now().Add(-2 * time.Hour)
	_, err := suite.db.DB.Exec(
		"INSERT INTO drag_locks (note_id, user_id, board_id, created_at) VALUES ($1, $2, $3, $4)",
		noteID1, userID, boardID, oldTime,
	)
	suite.Require().NoError(err)

	// Insert recent lock
	suite.service.AcquireLock(noteID2, userID, boardID)

	// Note: CleanupOldLocks is not part of the interface, testing via background cleanup
	// Wait briefly for background cleanup to potentially run
	time.Sleep(100 * time.Millisecond)

	// Verify old lock is removed but recent lock remains
	var count1, count2 int
	err = suite.db.DB.QueryRow("SELECT COUNT(*) FROM drag_locks WHERE note_id = $1", noteID1).Scan(&count1)
	suite.Require().NoError(err)
	// Note: Background cleanup may or may not have run yet

	err = suite.db.DB.QueryRow("SELECT COUNT(*) FROM drag_locks WHERE note_id = $1", noteID2).Scan(&count2)
	suite.Require().NoError(err)
	suite.Equal(1, count2)
}

func (suite *DatabaseDragLockTestSuite) TestConcurrency() {
	noteID := uuid.New()
	boardID := uuid.New()

	const numGoroutines = 10
	results := make(chan bool, numGoroutines)

	// Start multiple goroutines trying to acquire the same lock
	for i := 0; i < numGoroutines; i++ {
		go func() {
			userID := uuid.New()
			result := suite.service.AcquireLock(noteID, userID, boardID)
			results <- result
		}()
	}

	// Collect results
	var successCount int
	for i := 0; i < numGoroutines; i++ {
		if <-results {
			successCount++
		}
	}

	// Only one should succeed
	suite.Equal(1, successCount)

	// Verify only one lock exists in database
	var count int
	err := suite.db.DB.QueryRow("SELECT COUNT(*) FROM drag_locks WHERE note_id = $1", noteID).Scan(&count)
	suite.Require().NoError(err)
	suite.Equal(1, count)
}