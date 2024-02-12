package database

import (
	"context"
	"errors"
	"fmt"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/database/types"
	"time"
)

type Voting struct {
	bun.BaseModel      `bun:"table:votings"`
	ID                 uuid.UUID
	Board              uuid.UUID
	CreatedAt          time.Time
	VoteLimit          int
	AllowMultipleVotes bool
	ShowVotesOfOthers  bool
	Status             types.VotingStatus
}

type VotingInsert struct {
	bun.BaseModel      `bun:"table:votings"`
	Board              uuid.UUID
	VoteLimit          int
	AllowMultipleVotes bool
	ShowVotesOfOthers  bool
	Status             types.VotingStatus
}

type VotingUpdate struct {
	bun.BaseModel `bun:"table:votings"`
	ID            uuid.UUID
	Board         uuid.UUID
	Status        types.VotingStatus
}

func (d *Database) CreateVoting(insert VotingInsert) (Voting, error) {
	if insert.Status != types.VotingStatusOpen {
		return Voting{}, errors.New("unable to create voting with other state than 'OPEN'")
	}

	if insert.VoteLimit < 0 {
		return Voting{}, errors.New("vote limit shall not be a negative number")
	} else if insert.VoteLimit >= 100 {
		return Voting{}, errors.New("vote limit shall not be greater than 99")
	}

	countOpenVotings := d.db.NewSelect().Model((*Voting)(nil)).ColumnExpr("COUNT(*) as count").Where("board = ?", insert.Board).Where("status = ?", types.VotingStatusOpen)
	values := d.db.NewSelect().
		ColumnExpr("uuid(?) as board", insert.Board).
		ColumnExpr("? as vote_limit", insert.VoteLimit).
		ColumnExpr("? as show_votes_of_others", insert.ShowVotesOfOthers).
		ColumnExpr("? as allow_multiple_votes", insert.AllowMultipleVotes).
		ColumnExpr("?::voting_status as status", insert.Status).
		Where("(SELECT count FROM \"countOpenVotings\") = 0")

	updateBoard := d.db.NewUpdate().Model((*Board)(nil)).Set("show_voting = null").Where("(SELECT count FROM \"countOpenVotings\") = 0")

	var voting Voting
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

func (d *Database) UpdateVoting(update VotingUpdate) (Voting, error) {
	if update.Status == types.VotingStatusOpen {
		return Voting{}, errors.New("only allowed to close a voting")
	}

	updateQuery := d.db.NewUpdate().
		Model(&update).
		Where("id = ?", update.ID).
		Where("board = ?", update.Board).
		Where("status = ?", types.VotingStatusOpen).
		Returning("*")

	var voting Voting
	var err error

	if update.Status == types.VotingStatusClosed {
		updateBoard := d.db.NewUpdate().Model((*Board)(nil)).Set("show_voting = (SELECT id FROM \"updateQuery\")").Where("id = ?", update.Board)

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

func (d *Database) getRankUpdateQueryForClosedVoting(votingQuery string) *bun.UpdateQuery {
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
		Model((*Note)(nil)).
		TableExpr("_data").
		Set("rank = _data.new_rank").
		WhereOr("note.id = _data.id").
		WhereOr("note.stack = _data.id")

	return rankUpdate
}

func (d *Database) GetVoting(board, id uuid.UUID) (Voting, []Vote, error) {
	var voting Voting
	err := d.db.NewSelect().Model(&voting).Where("board = ?", board).Where("id = ?", id).Scan(context.Background())

	if voting.Status == types.VotingStatusClosed {
		votes, err := d.GetVotes(filter.VoteFilter{Board: board, Voting: &id})
		return voting, votes, err
	}

	return voting, []Vote{}, err
}

func (d *Database) GetVotings(board uuid.UUID) ([]Voting, []Vote, error) {
	var votings []Voting
	err := d.db.NewSelect().
		Model(&votings).
		Where("board = ?", board).
		OrderExpr("array_position(array['OPEN', 'CLOSED']::voting_status[], status) ASC, created_at DESC").
		Scan(context.Background())

	if err != nil {
		return votings, []Vote{}, err
	}

	votes, err := d.GetVotes(filter.VoteFilter{Board: board})
	return votings, votes, err
}
