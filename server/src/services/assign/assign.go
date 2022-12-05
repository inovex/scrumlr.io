package assign

import (
	"context"

	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/services"

	"scrumlr.io/server/database"
	"scrumlr.io/server/logger"
)

type AssignService struct {
	database *database.Database
	realtime *realtime.Broker
}

func NewAssignService(db *database.Database, rt *realtime.Broker) services.Assignings {
	b := new(AssignService)
	b.database = db
	b.realtime = rt
	return b
}

func (s *AssignService) AddAssign(ctx context.Context, body dto.AssignRequest) (*dto.Assign, error) {
	log := logger.FromContext(ctx)
	a, err := s.database.AddAssign(body.Board, body.Note, body.Name, body.Id)
	if err != nil {

		log.Warnw("unable to assign", "note", body.Note, "name", body.Name, "id", body.Id, "err", err)
		return nil, err
	}
	return new(dto.Assign).From(a), err
}

func (s *AssignService) RemoveAssign(_ context.Context, body dto.AssignRequest) error {
	return s.database.RemoveAssign(body.Board, body.Note, body.Name, body.Id)
}

func (s *AssignService) GetAssignings(_ context.Context, f filter.AssignFilter) ([]*dto.Assign, error) {
	assignings, err := s.database.GetAssignings(f)
	return dto.Assignings(assignings), err

}
