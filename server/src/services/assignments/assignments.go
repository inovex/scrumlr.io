package assignments

import (
	"context"
	"github.com/google/uuid"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/database"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/services"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/common"
)

type AssignmentService struct {
  database DB
  realtime *realtime.Broker
}

type Observer interface {
  AttachObserver(observer database.Observer)
}

type DB interface {
  Observer
  CreateAssignment(insert database.AssignmentInsert) (database.Assignment, error)
  DeleteAssignment(board, assignment uuid.UUID) error
}

func NewAssignmentService(db DB, rt *realtime.Broker) services.Assignments {
  b := new(AssignmentService)
  b.database = db
  b.realtime = rt
  b.database.AttachObserver((database.AssignmentsObserver)(b))
  return b
}

func (s *AssignmentService) Create(ctx context.Context, body dto.AssignmentCreateRequest) (*dto.Assignment, error) {
  log := logger.FromContext(ctx)
  assignment, err := s.database.CreateAssignment(database.AssignmentInsert{
    Board: body.Board,
    Note: body.Note,
    Name: body.Name,
  })
  if err != nil {
    log.Errorw("unable to create assignment", "board", body.Board, "note", body.Note, "error", err)
    return nil, common.InternalServerError
  }

  s.CreatedAssignment(body.Board, assignment)

  return new(dto.Assignment).From(assignment), err
}

func (s *AssignmentService) Delete(ctx context.Context, id uuid.UUID) error {
  return s.database.DeleteAssignment(ctx.Value("Board").(uuid.UUID), id)
}

func (s *AssignmentService) CreatedAssignment(board uuid.UUID, assignment database.Assignment) {
  err := s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
    Type: realtime.BoardEventAssignmentCreated,
    Data: new(dto.Assignment).From(assignment),
  })
	if err != nil {
		logger.Get().Errorw("unable to broadcast deleted assignment", "err", err)
	}
}

func (s *AssignmentService) DeletedAssignment(board, assignment uuid.UUID) {
  err := s.realtime.BroadcastToBoard(board, realtime.BoardEvent{
    Type: realtime.BoardEventAssignmentDeleted,
    Data: assignment,
  })
	if err != nil {
		logger.Get().Errorw("unable to broadcast deleted assignment", "err", err)
	}
}
