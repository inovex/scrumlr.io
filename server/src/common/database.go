package common

import (
	"fmt"

	"github.com/uptrace/bun"
)

func GetRankUpdateQueryForClosedVoting(db *bun.DB, votingQuery string) *bun.UpdateQuery {
	newRankSelect := db.NewSelect().
		TableExpr("notes as note").
		ColumnExpr(fmt.Sprintf(
			"ROW_NUMBER() OVER (PARTITION BY \"column\" ORDER BY "+
				"(SELECT COUNT(*) FROM notes AS n INNER JOIN (SELECT * FROM VOTES WHERE voting = (SELECT id FROM \"%s\")) as v ON n.id = v.note WHERE n.id = note.id OR n.stack = note.id), rank)-1 AS new_rank",
			votingQuery)).
		Column("id").
		Where(fmt.Sprintf("stack IS NULL AND board = (SELECT board FROM \"%s\")", votingQuery)).
		GroupExpr("id")

	rankUpdate := db.NewUpdate().With("_data", newRankSelect).
		Model((*DatabaseNote)(nil)).
		TableExpr("_data").
		Set("rank = _data.new_rank").
		WhereOr("note.id = _data.id").
		WhereOr("note.stack = _data.id")

	return rankUpdate
}
