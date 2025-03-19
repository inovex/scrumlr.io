package services

import (
	"context"

	"scrumlr.io/server/columns"
	"scrumlr.io/server/votes"

	"github.com/google/uuid"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/common/filter"
)

type Boards interface {
	Create(ctx context.Context, body dto.CreateBoardRequest) (*dto.Board, error)
	Get(ctx context.Context, id uuid.UUID) (*dto.Board, error)
	Update(ctx context.Context, body dto.BoardUpdateRequest) (*dto.Board, error)
	Delete(ctx context.Context, id uuid.UUID) error

	SetTimer(ctx context.Context, id uuid.UUID, minutes uint8) (*dto.Board, error)
	DeleteTimer(ctx context.Context, id uuid.UUID) (*dto.Board, error)
	IncrementTimer(ctx context.Context, id uuid.UUID) (*dto.Board, error)

	CreateColumn(ctx context.Context, body dto.ColumnRequest) (*columns.Column, error)
	DeleteColumn(ctx context.Context, board, column, user uuid.UUID) error
	UpdateColumn(ctx context.Context, body dto.ColumnUpdateRequest) (*columns.Column, error)
	GetColumn(ctx context.Context, boardID, columnID uuid.UUID) (*columns.Column, error)
	ListColumns(ctx context.Context, boardID uuid.UUID) ([]*columns.Column, error)

	FullBoard(ctx context.Context, boardID uuid.UUID) (*dto.FullBoard, error)
	BoardOverview(ctx context.Context, boardIDs []uuid.UUID, user uuid.UUID) ([]*dto.BoardOverview, error)
	GetBoards(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error)
}

type Votings interface {
	Create(ctx context.Context, body votes.VotingCreateRequest) (*votes.Voting, error)
	Update(ctx context.Context, body votes.VotingUpdateRequest) (*votes.Voting, error)
	Get(ctx context.Context, board, id uuid.UUID) (*votes.Voting, error)
	List(ctx context.Context, board uuid.UUID) ([]*votes.Voting, error)

	AddVote(ctx context.Context, req dto.VoteRequest) (*dto.Vote, error)
	RemoveVote(ctx context.Context, req dto.VoteRequest) error
	GetVotes(ctx context.Context, f filter.VoteFilter) ([]*dto.Vote, error)
}

type BoardReactions interface {
	Create(ctx context.Context, board uuid.UUID, body dto.BoardReactionCreateRequest)
}

type BoardTemplates interface {
	Create(ctx context.Context, body dto.CreateBoardTemplateRequest) (*dto.BoardTemplate, error)
	Get(ctx context.Context, id uuid.UUID) (*dto.BoardTemplate, error)
	List(ctx context.Context, user uuid.UUID) ([]*dto.BoardTemplateFull, error)
	Update(ctx context.Context, body dto.BoardTemplateUpdateRequest) (*dto.BoardTemplate, error)
	Delete(ctx context.Context, id uuid.UUID) error

	CreateColumnTemplate(ctx context.Context, body dto.ColumnTemplateRequest) (*dto.ColumnTemplate, error)
	GetColumnTemplate(ctx context.Context, boardID, columnID uuid.UUID) (*dto.ColumnTemplate, error)
	ListColumnTemplates(ctx context.Context, board uuid.UUID) ([]*dto.ColumnTemplate, error)
	UpdateColumnTemplate(ctx context.Context, body dto.ColumnTemplateUpdateRequest) (*dto.ColumnTemplate, error)
	DeleteColumnTemplate(ctx context.Context, boar, column, user uuid.UUID) error
}
