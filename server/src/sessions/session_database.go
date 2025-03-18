package sessions

import (
	"context"
	"errors"

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

func (db *SessionDB) CreateBoardSession(boardSession DatabaseBoardSessionInsert) (DatabaseBoardSession, error) {
	if boardSession.Role == SessionRoleOwner {
		return DatabaseBoardSession{}, errors.New("not allowed to create board session with owner role")
	}

	var session DatabaseBoardSession
	insertQuery := db.db.NewInsert().
		Model(&boardSession).
		Returning("*")
	err := db.db.NewSelect().
		With("insertQuery", insertQuery).
		Model((*DatabaseBoardSession)(nil)).
		ModelTableExpr("\"insertQuery\" AS s").
		ColumnExpr("s.board, s.user, u.avatar, u.name, u.account_type, s.connected, s.show_hidden_columns, s.ready, s.raised_hand, s.role, s.banned").
		Where("s.board = ?", boardSession.Board).
		Where("s.user = ?", boardSession.User).
		Join("INNER JOIN users AS u ON u.id = s.user").
		Scan(common.ContextWithValues(context.Background(),
			"Database", db,
			"Operation", "INSERT",
			identifiers.BoardIdentifier, boardSession.Board,
			"Result", &session,
		), &session)

	return session, err
}

func (db *SessionDB) UpdateBoardSession(update DatabaseBoardSessionUpdate) (DatabaseBoardSession, error) {
	updateQuery := db.db.NewUpdate().Model(&update)
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
		if *update.Role == SessionRoleOwner {
			updateQuery.Where("role = ?", SessionRoleOwner)
		}
	}
	if update.Banned != nil {
		updateQuery = updateQuery.Column("banned")
	}

	updateQuery.Where("\"board\" = ?", update.Board).Where("\"user\" = ?", update.User).Returning("*")

	var session DatabaseBoardSession
	err := db.db.NewSelect().
		With("updateQuery", updateQuery).
		Model((*DatabaseBoardSession)(nil)).
		ModelTableExpr("\"updateQuery\" AS s").
		ColumnExpr("s.board, s.user, u.avatar, u.name, u.account_type, s.connected, s.show_hidden_columns, s.ready, s.raised_hand, s.role, s.banned").
		Where("s.board = ?", update.Board).
		Where("s.user = ?", update.User).
		Join("INNER JOIN users AS u ON u.id = s.user").
		Scan(common.ContextWithValues(context.Background(),
			"Database", db,
			"Operation", "UPDATE",
			identifiers.BoardIdentifier, update.Board,
			"Result", &session,
		), &session)

	return session, err
}

func (db *SessionDB) UpdateBoardSessions(update DatabaseBoardSessionUpdate) ([]DatabaseBoardSession, error) {
	updateQuery := db.db.NewUpdate().Model(&update)
	if update.Ready != nil {
		updateQuery = updateQuery.Column("ready")
	}
	if update.RaisedHand != nil {
		updateQuery = updateQuery.Column("raised_hand")
	}

	updateQuery.Where("\"board\" = ?", update.Board).Returning("*")

	var sessions []DatabaseBoardSession
	err := db.db.NewSelect().
		With("updateQuery", updateQuery).
		Model((*DatabaseBoardSession)(nil)).
		ModelTableExpr("\"updateQuery\" AS s").
		ColumnExpr("s.board, s.user, u.avatar, u.name, u.account_type, s.connected, s.show_hidden_columns, s.ready, s.raised_hand, s.role, s.banned").
		Where("s.board = ?", update.Board).
		Join("INNER JOIN users AS u ON u.id = s.user").
		Scan(context.Background(), &sessions)

	return sessions, err
}

func (db *SessionDB) BoardSessionExists(board, user uuid.UUID) (bool, error) {
	return db.db.NewSelect().
		Table("board_sessions").
		Where("\"board\" = ?", board).
		Where("\"user\" = ?", user).
		Exists(context.Background())
}

func (db *SessionDB) BoardModeratorSessionExists(board, user uuid.UUID) (bool, error) {
	return db.db.NewSelect().
		Table("board_sessions").
		Where("\"board\" = ?", board).
		Where("\"user\" = ?", user).
		Where("role <> ?", SessionRoleParticipant).
		Exists(context.Background())
}

func (db *SessionDB) ParticipantBanned(board, user uuid.UUID) (bool, error) {
	return db.db.NewSelect().
		Table("board_sessions").
		Where("\"board\" = ?", board).
		Where("\"user\" = ?", user).
		Where("\"banned\" = ?", true).
		Exists(context.Background())
}

func (db *SessionDB) GetBoardSession(board, user uuid.UUID) (DatabaseBoardSession, error) {
	var session DatabaseBoardSession
	err := db.db.NewSelect().
		TableExpr("board_sessions AS s").
		ColumnExpr("s.board, s.user, u.avatar, u.name, u.account_type, s.connected, s.show_hidden_columns, s.ready, s.raised_hand, s.role, s.banned").
		Where("s.board = ?", board).
		Where("s.user = ?", user).
		Join("INNER JOIN users AS u ON u.id = s.user").
		Scan(context.Background(), &session)
	return session, err
}

func (db *SessionDB) GetBoardSessions(board uuid.UUID, filter ...BoardSessionFilter) ([]DatabaseBoardSession, error) {
	query := db.db.NewSelect().
		TableExpr("board_sessions AS s").
		ColumnExpr("s.user, u.avatar, u.name, u.account_type, s.connected, s.show_hidden_columns, s.ready, s.raised_hand, s.role, s.banned").
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
	err := query.Scan(context.Background(), &sessions)
	return sessions, err
}

// Gets all board sessions of a single user who he is currently connected to
func (db *SessionDB) GetUserConnectedBoards(user uuid.UUID) ([]DatabaseBoardSession, error) {
	var sessions []DatabaseBoardSession
	err := db.db.NewSelect().
		TableExpr("board_sessions AS s").
		ColumnExpr("s.board, s.user, u.avatar, u.name, u.account_type, s.connected, s.show_hidden_columns, s.ready, s.raised_hand, s.role, s.banned").
		Where("s.user = ?", user).
		Where("s.connected").
		Join("INNER JOIN users AS u ON u.id = s.user").
		Scan(context.Background(), &sessions)
	if err != nil {
		return nil, err
	}

	return sessions, err
}
