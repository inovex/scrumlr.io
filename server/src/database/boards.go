package database

import (
  "context"
  "errors"
  "scrumlr.io/server/identifiers"
  "time"

  "github.com/google/uuid"
  "github.com/uptrace/bun"
  "scrumlr.io/server/common"
  "scrumlr.io/server/database/types"
)

type Board struct {
	bun.BaseModel         `bun:"table:boards"`
	ID                    uuid.UUID
	Name                  *string
	Description           *string
	AccessPolicy          types.AccessPolicy
	Passphrase            *string
	Salt                  *string
	ShowAuthors           bool
	ShowNotesOfOtherUsers bool
	ShowNoteReactions     bool
	AllowStacking         bool
	AllowEditing          bool
	CreatedAt             time.Time
	TimerStart            *time.Time
	TimerEnd              *time.Time
	SharedNote            uuid.NullUUID
	ShowVoting            uuid.NullUUID
}

type BoardInsert struct {
	bun.BaseModel `bun:"table:boards"`
	Name          *string
	Description   *string
	AccessPolicy  types.AccessPolicy
	Passphrase    *string
	Salt          *string
}

type BoardTimerUpdate struct {
	bun.BaseModel `bun:"table:boards"`
	ID            uuid.UUID
	TimerStart    *time.Time
	TimerEnd      *time.Time
}

type BoardUpdate struct {
	bun.BaseModel         `bun:"table:boards"`
	ID                    uuid.UUID
	Name                  *string
	Description           *string
	AccessPolicy          *types.AccessPolicy
	Passphrase            *string
	Salt                  *string
	ShowAuthors           *bool
	ShowNotesOfOtherUsers *bool
	ShowNoteReactions     *bool
	AllowStacking         *bool
	AllowEditing          *bool
	TimerStart            *time.Time
	TimerEnd              *time.Time
	SharedNote            uuid.NullUUID
	ShowVoting            uuid.NullUUID
}

func (d *Database) CreateBoard(creator uuid.UUID, board BoardInsert, columns []ColumnInsert) (Board, error) {
	boardInsert := d.db.NewInsert().Model(&board).Returning("*")

	if board.AccessPolicy == types.AccessPolicyByPassphrase && (board.Passphrase == nil || board.Salt == nil) {
		return Board{}, errors.New("passphrase or salt may not be empty")
	} else if board.AccessPolicy != types.AccessPolicyByPassphrase && (board.Passphrase != nil || board.Salt != nil) {
		return Board{}, errors.New("passphrase or salt should not be set for policies except 'BY_PASSPHRASE'")
	}

	session := BoardSessionInsert{User: creator, Role: types.SessionRoleOwner}

	var b Board
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

func (d *Database) UpdateBoardTimer(update BoardTimerUpdate) (Board, error) {
	var board Board
	_, err := d.db.NewUpdate().Model(&update).Column("timer_start", "timer_end").Where("id = ?", update.ID).Returning("*").Exec(common.ContextWithValues(context.Background(), "Database", d, "Result", &board), &board)
	return board, err
}

func (d *Database) UpdateBoard(update BoardUpdate) (Board, error) {
	query := d.db.NewUpdate().Model(&update).Column("timer_start", "timer_end", "shared_note")

	if update.Name != nil {
		query.Column("name")
	}
	if update.Description != nil {
		query.Column("description")
	}
	if update.AccessPolicy != nil {
		if *update.AccessPolicy == types.AccessPolicyByPassphrase && (update.Passphrase == nil || update.Salt == nil) {
			return Board{}, errors.New("passphrase and salt should be set when access policy is updated")
		} else if *update.AccessPolicy != types.AccessPolicyByPassphrase && (update.Passphrase != nil || update.Salt != nil) {
			return Board{}, errors.New("passphrase and salt should not be set if access policy is defined as 'BY_PASSPHRASE'")
		}

		if *update.AccessPolicy == types.AccessPolicyByInvite {
			query.Where("access_policy = ?", types.AccessPolicyByInvite)
		} else {
			query.Where("access_policy <> ?", types.AccessPolicyByInvite)
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
	if update.AllowEditing != nil {
		query.Column("allow_editing")
	}

	var board Board
	var err error
	if update.ShowVoting.Valid {
		votingQuery := d.db.NewSelect().
			Model((*Voting)(nil)).
			Column("id").
			Where("board = ?", update.ID).
			Where("id = ?", update.ShowVoting.UUID).
			Where("status = ?", types.VotingStatusClosed)

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

func (d *Database) DeleteBoard(id uuid.UUID) error {
	_, err := d.db.NewDelete().Model((*Board)(nil)).Where("id = ?", id).Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardIdentifier, id))
	return err
}

func (d *Database) GetBoard(id uuid.UUID) (Board, error) {
	var board Board
	err := d.db.NewSelect().Model(&board).Where("id = ?", id).Scan(context.Background())
	return board, err
}

func (d *Database) GetBoards(userID uuid.UUID) ([]Board, error) {
	var boards []Board
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

func (d *Database) GetBoardOverview(id uuid.UUID) (Board, []BoardSession, []Column, error) {
	var board Board
	var sessions []BoardSession
	var columns []Column
	var err error

	board, err = d.GetBoard(id)
	if err != nil {
		return Board{}, nil, nil, err
	}
	sessions, err = d.GetBoardSessions(id)
	if err != nil {
		return Board{}, nil, nil, err
	}

	columns, err = d.GetColumns(id)
	if err != nil {
		return Board{}, nil, nil, err
	}

	return board, sessions, columns, err

}
