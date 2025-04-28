package voting

import (
	"context"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/database"
	"scrumlr.io/server/database/types"
	"scrumlr.io/server/notes"
)

type DB struct {
	db *bun.DB
}

func NewVotingDatabase(database *bun.DB) VotingDatabase {
	db := new(DB)
	db.db = database

	return db
}

func (d *DB) Create(insert VotingInsert) (VotingDB, error) {
	if insert.Status != types.VotingStatusOpen {
		return VotingDB{}, errors.New("unable to create voting with other state than 'OPEN'")
	}

	if insert.VoteLimit < 0 {
		return VotingDB{}, errors.New("vote limit shall not be a negative number")
	} else if insert.VoteLimit >= 100 {
		return VotingDB{}, errors.New("vote limit shall not be greater than 99")
	}

	countOpenVotings := d.db.NewSelect().Model((*Voting)(nil)).ColumnExpr("COUNT(*) as count").Where("board = ?", insert.Board).Where("status = ?", types.VotingStatusOpen)
	values := d.db.NewSelect().
		ColumnExpr("uuid(?) as board", insert.Board).
		ColumnExpr("? as vote_limit", insert.VoteLimit).
		ColumnExpr("? as show_votes_of_others", insert.ShowVotesOfOthers).
		ColumnExpr("? as allow_multiple_votes", insert.AllowMultipleVotes).
		ColumnExpr("?::voting_status as status", insert.Status).
		Where("(SELECT count FROM \"countOpenVotings\") = 0")

	updateBoard := d.db.NewUpdate().Model((*database.Board)(nil)).Set("show_voting = null").Where("(SELECT count FROM \"countOpenVotings\") = 0")

	var voting VotingDB
	_, err := d.db.NewInsert().
		With("countOpenVotings", countOpenVotings).
		With("updateBoard", updateBoard).
		With("_values", values).
		Model(&insert).
		TableExpr("_values").
		Column("board", "vote_limit", "show_votes_of_others", "allow_multiple_votes", "status").
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", d, "Result", &voting), &voting)
	return voting, err
}

func (d *DB) Update(update VotingUpdate) (VotingDB, error) {
	if update.Status == types.VotingStatusOpen {
		return VotingDB{}, errors.New("only allowed to close or a abort a voting")
	}

	updateQuery := d.db.NewUpdate().
		Model(&update).
		Where("id = ?", update.ID).
		Where("board = ?", update.Board).
		Where("status = ?", types.VotingStatusOpen).
		Returning("*")

	var voting VotingDB
	var err error

	if update.Status == types.VotingStatusClosed {
		updateBoard := d.db.NewUpdate().Model((*database.Board)(nil)).Set("show_voting = (SELECT id FROM \"updateQuery\")").Where("id = ?", update.Board)

		err = d.db.NewSelect().
			With("updateQuery", updateQuery).
			With("updateBoard", updateBoard).
			With("rankUpdate", d.getRankUpdateQueryForClosedVoting("updateQuery")).
			Model((*Voting)(nil)).
			ModelTableExpr("\"updateQuery\" AS voting").
			Scan(common.ContextWithValues(context.Background(), "Database", d, "Result", &voting), &voting)
	}

	return voting, err
}

func (d *DB) getRankUpdateQueryForClosedVoting(votingQuery string) *bun.UpdateQuery {
	newRankSelect := d.db.NewSelect().
		TableExpr("notes as note").
		ColumnExpr(fmt.Sprintf(
			"ROW_NUMBER() OVER (PARTITION BY \"column\" ORDER BY "+
				"(SELECT COUNT(*) FROM notes AS n INNER JOIN (SELECT * FROM VOTES WHERE voting = (SELECT id FROM \"%s\")) as v ON n.id = v.note WHERE n.id = note.id OR n.stack = note.id), rank)-1 AS new_rank",
			votingQuery)).
		Column("id").
		Where(fmt.Sprintf("stack IS NULL AND board = (SELECT board FROM \"%s\")", votingQuery)).
		GroupExpr("id")

	rankUpdate := d.db.NewUpdate().With("_data", newRankSelect).
		Model((*notes.NoteDB)(nil)).
		TableExpr("_data").
		Set("rank = _data.new_rank").
		WhereOr("note.id = _data.id").
		WhereOr("note.stack = _data.id")

	return rankUpdate
}

func (d *DB) Get(board, id uuid.UUID) (VotingDB, []VoteDB, error) {
	var voting VotingDB
	err := d.db.NewSelect().Model(&voting).Where("board = ?", board).Where("id = ?", id).Scan(context.Background())

	if voting.Status == types.VotingStatusClosed {
		votes, err := d.GetVotes(filter.VoteFilter{Board: board, Voting: &id})
		return voting, votes, err
	}

	return voting, []VoteDB{}, err
}

func (d *DB) GetAll(board uuid.UUID) ([]VotingDB, []VoteDB, error) {
	var votings []VotingDB
	err := d.db.NewSelect().
		Model(&votings).
		Where("board = ?", board).
		OrderExpr("array_position(array['OPEN', 'CLOSED', 'ABORTED']::voting_status[], status) ASC, created_at DESC").
		Scan(context.Background())

	if err != nil {
		return votings, []VoteDB{}, err
	}

	votes, err := d.GetVotes(filter.VoteFilter{Board: board})
	return votings, votes, err
}

func (d *DB) GetVotes(f filter.VoteFilter) ([]VoteDB, error) {
	voteQuery := d.db.NewSelect().Model((*Vote)(nil)).Where("board = ?", f.Board)

	if f.Voting != nil {
		voteQuery = voteQuery.Where("voting = ?", *f.Voting)
	}
	if f.User != nil {
		voteQuery = voteQuery.Where("\"user\" = ?", *f.User)
	}
	if f.Note != nil {
		voteQuery = voteQuery.Where("note = ?", *f.Note)
	}

	var votes []VoteDB
	err := voteQuery.Scan(context.Background(), &votes)

	return votes, err
}

func (d *DB) AddVote(board, user, note uuid.UUID) (VoteDB, error) {
	openVotingQuery := d.db.NewSelect().
		Model((*VotingDB)(nil)).
		Column("id", "vote_limit", "allow_multiple_votes").
		Where("board = ?", board).
		Where("status = ?", types.VotingStatusOpen)

	currentVoteCount := d.db.NewSelect().
		Model((*VoteDB)(nil)).ColumnExpr("note").
		Where("voting = (SELECT id FROM \"openVotingQuery\")").
		Where("\"user\" = ?", user)

	currentVotesOnNoteCount := d.db.NewSelect().
		Model((*VoteDB)(nil)).
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

	var result VoteDB
	insert := VoteDB{Board: board, User: user, Note: note}
	_, err := d.db.NewInsert().
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

func (d *DB) RemoveVote(board, user, note uuid.UUID) error {
	openVotingQuery := d.db.NewSelect().Model((*Voting)(nil)).Column("id").Where("board = ?", board).Where("status = ?", types.VotingStatusOpen)
	limitQuery := d.db.NewSelect().Model((*Vote)(nil)).Column("ctid").Where("voting = (SELECT id FROM \"openVotingQuery\")").Where("\"user\" = ?", user).Where("note = ?", note).Limit(1)

	deleteQuery := VoteDB{Board: board, User: user, Note: note}
	_, err := d.db.NewDelete().
		With("openVotingQuery", openVotingQuery).
		Model(&deleteQuery).
		Where("voting = (SELECT id FROM \"openVotingQuery\")").
		Where("ctid IN (?)", limitQuery).
		Exec(context.Background())

	return err
}

func (d *DB) GetOpenVoting(board uuid.UUID) (VotingDB, error) {
	var voting VotingDB
	err := d.db.NewSelect().Model(&voting).Where("board = ?", board).Where("status = ?", "OPEN").Scan(context.Background())
	return voting, err
}
