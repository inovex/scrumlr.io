package database

import "github.com/google/uuid"

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
