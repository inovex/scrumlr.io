package database

import (
	"context"
	"database/sql"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/database/types"
)

// BoardSessionRequest is the model for a board session request
type BoardSessionRequest struct {
	bun.BaseModel `bun:"table:board_session_requests"`
	Board         uuid.UUID
	User          uuid.UUID
	Name          string
	Status        types.BoardSessionRequestStatus
	CreatedAt     time.Time
}

// BoardSessionRequestInsert is the model for board session requests inserts
type BoardSessionRequestInsert struct {
	bun.BaseModel `bun:"table:board_session_requests"`
	Board         uuid.UUID
	User          uuid.UUID
}

// BoardSessionRequestUpdate is the model for a board session request update
type BoardSessionRequestUpdate struct {
	bun.BaseModel `bun:"table:board_session_requests"`
	Board         uuid.UUID
	User          uuid.UUID
	Status        types.BoardSessionRequestStatus
}

// CreateBoardSessionRequest creates a new board session request with the state 'PENDING' and does nothing if it already exists
func (d *Database) CreateBoardSessionRequest(request BoardSessionRequestInsert) (BoardSessionRequest, error) {
	r := BoardSessionRequest{Board: request.Board, User: request.User, Status: types.BoardSessionRequestStatusPending}
	insertQuery := d.writeDB.NewInsert().Model(&r).ExcludeColumn("name").On("CONFLICT (\"user\", board) DO UPDATE SET board=?", request.Board).Returning("*")
	err := d.readDB.NewSelect().
		With("insertQuery", insertQuery).
		Model((*BoardSessionRequest)(nil)).
		ModelTableExpr("\"insertQuery\" AS s").
		ColumnExpr("s.board, s.user, u.name, s.status, s.created_at").
		Join("INNER JOIN users AS u ON u.id = s.user").
		Scan(common.ContextWithValues(context.Background(),
			"Database", d,
			"Operation", "INSERT",
			"Board", request.Board,
			"Result", &r,
		), &r)

	if err == sql.ErrNoRows {

	}

	return r, err
}

func (d *Database) BoardSessionRequestExists(board, user uuid.UUID) (bool, error) {
	return d.readDB.NewSelect().Table("board_session_requests").Where("\"board\" = ?", board).Where("\"user\" = ?", user).Exists(context.Background())
}

// UpdateBoardSessionRequest updates an existing board session request
func (d *Database) UpdateBoardSessionRequest(update BoardSessionRequestUpdate) (BoardSessionRequest, error) {
	var r BoardSessionRequest
	updateQuery := d.writeDB.NewUpdate().
		Model(&update).
		Where("board = ?", update.Board).
		Where("\"user\" = ?", update.User).
		Where("status = ?", types.BoardSessionRequestStatusPending).
		Returning("*")

	err := d.readDB.NewSelect().
		With("updateQuery", updateQuery).
		Model((*BoardSessionRequest)(nil)).
		ModelTableExpr("\"updateQuery\" AS s").
		ColumnExpr("s.board, s.user, u.name, s.status, s.created_at").
		Where("s.board = ?", update.Board).
		Where("s.user = ?", update.User).
		Join("INNER JOIN users AS u ON u.id = s.user").
		Scan(common.ContextWithValues(context.Background(),
			"Database", d,
			"Operation", "UPDATE",
			"Board", update.Board,
			"Result", &r,
		), &r)

	if err != nil {
		return BoardSessionRequest{}, err
	}

	if r.Board == uuid.Nil {
		return BoardSessionRequest{}, errors.New("no session to update found")
	}

	if update.Status == types.BoardSessionRequestStatusAccepted {
		_, err := d.CreateBoardSession(BoardSessionInsert{
			Board: update.Board,
			User:  update.User,
			Role:  types.SessionRoleParticipant,
		})

		if err != nil {
			return BoardSessionRequest{}, err
		}
	}
	return r, err
}

// GetBoardSessionRequest returns the board session request for the specified board and user
func (d *Database) GetBoardSessionRequest(board, user uuid.UUID) (BoardSessionRequest, error) {
	var request BoardSessionRequest
	err := d.readDB.NewSelect().
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
func (d *Database) GetBoardSessionRequests(board uuid.UUID, status ...types.BoardSessionRequestStatus) ([]BoardSessionRequest, error) {
	var requests []BoardSessionRequest
	query := d.readDB.NewSelect().
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
