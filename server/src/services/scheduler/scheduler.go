package scheduler

import (
	"context"
	"fmt"
	"github.com/go-co-op/gocron/v2"
	"github.com/google/uuid"
	"scrumlr.io/server/database"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/services"
	"time"
)

type DB interface {
	DeleteBoard(id uuid.UUID) error
	GetSessionsOlderThan(t time.Time, interactions int) ([]database.BoardSession, error)
}

// NewSchedulerService Questsion: kann ich mehrere DB typen zusammenfuehren? Also teil davon und teil davon implementieren
type SchedulerService struct {
	database  DB
	scheduler gocron.Scheduler
}

func NewSchedulerService(db DB, scheduler gocron.Scheduler) services.Scheduler {
	s := new(SchedulerService)
	s.database = db
	s.scheduler = scheduler
	return s
}

func StartScheduler(s gocron.Scheduler, db DB) {

	//defer func() { _ = s.Shutdown() }()

	_, _ = s.NewJob(
		gocron.CronJob("*/20 * * * * *", true),
		gocron.NewTask(deleteUnusedBoards, db),
	)
	s.Start()
}

func (s SchedulerService) GetOldSessions(ctx context.Context, t time.Time, interactions int) ([]database.BoardSession, error) {
	log := logger.FromContext(ctx)
	sessions, err := s.database.GetSessionsOlderThan(t, interactions)
	if err != nil {
		log.Errorw("Could not fetch sessions", "error", err)
		return nil, err
	}
	return sessions, err
}

func (s SchedulerService) Delete(ctx context.Context, id uuid.UUID) error {
	log := logger.FromContext(ctx)
	err := s.database.DeleteBoard(id)
	if err != nil {
		log.Errorw("Unable to delete Board", "error", err)
		return err
	}
	return nil
}

func deleteUnusedBoards(db DB) {
	sessions, _ := db.GetSessionsOlderThan(time.Now(), 10)
	fmt.Println(sessions)
}
