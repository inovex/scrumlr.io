package sessions

import (
  "context"
  "errors"

  "github.com/google/uuid"
  "github.com/uptrace/bun"
  "scrumlr.io/server/common"
  "scrumlr.io/server/identifiers"
)

type DB struct {
  db *bun.DB
}

func NewSessionDatabase(database *bun.DB) SessionDatabase {
  db := new(DB)
  db.db = database

  return db
}

func (database *DB) Create(ctx context.Context, boardSession DatabaseBoardSessionInsert) (DatabaseBoardSession, error) {
  if boardSession.Role == common.OwnerRole {
    return DatabaseBoardSession{}, errors.New("not allowed to create board session with owner role")
  }

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

func (database *DB) Update(ctx context.Context, update DatabaseBoardSessionUpdate) (DatabaseBoardSession, error) {
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

func (database *DB) UpdateAll(ctx context.Context, update DatabaseBoardSessionUpdate) ([]DatabaseBoardSession, error) {
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

func (database *DB) Exists(ctx context.Context, board, user uuid.UUID) (bool, error) {
  return database.db.NewSelect().
    Table("board_sessions").
    Where("\"board\" = ?", board).
    Where("\"user\" = ?", user).
    Exists(ctx)
}

func (database *DB) ModeratorExists(ctx context.Context, board, user uuid.UUID) (bool, error) {
  return database.db.NewSelect().
    Table("board_sessions").
    Where("\"board\" = ?", board).
    Where("\"user\" = ?", user).
    Where("role <> ?", common.ParticipantRole).
    Exists(ctx)
}

func (database *DB) IsParticipantBanned(ctx context.Context, board, user uuid.UUID) (bool, error) {
  return database.db.NewSelect().
    Table("board_sessions").
    Where("\"board\" = ?", board).
    Where("\"user\" = ?", user).
    Where("\"banned\" = ?", true).
    Exists(ctx)
}

func (database *DB) Get(ctx context.Context, board, user uuid.UUID) (DatabaseBoardSession, error) {
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

func (database *DB) GetAll(ctx context.Context, board uuid.UUID, filter ...BoardSessionFilter) ([]DatabaseBoardSession, error) {
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

// Gets all board sessions of a single user who he is currently connected to
func (database *DB) GetUserConnectedBoards(ctx context.Context, user uuid.UUID) ([]DatabaseBoardSession, error) {
  var sessions []DatabaseBoardSession
  err := database.db.NewSelect().
    TableExpr("board_sessions AS s").
    ColumnExpr("s.board, s.user, u.avatar, u.name, u.account_type, s.connected, s.show_hidden_columns, s.ready, s.raised_hand, s.role, s.banned").
    Where("s.user = ?", user).
    Where("s.connected").
    Join("INNER JOIN users AS u ON u.id = s.user").
    Scan(ctx, &sessions)

  return sessions, err
}
