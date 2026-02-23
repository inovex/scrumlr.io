package sessions

import (
	"context"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
)

type SessionDB struct {
	db *bun.DB
}

func NewSessionDatabase(database *bun.DB) SessionDatabase {
	db := new(SessionDB)
	db.db = database

	return db
}

func (database *SessionDB) Create(ctx context.Context, boardSession DatabaseBoardSessionInsert) (DatabaseBoardSession, error) {
	var session DatabaseBoardSession
	insertQuery := database.db.NewInsert().
		Model(&boardSession).
		Returning("*")

	err := database.db.NewSelect().
		With("insertQuery", insertQuery).
		Model((*DatabaseBoardSession)(nil)).
		ModelTableExpr("\"insertQuery\" AS s").
		ColumnExpr("s.board, s.user, u.avatar, u.name, u.account_type, s.connected, s.show_hidden_columns, s.ready, s.raised_hand, s.role, s.banned").
		Where("s.board = ?", boardSession.Board).
		Where("s.user = ?", boardSession.User).
		Join("INNER JOIN users AS u ON u.id = s.user").
		Scan(common.ContextWithValues(ctx,
			"Database", database,
			"Operation", "INSERT",
			identifiers.BoardIdentifier, boardSession.Board,
			"Result", &session,
		), &session)

	return session, err
}

func (database *SessionDB) Update(ctx context.Context, update DatabaseBoardSessionUpdate) (DatabaseBoardSession, error) {
	updateQuery := database.db.NewUpdate().
		Model(&update)

	if update.Connected != nil {
		updateQuery = updateQuery.Column("connected")
	}

	if update.Ready != nil {
		updateQuery = updateQuery.Column("ready")
	}

	if update.ShowHiddenColumns != nil {
		updateQuery = updateQuery.Column("show_hidden_columns")
	}

	if update.RaisedHand != nil {
		updateQuery = updateQuery.Column("raised_hand")
	}

	if update.Role != nil {
		updateQuery = updateQuery.Column("role")
		if *update.Role == common.OwnerRole {
			updateQuery.Where("role = ?", common.OwnerRole)
		}
	}

	if update.Banned != nil {
		updateQuery = updateQuery.Column("banned")
	}

	updateQuery.Where("\"board\" = ?", update.Board).
		Where("\"user\" = ?", update.User).
		Returning("*")

	var session DatabaseBoardSession
	err := database.db.NewSelect().
		With("updateQuery", updateQuery).
		Model((*DatabaseBoardSession)(nil)).
		ModelTableExpr("\"updateQuery\" AS s").
		ColumnExpr("s.board, s.user, u.avatar, u.name, u.account_type, s.connected, s.show_hidden_columns, s.ready, s.raised_hand, s.role, s.banned").
		Where("s.board = ?", update.Board).
		Where("s.user = ?", update.User).
		Join("INNER JOIN users AS u ON u.id = s.user").
		Scan(common.ContextWithValues(ctx,
			"Database", database,
			"Operation", "UPDATE",
			identifiers.BoardIdentifier, update.Board,
			"Result", &session,
		), &session)

	return session, err
}

func (database *SessionDB) UpdateAll(ctx context.Context, update DatabaseBoardSessionUpdate) ([]DatabaseBoardSession, error) {
	updateQuery := database.db.NewUpdate().
		Model(&update)

	if update.Ready != nil {
		updateQuery = updateQuery.Column("ready")
	}

	if update.RaisedHand != nil {
		updateQuery = updateQuery.Column("raised_hand")
	}

	updateQuery.Where("\"board\" = ?", update.Board).
		Returning("*")

	var sessions []DatabaseBoardSession
	err := database.db.NewSelect().
		With("updateQuery", updateQuery).
		Model((*DatabaseBoardSession)(nil)).
		ModelTableExpr("\"updateQuery\" AS s").
		ColumnExpr("s.board, s.user, u.avatar, u.name, u.account_type, s.connected, s.show_hidden_columns, s.ready, s.raised_hand, s.role, s.banned").
		Where("s.board = ?", update.Board).
		Join("INNER JOIN users AS u ON u.id = s.user").
		Scan(ctx, &sessions)

	return sessions, err
}

func (database *SessionDB) Exists(ctx context.Context, board, user uuid.UUID) (bool, error) {
	return database.db.NewSelect().
		Table("board_sessions").
		Where("\"board\" = ?", board).
		Where("\"user\" = ?", user).
		Exists(ctx)
}

func (database *SessionDB) ModeratorExists(ctx context.Context, board, user uuid.UUID) (bool, error) {
	return database.db.NewSelect().
		Table("board_sessions").
		Where("\"board\" = ?", board).
		Where("\"user\" = ?", user).
		Where("role <> ?", common.ParticipantRole).
		Exists(ctx)
}

func (database *SessionDB) IsParticipantBanned(ctx context.Context, board, user uuid.UUID) (bool, error) {
	return database.db.NewSelect().
		Table("board_sessions").
		Where("\"board\" = ?", board).
		Where("\"user\" = ?", user).
		Where("\"banned\" = ?", true).
		Exists(ctx)
}

func (database *SessionDB) Get(ctx context.Context, board, user uuid.UUID) (DatabaseBoardSession, error) {
	var session DatabaseBoardSession
	err := database.db.NewSelect().
		TableExpr("board_sessions AS s").
		ColumnExpr("s.board, s.user, u.avatar, u.name, u.account_type, s.connected, s.show_hidden_columns, s.ready, s.raised_hand, s.role, s.banned").
		Where("s.board = ?", board).
		Where("s.user = ?", user).
		Join("INNER JOIN users AS u ON u.id = s.user").
		Scan(ctx, &session)

	return session, err
}

func (database *SessionDB) GetAll(ctx context.Context, board uuid.UUID, filter ...BoardSessionFilter) ([]DatabaseBoardSession, error) {
	query := database.db.NewSelect().
		TableExpr("board_sessions AS s").
		ColumnExpr("s.board, s.user, u.avatar, u.name, u.account_type, s.connected, s.show_hidden_columns, s.ready, s.raised_hand, s.role, s.banned").
		Where("s.board = ?", board).
		Join("INNER JOIN users AS u ON u.id = s.user")

	if len(filter) > 0 {
		f := filter[0]
		if f.Ready != nil {
			query = query.Where("s.ready = ?", *f.Ready)
		}
		if f.RaisedHand != nil {
			query = query.Where("s.raised_hand = ?", *f.RaisedHand)
		}
		if f.Connected != nil {
			query = query.Where("s.connected = ?", *f.Connected)
		}
		if f.Role != nil {
			query = query.Where("s.role = ?", *f.Role)
		}
	}

	var sessions []DatabaseBoardSession
	err := query.Scan(ctx, &sessions)
	return sessions, err
}

func (database *SessionDB) GetUserBoardSessions(ctx context.Context, user uuid.UUID, connectedOnly bool) ([]DatabaseBoardSession, error) {
	var sessions []DatabaseBoardSession
	query := database.db.NewSelect().
		TableExpr("board_sessions AS s").
		ColumnExpr("s.board, s.user, u.avatar, u.name, u.account_type, s.connected, s.show_hidden_columns, s.ready, s.raised_hand, s.role, s.banned").
		Where("s.user = ?", user).
		Join("INNER JOIN users AS u ON u.id = s.user")

	if connectedOnly {
		query.Where("s.connected = ?", connectedOnly)
	}
	err := query.Scan(ctx, &sessions)

	return sessions, err
}
