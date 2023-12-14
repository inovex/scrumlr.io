package database

import (
	"context"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/database/types"
)

type Vote struct {
	bun.BaseModel `bun:"table:votes"`
	Board         uuid.UUID
	Voting        uuid.UUID
	User          uuid.UUID
	Note          uuid.UUID
}

// AddVote adds a vote to the current open voting session.
//
// If the vote limit is reached no further votes will be allowed.
func (d *Database) AddVote(board, user, note uuid.UUID) (Vote, error) {
	openVotingQuery := d.readDB.NewSelect().
		Model((*Voting)(nil)).
		Column("id", "vote_limit", "allow_multiple_votes").
		Where("board = ?", board).
		Where("status = ?", types.VotingStatusOpen)

	currentVoteCount := d.readDB.NewSelect().
		Model((*Vote)(nil)).ColumnExpr("note").
		Where("voting = (SELECT id FROM \"openVotingQuery\")").
		Where("\"user\" = ?", user)

	currentVotesOnNoteCount := d.readDB.NewSelect().
		Model((*Vote)(nil)).
		ColumnExpr("COUNT(*) as count").
		Where("voting = (SELECT id FROM \"openVotingQuery\")").
		Where("\"user\" = ?", user).
		Where("note = ?", note)

	values := d.readDB.NewSelect().
		ColumnExpr("(SELECT id FROM \"openVotingQuery\") as voting").
		ColumnExpr("uuid(?) as board", board).
		ColumnExpr("uuid(?) as note", note).
		ColumnExpr("uuid(?) as \"user\"", user).
		Where("(SELECT COUNT(*) FROM \"currentVoteCount\") < (SELECT vote_limit FROM \"openVotingQuery\")").
		WhereGroup(" AND ", func(q *bun.SelectQuery) *bun.SelectQuery {
			return q.
				WhereOr("(SELECT allow_multiple_votes FROM \"openVotingQuery\")").
				WhereGroup(" OR ", func(q *bun.SelectQuery) *bun.SelectQuery {
					return q.
						Where("(SELECT NOT(allow_multiple_votes) FROM \"openVotingQuery\")").
						Where("(SELECT count FROM \"currentVotesOnNoteCount\") < 1")
				})

		})

	var result Vote
	insert := Vote{Board: board, User: user, Note: note}
	_, err := d.writeDB.NewInsert().
		With("openVotingQuery", openVotingQuery).
		With("currentVoteCount", currentVoteCount).
		With("currentVotesOnNoteCount", currentVotesOnNoteCount).
		With("_values", values).
		Model(&insert).
		TableExpr("_values").
		Column("board", "voting", "user", "note").
		Returning("*").
		Exec(context.Background(), &result)

	return result, err
}

// RemoveVote removes a vote from the current voting session.
func (d *Database) RemoveVote(board, user, note uuid.UUID) error {
	openVotingQuery := d.readDB.NewSelect().Model((*Voting)(nil)).Column("id").Where("board = ?", board).Where("status = ?", types.VotingStatusOpen)
	limitQuery := d.readDB.NewSelect().Model((*Vote)(nil)).Column("ctid").Where("voting = (SELECT id FROM \"openVotingQuery\")").Where("\"user\" = ?", user).Where("note = ?", note).Limit(1)

	deleteQuery := Vote{Board: board, User: user, Note: note}
	_, err := d.writeDB.NewDelete().
		With("openVotingQuery", openVotingQuery).
		Model(&deleteQuery).
		Where("voting = (SELECT id FROM \"openVotingQuery\")").
		Where("ctid IN (?)", limitQuery).
		Exec(context.Background())

	return err
}

// GetVotes returns all votes for a closed voting session.
func (d *Database) GetVotes(f filter.VoteFilter) ([]Vote, error) {
	voteQuery := d.readDB.NewSelect().Model((*Vote)(nil)).Where("board = ?", f.Board)

	if f.Voting != nil {
		voteQuery = voteQuery.Where("voting = ?", *f.Voting)
	}
	if f.User != nil {
		voteQuery = voteQuery.Where("\"user\" = ?", *f.User)
	}
	if f.Note != nil {
		voteQuery = voteQuery.Where("note = ?", *f.Note)
	}

	var votes []Vote
	err := voteQuery.Scan(context.Background(), &votes)

	return votes, err
}
