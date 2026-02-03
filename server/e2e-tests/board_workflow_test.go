package e2e

import (
	"errors"
	"testing"
	"time"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"scrumlr.io/server/boards"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/users"
	"scrumlr.io/server/votings"
)

// Helper functions for pointers
func ptr[T any](v T) *T { return &v }

// E2ESuite is the main test suite for e2e tests.
type E2ESuite struct {
	suite.Suite
	cfg    *E2ETestConfig
	client *Client
}

func (s *E2ESuite) SetupSuite() {
	cfg, err := LoadConfig()
	require.NoError(s.T(), err, "Failed to load config")
	s.cfg = cfg
	s.T().Logf("Running e2e tests against: %s", cfg.Server.BaseURL)
}

func (s *E2ESuite) SetupTest() {
	s.client = NewClient(s.cfg)
}

func TestE2ESuite(t *testing.T) {
	suite.Run(t, new(E2ESuite))
}

// --- Health & Basic Tests ---

func (s *E2ESuite) TestHealthCheck() {
	err := s.client.Health()
	assert.NoError(s.T(), err)
}

// --- Login Tests ---

func (s *E2ESuite) TestAnonymousLogin() {
	user, err := s.client.LoginAnonymous(s.cfg.Users.Default.Name)
	require.NoError(s.T(), err)
	assert.NotEqual(s.T(), uuid.Nil, user.ID)
	assert.Equal(s.T(), s.cfg.Users.Default.Name, user.Name)
}

func (s *E2ESuite) TestAnonymousLoginTrimName() {
	user, err := s.client.LoginAnonymous("  John Doe  ")
	require.NoError(s.T(), err)
	assert.Equal(s.T(), "John Doe", user.Name, "Name should be trimmed")
}

func (s *E2ESuite) TestUnauthorizedAccess() {
	_, err := s.client.do("GET", "/boards", nil, nil)
	assert.Error(s.T(), err)
	var apiErr APIError
	ok := errors.As(err, &apiErr)
	require.True(s.T(), ok, "Expected APIError")
	assert.Equal(s.T(), 401, apiErr.StatusCode)
}

// --- User Tests ---

func (s *E2ESuite) TestGetUser() {
	_, err := s.client.LoginAnonymous("Test User")
	require.NoError(s.T(), err)

	user, err := s.client.GetUser()
	require.NoError(s.T(), err)
	assert.Equal(s.T(), "Test User", user.Name)
}

func (s *E2ESuite) TestUpdateUser() {
	_, err := s.client.LoginAnonymous("Original Name")
	require.NoError(s.T(), err)

	user, err := s.client.UpdateUser(users.UserUpdateRequest{Name: "Updated Name"})
	require.NoError(s.T(), err)
	assert.Equal(s.T(), "Updated Name", user.Name)
}

// --- Board Workflow Tests ---

func (s *E2ESuite) TestBoardWorkflow() {
	user, err := s.client.LoginAnonymous(s.cfg.Users.Moderator.Name)
	require.NoError(s.T(), err)
	s.T().Logf("Logged in as: %s (%s)", user.Name, user.ID)

	cols := []columns.ColumnRequest{
		{Name: "Positive", Color: columns.ColorGoalGreen, Visible: ptr(true)},
		{Name: "Negative", Color: columns.ColorOnlineOrange, Visible: ptr(true)},
		{Name: "Actions", Color: columns.ColorPlanningPink, Visible: ptr(true)},
	}

	board, err := s.client.CreateBoard(boards.CreateBoardRequest{
		Name:         ptr("E2E Test Board"),
		AccessPolicy: boards.Public,
		Columns:      cols,
	})
	require.NoError(s.T(), err)
	require.NotEqual(s.T(), uuid.Nil, board.ID)
	s.T().Logf("Created board: %s", board.ID)

	defer func() {
		err := s.client.DeleteBoard(board.ID)
		assert.NoError(s.T(), err, "Failed to delete board")
	}()

	fetchedBoard, err := s.client.GetBoard(board.ID)
	require.NoError(s.T(), err)
	assert.Equal(s.T(), board.ID, fetchedBoard.ID)

	fetchedCols, err := s.client.GetColumns(board.ID)
	require.NoError(s.T(), err)
	assert.Len(s.T(), fetchedCols, 3)

	require.NotEmpty(s.T(), fetchedCols)
	firstColumn := fetchedCols[0]

	note, err := s.client.CreateNote(board.ID, notes.NoteCreateRequest{
		Column: firstColumn.ID,
		Text:   "This is a test note from e2e tests",
	})
	require.NoError(s.T(), err)
	assert.NotEqual(s.T(), uuid.Nil, note.ID)
	s.T().Logf("Created note: %s", note.ID)

	fetchedNotes, err := s.client.GetNotes(board.ID)
	require.NoError(s.T(), err)
	assert.GreaterOrEqual(s.T(), len(fetchedNotes), 1)
}

func (s *E2ESuite) TestCreateBoardWithPassphrase() {
	_, err := s.client.LoginAnonymous(s.cfg.Users.Default.Name)
	require.NoError(s.T(), err)

	board, err := s.client.CreateBoard(boards.CreateBoardRequest{
		Name:         ptr("Protected Board"),
		AccessPolicy: boards.ByPassphrase,
		Passphrase:   ptr("secret123"),
		Columns: []columns.ColumnRequest{
			{Name: "Ideas", Color: columns.ColorBacklogBlue, Visible: ptr(true)},
		},
	})
	require.NoError(s.T(), err)
	assert.Equal(s.T(), boards.ByPassphrase, board.AccessPolicy)

	err = s.client.DeleteBoard(board.ID)
	assert.NoError(s.T(), err)
}

func (s *E2ESuite) TestUpdateBoard() {
	_, err := s.client.LoginAnonymous(s.cfg.Users.Default.Name)
	require.NoError(s.T(), err)

	board, err := s.client.CreateBoard(boards.CreateBoardRequest{
		Name:         ptr("Original Name"),
		AccessPolicy: boards.Public,
	})
	require.NoError(s.T(), err)
	defer func() {
		err := s.client.DeleteBoard(board.ID)
		assert.NoError(s.T(), err, "Failed to delete board")
	}()

	updated, err := s.client.UpdateBoard(board.ID, boards.BoardUpdateRequest{Name: ptr("Updated Name")})
	require.NoError(s.T(), err)
	assert.Equal(s.T(), "Updated Name", *updated.Name)

	updated, err = s.client.UpdateBoard(board.ID, boards.BoardUpdateRequest{Description: ptr("New description")})
	require.NoError(s.T(), err)
	assert.Equal(s.T(), "New description", *updated.Description)
}

func (s *E2ESuite) TestGetBoards() {
	_, err := s.client.LoginAnonymous(s.cfg.Users.Default.Name)
	require.NoError(s.T(), err)

	board, err := s.client.CreateBoard(boards.CreateBoardRequest{
		Name:         ptr("List Test Board"),
		AccessPolicy: boards.Public,
	})
	require.NoError(s.T(), err)
	defer func() {
		err := s.client.DeleteBoard(board.ID)
		assert.NoError(s.T(), err, "Failed to delete board")
	}()

	boardList, err := s.client.GetBoards()
	require.NoError(s.T(), err)
	assert.GreaterOrEqual(s.T(), len(boardList), 1)
}

// --- Timer Tests ---

func (s *E2ESuite) TestTimerOperations() {
	_, err := s.client.LoginAnonymous(s.cfg.Users.Default.Name)
	require.NoError(s.T(), err)

	board, err := s.client.CreateBoard(boards.CreateBoardRequest{
		Name:         ptr("Timer Test Board"),
		AccessPolicy: boards.Public,
	})
	require.NoError(s.T(), err)
	defer func() {
		err := s.client.DeleteBoard(board.ID)
		assert.NoError(s.T(), err, "Failed to delete board")
	}()

	board, err = s.client.SetTimer(board.ID, 5)
	require.NoError(s.T(), err)
	require.Equal(s.T(), board.TimerStart.Add(time.Minute*5), *board.TimerEnd)

	// increment a running timer only adds one minute to the timerEnd
	board, err = s.client.IncrementTimer(board.ID)
	require.NoError(s.T(), err)
	require.Equal(s.T(), board.TimerStart.Add(time.Minute*6), *board.TimerEnd)

	board, err = s.client.DeleteTimer(board.ID)
	assert.NoError(s.T(), err)
	require.Nil(s.T(), board.TimerStart)
	require.Nil(s.T(), board.TimerEnd)
}

// --- Column Tests ---

func (s *E2ESuite) TestColumnOperations() {
	_, err := s.client.LoginAnonymous(s.cfg.Users.Default.Name)
	require.NoError(s.T(), err)

	board, err := s.client.CreateBoard(boards.CreateBoardRequest{
		Name:         ptr("Column Test Board"),
		AccessPolicy: boards.Public,
	})
	require.NoError(s.T(), err)
	defer func() {
		err := s.client.DeleteBoard(board.ID)
		assert.NoError(s.T(), err, "Failed to delete board")
	}()

	column, err := s.client.CreateColumn(board.ID, columns.ColumnRequest{
		Name:    "New Column",
		Color:   columns.ColorBacklogBlue,
		Visible: ptr(true),
		Index:   ptr(0),
	})
	require.NoError(s.T(), err)
	assert.Equal(s.T(), "New Column", column.Name)

	fetched, err := s.client.GetColumn(board.ID, column.ID)
	require.NoError(s.T(), err)
	assert.Equal(s.T(), column.ID, fetched.ID)

	updated, err := s.client.UpdateColumn(board.ID, column.ID, columns.ColumnUpdateRequest{
		Name:    "Renamed Column",
		Color:   columns.ColorPlanningPink,
		Visible: true,
		Index:   0,
	})
	require.NoError(s.T(), err)
	assert.Equal(s.T(), "Renamed Column", updated.Name)

	err = s.client.DeleteColumn(board.ID, column.ID)
	assert.NoError(s.T(), err)
}

// --- Note Tests ---

func (s *E2ESuite) TestNoteOperations() {
	_, err := s.client.LoginAnonymous(s.cfg.Users.Default.Name)
	require.NoError(s.T(), err)

	board, err := s.client.CreateBoard(boards.CreateBoardRequest{
		Name:         ptr("Note Test Board"),
		AccessPolicy: boards.Public,
		Columns: []columns.ColumnRequest{
			{Name: "Column", Color: columns.ColorBacklogBlue, Visible: ptr(true)},
		},
	})
	require.NoError(s.T(), err)
	defer func() {
		err := s.client.DeleteBoard(board.ID)
		assert.NoError(s.T(), err, "Failed to delete board")
	}()

	cols, err := s.client.GetColumns(board.ID)
	require.NoError(s.T(), err)
	require.NotEmpty(s.T(), cols)

	note, err := s.client.CreateNote(board.ID, notes.NoteCreateRequest{
		Column: cols[0].ID,
		Text:   "Original text",
	})
	require.NoError(s.T(), err)

	fetched, err := s.client.GetNote(board.ID, note.ID)
	require.NoError(s.T(), err)
	assert.Equal(s.T(), "Original text", fetched.Text)

	updated, err := s.client.UpdateNote(board.ID, note.ID, notes.NoteUpdateRequest{
		Text: ptr("Updated text"),
	})
	require.NoError(s.T(), err)
	assert.Equal(s.T(), "Updated text", updated.Text)

	err = s.client.DeleteNote(board.ID, note.ID, notes.NoteDeleteRequest{
		DeleteStack: false,
	})
	assert.NoError(s.T(), err)
}

// --- Voting Tests ---

func (s *E2ESuite) TestVotingWorkflow() {
	_, err := s.client.LoginAnonymous(s.cfg.Users.Default.Name)
	require.NoError(s.T(), err)

	board, err := s.client.CreateBoard(boards.CreateBoardRequest{
		Name:         ptr("Voting Test Board"),
		AccessPolicy: boards.Public,
		Columns: []columns.ColumnRequest{
			{Name: "Ideas", Color: columns.ColorBacklogBlue, Visible: ptr(true)},
		},
	})
	require.NoError(s.T(), err)
	defer func() {
		err := s.client.DeleteBoard(board.ID)
		assert.NoError(s.T(), err, "Failed to delete board")
	}()

	cols, err := s.client.GetColumns(board.ID)
	require.NoError(s.T(), err)

	note, err := s.client.CreateNote(board.ID, notes.NoteCreateRequest{
		Column: cols[0].ID,
		Text:   "Vote for me",
	})
	require.NoError(s.T(), err)

	voting, err := s.client.CreateVoting(board.ID, votings.VotingCreateRequest{
		VoteLimit:          5,
		AllowMultipleVotes: true,
		ShowVotesOfOthers:  true,
	})
	require.NoError(s.T(), err)
	assert.Equal(s.T(), votings.Open, voting.Status)

	votingList, err := s.client.GetVotings(board.ID)
	require.NoError(s.T(), err)
	assert.GreaterOrEqual(s.T(), len(votingList), 1)

	err = s.client.AddVote(board.ID, votings.VoteRequest{Note: note.ID})
	require.NoError(s.T(), err)

	voteList, err := s.client.GetVotes(board.ID)
	require.NoError(s.T(), err)
	assert.GreaterOrEqual(s.T(), len(voteList), 1)

	err = s.client.RemoveVote(board.ID, votings.VoteRequest{Note: note.ID})
	require.NoError(s.T(), err)

	closed, err := s.client.CloseVoting(board.ID, voting.ID)
	require.NoError(s.T(), err)
	assert.Equal(s.T(), votings.Closed, closed.Status)
}

// --- Reaction Tests ---

func (s *E2ESuite) TestReactionOperations() {
	_, err := s.client.LoginAnonymous(s.cfg.Users.Default.Name)
	require.NoError(s.T(), err)

	board, err := s.client.CreateBoard(boards.CreateBoardRequest{
		Name:         ptr("Reaction Test Board"),
		AccessPolicy: boards.Public,
		Columns: []columns.ColumnRequest{
			{Name: "Column", Color: columns.ColorBacklogBlue, Visible: ptr(true)},
		},
	})
	require.NoError(s.T(), err)
	defer func() {
		err := s.client.DeleteBoard(board.ID)
		assert.NoError(s.T(), err, "Failed to delete board")
	}()

	cols, err := s.client.GetColumns(board.ID)
	require.NoError(s.T(), err)

	note, err := s.client.CreateNote(board.ID, notes.NoteCreateRequest{
		Column: cols[0].ID,
		Text:   "React to me",
	})
	require.NoError(s.T(), err)

	reaction, err := s.client.CreateReaction(board.ID, reactions.ReactionCreateRequest{
		Note:         note.ID,
		ReactionType: reactions.Thinking,
	})
	require.NoError(s.T(), err)

	reactionList, err := s.client.GetReactions(board.ID)
	require.NoError(s.T(), err)
	assert.GreaterOrEqual(s.T(), len(reactionList), 1)

	updated, err := s.client.UpdateReaction(board.ID, reaction.ID, reactions.ReactionUpdateTypeRequest{
		ReactionType: reactions.Heart,
	})
	require.NoError(s.T(), err)
	assert.Equal(s.T(), reactions.Heart, updated.ReactionType)

	err = s.client.DeleteReaction(board.ID, reaction.ID)
	assert.NoError(s.T(), err)
}

// --- Multi-User Tests ---

func (s *E2ESuite) TestMultipleUsersOnBoard() {
	moderatorClient := NewClient(s.cfg)
	_, err := moderatorClient.LoginAnonymous(s.cfg.Users.Moderator.Name)
	require.NoError(s.T(), err)

	board, err := moderatorClient.CreateBoard(boards.CreateBoardRequest{
		Name:         ptr("Multi-User Board"),
		AccessPolicy: boards.Public,
		Columns: []columns.ColumnRequest{
			{Name: "Ideas", Color: columns.ColorBacklogBlue, Visible: ptr(true)},
		},
	})
	require.NoError(s.T(), err)
	defer func() {
		err := moderatorClient.DeleteBoard(board.ID)
		assert.NoError(s.T(), err, "Failed to delete board")
	}()

	participantClient := NewClient(s.cfg)
	_, err = participantClient.LoginAnonymous(s.cfg.Users.Participant.Name)
	require.NoError(s.T(), err)

	err = participantClient.JoinBoard(board.ID)
	require.NoError(s.T(), err)

	fetchedBoard, err := participantClient.GetBoard(board.ID)
	require.NoError(s.T(), err)
	assert.Equal(s.T(), board.ID, fetchedBoard.ID)

	cols, err := participantClient.GetColumns(board.ID)
	require.NoError(s.T(), err)
	require.NotEmpty(s.T(), cols)

	note, err := participantClient.CreateNote(board.ID, notes.NoteCreateRequest{
		Column: cols[0].ID,
		Text:   "Note from participant",
	})
	require.NoError(s.T(), err)
	assert.NotEqual(s.T(), uuid.Nil, note.ID)

	noteList, err := moderatorClient.GetNotes(board.ID)
	require.NoError(s.T(), err)
	assert.GreaterOrEqual(s.T(), len(noteList), 1)

	participants, err := moderatorClient.GetParticipants(board.ID)
	require.NoError(s.T(), err)
	assert.GreaterOrEqual(s.T(), len(participants), 2)
}

func (s *E2ESuite) TestLockBoard() {
	_, err := s.client.LoginAnonymous(s.cfg.Users.Default.Name)
	require.NoError(s.T(), err)

	board, err := s.client.CreateBoard(boards.CreateBoardRequest{
		Name:         ptr("Lock Test Board"),
		AccessPolicy: boards.Public,
	})
	require.NoError(s.T(), err)
	defer func() {
		err := s.client.DeleteBoard(board.ID)
		assert.NoError(s.T(), err, "Failed to delete board")
	}()

	updated, err := s.client.UpdateBoard(board.ID, boards.BoardUpdateRequest{
		Name:     board.Name,
		IsLocked: ptr(true),
	})
	require.NoError(s.T(), err)
	assert.True(s.T(), updated.IsLocked)

	updated, err = s.client.UpdateBoard(board.ID, boards.BoardUpdateRequest{
		Name:     board.Name,
		IsLocked: ptr(false),
	})
	require.NoError(s.T(), err)
	assert.False(s.T(), updated.IsLocked)
}
