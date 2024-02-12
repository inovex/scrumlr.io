package database

import (
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/database/types"
	"testing"
)

type VotingObserverForTests struct {
	t      *testing.T
	board  *uuid.UUID
	voting *Voting
}

func (o *VotingObserverForTests) CreatedVoting(board uuid.UUID, voting Voting) {
	o.board = &board
	o.voting = &voting
}

func (o *VotingObserverForTests) UpdatedVoting(board uuid.UUID, voting Voting) {
	o.board = &board
	o.voting = &voting
}

func (o *VotingObserverForTests) Reset() {
	o.board = nil
	o.voting = nil
}

var votingObserver VotingObserverForTests

func TestBoardVotingObserver(t *testing.T) {
	votingObserver = VotingObserverForTests{t: t}
	testDb.AttachObserver(&votingObserver)

	t.Run("Test=1", testVotingObserverOnCreate)
	votingObserver.Reset()
	t.Run("Test=2", testVotingOnUpdateClosed)

	_, _ = testDb.DetachObserver(votingObserver)
}

var votingFromVotingObserverTest *Voting

func testVotingObserverOnCreate(t *testing.T) {
	board := fixture.MustRow("Board.votingObserverTestBoard").(*Board)

	voting, err := testDb.CreateVoting(VotingInsert{
		Board:              board.ID,
		VoteLimit:          5,
		AllowMultipleVotes: false,
		ShowVotesOfOthers:  false,
		Status:             "OPEN",
	})
	assert.Nil(t, err)

	assert.NotNil(t, votingObserver.board)
	assert.NotNil(t, votingObserver.voting)

	assert.Equal(t, board.ID, votingObserver.voting.Board)

	votingFromVotingObserverTest = &voting
}

func testVotingOnUpdateClosed(t *testing.T) {
	board := fixture.MustRow("Board.votingObserverTestBoard").(*Board)

	_, err := testDb.UpdateVoting(VotingUpdate{
		ID:     votingFromVotingObserverTest.ID,
		Board:  votingFromVotingObserverTest.Board,
		Status: types.VotingStatusClosed,
	})

	assert.Nil(t, err)

	assert.NotNil(t, votingObserver.board)
	assert.NotNil(t, votingObserver.voting)

	assert.Equal(t, board.ID, votingObserver.voting.Board)
	assert.Equal(t, types.VotingStatusClosed, votingObserver.voting.Status)
}
