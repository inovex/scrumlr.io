package database

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
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

//func (d *Database) CreateVoting(insert VotingInsert) (Voting, error) {
//	if insert.Status != types.VotingStatusOpen {
//		return Voting{}, errors.New("unable to create voting with other state than 'OPEN'")
//	}
//
//	if insert.VoteLimit < 0 {
//		return Voting{}, errors.New("vote limit shall not be a negative number")
//	} else if insert.VoteLimit >= 100 {
//		return Voting{}, errors.New("vote limit shall not be greater than 99")
//	}
//
//	countOpenVotings := d.db.NewSelect().Model((*Voting)(nil)).ColumnExpr("COUNT(*) as count").Where("board = ?", insert.Board).Where("status = ?", types.VotingStatusOpen)
//	values := d.db.NewSelect().
//		ColumnExpr("uuid(?) as board", insert.Board).
//		ColumnExpr("? as vote_limit", insert.VoteLimit).
//		ColumnExpr("? as show_votes_of_others", insert.ShowVotesOfOthers).
//		ColumnExpr("? as allow_multiple_votes", insert.AllowMultipleVotes).
//		ColumnExpr("?::voting_status as status", insert.Status).
//		Where("(SELECT count FROM \"countOpenVotings\") = 0")
//
//	updateBoard := d.db.NewUpdate().Model((*Board)(nil)).Set("show_voting = null").Where("(SELECT count FROM \"countOpenVotings\") = 0")
//
//	var voting Voting
//	_, err := d.db.NewInsert().
//		With("countOpenVotings", countOpenVotings).
//		With("updateBoard", updateBoard).
//		With("_values", values).
//		Model(&insert).
//		TableExpr("_values").
//		Column("board", "vote_limit", "show_votes_of_others", "allow_multiple_votes", "status").
//		Returning("*").
//		Exec(common.ContextWithValues(context.Background(), "Database", d, "Result", &voting), &voting)
//	return voting, err
//}
