package services

import (
	"context"

	"github.com/google/uuid"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/common/filter"
)

type Users interface {
	Get(ctx context.Context, id uuid.UUID) (*dto.User, error)
	LoginAnonymous(ctx context.Context, name string) (*dto.User, error)
	CreateGitHubUser(ctx context.Context, id, name, avatarUrl string) (*dto.User, error)
	CreateGoogleUser(ctx context.Context, id, name, avatarUrl string) (*dto.User, error)
	CreateMicrosoftUser(ctx context.Context, id, name, avatarUrl string) (*dto.User, error)
	CreateAzureAdUser(ctx context.Context, id, name, avatarUrl string) (*dto.User, error)
	CreateAppleUser(ctx context.Context, id, name, avatarUrl string) (*dto.User, error)
	Update(ctx context.Context, body dto.UserUpdateRequest) (*dto.User, error)
}

type Feedback interface {
	Create(ctx context.Context, feedbackType string, contact string, text string)
	Enabled() bool
}

type Boards interface {
	Create(ctx context.Context, body dto.CreateBoardRequest) (*dto.Board, error)
	Get(ctx context.Context, id uuid.UUID) (*dto.Board, error)
	Update(ctx context.Context, body dto.BoardUpdateRequest) (*dto.Board, error)
	Delete(ctx context.Context, id uuid.UUID) error

	SetTimer(ctx context.Context, id uuid.UUID, minutes uint8) (*dto.Board, error)
	DeleteTimer(ctx context.Context, id uuid.UUID) (*dto.Board, error)

	CreateColumn(ctx context.Context, body dto.ColumnRequest) (*dto.Column, error)
	DeleteColumn(ctx context.Context, board, column, user uuid.UUID) error
	UpdateColumn(ctx context.Context, body dto.ColumnUpdateRequest) (*dto.Column, error)
	GetColumn(ctx context.Context, boardID, columnID uuid.UUID) (*dto.Column, error)
	ListColumns(ctx context.Context, boardID uuid.UUID) ([]*dto.Column, error)

	FullBoard(ctx context.Context, boardID uuid.UUID) (*dto.Board, []*dto.BoardSessionRequest, []*dto.BoardSession, []*dto.Column, []*dto.Note, []*dto.Voting, []*dto.Vote, []*dto.Assignment, error)
}

type BoardSessions interface {
	Get(ctx context.Context, boardID, userID uuid.UUID) (*dto.BoardSession, error)
	Create(ctx context.Context, boardID, userID uuid.UUID) (*dto.BoardSession, error)
	Update(ctx context.Context, body dto.BoardSessionUpdateRequest) (*dto.BoardSession, error)
	UpdateAll(ctx context.Context, body dto.BoardSessionsUpdateRequest) ([]*dto.BoardSession, error)
	List(ctx context.Context, boardID uuid.UUID, f filter.BoardSessionFilter) ([]*dto.BoardSession, error)
	Connect(ctx context.Context, boardID, userID uuid.UUID) error
	Disconnect(ctx context.Context, boardID, userID uuid.UUID) error

	GetSessionRequest(ctx context.Context, boardID, userID uuid.UUID) (*dto.BoardSessionRequest, error)
	CreateSessionRequest(ctx context.Context, boardID, userID uuid.UUID) (*dto.BoardSessionRequest, error)
	ListSessionRequest(ctx context.Context, boardID uuid.UUID, statusQuery string) ([]*dto.BoardSessionRequest, error)
	UpdateSessionRequest(ctx context.Context, body dto.BoardSessionRequestUpdate) (*dto.BoardSessionRequest, error)

	SessionExists(ctx context.Context, boardID, userID uuid.UUID) (bool, error)
	ModeratorSessionExists(ctx context.Context, boardID, userID uuid.UUID) (bool, error)
	SessionRequestExists(ctx context.Context, boardID, userID uuid.UUID) (bool, error)
}

type Notes interface {
	Create(ctx context.Context, body dto.NoteCreateRequest) (*dto.Note, error)
	Get(ctx context.Context, id uuid.UUID) (*dto.Note, error)
	GetBySeqNum(ctx context.Context, body dto.NoteResentRequest) (*dto.Note, error)
	Update(ctx context.Context, body dto.NoteUpdateRequest) (*dto.Note, error)
	List(ctx context.Context, id uuid.UUID) ([]*dto.Note, error)
	Delete(ctx context.Context, body dto.NoteDeleteRequest, id uuid.UUID) error
}

type Votings interface {
	Create(ctx context.Context, body dto.VotingCreateRequest) (*dto.Voting, error)
	Update(ctx context.Context, body dto.VotingUpdateRequest) (*dto.Voting, error)
	Get(ctx context.Context, board, id uuid.UUID) (*dto.Voting, error)
	List(ctx context.Context, board uuid.UUID) ([]*dto.Voting, error)

	AddVote(ctx context.Context, req dto.VoteRequest) (*dto.Vote, error)
	RemoveVote(ctx context.Context, req dto.VoteRequest) error
	GetVotes(ctx context.Context, f filter.VoteFilter) ([]*dto.Vote, error)
}

type Health interface {
	IsDatabaseHealthy() bool
	IsRealtimeHealthy() bool
}

type Assignments interface {
	Create(ctx context.Context, body dto.AssignmentCreateRequest) (*dto.Assignment, error)
	Delete(ctx context.Context, id uuid.UUID) error
}
