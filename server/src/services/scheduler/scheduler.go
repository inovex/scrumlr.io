package scheduler

import (
	"context"
	"fmt"
	"github.com/go-co-op/gocron/v2"
	"log/slog"
	"scrumlr.io/server/database"
	"scrumlr.io/server/logger"
	"time"
)

type scheduler struct {
	db *database.Database
}

func Init(db *database.Database) (context.Context, context.CancelFunc) {
	sched := scheduler{
		db: db,
	}
	ctx, cancel := context.WithCancel(context.Background())
	go sched.initScheduler(ctx)
	return ctx, cancel
}

func (sched *scheduler) initScheduler(ctx context.Context) {
	log := logger.FromContext(ctx)
	s, err := gocron.NewScheduler(gocron.WithLogger(slog.Default()))

	if err != nil {
		fmt.Println(err)
	}
	defer func() { _ = s.Shutdown() }()
	addJob(s, time.Now().Add(5*time.Second), func() []database.BoardSession {
		//todo change later to 3 months
		sessions, err := sched.db.GetSessionsOlderThan(time.Now().AddDate(0, 0, -12).Add(time.Hour * -5))
		if err != nil {
			log.Errorw("Could not get sessions older ")
			return nil
		}
		for _, session := range sessions {
			err := sched.db.DeleteBoard(session.Board)
			if err != nil {
				log.Errorw("unable to delete board", "board", session.Board, "error", err)
				return nil
			}
		}

		return sessions
	})

	s.Start()

	select {
	case <-ctx.Done():

	}
}

func addJob(s gocron.Scheduler, executeAt time.Time, task func() []database.BoardSession) {
	_, err :=

		s.NewJob(
			gocron.CronJob("*/1 * * * *", false), gocron.NewTask(task),
			//gocron.DailyJob(
			//	1,
			//	gocron.NewAtTimes(
			//		gocron.NewAtTime(uint(executeAt.Hour()), uint(executeAt.Minute()), uint(executeAt.Second())),
			//	),
			//),
			//gocron.NewTask(
			//	task,
			//),
		)
	if err != nil {
		fmt.Println(err)
	}

}
