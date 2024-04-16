package scheduler

import (
	"context"
	"github.com/go-co-op/gocron/v2"
	"github.com/google/uuid"
	"math/rand"
	"scrumlr.io/server/database"
	"scrumlr.io/server/logger"
	"strconv"
	"strings"
	"time"
)

type DB interface {
	DeleteBoard(id uuid.UUID) error
	GetSessionsOlderThan(t time.Time, interactions int) ([]database.BoardSession, error)
}

type SchedulerService struct {
	database  DB
	scheduler gocron.Scheduler
}

func NewSchedulerService(db DB, scheduler gocron.Scheduler, path string) *SchedulerService {
	s := new(SchedulerService)
	s.database = db
	s.scheduler = scheduler
	r := rand.New(rand.NewSource(time.Now().UnixNano()))
	s.StartScheduler(path, strconv.Itoa(r.Intn(60)))
	return s
}

/*
  StartScheduler

This methode initializes and starts the scheduler.
When adding a new job to the scheduler, extend the switch case with the job's methode
*/

func (s *SchedulerService) StartScheduler(path string, delay string) {
	ctx := context.Background()
	log := logger.FromContext(ctx)
	conf, err := parseFile(path)
	if err != nil {
		log.Error("Failed to parse file", "error", err)
	}
	for _, job := range conf.Jobs {
		var task interface{}
		var params []any
		switch job.Name {
		case "Delete Unused Boards":
			params = append(params, ctx)
			task = s.deleteUnusedBoards
			job.Schedule = strings.Replace(job.Schedule, "$", delay, -1)
			params = append(params, parseTaskParameters(ctx, job.Task, new(DeleteBoards))...)
		}
		_, err := s.scheduler.NewJob(gocron.CronJob(job.Schedule, job.WithSeconds), gocron.NewTask(task, params...))
		if err != nil {
			log.Errorw("Could not create new job", "error", err, "task", job.Name)
		}
	}

	s.scheduler.Start()
}
