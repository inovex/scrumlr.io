package scheduler

import (
	"context"
	"fmt"
	"scrumlr.io/server/logger"
	"time"
)

type Config struct {
	Jobs []Job `yaml:"jobs"`
}

type Job struct {
	// information for scheduler
	Name        string `yaml:"name"`
	Schedule    string `yaml:"schedule"`
	WithSeconds bool   `yaml:"withSeconds"`
	// information for task
	Task map[string]interface{} `yaml:"task"`
}

type Task interface {
	GetParams() []any
}

/*
	DeleteBoards

this struct defines the parameters needed for the methode associated to this task
When adding new task to the scheduler, creating a struct for this task is required
*/
type DeleteBoards struct {
	TimeToExpire string `mapstructure:"timeToExpiry"`
	Interactions int    `mapstructure:"interactions"`
}

/*
	GetParams()

All structs that are created for a task should implement the GetParams methode
for easier access to the methode parameters
*/
func (t DeleteBoards) GetParams() []any {
	return []any{t.TimeToExpire, t.Interactions}
}

/*
	deleteUnusedBoards

Methode associated to the DeleteBoards struct
*/
func (s *SchedulerService) deleteUnusedBoards(ctx context.Context, t string, interactions int) {
	log := logger.FromContext(ctx)
	duration, err := time.ParseDuration(t)
	if err != nil {
		log.Errorw("Failed parsing time", "error", err)
	}
	lastValidDate := time.Now().Add(-duration)
	sessions, err := s.database.GetSessionsOlderThan(lastValidDate, interactions)

	if err != nil {
		log.Errorw("Failed")
	}

	for _, session := range sessions {
		err := s.database.DeleteBoard(session.Board)
		if err != nil {
			log.Errorw("Failed to delete board", "error", err)
		}
	}
}

func (s *SchedulerService) tmpTask(string2 string, int2 int, bool2 bool) {
	fmt.Printf("string: %s, int: %d, bool: %v\n", string2, int2, bool2)
}
