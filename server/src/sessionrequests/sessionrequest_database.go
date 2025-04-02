package sessionrequests

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
)

type SessionRequestDB struct {
	db *bun.DB
}

func NewSessionRequestDatabase(database *bun.DB) SessionRequestDatabase {
	db := new(SessionRequestDB)
	db.db = database

	return db
}

// CreateBoardSessionRequest creates a new board session request with the state 'PENDING' and does nothing if it already exists
func (database *SessionRequestDB) CreateBoardSessionRequest(request DatabaseBoardSessionRequestInsert) (DatabaseBoardSessionRequest, error) {
	r := DatabaseBoardSessionRequest{Board: request.Board, User: request.User, Status: RequestPending}
	insertQuery := database.db.NewInsert().Model(&r).ExcludeColumn("name").On("CONFLICT (\"user\", board) DO UPDATE SET board=?", request.Board).Returning("*")
	err := database.db.NewSelect().
		With("insertQuery", insertQuery).
		Model((*BoardSessionRequest)(nil)).
		ModelTableExpr("\"insertQuery\" AS s").
		ColumnExpr("s.board, s.user, u.name, s.status, s.created_at").
		Join("INNER JOIN users AS u ON u.id = s.user").
		Scan(common.ContextWithValues(context.Background(),
			"Database", database,
			"Operation", "INSERT",
			identifiers.BoardIdentifier, request.Board,
			"Result", &r,
		), &r)

	return r, err
}

// UpdateBoardSessionRequest updates an existing board session request
func (database *SessionRequestDB) UpdateBoardSessionRequest(update DatabaseBoardSessionRequestUpdate) (DatabaseBoardSessionRequest, error) {
	var r DatabaseBoardSessionRequest
	updateQuery := database.db.NewUpdate().
		Model(&update).
		Where("board = ?", update.Board).
		Where("\"user\" = ?", update.User).
		Where("status = ?", RequestPending).
		Returning("*")

	err := database.db.NewSelect().
		With("updateQuery", updateQuery).
		Model((*BoardSessionRequest)(nil)).
		ModelTableExpr("\"updateQuery\" AS s").
		ColumnExpr("s.board, s.user, u.name, s.status, s.created_at").
		Where("s.board = ?", update.Board).
		Where("s.user = ?", update.User).
		Join("INNER JOIN users AS u ON u.id = s.user").
		Scan(common.ContextWithValues(context.Background(),
			"Database", database,
			"Operation", "UPDATE",
			identifiers.BoardIdentifier, update.Board,
			"Result", &r,
		), &r)

	if err != nil {
		return DatabaseBoardSessionRequest{}, err
	}

	if r.Board == uuid.Nil {
		return DatabaseBoardSessionRequest{}, errors.New("no session to update found")
	}

	return r, err
}

// GetBoardSessionRequest returns the board session request for the specified board and user
func (database *SessionRequestDB) GetBoardSessionRequest(board, user uuid.UUID) (DatabaseBoardSessionRequest, error) {
	var request DatabaseBoardSessionRequest
	err := database.db.NewSelect().
		Model(&request).
		ModelTableExpr("board_session_requests AS s").
		ColumnExpr("s.board, s.user, u.name, s.status, s.created_at").
		Where("s.board = ?", board).
		Where("s.user = ?", user).
		Join("INNER JOIN users AS u ON u.id = s.user").
		Scan(context.Background())

	return request, err
}

// GetBoardSessionRequests returns the list of all board session requests filtered by the status
func (database *SessionRequestDB) GetBoardSessionRequests(board uuid.UUID, status ...RequestStatus) ([]DatabaseBoardSessionRequest, error) {
	var requests []DatabaseBoardSessionRequest
	query := database.db.NewSelect().
		Model(&requests).
		ModelTableExpr("board_session_requests AS s").
		ColumnExpr("s.board, s.user, u.name, s.status, s.created_at")

	for _, value := range status {
		query = query.WhereOr("s.status = ?", value)
	}

	err := query.
		Where("s.board = ?", board).
		Join("INNER JOIN users AS u ON u.id = s.user").
		Order("created_at ASC").
		Scan(context.Background())

	return requests, err
}

func (database *SessionRequestDB) BoardSessionRequestExists(board, user uuid.UUID) (bool, error) {
	return database.db.NewSelect().
		Table("board_session_requests").
		Where("\"board\" = ?", board).
		Where("\"user\" = ?", user).
		Exists(context.Background())
}
