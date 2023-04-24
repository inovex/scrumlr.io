package database

import (
	"context"
	"errors"
	"net/url"
	"strconv"
	"time"

	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/filter"

	"github.com/uptrace/bun"
	"scrumlr.io/server/database/types"
)

type BoardSession struct {
	bun.BaseModel     `bun:"table:board_sessions"`
	Board             uuid.UUID
	User              uuid.UUID
	Avatar            *types.Avatar
	Name              string
	ShowHiddenColumns bool
	Connected         bool
	Ready             bool
	RaisedHand        bool
	ViewsSharedNote   bool
	Moderating        bool
	Role              types.SessionRole
	CreatedAt         time.Time
}

type BoardSessionInsert struct {
	bun.BaseModel `bun:"table:board_sessions"`
	Board         uuid.UUID
	User          uuid.UUID
	Role          types.SessionRole
}

type BoardSessionUpdate struct {
	bun.BaseModel     `bun:"table:board_sessions"`
	Board             uuid.UUID
	User              uuid.UUID
	Connected         *bool
	ShowHiddenColumns *bool
	Ready             *bool
	RaisedHand        *bool
	ViewsSharedNote   *bool
	Moderating        *bool
	Role              *types.SessionRole
}

func BoardSessionFilterTypeFromQueryString(query url.Values) filter.BoardSessionFilter {
	filter := filter.BoardSessionFilter{}
	connectedFilter := query.Get("connected")
	if connectedFilter != "" {
		value, _ := strconv.ParseBool(connectedFilter)
		filter.Connected = &value
	}
	readyFilter := query.Get("ready")
	if readyFilter != "" {
		value, _ := strconv.ParseBool(readyFilter)
		filter.Ready = &value
	}
	raisedHandFilter := query.Get("raisedHand")
	if raisedHandFilter != "" {
		value, _ := strconv.ParseBool(raisedHandFilter)
		filter.RaisedHand = &value
	}
	viewsSharedNoteFilter := query.Get("viewsSharedNote")
	if viewsSharedNoteFilter != "" {
		value, _ := strconv.ParseBool(viewsSharedNoteFilter)
		filter.ViewsSharedNote = &value
	}
	moderatingFilter := query.Get("moderating")
	if moderatingFilter != "" {
		value, _ := strconv.ParseBool(moderatingFilter)
		filter.Moderating = &value
	}
	roleFilter := query.Get("role")
	if roleFilter != "" {
		filter.Role = (*types.SessionRole)(&roleFilter)
	}
	return filter
}

func (d *Database) CreateBoardSession(boardSession BoardSessionInsert) (BoardSession, error) {
	if boardSession.Role == types.SessionRoleOwner {
		return BoardSession{}, errors.New("not allowed to create board session with owner role")
	}

	var s BoardSession
	insertQuery := d.db.NewInsert().
		Model(&boardSession).
		Returning("*")
	err := d.db.NewSelect().
		With("insertQuery", insertQuery).
		Model((*BoardSession)(nil)).
		ModelTableExpr("\"insertQuery\" AS s").
		ColumnExpr("s.board, s.user, u.avatar, u.name, s.connected, s.show_hidden_columns, s.ready, s.raised_hand, s.views_shared_note, s.moderating, s.role").
		Where("s.board = ?", boardSession.Board).
		Where("s.user = ?", boardSession.User).
		Join("INNER JOIN users AS u ON u.id = s.user").
		Scan(common.ContextWithValues(context.Background(),
			"Database", d,
			"Operation", "INSERT",
			"Board", boardSession.Board,
			"Result", &s,
		), &s)

	return s, err
}

func (d *Database) UpdateBoardSession(update BoardSessionUpdate) (BoardSession, error) {
	updateQuery := d.db.NewUpdate().Model(&update)
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
	if update.ViewsSharedNote != nil {
		updateQuery = updateQuery.Column("views_shared_note")
	}
	if update.Moderating != nil {
		updateQuery = updateQuery.Column("moderating")
	}
	if update.Role != nil {
		updateQuery = updateQuery.Column("role")
		if *update.Role == types.SessionRoleOwner {
			updateQuery.Where("role = ?", types.SessionRoleOwner)
		}
	}

	updateQuery.Where("\"board\" = ?", update.Board).Where("\"user\" = ?", update.User).Returning("*")

	var session BoardSession
	err := d.db.NewSelect().
		With("updateQuery", updateQuery).
		Model((*BoardSession)(nil)).
		ModelTableExpr("\"updateQuery\" AS s").
		ColumnExpr("s.board, s.user, u.avatar, u.name, s.connected, s.show_hidden_columns, s.ready, s.raised_hand, s.views_shared_note, s.moderating, s.role").
		Where("s.board = ?", update.Board).
		Where("s.user = ?", update.User).
		Join("INNER JOIN users AS u ON u.id = s.user").
		Scan(common.ContextWithValues(context.Background(),
			"Database", d,
			"Operation", "UPDATE",
			"Board", update.Board,
			"Result", &session,
		), &session)

	return session, err
}

func (d *Database) UpdateBoardSessions(update BoardSessionUpdate) ([]BoardSession, error) {
	updateQuery := d.db.NewUpdate().Model(&update)
	if update.Ready != nil {
		updateQuery = updateQuery.Column("ready")
	}
	if update.RaisedHand != nil {
		updateQuery = updateQuery.Column("raised_hand")
	}

	updateQuery.Where("\"board\" = ?", update.Board).Returning("*")

	var sessions []BoardSession
	err := d.db.NewSelect().
		With("updateQuery", updateQuery).
		Model((*BoardSession)(nil)).
		ModelTableExpr("\"updateQuery\" AS s").
		ColumnExpr("s.board, s.user, u.avatar, u.name, s.connected, s.show_hidden_columns, s.ready, s.raised_hand, s.role").
		Where("s.board = ?", update.Board).
		Join("INNER JOIN users AS u ON u.id = s.user").
		Scan(context.Background(), &sessions)

	// send update to observers here, as bun .AfterScanRow() is triggered for each updated row
	// see more details in: https://github.com/inovex/scrumlr.io/pull/2071/files#r1026237100
	for _, observer := range d.observer {
		if o, ok := observer.(BoardSessionsObserver); ok {
			o.UpdatedSessions(update.Board, sessions)
		}
	}

	return sessions, err
}

func (d *Database) BoardSessionExists(board, user uuid.UUID) (bool, error) {
	return d.db.NewSelect().Table("board_sessions").Where("\"board\" = ?", board).Where("\"user\" = ?", user).Exists(context.Background())
}

func (d *Database) BoardModeratorSessionExists(board, user uuid.UUID) (bool, error) {
	return d.db.NewSelect().Table("board_sessions").Where("\"board\" = ?", board).Where("\"user\" = ?", user).Where("role <> ?", types.SessionRoleParticipant).Exists(context.Background())
}

func (d *Database) GetBoardSession(board, user uuid.UUID) (BoardSession, error) {
	var session BoardSession
	err := d.db.NewSelect().
		TableExpr("board_sessions AS s").
		ColumnExpr("s.board, s.user, u.avatar, u.name, s.connected, s.show_hidden_columns, s.ready, s.raised_hand, s.views_shared_note, s.moderating, s.role").
		Where("s.board = ?", board).
		Where("s.user = ?", user).
		Join("INNER JOIN users AS u ON u.id = s.user").
		Scan(context.Background(), &session)
	return session, err
}

func (d *Database) GetBoardSessions(board uuid.UUID, filter ...filter.BoardSessionFilter) ([]BoardSession, error) {
	query := d.db.NewSelect().
		TableExpr("board_sessions AS s").
		ColumnExpr("s.user, u.avatar, u.name, s.connected, s.show_hidden_columns, s.ready, s.raised_hand, s.views_shared_note, s.moderating, s.role").
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
		if f.ViewsSharedNote != nil {
			query = query.Where("s.views_shared_note = ?", *f.ViewsSharedNote)
		}
		if f.Moderating != nil {
			query = query.Where("s.moderating = ?", *f.Moderating)
		}
		if f.Connected != nil {
			query = query.Where("s.connected = ?", *f.Connected)
		}
		if f.Role != nil {
			query = query.Where("s.role = ?", *f.Role)
		}
	}

	var sessions []BoardSession
	err := query.Scan(context.Background(), &sessions)
	return sessions, err
}
