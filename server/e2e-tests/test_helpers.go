package e2e

import (
	"github.com/stretchr/testify/require"
	"scrumlr.io/server/boards"
	"scrumlr.io/server/columns"
	"testing"
)

type BoardBuilder struct {
	name         *string
	accessPolicy boards.AccessPolicy
	passphrase   *string
	columns      []columns.ColumnRequest
}

func Ptr[T any](v T) *T { return &v }

func NewBoardBuilder() *BoardBuilder {
	return &BoardBuilder{
		name:         Ptr("Test Board"),
		accessPolicy: boards.Public,
		columns: []columns.ColumnRequest{
			{Name: "Column 1", Color: columns.ColorBacklogBlue, Visible: Ptr(true)},
		},
	}
}

func (b *BoardBuilder) WithName(name string) *BoardBuilder {
	b.name = Ptr(name)
	return b
}

func (b *BoardBuilder) WithAccessPolicy(policy boards.AccessPolicy) *BoardBuilder {
	b.accessPolicy = policy
	return b
}

func (b *BoardBuilder) WithPassphrase(passphrase string) *BoardBuilder {
	b.passphrase = Ptr(passphrase)
	b.accessPolicy = boards.ByPassphrase
	return b
}

func (b *BoardBuilder) WithColumns(cols []columns.ColumnRequest) *BoardBuilder {
	b.columns = cols
	return b
}

func (b *BoardBuilder) WithDefaultColumns() *BoardBuilder {
	b.columns = []columns.ColumnRequest{
		{Name: "Positive", Color: columns.ColorGoalGreen, Visible: Ptr(true)},
		{Name: "Negative", Color: columns.ColorOnlineOrange, Visible: Ptr(true)},
		{Name: "Actions", Color: columns.ColorPlanningPink, Visible: Ptr(true)},
	}
	return b
}

func (b *BoardBuilder) Build() boards.CreateBoardRequest {
	return boards.CreateBoardRequest{
		Name:         b.name,
		AccessPolicy: b.accessPolicy,
		Passphrase:   b.passphrase,
		Columns:      b.columns,
	}
}

func (b *BoardBuilder) CreateAndCleanup(t *testing.T, client *Client) *boards.Board {
	board, err := client.CreateBoard(b.Build())
	require.NoError(t, err)
	t.Cleanup(func() {
		_ = client.DeleteBoard(board.ID)
	})
	return board
}

type TestBoard struct {
	Board  *boards.Board
	Client *Client
	T      *testing.T
}

func (tb *TestBoard) Cleanup() {
	err := tb.Client.DeleteBoard(tb.Board.ID)
	require.NoError(tb.T, err, "Failed to cleanup board")
}

func SetupTestBoard(t *testing.T, client *Client, name string) *TestBoard {
	board := NewBoardBuilder().
		WithName(name).
		CreateAndCleanup(t, client)

	return &TestBoard{
		Board:  board,
		Client: client,
		T:      t,
	}
}
