package votings

import (
	"context"
	"fmt"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
)

type DB struct {
	db *bun.DB
}

func NewVotingDatabase(database *bun.DB) VotingDatabase {
	db := new(DB)
	db.db = database

	return db
}

func (d *DB) Create(ctx context.Context, insert DatabaseVotingInsert) (DatabaseVoting, error) {
	var voting DatabaseVoting
	_, err := d.db.NewInsert().
		Model(&insert).
		Returning("*").
		Exec(common.ContextWithValues(ctx, "Database", d, "Result", &voting), &voting)

	return voting, err
}

func (d *DB) Close(ctx context.Context, update DatabaseVotingUpdate) (DatabaseVoting, error) {
	var voting DatabaseVoting
	updateQuery := d.db.NewUpdate().
		Model(&update).
		Where("id = ?", update.ID).
		Where("board = ?", update.Board).
		Where("status = ?", Open).
		Returning("*")

	updateBoard := d.db.NewUpdate().
		Model((*common.DatabaseBoard)(nil)).
		Set("show_voting = (SELECT id FROM \"updateQuery\")").
		Where("id = ?", update.Board)

	err := d.db.NewSelect().
		With("updateQuery", updateQuery).
		With("updateBoard", updateBoard).
		With("rankUpdate", d.getRankUpdateQueryForClosedVoting("updateQuery")).
		Model((*DatabaseVoting)(nil)).
		ModelTableExpr("\"updateQuery\" AS voting").
		Scan(common.ContextWithValues(ctx, "Database", d, "Result", &voting), &voting)

	return voting, err
}

func (d *DB) getRankUpdateQueryForClosedVoting(votingQuery string) *bun.UpdateQuery {
	newRankSelect := d.db.NewSelect().
		TableExpr("notes as note").
		ColumnExpr(fmt.Sprintf(
			"ROW_NUMBER() OVER (PARTITION BY \"column\" ORDER BY "+
				"(SELECT COUNT(*) FROM notes AS n INNER JOIN (SELECT * FROM votes WHERE voting = (SELECT id FROM \"%s\")) as v ON n.id = v.note WHERE n.id = note.id OR n.stack = note.id), rank)-1 AS new_rank",
			votingQuery)).
		Column("id").
		Where(fmt.Sprintf("stack IS NULL AND board = (SELECT board FROM \"%s\")", votingQuery)).
		GroupExpr("id")

	rankUpdate := d.db.NewUpdate().With("_data", newRankSelect).
		Model((*common.DatabaseNote)(nil)).
		TableExpr("_data").
		Set("rank = _data.new_rank").
		WhereOr("note.id = _data.id").
		WhereOr("note.stack = _data.id")

	return rankUpdate
}

func (d *DB) Get(ctx context.Context, board, id uuid.UUID) (DatabaseVoting, error) {
	var voting DatabaseVoting
	err := d.db.NewSelect().
		Model(&voting).
		Where("board = ?", board).
		Where("id = ?", id).
		Scan(ctx)

	return voting, err
}

func (d *DB) GetAll(ctx context.Context, board uuid.UUID) ([]DatabaseVoting, error) {
	var votings []DatabaseVoting
	err := d.db.NewSelect().
		Model(&votings).
		Where("board = ?", board).
		OrderExpr("array_position(array['OPEN', 'CLOSED', 'ABORTED']::voting_status[], status) ASC, created_at DESC").
		Scan(ctx)

	return votings, err
}

func (d *DB) GetVotes(ctx context.Context, board uuid.UUID, f VoteFilter) ([]DatabaseVote, error) {
	voteQuery := d.db.NewSelect().
		Model((*Vote)(nil)).
		Where("board = ?", board)

	if f.Voting != nil {
		voteQuery = voteQuery.Where("voting = ?", *f.Voting)
	}
	if f.User != nil {
		voteQuery = voteQuery.Where("\"user\" = ?", *f.User)
	}
	if f.Note != nil {
		voteQuery = voteQuery.Where("note = ?", *f.Note)
	}

	var votes []DatabaseVote
	err := voteQuery.Scan(ctx, &votes)

	return votes, err
}

func (d *DB) AddVote(ctx context.Context, board, user, note uuid.UUID) (DatabaseVote, error) {
	openVotingQuery := d.db.NewSelect().
		Model((*DatabaseVoting)(nil)).
		Column("id", "vote_limit", "allow_multiple_votes").
		Where("board = ?", board).
		Where("status = ?", Open)

	currentVoteCount := d.db.NewSelect().
		Model((*DatabaseVote)(nil)).
		ColumnExpr("note").
		Where("voting = (SELECT id FROM \"openVotingQuery\")").
		Where("\"user\" = ?", user)

	currentVotesOnNoteCount := d.db.NewSelect().
		Model((*DatabaseVote)(nil)).
		ColumnExpr("COUNT(*) as count").
		Where("voting = (SELECT id FROM \"openVotingQuery\")").
		Where("\"user\" = ?", user).
		Where("note = ?", note)

	values := d.db.NewSelect().
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

	var result DatabaseVote
	insert := DatabaseVote{Board: board, User: user, Note: note}
	_, err := d.db.NewInsert().
		With("openVotingQuery", openVotingQuery).
		With("currentVoteCount", currentVoteCount).
		With("currentVotesOnNoteCount", currentVotesOnNoteCount).
		With("_values", values).
		Model(&insert).
		TableExpr("_values").
		Column("board", "voting", "user", "note").
		Returning("*").
		Exec(ctx, &result)

	return result, err
}

func (d *DB) RemoveVote(ctx context.Context, board, user, note uuid.UUID) error {
	openVotingQuery := d.db.NewSelect().
		Model((*Voting)(nil)).
		Column("id").
		Where("board = ?", board).
		Where("status = ?", Open)

	limitQuery := d.db.NewSelect().
		Model((*Vote)(nil)).
		Column("ctid").
		Where("voting = (SELECT id FROM \"openVotingQuery\")").
		Where("\"user\" = ?", user).
		Where("note = ?", note).
		Limit(1)

	deleteQuery := DatabaseVote{Board: board, User: user, Note: note}
	_, err := d.db.NewDelete().
		With("openVotingQuery", openVotingQuery).
		Model(&deleteQuery).
		Where("voting = (SELECT id FROM \"openVotingQuery\")").
		Where("ctid IN (?)", limitQuery).
		Exec(ctx)

	return err
}

func (d *DB) GetOpenVoting(ctx context.Context, board uuid.UUID) (DatabaseVoting, error) {
	var voting DatabaseVoting
	err := d.db.NewSelect().
		Model(&voting).
		Where("board = ?", board).
		Where("status = ?", "OPEN").
		Scan(ctx)

	return voting, err
}
