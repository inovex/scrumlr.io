package boards

import (
	"context"
	"errors"
	"fmt"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/votings"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
)

type DB struct {
	db *bun.DB
}

func NewBoardDatabase(database *bun.DB) BoardDatabase {
	db := new(DB)
	db.db = database

	return db
}

func (d *DB) CreateBoard(creator uuid.UUID, board DatabaseBoardInsert, columns []columns.DatabaseColumnInsert) (DatabaseBoard, error) {
	boardInsert := d.db.NewInsert().
		Model(&board).
		Returning("*")

	if board.AccessPolicy == ByPassphrase && (board.Passphrase == nil || board.Salt == nil) {
		return DatabaseBoard{}, errors.New("passphrase or salt may not be empty")
	} else if board.AccessPolicy != ByPassphrase && (board.Passphrase != nil || board.Salt != nil) {
		return DatabaseBoard{}, errors.New("passphrase or salt should not be set for policies except 'BY_PASSPHRASE'")
	}

	session := sessions.DatabaseBoardSessionInsert{User: creator, Role: common.OwnerRole}

	var b DatabaseBoard
	query := d.db.NewSelect().With("createdBoard", boardInsert)
	if len(columns) > 0 {
		for index := range columns {
			newColumnIndex := index
			columns[index].Index = &newColumnIndex
		}

		query = query.With("createdColumns", d.db.NewInsert().
			Model(&columns).
			Value("board", "(SELECT id FROM \"createdBoard\")"))
	}
	err := query.
		With("createdSession", d.db.NewInsert().
			Model(&session).
			Value("board", "(SELECT id FROM \"createdBoard\")")).
		Table("createdBoard").
		Column("*").
		Scan(context.Background(), &b)

	return b, err
}

func (d *DB) UpdateBoardTimer(update DatabaseBoardTimerUpdate) (DatabaseBoard, error) {
	var board DatabaseBoard
	_, err := d.db.NewUpdate().
		Model(&update).
		Column("timer_start", "timer_end").
		Where("id = ?", update.ID).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", d, "Result", &board), &board)

	return board, err
}

func (d *DB) UpdateBoard(update DatabaseBoardUpdate) (DatabaseBoard, error) {
	query := d.db.NewUpdate().
		Model(&update).
		Column("timer_start", "timer_end", "shared_note")

	if update.Name != nil {
		query.Column("name")
	}
	if update.Description != nil {
		query.Column("description")
	}
	if update.AccessPolicy != nil {
		if *update.AccessPolicy == ByPassphrase && (update.Passphrase == nil || update.Salt == nil) {
			return DatabaseBoard{}, errors.New("passphrase and salt should be set when access policy is updated")
		} else if *update.AccessPolicy != ByPassphrase && (update.Passphrase != nil || update.Salt != nil) {
			return DatabaseBoard{}, errors.New("passphrase and salt should not be set if access policy is defined as 'BY_PASSPHRASE'")
		}

		if *update.AccessPolicy == ByInvite {
			query.Where("access_policy = ?", ByInvite)
		} else {
			query.Where("access_policy <> ?", ByInvite)
		}

		query.Column("access_policy", "passphrase", "salt")
	}
	if update.ShowAuthors != nil {
		query.Column("show_authors")
	}
	if update.ShowNotesOfOtherUsers != nil {
		query.Column("show_notes_of_other_users")
	}
	if update.ShowNoteReactions != nil {
		query.Column("show_note_reactions")
	}
	if update.AllowStacking != nil {
		query.Column("allow_stacking")
	}
	if update.IsLocked != nil {
		query.Column("is_locked")
	}

	var board DatabaseBoard
	var err error
	if update.ShowVoting.Valid {
		votingQuery := d.db.NewSelect().
			Model((*common.VotingDB)(nil)).
			Column("id").
			Where("board = ?", update.ID).
			Where("id = ?", update.ShowVoting.UUID).
			Where("status = ?", votings.Closed)

		_, err = query.
			With("voting", votingQuery).
			With("rankUpdate", d.getRankUpdateQueryForClosedVoting("voting")).
			Set("voting = (SELECT \"id\" FROM \"voting\")").
			Where("id = ?", update.ID).
			Returning("*").
			Exec(common.ContextWithValues(context.Background(), "Database", d, "Result", &board), &board)
	} else {
		_, err = query.
			Where("id = ?", update.ID).
			Returning("*").
			Exec(common.ContextWithValues(context.Background(), "Database", d, "Result", &board), &board)
	}

	return board, err

}

func (d *DB) DeleteBoard(id uuid.UUID) error {
	_, err := d.db.NewDelete().
		Model((*DatabaseBoard)(nil)).
		Where("id = ?", id).
		Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardIdentifier, id))

	return err
}

func (d *DB) GetBoard(id uuid.UUID) (DatabaseBoard, error) {
	var board DatabaseBoard
	err := d.db.NewSelect().
		Model(&board).
		Where("id = ?", id).
		Scan(context.Background())

	return board, err
}

func (d *DB) GetBoards(userID uuid.UUID) ([]DatabaseBoard, error) {
	var boards []DatabaseBoard
	err := d.db.NewSelect().
		TableExpr("boards AS b").
		ColumnExpr("b.*").
		Join("INNER JOIN board_sessions AS s ON s.board = b.id").
		Where("s.user = ?", userID).
		Scan(context.Background(), &boards)

	if err != nil {
		return nil, err
	}

	return boards, err
}

// todo: duplicate here. either remove from here or from voting
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
		Model((*common.NoteDB)(nil)).
		TableExpr("_data").
		Set("rank = _data.new_rank").
		WhereOr("note.id = _data.id").
		WhereOr("note.stack = _data.id")

	return rankUpdate
}
